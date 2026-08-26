import { EventEmitter } from "events";
import { PrismaClient } from "@prisma/client";
import { cvTrackingProvider, featureExtractionService } from "./cv";
import { BaselineAssessmentProvider } from "./assessment";
import { logAuditAction } from "./audit";

const db = new PrismaClient();
const assessmentProvider = new BaselineAssessmentProvider(db);

export class CVQueueService extends EventEmitter {
  private activeJobs: Set<string> = new Set();

  constructor() {
    super();
    // Hook up worker processing
    this.on("process", this.worker.bind(this));
  }

  isProcessing(attemptId: string): boolean {
    return this.activeJobs.has(attemptId);
  }

  async enqueue(attemptId: string, filePath: string, simulateFailure = false): Promise<void> {
    if (this.isProcessing(attemptId)) {
      throw new Error(`Attempt ${attemptId} is already undergoing active CV processing.`);
    }

    // Set job as active to enforce idempotency
    this.activeJobs.add(attemptId);

    // Update attempt status to CV_PROCESSING immediately
    await db.attempt.update({
      where: { id: attemptId },
      data: { status: "CV_PROCESSING" },
    });

    // Dispatch background task to event loop asynchronously
    setImmediate(() => {
      this.emit("process", { attemptId, filePath, simulateFailure });
    });
  }

  private async worker(job: { attemptId: string; filePath: string; simulateFailure: boolean }) {
    const { attemptId, filePath, simulateFailure } = job;
    const ipAddress = "127.0.0.1"; // Internal queue worker IP

    try {
      console.log(`🤖 [CV Processing Worker] Starting tracking session for Attempt: ${attemptId}...`);

      const startTime = new Date();

      // Execute framework-agnostic tracking provider
      const trackingResult = await cvTrackingProvider.processVideo(filePath, simulateFailure);

      // Extract kinematics movement features
      const features = featureExtractionService.extractFeatures(trackingResult.landmarks, trackingResult.duration);

      const endTime = new Date();

      // Transactionally save tracking session and landmarks, update attempt status to CV_COMPLETED
      await db.$transaction(async (tx) => {
        // Delete any existing tracking sessions for this attempt to support clean retries
        await tx.trackingSession.deleteMany({
          where: { attemptId },
        });

        // Save normalized session output
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

      console.log(`✅ [CV Processing Worker] Successful tracking for Attempt: ${attemptId}`);

      await logAuditAction(db, {
        userId: null,
        ipAddress,
        action: "CV_TRACKING_COMPLETED",
        resource: `Attempt:${attemptId}`,
        result: "SUCCESS",
        details: `CV tracking landmarks and kinematics features extracted successfully. Confidence: ${trackingResult.overallConfidence}`,
      });

      // Automatically transition to scoring assessment logic
      await this.runAssessmentScoring(attemptId, trackingResult, features);

    } catch (err: any) {
      console.error(`❌ [CV Processing Worker] Failure for Attempt: ${attemptId}:`, err.message);

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
      // Clear job activity lock
      this.activeJobs.delete(attemptId);
    }
  }

  private async runAssessmentScoring(attemptId: string, tracking: any, features: any) {
    try {
      console.log(`📊 [CV Processing Worker] Transitioning to Scoring Engine for Attempt: ${attemptId}`);

      await db.attempt.update({
        where: { id: attemptId },
        data: { status: "ASSESSMENT_READY" },
      });

      // We run the assessment score calculations utilizing the extracted CV features
      const baseResult = await assessmentProvider.generateAssessment(attemptId);

      // Save scoring details and transition to final COMPLETED status
      await db.$transaction([
        // Create timeline events
        ...baseResult.detectedEvents.map((evt) =>
          db.detectedEvent.create({
            data: {
              attemptId,
              eventType: evt.eventType,
              timestamp: evt.timestamp,
              details: evt.details,
            },
          })
        ),
        // Create errors
        ...baseResult.detectedErrors.map((err) =>
          db.detectedError.create({
            data: {
              attemptId,
              errorType: err.errorType,
              timestamp: err.timestamp,
              details: err.details,
            },
          })
        ),
        // Update final scoring values
        db.attempt.update({
          where: { id: attemptId },
          data: {
            status: "COMPLETED",
            checklistScore: baseResult.checklistScore,
            motionScore: baseResult.motionScore,
            compositeScore: baseResult.compositeScore,
            feedbackMarkdown: baseResult.feedbackMarkdown,
          },
        }),
      ]);

      await logAuditAction(db, {
        userId: null,
        ipAddress: "127.0.0.1",
        action: "ASSESSMENT_COMPLETED",
        resource: `Attempt:${attemptId}`,
        result: "SUCCESS",
        details: `Final clinical scoring generated from CV tracking metrics. Composite: ${baseResult.compositeScore}`,
      });

    } catch (err: any) {
      console.error(`❌ [CV Processing Worker] Scoring failure for Attempt: ${attemptId}:`, err.message);

      await db.attempt.update({
        where: { id: attemptId },
        data: { 
          status: "ASSESSMENT_FAILED",
          feedbackMarkdown: `### Clinical Scoring Failed\nError: ${err.message}`,
        },
      });
    }
  }
}

export const cvQueueService = new CVQueueService();
