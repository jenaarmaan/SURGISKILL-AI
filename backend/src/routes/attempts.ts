import { FastifyInstance } from "fastify";
import { z } from "zod";
import * as fs from "fs";
import { logAuditAction } from "../services/audit";
import { videoStorage } from "../services/storage";
import { cvQueueService } from "../services/queue";

const createAttemptSchema = z.object({
  stationId: z.string(),
});

const overrideScoreSchema = z.object({
  newScore: z.number().min(0).max(100),
  reason: z.string().min(5),
});

export async function attemptRoutes(fastify: FastifyInstance) {
  // GET /attempts
  fastify.get("/", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { id: string; role: string };

    let attempts;
    if (user.role === "STUDENT") {
      attempts = await fastify.db.attempt.findMany({
        where: { studentId: user.id },
        include: {
          station: { select: { name: true } },
          rubric: { select: { version: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      attempts = await fastify.db.attempt.findMany({
        include: {
          student: { select: { name: true, email: true } },
          station: { select: { name: true } },
          rubric: { select: { version: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return attempts;
  });

  // POST /attempts
  fastify.post("/", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { id: string; role: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;
    const { stationId } = createAttemptSchema.parse(request.body);

    const station = await fastify.db.station.findUnique({
      where: { id: stationId },
      include: { rubrics: { where: { active: true } } },
    });

    if (!station) {
      return reply.status(404).send({ error: "Station not found" });
    }

    const activeRubric = station.rubrics[0];
    if (!activeRubric) {
      return reply.status(400).send({ error: "No active rubric configured for this station." });
    }

    const attempt = await fastify.db.attempt.create({
      data: {
        studentId: user.id,
        stationId,
        rubricId: activeRubric.id,
        status: "CREATED",
      },
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "INITIALIZE_ATTEMPT",
      resource: `Attempt:${attempt.id}`,
      result: "SUCCESS",
      details: `Initialized attempt in CREATED status for station: ${station.name}`,
    });

    return attempt;
  });

  // GET /attempts/:id
  fastify.get("/:id", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string; role: string };

    const attempt = await fastify.db.attempt.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        station: { select: { id: true, name: true, description: true } },
        rubric: {
          include: {
            checklistSteps: { orderBy: { sequenceOrder: "asc" } },
          },
        },
        detectedEvents: { orderBy: { timestamp: "asc" } },
        detectedErrors: { orderBy: { timestamp: "asc" } },
        scoreOverrides: {
          include: {
            faculty: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        aiAssessment: {
          include: {
            checklistAssessments: true,
            parameterAssessments: true,
            detectedErrors: true,
            evidence: true
          }
        }
      },
    });

    if (!attempt) {
      return reply.status(404).send({ error: "Attempt not found" });
    }

    if (user.role === "STUDENT" && attempt.studentId !== user.id) {
      return reply.status(403).send({ error: "Access Denied: You cannot view this attempt." });
    }

    return attempt;
  });

  // GET /attempts/:id/video
  fastify.get("/:id/video", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string; role: string };

    const attempt = await fastify.db.attempt.findUnique({
      where: { id },
    });

    if (!attempt || !attempt.videoPath) {
      return reply.status(404).send({ error: "Video not found for this attempt" });
    }

    if (user.role === "STUDENT" && attempt.studentId !== user.id) {
      return reply.status(403).send({ error: "Access Denied: You cannot view this video." });
    }

    const exists = await videoStorage.exists(attempt.videoPath);
    if (!exists) {
      return reply.status(404).send({ error: "Video file not found in storage" });
    }

    try {
      const stream = await videoStorage.getReadStream(attempt.videoPath);
      reply.header("Content-Type", "video/mp4");
      return reply.send(stream);
    } catch (err: any) {
      return reply.status(500).send({ error: `Failed to stream video: ${err.message}` });
    }
  });

  // GET /attempts/:id/tracking (Secure Tracking diagnostics JSON endpoint)
  fastify.get("/:id/tracking", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string; role: string };

    const attempt = await fastify.db.attempt.findUnique({
      where: { id },
      include: { trackingSessions: true },
    });

    if (!attempt) {
      return reply.status(404).send({ error: "Attempt not found" });
    }

    // Students can read their own tracking summary. Clinical leads can view complete details
    if (user.role === "STUDENT" && attempt.studentId !== user.id) {
      return reply.status(403).send({ error: "Access Denied." });
    }

    const tracking = attempt.trackingSessions[0];
    if (!tracking) {
      return reply.status(404).send({ error: "No tracking details generated yet." });
    }

    // Exclude detailed landmark coordinate arrays for student profiles to preserve API overhead
    if (user.role === "STUDENT") {
      const { landmarks, ...studentSummary } = tracking;
      return studentSummary;
    }

    return tracking;
  });

  // POST /attempts/:id/upload (Asynchronous multipart upload and CV trigger queue)
  fastify.post("/:id/upload", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string; role: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;

    const attempt = await fastify.db.attempt.findUnique({
      where: { id },
    });

    if (!attempt) {
      return reply.status(404).send({ error: "Attempt not found" });
    }

    if (attempt.studentId !== user.id) {
      return reply.status(403).send({ error: "Access Denied: You cannot upload to this attempt." });
    }

    // Idempotency: block execution if job is already processing
    if (cvQueueService.isProcessing(id)) {
      return reply.status(409).send({ error: "Attempt is already undergoing active CV processing." });
    }

    // Set status to UPLOADING
    await fastify.db.attempt.update({
      where: { id },
      data: { status: "UPLOADING" },
    });

    const data = await request.file();
    if (!data) {
      await fastify.db.attempt.update({
        where: { id },
        data: { status: "UPLOAD_FAILED" },
      });
      return reply.status(400).send({ error: "No video file found in payload." });
    }

    let savedFilename: string;
    try {
      const fileBuffer = await data.toBuffer();
      const rawName = data.filename || `attempt_${id}.mp4`;
      savedFilename = await videoStorage.upload(rawName, fileBuffer);
    } catch (err) {
      await fastify.db.attempt.update({
        where: { id },
        data: { status: "UPLOAD_FAILED" },
      });
      await logAuditAction(fastify.db, {
        userId: user.id,
        ipAddress,
        action: "UPLOAD_VIDEO_FAILED",
        resource: `Attempt:${id}`,
        result: "FAILED",
        details: "File system error saving recording.",
      });
      return reply.status(500).send({ error: "Failed to persist video file." });
    }

    // Update video reference in DB and set status to PROCESSING
    const updatedAttempt = await fastify.db.attempt.update({
      where: { id },
      data: { status: "PROCESSING", videoPath: savedFilename },
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "UPLOAD_VIDEO",
      resource: `Attempt:${id}`,
      result: "SUCCESS",
      details: `Video uploaded successfully: ${savedFilename}.`,
    });

    // Enqueue background tracking job asynchronously (non-blocking)
    const simulateFailure = request.headers["x-simulate-failure"] === "true";
    const filePath = videoStorage.getFilePath(savedFilename);
    
    try {
      await cvQueueService.enqueue(id, filePath, simulateFailure);
    } catch (err: any) {
      return reply.status(409).send({ error: err.message });
    }

    // Return the updated attempt immediately with CV_PROCESSING status
    return {
      ...updatedAttempt,
      status: "CV_PROCESSING",
    };
  });

  // PATCH /attempts/:id/override
  fastify.patch("/:id/override", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string; role: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;
    const { newScore, reason } = overrideScoreSchema.parse(request.body);

    if (user.role !== "FACULTY" && user.role !== "CLINICAL_LEAD" && user.role !== "ADMIN") {
      return reply.status(403).send({ error: "Access Denied: Only examiners can override scores." });
    }

    const attempt = await fastify.db.attempt.findUnique({
      where: { id },
    });

    if (!attempt) {
      return reply.status(404).send({ error: "Attempt not found" });
    }

    if (attempt.status !== "COMPLETED") {
      return reply.status(400).send({ error: "Cannot override scores for uncompleted attempts." });
    }

    const originalScore = attempt.compositeScore || 0.0;

    await fastify.db.scoreOverride.create({
      data: {
        attemptId: id,
        facultyId: user.id,
        originalScore,
        newScore,
        reason,
      },
    });

    const updatedFeedback = `${attempt.feedbackMarkdown || ""}\n\n---\n**[Faculty Override Annotation]**: Score adjusted from **${originalScore}** to **${newScore}** by examiner (${user.role} ID: ${user.id}). Reason: *${reason}*`;

    const updatedAttempt = await fastify.db.attempt.update({
      where: { id },
      data: {
        compositeScore: newScore,
        feedbackMarkdown: updatedFeedback,
      },
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "SCORE_OVERRIDE",
      resource: `Attempt:${id}`,
      result: "SUCCESS",
      details: `Manually adjusted attempt score from ${originalScore} to ${newScore}. Reason: ${reason}`,
    });

    return updatedAttempt;
  });
}
