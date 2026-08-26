import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
  }
}

export const connectDB = fp(async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    fastify.decorate("db", prisma);
    fastify.addHook("onClose", async (instance) => {
      await instance.db.$disconnect();
    });
    fastify.log.info("🐘 PostgreSQL connected via Prisma");
  } catch (err) {
    fastify.log.error("❌ Failed to connect to PostgreSQL");
    throw err;
  }
});
