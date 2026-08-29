import { EventEmitter } from "events";
import { PrismaClient } from "@prisma/client";
import { cvTrackingProvider, featureExtractionService } from "./cv";
import { AIAssessmentProvider } from "./ai";
import { logAuditAction } from "./audit";
import { QueueProvider } from "./queue-interface";

const db = new PrismaClient();
const assessmentProvider = new AIAssessmentProvider(db);

export class InMemoryQueueProvider extends EventEmitter implements QueueProvider {
  private activeJobs: Set<string> = new Set();

  constructor() {
    super();
    this.on("process", this.worker.bind(this));
  }

  isProcessing(attemptId: string): boolean {
    return this.activeJobs.has(attemptId);
  }

  async enqueue(attemptId: string, filePath: string, simulateFailure = false): Promise<void> {
    if (this.isProcessing(attemptId)) {
      throw new Error(`Attempt ${attemptId} is already undergoing active CV processing.`);
    }

    this.activeJobs.add(attemptId);

    await db.attempt.update({
      where: { id: attemptId },
      data: { status: "CV_PROCESSING" },
    });

    setImmediate(() => {
      this.emit("process", { attemptId, filePath, simulateFailure });
    });
  }

  async clean(): Promise<void> {
    this.activeJobs.clear();
  }

  private async worker(job: { attemptId: string; filePath: string; simulateFailure: boolean }) {
    const { attemptId, filePath, simulateFailure } = job;
    const ipAddress = "127.0.0.1";

    try {
      console.log(`🤖 [InMemoryQueue Worker] Starting tracking session for Attempt: ${attemptId}...`);
      const startTime = new Date();
      const trackingResult = await cvTrackingProvider.processVideo(filePath, simulateFailure);
      const features = featureExtractionService.extractFeatures(trackingResult.landmarks, trackingResult.duration);
      const endTime = new Date();

      await db.$transaction(async (tx) => {
        await tx.trackingSession.deleteMany({ where: { attemptId } });
        await tx.trackingSession.create({
          data: {
            attemptId,
            provider: trackingResult.provider,
            providerVersion: trackingResult.providerVersion,
            processingVersion: trackingResult.processingVersion,
            overallConfidence: trackingResult.overallConfidence,
            frameCount: trackingResult.frameCount,
            processedFrameCount: trackingResult.processedFrameCount,
            duration: trackingResult.duration,
            qualitySummary: trackingResult.qualitySummary,
            features: features as any,
            landmarks: trackingResult.landmarks as any,
            startedAt: startTime,
            completedAt: endTime,
          },
        });

        await tx.attempt.update({
          where: { id: attemptId },
          data: { status: "CV_COMPLETED" },
        });
      });

      console.log(`✅ [InMemoryQueue Worker] Successful tracking for Attempt: ${attemptId}`);

      await logAuditAction(db, {
        userId: null,
        ipAddress,
        action: "CV_TRACKING_COMPLETED",
        resource: `Attempt:${attemptId}`,
        result: "SUCCESS",
        details: `CV tracking landmarks and kinematics features extracted successfully. Confidence: ${trackingResult.overallConfidence}`,
      });

      await this.runAssessmentScoring(attemptId, trackingResult, features);

    } catch (err: any) {
      console.error(`❌ [InMemoryQueue Worker] Failure for Attempt: ${attemptId}:`, err.message);

      await db.attempt.update({
        where: { id: attemptId },
        data: { 
          status: "CV_PROCESSING_FAILED",
          feedbackMarkdown: `### Computer vision analysis could not be completed.\nError: ${err.message}`,
        },
      });

      await logAuditAction(db, {
        userId: null,
        ipAddress,
        action: "CV_TRACKING_FAILED",
        resource: `Attempt:${attemptId}`,
        result: "FAILED",
        details: `CV processing failed: ${err.message}`,
      });

    } finally {
      this.activeJobs.delete(attemptId);
    }
  }

  private async runAssessmentScoring(attemptId: string, tracking: any, features: any) {
    try {
      console.log(`📊 [InMemoryQueue Worker] Transitioning to AI Assessment for Attempt: ${attemptId}`);

      await db.attempt.update({
        where: { id: attemptId },
        data: { status: "AI_PROCESSING" },
      });

      const aiResult = await assessmentProvider.runAssessment(attemptId);

      if (aiResult.status === "AI_INSUFFICIENT_DATA") {
        await logAuditAction(db, {
          userId: null,
          ipAddress: "127.0.0.1",
          action: "AI_ASSESSMENT_INSUFFICIENT",
          resource: `Attempt:${attemptId}`,
          result: "SUCCESS",
          details: `AI assessment skipped due to insufficient video quality or frame occlusions.`,
        });
        return;
      }

      await logAuditAction(db, {
        userId: null,
        ipAddress: "127.0.0.1",
        action: "AI_ASSESSMENT_COMPLETED",
        resource: `Attempt:${attemptId}`,
        result: "SUCCESS",
        details: `AI assessment and sequence alignments completed. Composite: ${aiResult.compositeScore}`,
      });

    } catch (err: any) {
      console.error(`❌ [InMemoryQueue Worker] AI assessment failure for Attempt: ${attemptId}:`, err.message);

      await db.attempt.update({
        where: { id: attemptId },
        data: { 
          status: "AI_PROCESSING_FAILED",
          feedbackMarkdown: `### AI Assessment Failed\nError: ${err.message}`,
        },
      });

      await logAuditAction(db, {
        userId: null,
        ipAddress: "127.0.0.1",
        action: "AI_ASSESSMENT_FAILED",
        resource: `Attempt:${attemptId}`,
        result: "FAILED",
        details: `AI processing failed: ${err.message}`,
      });
    }
  }
}

export class BullMQQueueProvider implements QueueProvider {
  private queue: any;
  private worker: any;
  private redisConnection: any;
  private activeJobs: Set<string> = new Set();

  constructor() {
    // Dynamically require BullMQ and IORedis to prevent execution crashes in environments lacking active Redis setup
    const { Queue, Worker } = require("bullmq");
    const IORedis = require("ioredis");

    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    this.redisConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

    this.queue = new Queue("surgiskill_cv_jobs", { connection: this.redisConnection });
    
    this.worker = new Worker("surgiskill_cv_jobs", async (job: any) => {
      await this.processJob(job.data);
    }, { connection: this.redisConnection, concurrency: 1 });

    this.worker.on("failed", (job: any, err: any) => {
      console.error(`❌ [BullMQ Queue Worker] Job ${job?.id} failed:`, err.message);
    });
  }

  isProcessing(attemptId: string): boolean {
    return this.activeJobs.has(attemptId);
  }

  async enqueue(attemptId: string, filePath: string, simulateFailure = false): Promise<void> {
    if (this.isProcessing(attemptId)) {
      throw new Error(`Attempt ${attemptId} is already undergoing active CV processing.`);
    }

    this.activeJobs.add(attemptId);

    await db.attempt.update({
      where: { id: attemptId },
      data: { status: "CV_PROCESSING" },
    });

    await this.queue.add(`cv_job_${attemptId}`, {
      attemptId,
      filePath,
      simulateFailure
    }, {
      attempts: parseInt(process.env.QUEUE_MAX_RETRIES || "3", 10),
      backoff: { type: "exponential", delay: 5000 }
    });
  }

  async clean(): Promise<void> {
    await this.queue.drain();
  }

  private async processJob(data: { attemptId: string; filePath: string; simulateFailure: boolean }) {
    const { attemptId, filePath, simulateFailure } = data;
    const ipAddress = "127.0.0.1";

    try {
      this.activeJobs.add(attemptId);
      console.log(`🤖 [BullMQ Worker] Processing Attempt: ${attemptId}...`);
      const startTime = new Date();
      const trackingResult = await cvTrackingProvider.processVideo(filePath, simulateFailure);
      const features = featureExtractionService.extractFeatures(trackingResult.landmarks, trackingResult.duration);
      const endTime = new Date();

      await db.$transaction(async (tx) => {
        await tx.trackingSession.deleteMany({ where: { attemptId } });
        await tx.trackingSession.create({
          data: {
            attemptId,
            provider: trackingResult.provider,
            providerVersion: trackingResult.providerVersion,
            processingVersion: trackingResult.processingVersion,
            overallConfidence: trackingResult.overallConfidence,
            frameCount: trackingResult.frameCount,
            processedFrameCount: trackingResult.processedFrameCount,
            duration: trackingResult.duration,
            qualitySummary: trackingResult.qualitySummary,
            features: features as any,
            landmarks: trackingResult.landmarks as any,
            startedAt: startTime,
            completedAt: endTime,
          },
        });

        await tx.attempt.update({
          where: { id: attemptId },
          data: { status: "CV_COMPLETED" },
        });
      });

      console.log(`✅ [BullMQ Worker] Completed tracking for Attempt: ${attemptId}`);

      await logAuditAction(db, {
        userId: null,
        ipAddress,
        action: "CV_TRACKING_COMPLETED",
        resource: `Attempt:${attemptId}`,
        result: "SUCCESS",
        details: `CV tracking completed. Confidence: ${trackingResult.overallConfidence}`,
      });

      // AI Scoring Transition
      await db.attempt.update({
        where: { id: attemptId },
        data: { status: "AI_PROCESSING" },
      });

      const aiResult = await assessmentProvider.runAssessment(attemptId);
      
      await logAuditAction(db, {
        userId: null,
        ipAddress: "127.0.0.1",
        action: aiResult.status === "AI_INSUFFICIENT_DATA" ? "AI_ASSESSMENT_INSUFFICIENT" : "AI_ASSESSMENT_COMPLETED",
        resource: `Attempt:${attemptId}`,
        result: "SUCCESS",
        details: aiResult.status === "AI_INSUFFICIENT_DATA" 
          ? `AI assessment skipped due to insufficient video quality.`
          : `AI assessment completed. Composite: ${aiResult.compositeScore}`,
      });

    } catch (err: any) {
      console.error(`❌ [BullMQ Worker] Processing error:`, err.message);

      await db.attempt.update({
        where: { id: attemptId },
        data: { 
          status: "CV_PROCESSING_FAILED",
          feedbackMarkdown: `### CV/AI Analysis failed\nError: ${err.message}`,
        },
      });

      await logAuditAction(db, {
        userId: null,
        ipAddress,
        action: "CV_TRACKING_FAILED",
        resource: `Attempt:${attemptId}`,
        result: "FAILED",
        details: `Processing failed: ${err.message}`,
      });

      throw err; // Bubble up error for BullMQ to handle retry
    } finally {
      this.activeJobs.delete(attemptId);
    }
  }
}

const queueProviderName = process.env.QUEUE_PROVIDER || "in-memory";
const isProductionMode = process.env.NODE_ENV === "production";
let activeQueue: QueueProvider;

if (isProductionMode && queueProviderName !== "bullmq") {
  throw new Error("CRITICAL: In-memory queue provider is prohibited in production environment.");
}

if (queueProviderName === "bullmq") {
  try {
    activeQueue = new BullMQQueueProvider();
    console.log("⚙️  Using durable BullMQ Redis queue provider");
  } catch (err: any) {
    if (isProductionMode) {
      console.error("❌ CRITICAL: Failed to initialize BullMQ Redis queue in production environment.");
      throw err;
    }
    console.warn("⚠️  Failed to connect to Redis for BullMQ. Falling back to in-memory queue.", err.message);
    activeQueue = new InMemoryQueueProvider();
  }
} else {
  activeQueue = new InMemoryQueueProvider();
  console.log("⚙️  Using local in-memory event-loop queue provider");
}

export const cvQueueService = {
  isProcessing: (attemptId: string) => activeQueue.isProcessing(attemptId),
  enqueue: (attemptId: string, filePath: string, simulateFailure = false) => activeQueue.enqueue(attemptId, filePath, simulateFailure),
  clean: () => activeQueue.clean(),
};
