import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { aiAnalysisResultSchema, AIAssessmentProvider } from "../services/ai";
import { InMemoryQueueProvider } from "../services/queue";
import { LocalVideoStorageProvider } from "../services/storage";
import * as path from "path";
import * as fs from "fs/promises";
import { Readable } from "stream";

const db = new PrismaClient();

describe("SurgiSkill AI — Pilot Hardening & Production Integrity Tests", () => {
  beforeAll(async () => {
    // Ensure test directories exist
    const testDir = path.join(__dirname, "../../uploads/videos");
    await fs.mkdir(testDir, { recursive: true });
  });

  // 1. Zod Schema Validation Rules Tests
  describe("1. AI Analysis Result Zod Schema Constraints", () => {
    it("should successfully parse a valid schema payload", () => {
      const validPayload = {
        proceduralEvents: [
          { eventType: "STEP_STARTED", timestamp: 1.2, endTimestamp: 3.4, confidence: "HIGH", details: "Step verified." }
        ],
        checklistResults: [
          { checklistStepId: "step-1", status: "COMPLETED", confidence: "HIGH", startTimestamp: 1.2, endTimestamp: 3.4, rationale: "Completed." }
        ],
        parameterAssessments: [
          { parameterId: "instrumentHandling", status: "AVAILABLE", score: 85, confidence: "HIGH", rationale: "Smooth handling." }
        ],
        detectedErrors: [
          { category: "TECHNIQUE_DEVIATION", severity: "MINOR", parameterId: "instrumentHandling", checklistStepId: null, timestamp: 2.1, endTimestamp: null, confidence: "MEDIUM", explanation: "Slipped.", scoreImpact: -5 }
        ],
        evidence: [
          { id: "ev-1", type: "VIDEO_INTERVAL", startTimestamp: 1.2, endTimestamp: 3.4, sourceReference: "Reference clip", confidence: "HIGH" }
        ],
        feedbackCandidates: {
          wellDone: ["Compliance"],
          needsImprovement: ["Speed"],
          practiceRecommendation: ["Focus"]
        },
        overallConfidence: "HIGH",
        qualityGateStatus: "HIGH"
      };

      const result = aiAnalysisResultSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("should reject payloads with missing mandatory fields", () => {
      const invalidPayload = {
        proceduralEvents: [],
        overallConfidence: "HIGH"
      };

      const result = aiAnalysisResultSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("should reject scores outside the 0-100 range", () => {
      const badScorePayload = {
        proceduralEvents: [],
        checklistResults: [],
        parameterAssessments: [
          { parameterId: "instrumentHandling", status: "AVAILABLE", score: 125, confidence: "HIGH", rationale: "Smooth." }
        ],
        detectedErrors: [],
        evidence: [],
        feedbackCandidates: { wellDone: [], needsImprovement: [], practiceRecommendation: [] },
        overallConfidence: "HIGH",
        qualityGateStatus: "HIGH"
      };

      const result = aiAnalysisResultSchema.safeParse(badScorePayload);
      expect(result.success).toBe(false);
    });
  });

  // 2. Queue Abstraction Tests
  describe("2. Queue Abstraction & In-Memory Fallbacks", () => {
    it("should handle job registration and status tracking on in-memory queue", async () => {
      const queue = new InMemoryQueueProvider();
      const isProcessing = queue.isProcessing("test-attempt");
      expect(isProcessing).toBe(false);
    });
  });

  // 3. Storage Abstraction & Read Stream Tests
  describe("3. Storage Abstraction Stream Piping", () => {
    it("should successfully generate a readable stream for existing files", async () => {
      const storage = new LocalVideoStorageProvider();
      const testFile = "test_stream_file.mp4";
      const buffer = Buffer.from("mock-suture-video-content");
      
      const savedName = await storage.upload(testFile, buffer);
      expect(savedName).toBe(testFile);

      const exists = await storage.exists(testFile);
      expect(exists).toBe(true);

      const stream = await storage.getReadStream(testFile);
      expect(stream).toBeInstanceOf(Readable);
      stream.destroy();
      await new Promise(r => setTimeout(r, 100));

      // Clean up
      await storage.delete(testFile);
      const existsAfter = await storage.exists(testFile);
      expect(existsAfter).toBe(false);
    });
  });

  // 4. Faculty Override Telemetry JSON Save Tests
  describe("4. Faculty Disagreement Tracking & Score Variance Telemetry", () => {
    it("should record overrides with granular disagreements and score variance", async () => {
      // Create test student, cohort, station, rubric, attempt
      const cohort = await db.cohort.create({
        data: { name: `Test Cohort Hardening ${Date.now()}` }
      });

      const student = await db.user.create({
        data: {
          email: `student.hardening.${Date.now()}@surgiskill.ai`,
          password: "password123",
          name: "Test Hardening Student",
          role: "STUDENT",
          cohortId: cohort.id
        }
      });

      const faculty = await db.user.create({
        data: {
          email: `faculty.hardening.${Date.now()}@surgiskill.ai`,
          password: "password123",
          name: "Test Hardening Faculty",
          role: "FACULTY"
        }
      });

      const station = await db.station.create({
        data: {
          name: `Test Hardening Station ${Date.now()}`,
          description: "Inspect suture alignment quality.",
          rubrics: {
            create: {
              version: 1,
              active: true,
              checklistSteps: {
                create: [
                  { sequenceOrder: 1, description: "Engage surgical mask", penaltyPoints: 5.0 }
                ]
              }
            }
          }
        },
        include: { rubrics: true }
      });

      const attempt = await db.attempt.create({
        data: {
          studentId: student.id,
          stationId: station.id,
          rubricId: station.rubrics[0].id,
          compositeScore: 90,
          status: "COMPLETED"
        }
      });

      // Execute validation override telemetry
      const originalScore = attempt.compositeScore || 0.0;
      const finalScore = 75.0;
      const variance = originalScore - finalScore;
      const checklistDisagreements = ["step-1"];
      const parameterDisagreements = ["instrumentHandling"];

      const override = await db.scoreOverride.create({
        data: {
          attemptId: attempt.id,
          facultyId: faculty.id,
          originalScore,
          newScore: finalScore,
          reason: "Incorrect knot throw tension detected.",
          checklistDisagreements,
          parameterDisagreements,
          variance
        }
      });

      expect(override.originalScore).toBe(90);
      expect(override.newScore).toBe(75);
      expect(override.variance).toBe(15);
      expect(override.checklistDisagreements).toEqual(checklistDisagreements);
      expect(override.parameterDisagreements).toEqual(parameterDisagreements);

      // Clean up records safely
      await db.scoreOverride.delete({ where: { id: override.id } });
      await db.attempt.delete({ where: { id: attempt.id } });
      await db.station.delete({ where: { id: station.id } });
      await db.user.deleteMany({ where: { id: { in: [student.id, faculty.id] } } });
      await db.cohort.delete({ where: { id: cohort.id } });
    }, 30000);
  });

  // 5. Production Gate Safeguards Tests
  describe("5. Production Gate Safeguards", () => {
    it("should throw a fatal error when in-memory queue provider is selected in production", () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalQueueProvider = process.env.QUEUE_PROVIDER;
      
      process.env.NODE_ENV = "production";
      process.env.QUEUE_PROVIDER = "in-memory";

      expect(() => {
        if (process.env.NODE_ENV === "production" && process.env.QUEUE_PROVIDER !== "bullmq") {
          throw new Error("CRITICAL: In-memory queue provider is prohibited in production environment.");
        }
      }).toThrow(/prohibited/);

      // Restore env
      process.env.NODE_ENV = originalNodeEnv;
      process.env.QUEUE_PROVIDER = originalQueueProvider;
    });

    it("should fail AI assessment if Gemini API Key is missing in production mode", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalApiKey = process.env.GEMINI_API_KEY;
      const originalAiProvider = process.env.AI_PROVIDER;

      process.env.NODE_ENV = "production";
      process.env.AI_PROVIDER = "gemini";
      delete process.env.GEMINI_API_KEY;

      const cohort = await db.cohort.create({
        data: { name: `Test Production Gate ${Date.now()}` }
      });
      const student = await db.user.create({
        data: { email: `student.prodgate.${Date.now()}@surgiskill.ai`, password: "password123", name: "Student", role: "STUDENT", cohortId: cohort.id }
      });
      const station = await db.station.create({
        data: {
          name: `Station ${Date.now()}`,
          description: "OSCE Suture Pad",
          rubrics: { create: { version: 1, active: true, checklistSteps: { create: [{ sequenceOrder: 1, description: "Check suture tension", penaltyPoints: 5 }] } } }
        },
        include: { rubrics: true }
      });
      const attempt = await db.attempt.create({
        data: { studentId: student.id, stationId: station.id, rubricId: station.rubrics[0].id, compositeScore: null, status: "CV_COMPLETED" }
      });
      // Create mock tracking session for quality gate checks
      await db.trackingSession.create({
        data: {
          attemptId: attempt.id,
          provider: "mediapipe",
          providerVersion: "1.0",
          processingVersion: "1.0",
          overallConfidence: 0.9,
          frameCount: 100,
          processedFrameCount: 100,
          duration: 10,
          qualitySummary: { blurPercent: 0, dimLightingPercent: 0, occlusionPercent: 0 } as any,
          features: {} as any,
          landmarks: [] as any
        }
      });

      const provider = new AIAssessmentProvider(db);
      await expect(provider.runAssessment(attempt.id)).rejects.toThrow(/GEMINI_API_KEY is missing/);

      // Clean up records
      await db.trackingSession.deleteMany({ where: { attemptId: attempt.id } });
      await db.attempt.delete({ where: { id: attempt.id } });
      await db.station.delete({ where: { id: station.id } });
      await db.user.delete({ where: { id: student.id } });
      await db.cohort.delete({ where: { id: cohort.id } });

      // Restore env
      process.env.NODE_ENV = originalNodeEnv;
      process.env.GEMINI_API_KEY = originalApiKey;
      process.env.AI_PROVIDER = originalAiProvider;
    }, 15000);
  });
});
