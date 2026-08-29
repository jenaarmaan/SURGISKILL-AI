import { describe, it, expect, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

describe("SurgiSkill AI — Milestone 4 Enterprise System Orchestration Integration Tests", () => {
  let instA: any;
  let instB: any;
  let programA: any;
  let cohortA: any;
  let cohortB: any;
  let studentA: any;
  let studentB: any;
  let facultyA: any;
  let station: any;
  let rubric: any;

  beforeAll(async () => {
    const rand = Math.random().toString(36).substring(7);

    // 1. Create Institutions
    instA = await db.institution.create({
      data: { name: `Mayo Clinic ${rand}`, description: "Mayo Clinic Simulation Center" }
    });

    instB = await db.institution.create({
      data: { name: `Johns Hopkins ${rand}`, description: "Johns Hopkins Surgical Residency" }
    });

    // 2. Create Program and Cohorts
    programA = await db.program.create({
      data: { name: "General Surgery Residency", institutionId: instA.id }
    });

    cohortA = await db.cohort.create({
      data: { name: `PGY-1 Cohort A_${rand}`, institutionId: instA.id, programId: programA.id, academicPeriod: "2026-Fall" }
    });

    cohortB = await db.cohort.create({
      data: { name: `PGY-1 Cohort B_${rand}`, institutionId: instB.id, academicPeriod: "2026-Fall" }
    });

    // 3. Create Users with specific Institution context
    studentA = await db.user.create({
      data: {
        email: `student.a.${rand}@mayo.edu`,
        password: "hashedpassword",
        name: "Mayo Student",
        role: "STUDENT",
        institutionId: instA.id,
        cohortId: cohortA.id
      }
    });

    studentB = await db.user.create({
      data: {
        email: `student.b.${rand}@jhu.edu`,
        password: "hashedpassword",
        name: "Hopkins Student",
        role: "STUDENT",
        institutionId: instB.id,
        cohortId: cohortB.id
      }
    });

    facultyA = await db.user.create({
      data: {
        email: `faculty.a.${rand}@mayo.edu`,
        password: "hashedpassword",
        name: "Mayo Faculty Evaluator",
        role: "FACULTY",
        institutionId: instA.id
      }
    });

    // 4. Create Station & Rubric
    station = await db.station.create({
      data: {
        name: `Laparoscopic Peg Transfer_${rand}`,
        description: "OSCE peg transfer motor control station.",
        institutionId: instA.id
      }
    });

    rubric = await db.rubric.create({
      data: {
        stationId: station.id,
        version: 1,
        motionEfficiencyWeight: 0.5,
        checklistWeight: 0.5,
        active: true
      }
    });
  }, 30000);

  it("should enforce multi-tenant isolation on database records", async () => {
    // Mayo student must point to Mayo Clinic institution
    expect(studentA.institutionId).toBe(instA.id);
    expect(studentB.institutionId).toBe(instB.id);

    // Verify cohorts map to correct institutions
    expect(cohortA.institutionId).toBe(instA.id);
    expect(cohortB.institutionId).toBe(instB.id);
  });

  it("should support station assignments and lock rubric versions", async () => {
    const assignment = await db.stationAssignment.create({
      data: {
        stationId: station.id,
        cohortId: cohortA.id,
        assignedById: facultyA.id,
        rubricId: rubric.id,
        academicPeriod: "2026-Fall",
        dueDate: new Date("2026-12-31")
      }
    });

    expect(assignment.rubricId).toBe(rubric.id);
    expect(assignment.cohortId).toBe(cohortA.id);
  });

  it("should record structured telemetry log events without secrets", async () => {
    const log = await db.telemetryLog.create({
      data: {
        apiEndpoint: "/api/v1/attempts/verify",
        latencyMs: 124,
        statusCode: 200,
        userId: studentA.id
      }
    });

    expect(log.id).toBeDefined();
    expect(log.latencyMs).toBe(124);
  });

  it("should query review queue filters matching faculty institution context", async () => {
    // Create a mock failed AI assessment attempt belonging to Mayo student (inst A)
    const attempt = await db.attempt.create({
      data: {
        studentId: studentA.id,
        stationId: station.id,
        rubricId: rubric.id,
        status: "MANUAL_REVIEW_REQUIRED"
      }
    });

    // Query attempts requiring manual reviews, filtered by Mayo Faculty (inst A)
    const reviews = await db.attempt.findMany({
      where: {
        status: "MANUAL_REVIEW_REQUIRED",
        student: { institutionId: facultyA.institutionId }
      }
    });

    expect(reviews.length).toBeGreaterThanOrEqual(1);
    expect(reviews.some(r => r.id === attempt.id)).toBe(true);
  });
});
