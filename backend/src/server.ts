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
import { enterpriseRoutes } from "./routes/enterprise";

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

function validateProductionConfig() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    return;
  }

  console.log("🔒 Enforcing Production Pilot Configuration Gate...");

  const status: Record<string, "CONFIGURED" | "MISSING" | "INVALID"> = {};
  let hasFailure = false;

  // 1. DATABASE_URL
  if (!process.env.DATABASE_URL) {
    status.DATABASE_URL = "MISSING";
    hasFailure = true;
  } else {
    status.DATABASE_URL = "CONFIGURED";
  }

  // 2. JWT_SECRET
  if (!process.env.JWT_SECRET) {
    status.JWT_SECRET = "MISSING";
    hasFailure = true;
  } else if (process.env.JWT_SECRET === "surgiskill-super-secret-key-2026") {
    status.JWT_SECRET = "INVALID";
    hasFailure = true;
  } else {
    status.JWT_SECRET = "CONFIGURED";
  }

  // 3. AI PROVIDER & GEMINI API KEY
  const aiProvider = process.env.AI_PROVIDER || "gemini";
  if (aiProvider === "deterministic-test") {
    status.AI_PROVIDER = "INVALID";
    hasFailure = true;
  } else if (aiProvider === "gemini") {
    status.AI_PROVIDER = "CONFIGURED";
  } else {
    status.AI_PROVIDER = "INVALID";
    hasFailure = true;
  }

  if (!process.env.GEMINI_API_KEY) {
    status.GEMINI_API_KEY = "MISSING";
    hasFailure = true;
  } else {
    status.GEMINI_API_KEY = "CONFIGURED";
  }

  // 4. QUEUE PROVIDER & REDIS URL
  const queueProvider = process.env.QUEUE_PROVIDER || "bullmq";
  if (queueProvider === "in-memory") {
    status.QUEUE_PROVIDER = "INVALID";
    hasFailure = true;
  } else if (queueProvider === "bullmq") {
    status.QUEUE_PROVIDER = "CONFIGURED";
  } else {
    status.QUEUE_PROVIDER = "INVALID";
    hasFailure = true;
  }

  if (!process.env.REDIS_URL) {
    status.REDIS_URL = "MISSING";
    hasFailure = true;
  } else {
    status.REDIS_URL = "CONFIGURED";
  }

  // 5. STORAGE PROVIDER & S3 CONFIG
  const storageProvider = process.env.STORAGE_PROVIDER || "s3";
  if (storageProvider === "local") {
    status.STORAGE_PROVIDER = "INVALID";
    hasFailure = true;
  } else if (storageProvider === "s3") {
    status.STORAGE_PROVIDER = "CONFIGURED";
  } else {
    status.STORAGE_PROVIDER = "INVALID";
    hasFailure = true;
  }

  const s3Keys = ["S3_BUCKET_NAME", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_REGION"];
  s3Keys.forEach(key => {
    if (!process.env[key]) {
      status[key] = "MISSING";
      hasFailure = true;
    } else {
      status[key] = "CONFIGURED";
    }
  });

  console.log("=============================================");
  console.log("PRODUCTION STARTUP CONFIGURATION REPORT:");
  console.log("=============================================");
  Object.entries(status).forEach(([key, val]) => {
    console.log(`${key}: ${val}`);
  });
  console.log("=============================================");

  if (hasFailure) {
    console.error("❌ CRITICAL: Mandatory production dependencies are missing or misconfigured. Application failed to start.");
    process.exit(1);
  } else {
    console.log("🛡️  All production configurations are validated. Starting server...");
  }
}

async function bootstrap() {
  validateProductionConfig();
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
        instance.register(enterpriseRoutes);
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
