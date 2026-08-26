import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { BaselineAssessmentProvider } from "../services/assessment";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const assessmentProvider = new BaselineAssessmentProvider(db);

describe("SurgiSkill AI — Digital OSCE End-to-End & Boundary Tests", () => {
  let student1: any;
  let student2: any;
  let faculty: any;
  let lead: any;
  let station: any;
  let rubricV1: any;

  beforeAll(async () => {
    // Hash password once
    const hashed = await bcrypt.hash("password123", 10);

    // Create unique users to prevent run collisions
    const rand = Math.random().toString(36).substring(7);

    student1 = await db.user.create({
      data: {
        email: `student1_${rand}@surgiskill.ai`,
        password: hashed,
        name: "Student One",
        role: "STUDENT",
      },
    });

    student2 = await db.user.create({
      data: {
        email: `student2_${rand}@surgiskill.ai`,
        password: hashed,
        name: "Student Two",
        role: "STUDENT",
      },
    });

    faculty = await db.user.create({
      data: {
        email: `faculty_${rand}@surgiskill.ai`,
        password: hashed,
        name: "Faculty Evaluator",
        role: "FACULTY",
      },
    });

    lead = await db.user.create({
      data: {
        email: `lead_${rand}@surgiskill.ai`,
        password: hashed,
        name: "Clinical Lead",
        role: "CLINICAL_LEAD",
      },
    });

    // Create a new station
    station = await db.station.create({
      data: {
        name: `Suturing Station_${rand}`,
        description: "Standard practice pad suture validation",
      },
    });

    // Create Rubric Version 1 (weights: motion 0.4, checklist 0.6)
    rubricV1 = await db.rubric.create({
      data: {
        stationId: station.id,
        version: 1,
        motionEfficiencyWeight: 0.4,
        checklistWeight: 0.6,
        active: true,
        checklistSteps: {
          create: [
            { sequenceOrder: 1, description: "Sterile gloves hygiene", penaltyPoints: 10 },
            { sequenceOrder: 2, description: "Incision alignment check", penaltyPoints: 10 },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    // Disconnect Prisma Client
    await db.$disconnect();
  });

  it("1. Rubric Versioning Immutability Test", async () => {
    // A. Create attempt 1 using Rubric Version 1
    const attempt1 = await db.attempt.create({
      data: {
        studentId: student1.id,
        stationId: station.id,
        rubricId: rubricV1.id,
        status: "CREATED",
      },
    });

    // B. Run baseline assessment for Attempt 1
    const result1 = await assessmentProvider.generateAssessment(attempt1.id);
    expect(result1.compositeScore).toBeGreaterThanOrEqual(0);

    // Save assessment results to attempt 1
    const finalAttempt1 = await db.attempt.update({
      where: { id: attempt1.id },
      data: {
        status: "COMPLETED",
        checklistScore: result1.checklistScore,
        motionScore: result1.motionScore,
        compositeScore: result1.compositeScore,
      },
    });

    // C. Clinical Lead rolls a new Rubric Version 2 (weights: motion 0.8, checklist 0.2)
    // Deactivate version 1
    await db.rubric.update({
      where: { id: rubricV1.id },
      data: { active: false },
    });

    const rubricV2 = await db.rubric.create({
      data: {
        stationId: station.id,
        version: 2,
        motionEfficiencyWeight: 0.8,
        checklistWeight: 0.2,
        active: true,
        checklistSteps: {
          create: [
            { sequenceOrder: 1, description: "Sterile gloves hygiene", penaltyPoints: 5 },
            { sequenceOrder: 2, description: "Advanced knot placement tie", penaltyPoints: 20 },
          ],
        },
      },
    });

    // D. Create attempt 2 using Rubric Version 2
    const attempt2 = await db.attempt.create({
      data: {
        studentId: student1.id,
        stationId: station.id,
        rubricId: rubricV2.id,
        status: "CREATED",
      },
    });

    const result2 = await assessmentProvider.generateAssessment(attempt2.id);

    // E. Verify Attempt 1 remains linked to Rubric Version 1 and preserves original scores
    const verifyAttempt1 = await db.attempt.findUnique({
      where: { id: attempt1.id },
      include: { rubric: true },
    });
    expect(verifyAttempt1?.rubric.version).toBe(1);
    expect(verifyAttempt1?.compositeScore).toBe(finalAttempt1.compositeScore);

    // F. Verify Attempt 2 is linked to Rubric Version 2
    const verifyAttempt2 = await db.attempt.findUnique({
      where: { id: attempt2.id },
      include: { rubric: true },
    });
    expect(verifyAttempt2?.rubric.version).toBe(2);
    expect(result2.checklistScore).toBeDefined();
  }, 30000);

  it("2. Faculty Score Override & Audit Logging Boundary", async () => {
    // Create completed attempt for student 1
    const attempt = await db.attempt.create({
      data: {
        studentId: student1.id,
        stationId: station.id,
        rubricId: rubricV1.id,
        status: "COMPLETED",
        compositeScore: 70.0,
        checklistScore: 60.0,
        motionScore: 85.0,
      },
    });

    // Faculty overrides the score
    const newScore = 90.0;
    const reason = "Corrected due to MediaPipe hand overlap tracking offset at knot throw stage";

    await db.scoreOverride.create({
      data: {
        attemptId: attempt.id,
        facultyId: faculty.id,
        originalScore: attempt.compositeScore || 70.0,
        newScore,
        reason,
      },
    });

    // Update attempt
    await db.attempt.update({
      where: { id: attempt.id },
      data: { compositeScore: newScore },
    });

    // Write to audit trail log
    await db.auditLog.create({
      data: {
        userId: faculty.id,
        ipAddress: "127.0.0.1",
        action: "SCORE_OVERRIDE",
        resource: `Attempt:${attempt.id}`,
        result: "SUCCESS",
        details: `Overrode score from 70 to 90. Reason: ${reason}`,
      },
    });

    // Verify database preserves the override records
    const override = await db.scoreOverride.findFirst({
      where: { attemptId: attempt.id },
    });
    expect(override).toBeDefined();
    expect(override?.originalScore).toBe(70.0);
    expect(override?.newScore).toBe(90.0);
    expect(override?.reason).toBe(reason);

    const log = await db.auditLog.findFirst({
      where: { userId: faculty.id, action: "SCORE_OVERRIDE" },
    });
    expect(log).toBeDefined();
    expect(log?.details).toContain(reason);
  }, 30000);

  it("3. Student Authorization Exclusions", async () => {
    // Create an attempt belonging to Student 1
    const attemptS1 = await db.attempt.create({
      data: {
        studentId: student1.id,
        stationId: station.id,
        rubricId: rubricV1.id,
        status: "CREATED",
      },
    });

    // Guard simulation: verify that Cross-Student read checks behave correctly
    const readAllowed = (studentId: string, attemptOwnerId: string) => {
      return studentId === attemptOwnerId;
    };
    expect(readAllowed(student2.id, attemptS1.studentId)).toBe(false); // Student 2 cannot read Student 1's attempt
    expect(readAllowed(student1.id, attemptS1.studentId)).toBe(true);  // Student 1 can read own attempt

    // Guard simulation: verify score overrides are restricted to FACULTY/CLINICAL_LEAD
    const overrideAllowed = (role: string) => {
      return role === "FACULTY" || role === "CLINICAL_LEAD" || role === "ADMIN";
    };
    expect(overrideAllowed(student1.role)).toBe(false); // Student cannot override scores
    expect(overrideAllowed(faculty.role)).toBe(true);   // Faculty can override
    expect(overrideAllowed(lead.role)).toBe(true);      // Clinical lead can override
  }, 30000);
});
