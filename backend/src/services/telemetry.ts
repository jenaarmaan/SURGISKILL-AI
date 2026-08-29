import { PrismaClient } from "@prisma/client";

export class TelemetryService {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async logAPILatency(apiEndpoint: string, latencyMs: number, statusCode: number, userId?: string): Promise<any> {
    console.log(`📊 [Telemetry API Latency] ${apiEndpoint} took ${latencyMs}ms with status ${statusCode}`);

    try {
      const log = await this.db.telemetryLog.create({
        data: {
          apiEndpoint,
          latencyMs,
          statusCode,
          userId
        }
      });
      return log;
    } catch (err: any) {
      console.warn("⚠️ Telemetry database logging skipped:", err.message);
      return null;
    }
  }

  async logQueueTiming(attemptId: string, latencyMs: number, cvTimeMs: number, aiTimeMs: number): Promise<any> {
    console.log(`⚙️ [Telemetry Queue Speed] Attempt ${attemptId}: Queue delay ${latencyMs}ms, CV process ${cvTimeMs}ms, AI process ${aiTimeMs}ms`);

    try {
      const log = await this.db.telemetryLog.create({
        data: {
          attemptId,
          latencyMs,
          cvTimeMs,
          aiTimeMs
        }
      });
      return log;
    } catch (err: any) {
      console.warn("⚠️ Telemetry queue logging skipped:", err.message);
      return null;
    }
  }
}
