import { PrismaClient } from "@prisma/client";

interface AuditLogInput {
  userId?: string | null;
  ipAddress: string;
  action: string;
  resource: string;
  result: "SUCCESS" | "FAILED";
  details?: string | null;
}

export async function logAuditAction(db: PrismaClient, input: AuditLogInput) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId || null,
        ipAddress: input.ipAddress,
        action: input.action,
        resource: input.resource,
        result: input.result,
        details: input.details || null,
      },
    });
  } catch (err) {
    console.error("❌ Failed to write audit log:", err);
  }
}
