import { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { logAuditAction } from "../services/audit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["STUDENT", "FACULTY", "CLINICAL_LEAD", "ADMIN"]).default("STUDENT"),
  cohortId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  // POST /register
  fastify.post("/register", async (request, reply) => {
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;
    const { email, password, name, role, cohortId } = registerSchema.parse(request.body);

    const existingUser = await fastify.db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await logAuditAction(fastify.db, {
        ipAddress,
        action: "USER_REGISTRATION",
        resource: `Email:${email}`,
        result: "FAILED",
        details: "Registration failed: Email address already registered.",
      });
      return reply.status(400).send({ error: "Email address already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await fastify.db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        cohortId: cohortId || null,
      },
    });

    // Generate JWT access token
    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "USER_REGISTRATION",
      resource: `User:${user.id}`,
      result: "SUCCESS",
      details: `Successfully registered account with role: ${role}`,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        cohortId: user.cohortId,
      },
    };
  });

  // POST /login
  fastify.post("/login", async (request, reply) => {
    const ipAddress = (request.headers["x-forwarded-for"] as string) || request.ip;
    const { email, password } = loginSchema.parse(request.body);

    const user = await fastify.db.user.findUnique({
      where: { email },
    });

    if (!user) {
      await logAuditAction(fastify.db, {
        ipAddress,
        action: "USER_LOGIN",
        resource: `Email:${email}`,
        result: "FAILED",
        details: "Login failed: User not found.",
      });
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await logAuditAction(fastify.db, {
        userId: user.id,
        ipAddress,
        action: "USER_LOGIN",
        resource: `User:${user.id}`,
        result: "FAILED",
        details: "Login failed: Incorrect password.",
      });
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await logAuditAction(fastify.db, {
      userId: user.id,
      ipAddress,
      action: "USER_LOGIN",
      resource: `User:${user.id}`,
      result: "SUCCESS",
      details: "User successfully logged in via credentials.",
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        cohortId: user.cohortId,
      },
    };
  });

  // GET /me
  fastify.get("/me", {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const reqUser = request.user as { id: string };
    const user = await fastify.db.user.findUnique({
      where: { id: reqUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cohortId: true,
        cohort: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    return user;
  });
}
