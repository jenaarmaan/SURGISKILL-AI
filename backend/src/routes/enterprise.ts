import { FastifyInstance } from "fastify";
import { z } from "zod";
import { logAuditAction } from "../services/audit";
import { TelemetryService } from "../services/telemetry";

const createInstitutionSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

const createCohortSchema = z.object({
  name: z.string().min(2),
  institutionId: z.string().optional(),
  programId: z.string().optional(),
  academicPeriod: z.string().optional()
});

const createAssignmentSchema = z.object({
  stationId: z.string(),
  cohortId: z.string().optional(),
  studentId: z.string().optional(),
  rubricId: z.string().optional(),
  academicPeriod: z.string().optional(),
  dueDate: z.string().optional()
});

const reviewActionSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT", "OVERRIDE"]),
  newScore: z.number().min(0).max(100).optional(),
  reason: z.string().min(5),
  checklistDisagreements: z.array(z.string()).optional(),
  parameterDisagreements: z.array(z.string()).optional()
});

export async function enterpriseRoutes(fastify: FastifyInstance) {
  const telemetry = new TelemetryService(fastify.db);

  // Hook for API Telemetry Logging
  fastify.addHook("onResponse", async (request, reply) => {
    const user = request.user as { id: string } | undefined;
    const latency = reply.elapsedTime;
    if (request.url.startsWith("/api/v1")) {
      await telemetry.logAPILatency(request.url, Math.round(latency), reply.statusCode, user?.id);
    }
  });

  // GET /api/v1/health (System Health Monitoring)
  fastify.get("/health", async (request, reply) => {
    try {
      await fastify.db.$queryRaw`SELECT 1`;

      const isProd = process.env.NODE_ENV === "production";
      const hasGeminiKey = !!process.env.GEMINI_API_KEY;
      
      const isQueueHealthy = process.env.QUEUE_PROVIDER === "bullmq" && !!process.env.REDIS_URL;
      const isStorageHealthy = process.env.STORAGE_PROVIDER === "s3" && 
                               !!process.env.S3_BUCKET_NAME && 
                               !!process.env.S3_ACCESS_KEY_ID && 
                               !!process.env.S3_SECRET_ACCESS_KEY && 
                               !!process.env.S3_REGION;

      return {
        database: "healthy",
        queue: isQueueHealthy ? "healthy" : (isProd ? "unhealthy" : "healthy"),
        storage: isStorageHealthy ? "healthy" : (isProd ? "unhealthy" : "healthy"),
        ai: hasGeminiKey && process.env.AI_PROVIDER !== "deterministic-test" ? "configured" : "not_configured",
        application: "healthy",
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return reply.status(500).send({
        database: "unhealthy",
        queue: "unhealthy",
        storage: "unhealthy",
        ai: "not_configured",
        application: "unhealthy",
        error: err.message
      });
    }
  });

  // POST /api/v1/admin/institutions
  fastify.post("/admin/institutions", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { role: string; id: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;
    if (user.role !== "ADMIN") {
      return reply.status(403).send({ error: "Forbidden: Administrators only." });
    }

    const { name, description } = createInstitutionSchema.parse(request.body);
    const inst = await fastify.db.institution.create({
      data: { name, description }
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "CREATE_INSTITUTION",
      resource: `Institution:${inst.id}`,
      result: "SUCCESS",
      details: `Created institution: ${name}`
    });

    return inst;
  });

  // POST /api/v1/admin/cohorts
  fastify.post("/admin/cohorts", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { role: string; id: string; institutionId?: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;
    if (user.role !== "ADMIN" && user.role !== "CLINICAL_LEAD") {
      return reply.status(403).send({ error: "Forbidden: Clinical Leads or Administrators only." });
    }

    const { name, institutionId, programId, academicPeriod } = createCohortSchema.parse(request.body);
    const targetInstId = user.role === "ADMIN" ? institutionId : user.institutionId;

    const cohort = await fastify.db.cohort.create({
      data: {
        name,
        institutionId: targetInstId,
        programId,
        academicPeriod,
        active: true
      }
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "CREATE_COHORT",
      resource: `Cohort:${cohort.id}`,
      result: "SUCCESS",
      details: `Created cohort: ${name} inside institution context.`
    });

    return cohort;
  });

  // POST /api/v1/admin/assignments
  fastify.post("/admin/assignments", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { role: string; id: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;
    if (user.role !== "ADMIN" && user.role !== "CLINICAL_LEAD" && user.role !== "FACULTY") {
      return reply.status(403).send({ error: "Forbidden: Authorized examiners only." });
    }

    const { stationId, cohortId, studentId, rubricId, academicPeriod, dueDate } = createAssignmentSchema.parse(request.body);

    const assignment = await fastify.db.stationAssignment.create({
      data: {
        stationId,
        cohortId,
        studentId,
        rubricId,
        assignedById: user.id,
        academicPeriod,
        dueDate: dueDate ? new Date(dueDate) : null,
        active: true
      }
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "ASSIGN_STATION",
      resource: `StationAssignment:${assignment.id}`,
      result: "SUCCESS",
      details: `Assigned station ${stationId} to targets.`
    });

    return assignment;
  });

  // GET /api/v1/reviews/queue (Review Queue pagination support)
  fastify.get("/reviews/queue", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { role: string; institutionId?: string };
    if (user.role === "STUDENT") {
      return reply.status(403).send({ error: "Forbidden: Review queue is restricted to examiners." });
    }

    const query = request.query as any;
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;

    // Filter reviews belonging to the faculty's institution
    const whereClause: any = {
      status: {
        in: ["AI_PROCESSING_FAILED", "AI_INSUFFICIENT_DATA", "MANUAL_REVIEW_REQUIRED"]
      }
    };

    if (user.institutionId) {
      whereClause.student = { institutionId: user.institutionId };
    }

    const [items, total] = await Promise.all([
      fastify.db.attempt.findMany({
        where: whereClause,
        include: {
          student: { select: { name: true, email: true } },
          station: { select: { name: true } },
          aiAssessment: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      fastify.db.attempt.count({ where: whereClause })
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  });

  // POST /api/v1/reviews/:attemptId/action
  fastify.post("/reviews/:attemptId/action", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { attemptId } = request.params as { attemptId: string };
    const user = request.user as { role: string; id: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;

    if (user.role !== "ADMIN" && user.role !== "CLINICAL_LEAD" && user.role !== "FACULTY") {
      return reply.status(403).send({ error: "Forbidden: Authorized review actions only." });
    }

    const { action, newScore, reason, checklistDisagreements, parameterDisagreements } = reviewActionSchema.parse(request.body);
    const attempt = await fastify.db.attempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt) {
      return reply.status(404).send({ error: "Attempt not found." });
    }

    const originalScore = attempt.compositeScore || 0.0;
    const finalScore = action === "OVERRIDE" && newScore !== undefined ? newScore : originalScore;
    const variance = originalScore - finalScore;

    await fastify.db.$transaction(async (tx) => {
      // Create override entry with granular disagreements and score variance
      await tx.scoreOverride.create({
        data: {
          attemptId,
          facultyId: user.id,
          originalScore,
          newScore: finalScore,
          reason,
          checklistDisagreements: checklistDisagreements || [],
          parameterDisagreements: parameterDisagreements || [],
          variance
        }
      });

      // Update attempt status to COMPLETED and save comments
      await tx.attempt.update({
        where: { id: attemptId },
        data: {
          status: "COMPLETED",
          compositeScore: finalScore,
          feedbackMarkdown: `${attempt.feedbackMarkdown || ""}\n\n---\n**[Faculty Manual Review Action: ${action}]**: Adjustments finalized by examiner (${user.role} ID: ${user.id}). Reason: *${reason}*`
        }
      });
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: `MANUAL_REVIEW_${action}`,
      resource: `Attempt:${attemptId}`,
      result: "SUCCESS",
      details: `Completed review ${action} override for Attempt:${attemptId}. Reason: ${reason}`
    });

    return { status: "COMPLETED", originalScore, finalScore };
  });

  // GET /api/v1/dashboards/summary (Aggregates stats by Role)
  fastify.get("/dashboards/summary", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { role: string; id: string; institutionId?: string };

    if (user.role === "ADMIN") {
      const [institutionsCount, usersCount, cohortsCount, manualQueueCount] = await Promise.all([
        fastify.db.institution.count(),
        fastify.db.user.count(),
        fastify.db.cohort.count(),
        fastify.db.attempt.count({ where: { status: { in: ["AI_PROCESSING_FAILED", "AI_INSUFFICIENT_DATA", "MANUAL_REVIEW_REQUIRED"] } } })
      ]);
      return { role: "ADMIN", institutionsCount, usersCount, cohortsCount, manualQueueCount };
    }

    if (user.role === "CLINICAL_LEAD") {
      const filter = user.institutionId ? { student: { institutionId: user.institutionId } } : {};
      const [totalAttempts, averageScoreAgg, lowConfCount] = await Promise.all([
        fastify.db.attempt.count({ where: filter }),
        fastify.db.attempt.aggregate({
          where: { ...filter, status: "COMPLETED" },
          _avg: { compositeScore: true }
        }),
        fastify.db.aIAssessment.count({
          where: user.institutionId ? { attempt: { student: { institutionId: user.institutionId } }, overallConfidence: "LOW" } : { overallConfidence: "LOW" }
        })
      ]);

      return {
        role: "CLINICAL_LEAD",
        totalAttempts,
        averageScore: Math.round(averageScoreAgg._avg.compositeScore || 0),
        lowConfidenceAssessments: lowConfCount
      };
    }

    if (user.role === "FACULTY") {
      const filter = user.institutionId ? { student: { institutionId: user.institutionId } } : {};
      const [pendingCount, totalAttemptsCount] = await Promise.all([
        fastify.db.attempt.count({
          where: { ...filter, status: { in: ["AI_PROCESSING_FAILED", "AI_INSUFFICIENT_DATA", "MANUAL_REVIEW_REQUIRED"] } }
        }),
        fastify.db.attempt.count({ where: filter })
      ]);

      return {
        role: "FACULTY",
        pendingReviews: pendingCount,
        totalOSCEAttempts: totalAttemptsCount
      };
    }

    if (user.role === "STUDENT") {
      const attempts = await fastify.db.attempt.findMany({
        where: { studentId: user.id, status: "COMPLETED" },
        orderBy: { createdAt: "asc" },
        select: { compositeScore: true, checklistScore: true, motionScore: true, createdAt: true }
      });

      return {
        role: "STUDENT",
        completedAttemptsCount: attempts.length,
        progression: attempts
      };
    }

    return reply.status(400).send({ error: "Unknown user role context." });
  });

  // GET /api/v1/reports/student/:id (Progression reports)
  fastify.get("/reports/student/:id", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { role: string; id: string; institutionId?: string };

    if (user.role === "STUDENT" && user.id !== id) {
      return reply.status(403).send({ error: "Forbidden: Cannot export other students progression report." });
    }

    const attempts = await fastify.db.attempt.findMany({
      where: { studentId: id, status: "COMPLETED" },
      orderBy: { createdAt: "asc" },
      include: {
        station: { select: { name: true } },
        aiAssessment: true
      }
    });

    return {
      studentId: id,
      exportDate: new Date().toISOString(),
      attempts: attempts.map(a => ({
        id: a.id,
        station: a.station.name,
        compositeScore: a.compositeScore,
        checklistScore: a.checklistScore,
        motionScore: a.motionScore,
        aiProvider: a.aiAssessment?.provider || "N/A",
        createdAt: a.createdAt
      }))
    };
  });
}
