import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import { z } from "zod";

import { connectDB } from "./plugins/db";
import authPlugin from "./plugins/auth";
import { authRoutes } from "./routes/auth";
import { stationRoutes } from "./routes/stations";
import { attemptRoutes } from "./routes/attempts";

const isProduction = process.env.NODE_ENV === "production";

const fastify = Fastify({
  bodyLimit: 1048576 * 100, // 100MB payload size limit for actual video uploads
  logger: isProduction
    ? true
    : {
        transport: {
          target: "pino-pretty",
        },
      },
});

async function bootstrap() {
  try {
    // 1. Configure CORS
    await fastify.register(cors, {
      origin: true, // Allow development access from Next.js (localhost:3000)
      credentials: true,
    });

    // 2. Configure rate limiting
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      keyGenerator: (request) => {
        return (request.headers["x-forwarded-for"] as string) || request.ip;
      },
    });

    // 2.5 Register Multipart parser
    await fastify.register(multipart, {
      limits: {
        fileSize: 1048576 * 100, // 100MB maximum file size limit
      },
    });

    // 3. Configure JWT authentication
    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || "surgiskill-super-secret-key-2026",
    });

    // 4. Register custom database connection and auth validator plugins
    await fastify.register(connectDB);
    await fastify.register(authPlugin);

    // 5. Global validation error formatter
    fastify.setErrorHandler((error, request, reply) => {
      const err = error as any;
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: "Validation failed",
          details: error.issues.map((e: any) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      if (err.statusCode) {
        return reply.status(err.statusCode).send({ error: err.message });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal Server Error" });
    });

    // 6. Base routes
    fastify.get("/", async (request, reply) => {
      return { message: "Welcome to SurgiSkill AI API Platform", status: "Live" };
    });

    fastify.get("/api/v1/health", async (request, reply) => {
      return { status: "OK", database: "CONNECTED", timestamp: new Date().toISOString() };
    });

    // 7. Register application sub-routes
    fastify.register(
      async (instance) => {
        instance.register(authRoutes, { prefix: "/auth" });
        instance.register(stationRoutes, { prefix: "/stations" });
        instance.register(attemptRoutes, { prefix: "/attempts" });
      },
      { prefix: "/api/v1" }
    );

    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 SurgiSkill Backend running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
