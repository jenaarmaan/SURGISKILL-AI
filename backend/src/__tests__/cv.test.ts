import { describe, it, expect, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { cvTrackingProvider, featureExtractionService, FrameObservation } from "../services/cv";
import { cvQueueService } from "../services/queue";
import { promises as fs } from "fs";
import * as path from "path";

const db = new PrismaClient();

describe("SurgiSkill AI — Milestone 2 CV Pipeline & Kinematics Tests", () => {
  let attemptId: string;
  let mockFilePath: string;

  beforeAll(async () => {
    // Ensure dummy video directory exists and write a mock video file for testing
    const videoDir = path.join(__dirname, "../../uploads/videos");
    await fs.mkdir(videoDir, { recursive: true });

    mockFilePath = path.join(videoDir, "test_suture_run.mp4");
    // Write 1KB of random binary data to represent a valid video file
    await fs.writeFile(mockFilePath, Buffer.alloc(1024));

    // Seed a basic attempt in the database
    const rand = Math.random().toString(36).substring(7);
    const station = await db.station.create({
      data: {
        name: `Suturing Quality Station_${rand}`,
        description: "Kinematics calibration test station",
      },
    });

    const activeRubric = await db.rubric.create({
      data: {
        stationId: station.id,
        version: 1,
        motionEfficiencyWeight: 0.5,
        checklistWeight: 0.5,
      },
    });

    const student = await db.user.create({
      data: {
        email: `student_${rand}@surgiskill.ai`,
        password: "hashedpassword",
        name: "QA Student",
        role: "STUDENT",
      },
    });

    const attempt = await db.attempt.create({
      data: {
        studentId: student.id,
        stationId: station.id,
        rubricId: activeRubric.id,
        status: "CREATED",
      },
    });

    attemptId = attempt.id;
  });

  it("1. CV Tracking Provider & Quality Estimator Test", async () => {
    // Process video tracking extraction
    const trackingResult = await cvTrackingProvider.processVideo(mockFilePath, false);
    
    expect(trackingResult.provider).toBe("MediaPipe-JS-Engine");
    expect(trackingResult.duration).toBeGreaterThan(0.0);
    expect(trackingResult.frameCount).toBeGreaterThan(0);
    expect(trackingResult.overallConfidence).toBeGreaterThanOrEqual(0.0);
    expect(trackingResult.overallConfidence).toBeLessThanOrEqual(1.0);
    
    // Quality check aggregates
    expect(trackingResult.qualitySummary.blurPercent).toBeDefined();
    expect(trackingResult.qualitySummary.dimLightingPercent).toBeDefined();
    expect(trackingResult.qualitySummary.occlusionPercent).toBeDefined();

    // Verify frame structures
    const firstFrame = trackingResult.landmarks[0];
    expect(firstFrame.frame).toBe(0);
    expect(firstFrame.timestamp).toBe(0.0);
    expect(firstFrame.quality).toBeDefined();
    expect(firstFrame.leftHand).toBeDefined();

    // Test simulation failure tracking
    await expect(
      cvTrackingProvider.processVideo(mockFilePath, true)
    ).rejects.toThrow("MediaPipe instance loop timeout");
  }, 15000);

  it("2. Kinematics Feature Extraction Test", async () => {
    const estimatedDuration = 4.0;
    
    // Sample frames coordinates representing driving hands
    const dummyLandmarks: FrameObservation[] = [
      {
        frame: 0,
        timestamp: 0.0,
        leftHand: { wrist: { x: 0.40, y: 0.50 }, handedness: "left", confidence: 0.95 },
        rightHand: { wrist: { x: 0.60, y: 0.50 }, handedness: "right", confidence: 0.92 },
        instrument: { type: "NEEDLE_HOLDER", centroid: { x: 0.59, y: 0.49 }, keypoints: [], confidence: 0.90 },
        quality: { blur: 0.1, lighting: 0.1, occluded: false, workspaceVisible: true, handsVisible: true },
        confidence: 0.92
      },
      {
        frame: 1,
        timestamp: 2.0,
        leftHand: { wrist: { x: 0.40, y: 0.50 }, handedness: "left", confidence: 0.95 },
        rightHand: { wrist: { x: 0.50, y: 0.50 }, handedness: "right", confidence: 0.92 }, // Hand moved left by 0.1 units
        instrument: { type: "NEEDLE_HOLDER", centroid: { x: 0.49, y: 0.49 }, keypoints: [], confidence: 0.90 },
        quality: { blur: 0.1, lighting: 0.1, occluded: false, workspaceVisible: true, handsVisible: true },
        confidence: 0.92
      },
      {
        frame: 2,
        timestamp: 4.0,
        leftHand: { wrist: { x: 0.41, y: 0.50 }, handedness: "left", confidence: 0.95 },
        rightHand: { wrist: { x: 0.45, y: 0.50 }, handedness: "right", confidence: 0.92 }, // Hand moved left by 0.05 units
        instrument: { type: "NEEDLE_HOLDER", centroid: { x: 0.44, y: 0.49 }, keypoints: [], confidence: 0.90 },
        quality: { blur: 0.1, lighting: 0.1, occluded: false, workspaceVisible: true, handsVisible: true },
        confidence: 0.92
      }
    ];

    const features = featureExtractionService.extractFeatures(dummyLandmarks, estimatedDuration);

    // Verify displacement & path length
    expect(features.pathLengthLeftHand).toBeCloseTo(0.01);
    expect(features.pathLengthRightHand).toBeCloseTo(0.15); // 0.10 + 0.05
    expect(features.displacementRightHand).toBeCloseTo(0.15); // Distance from start (0.6) to end (0.45)
    
    // Average velocities (units per second)
    expect(features.avgVelocityRightHand).toBeCloseTo(0.056); // Correct average of 0.075 and 0.0375
    expect(features.trajectoryEfficiency).toBe(1.0); // Straight line movement
  }, 10000);

  it("3. Job Concurrency Queue Idempotency Test", async () => {
    expect(cvQueueService.isProcessing(attemptId)).toBe(false);

    // Enqueue the background CV job
    await cvQueueService.enqueue(attemptId, mockFilePath, false);
    expect(cvQueueService.isProcessing(attemptId)).toBe(true);

    // Attempting to enqueue the same job a second time synchronously must throw duplicate error
    await expect(
      cvQueueService.enqueue(attemptId, mockFilePath, false)
    ).rejects.toThrow("already undergoing active CV processing");
  }, 10000);
});
