import { FastifyInstance } from "fastify";
import { z } from "zod";
import { logAuditAction } from "../services/audit";

const createStationSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  cohortIds: z.array(z.string()).optional(),
  checklistSteps: z.array(
    z.object({
      sequenceOrder: z.number().int().min(1),
      description: z.string().min(5),
      penaltyPoints: z.number().min(0).default(5.0),
    })
  ).min(1),
  motionEfficiencyWeight: z.number().min(0).max(1).default(0.4),
  checklistWeight: z.number().min(0).max(1).default(0.6),
});

const createRubricVersionSchema = z.object({
  motionEfficiencyWeight: z.number().min(0).max(1),
  checklistWeight: z.number().min(0).max(1),
  checklistSteps: z.array(
    z.object({
      sequenceOrder: z.number().int().min(1),
      description: z.string().min(5),
      penaltyPoints: z.number().min(0).default(5.0),
    })
  ).min(1),
});

export async function stationRoutes(fastify: FastifyInstance) {
  // GET /stations
  fastify.get("/", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { id: string; role: string };

    let stations;
    if (user.role === "STUDENT") {
      const student = await fastify.db.user.findUnique({
        where: { id: user.id },
        select: { cohortId: true },
      });

      if (!student || !student.cohortId) {
        return [];
      }

      stations = await fastify.db.station.findMany({
        where: {
          cohorts: {
            some: {
              id: student.cohortId,
            },
          },
        },
        include: {
          rubrics: {
            where: { active: true },
            include: { checklistSteps: true },
          },
        },
      });
    } else {
      // Faculty / Admins see all stations
      stations = await fastify.db.station.findMany({
        include: {
          rubrics: {
            where: { active: true },
            include: { checklistSteps: true },
          },
          cohorts: true,
        },
      });
    }

    return stations;
  });

  // POST /stations (Clinical Lead / Admin only)
  fastify.post("/", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { id: string; role: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;

    if (user.role !== "CLINICAL_LEAD" && user.role !== "ADMIN") {
      return reply.status(403).send({ error: "Access Denied: Insufficient permissions." });
    }

    const {
      name,
      description,
      cohortIds,
      checklistSteps,
      motionEfficiencyWeight,
      checklistWeight,
    } = createStationSchema.parse(request.body);

    const existingStation = await fastify.db.station.findUnique({
      where: { name },
    });

    if (existingStation) {
      return reply.status(400).send({ error: "Station with this name already exists." });
    }

    const station = await fastify.db.station.create({
      data: {
        name,
        description,
        cohorts: cohortIds ? {
          connect: cohortIds.map((id) => ({ id })),
        } : undefined,
        rubrics: {
          create: {
            version: 1,
            motionEfficiencyWeight,
            checklistWeight,
            active: true,
            checklistSteps: {
              create: checklistSteps.map((step) => ({
                sequenceOrder: step.sequenceOrder,
                description: step.description,
                penaltyPoints: step.penaltyPoints,
              })),
            },
          },
        },
      },
      include: {
        rubrics: {
          include: { checklistSteps: true },
        },
      },
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "CREATE_STATION",
      resource: `Station:${station.id}`,
      result: "SUCCESS",
      details: `Created station: '${name}' with Rubric Version 1`,
    });

    return station;
  });

  // GET /stations/:id/rubric
  fastify.get("/:id/rubric", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const rubric = await fastify.db.rubric.findFirst({
      where: { stationId: id, active: true },
      include: { checklistSteps: { orderBy: { sequenceOrder: "asc" } } },
    });

    if (!rubric) {
      return reply.status(404).send({ error: "Active rubric not found for this station." });
    }

    return rubric;
  });

  // POST /stations/:id/rubric/version (Clinical Lead / Admin only)
  fastify.post("/:id/rubric/version", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as { id: string; role: string };
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;
    const { id: stationId } = request.params as { id: string };

    if (user.role !== "CLINICAL_LEAD" && user.role !== "ADMIN") {
      return reply.status(403).send({ error: "Access Denied: Insufficient permissions." });
    }

    const { motionEfficiencyWeight, checklistWeight, checklistSteps } = createRubricVersionSchema.parse(request.body);

    const station = await fastify.db.station.findUnique({
      where: { id: stationId },
      include: { rubrics: true },
    });

    if (!station) {
      return reply.status(404).send({ error: "Station not found" });
    }

    // Determine the next version number
    const maxVersion = station.rubrics.reduce((max, r) => (r.version > max ? r.version : max), 0);
    const nextVersion = maxVersion + 1;

    // Deactivate previous rubrics for this station
    await fastify.db.rubric.updateMany({
      where: { stationId },
      data: { active: false },
    });

    // Create the new active rubric version
    const rubric = await fastify.db.rubric.create({
      data: {
        stationId,
        version: nextVersion,
        motionEfficiencyWeight,
        checklistWeight,
        active: true,
        checklistSteps: {
          create: checklistSteps.map((step) => ({
            sequenceOrder: step.sequenceOrder,
            description: step.description,
            penaltyPoints: step.penaltyPoints,
          })),
        },
      },
      include: {
        checklistSteps: true,
      },
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "UPDATE_RUBRIC",
      resource: `Station:${stationId}`,
      result: "SUCCESS",
      details: `Rolled station rubric version to: ${nextVersion}`,
    });

    return rubric;
  });
}
