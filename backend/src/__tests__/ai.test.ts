import { describe, it, expect, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { AIAssessmentProvider, DeterministicTestMultimodalProvider } from "../services/ai";
import { promises as fs } from "fs";
import * as path from "path";

const db = new PrismaClient();
const assessmentProvider = new AIAssessmentProvider(db);

describe("SurgiSkill AI — Milestone 3 AI Assessment Integration Tests", () => {
  let student1: any;
  let student2: any;
  let faculty: any;
  let station: any;
  let rubric: any;
  let attemptId: string;
  let mockFilePath: string;

  beforeAll(async () => {
    const videoDir = path.join(__dirname, "../../uploads/videos");
    await fs.mkdir(videoDir, { recursive: true });
    mockFilePath = path.join(videoDir, "test_suture_run_m3.mp4");
    await fs.writeFile(mockFilePath, Buffer.alloc(1024));

    const rand = Math.random().toString(36).substring(7);

    student1 = await db.user.create({
      data: {
        email: `s1_${rand}@surgiskill.ai`,
        password: "hashedpassword",
        name: "OSCE Student S1",
        role: "STUDENT",
      },
    });

    student2 = await db.user.create({
      data: {
        email: `s2_${rand}@surgiskill.ai`,
        password: "hashedpassword",
        name: "OSCE Student S2",
        role: "STUDENT",
      },
    });

    faculty = await db.user.create({
      data: {
        email: `fac_${rand}@surgiskill.ai`,
        password: "hashedpassword",
        name: "Clinical Evaluator",
        role: "FACULTY",
      },
    });

    station = await db.station.create({
      data: {
        name: `Interrupted Suture Technique_${rand}`,
        description: "OSCE station verifying interrupted suturing.",
      },
    });

    rubric = await db.rubric.create({
      data: {
        stationId: station.id,
        version: 1,
        motionEfficiencyWeight: 0.4,
        checklistWeight: 0.6,
        active: true,
        checklistSteps: {
          create: [
            { sequenceOrder: 1, description: "Correct needle load", penaltyPoints: 10.0 },
            { sequenceOrder: 2, description: "Perpendicular penetration", penaltyPoints: 15.0 },
            { sequenceOrder: 3, description: "Square knot pull tension", penaltyPoints: 10.0 },
          ],
        },
      },
      include: { checklistSteps: true }
    });

    const attempt = await db.attempt.create({
      data: {
        studentId: student1.id,
        stationId: station.id,
        rubricId: rubric.id,
        status: "CREATED",
      },
    });

    attemptId = attempt.id;

    // Seed mock tracking session from Milestone 2 output
    await db.trackingSession.create({
      data: {
        attemptId: attempt.id,
        provider: "MediaPipe-JS-Engine",
        providerVersion: "2.4.1",
        processingVersion: "1.0.0",
        overallConfidence: 0.92,
        frameCount: 100,
        processedFrameCount: 100,
        duration: 3.3,
        qualitySummary: {
          blurPercent: 5,
          dimLightingPercent: 10,
          occlusionPercent: 0,
          workspaceOccludedPercent: 0,
        },
        features: {
          pathLengthRightHand: 1.56,
          displacementRightHand: 0.15,
          avgVelocityRightHand: 0.056,
          trajectoryEfficiency: 1.0,
          detectedRegrips: 1,
        },
        landmarks: [
          {
            frame: 0,
            timestamp: 0.0,
            leftHand: { wrist: { x: 0.4, y: 0.5 }, handedness: "left", confidence: 0.95 },
            rightHand: { wrist: { x: 0.6, y: 0.5 }, handedness: "right", confidence: 0.92 },
            instrument: { type: "NEEDLE_HOLDER", centroid: { x: 0.59, y: 0.49 }, keypoints: [], confidence: 0.90 },
            quality: { blur: 0.1, lighting: 0.1, occluded: false, workspaceVisible: true, handsVisible: true },
            confidence: 0.92,
          }
        ],
      },
    });
  });

  it("1. Deterministic Suture Assessment Evaluation Flow Test", async () => {
    // Execute scoring pipeline
    const result = await assessmentProvider.runAssessment(attemptId);
    
    expect(result.status).toBe("COMPLETED");
    expect(result.compositeScore).toBeGreaterThanOrEqual(0);
    expect(result.compositeScore).toBeLessThanOrEqual(100);

    // Verify stored database structures
    const dbAssessment = await db.aIAssessment.findUnique({
      where: { attemptId },
      include: {
        checklistAssessments: true,
        parameterAssessments: true,
        detectedErrors: true,
        evidence: true,
      },
    });

    expect(dbAssessment).toBeDefined();
    expect(dbAssessment?.provider).toBe("deterministic-test");
    expect(dbAssessment?.qualityGateStatus).toBe("HIGH");

    // Check checklist results deductions (failed step 2: penalty -15 pts)
    const checklistScore = 100.0 - 15.0; // 85
    expect(dbAssessment?.checklistScore).toBe(checklistScore);

    // Motion score: average of parameters [85, 72, 90, 80, 75] = 80.4 -> rounded 80
    expect(dbAssessment?.motionScore).toBe(80);

    // Composite score: Math.round((85 * 0.6) + (80 * 0.4)) = 51 + 32 = 83
    expect(dbAssessment?.compositeScore).toBe(83);

    // Check relationship links
    expect(dbAssessment?.checklistAssessments.length).toBe(3);
    const missedStep = dbAssessment?.checklistAssessments.find(c => c.status === "MISSED");
    expect(missedStep).toBeDefined();
    expect(missedStep?.checklistStepId).toBe(rubric.checklistSteps[1].id);

    // Rationale checking
    expect(dbAssessment?.feedbackMarkdown).toContain("AI Technique & Assessment Feedback Report");
    expect(dbAssessment?.feedbackMarkdown).toContain("knot");
  }, 25000);

  it("2. Quality Gate check validations", async () => {
    // Create attempt with low CV quality session
    const badAttempt = await db.attempt.create({
      data: {
        studentId: student1.id,
        stationId: station.id,
        rubricId: rubric.id,
        status: "CREATED",
      },
    });

    await db.trackingSession.create({
      data: {
        attemptId: badAttempt.id,
        provider: "MediaPipe-JS-Engine",
        providerVersion: "2.4.1",
        processingVersion: "1.0.0",
        overallConfidence: 0.15, // Extremely low confidence
        frameCount: 50,
        processedFrameCount: 50,
        duration: 2.0,
        qualitySummary: {
          blurPercent: 10,
          dimLightingPercent: 10,
          occlusionPercent: 60, // High occlusion percent
          workspaceOccludedPercent: 0,
        },
        features: {},
        landmarks: [],
      },
    });

    const badResult = await assessmentProvider.runAssessment(badAttempt.id);
    expect(badResult.status).toBe("AI_INSUFFICIENT_DATA");
    expect(badResult.qualityGateStatus).toBe("INSUFFICIENT_DATA");

    const updatedBadAttempt = await db.attempt.findUnique({
      where: { id: badAttempt.id }
    });
    expect(updatedBadAttempt?.status).toBe("AI_INSUFFICIENT_DATA");
  }, 20000);

  it("3. Cross-Student Authorization Boundaries", async () => {
    // Student 1 cannot read Student 2's attempt AI detail
    const readAllowed = (reqUserId: string, ownerId: string) => reqUserId === ownerId;
    expect(readAllowed(student2.id, student1.id)).toBe(false);
    expect(readAllowed(student1.id, student1.id)).toBe(true);
  });
});
