import { PrismaClient } from "@prisma/client";

export interface AssessmentResult {
  checklistScore: number;
  motionScore: number;
  compositeScore: number;
  feedbackMarkdown: string;
  landmarks: any;
  detectedEvents: Array<{ eventType: string; timestamp: number; details: string }>;
  detectedErrors: Array<{ errorType: string; timestamp: number; details: string }>;
}

export interface AssessmentProvider {
  generateAssessment(attemptId: string, simulateFailure?: boolean): Promise<AssessmentResult>;
}

export class BaselineAssessmentProvider implements AssessmentProvider {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async generateAssessment(attemptId: string, simulateFailure = false): Promise<AssessmentResult> {
    if (simulateFailure) {
      throw new Error("Simulated CV pipeline processing error: Frame stream corruption.");
    }

    // Fetch attempt details along with the associated rubric and checklist steps
    const attempt = await this.db.attempt.findUnique({
      where: { id: attemptId },
      include: {
        station: true,
        rubric: {
          include: {
            checklistSteps: { orderBy: { sequenceOrder: "asc" } },
          },
        },
      },
    });

    if (!attempt) {
      throw new Error(`Attempt ${attemptId} not found in database.`);
    }

    const steps = attempt.rubric.checklistSteps;
    if (steps.length === 0) {
      throw new Error(`Active rubric for station ${attempt.stationId} has no checklist steps.`);
    }

    const completedSteps: string[] = [];
    const missedSteps: string[] = [];
    let checklistScore = 100.0;

    // Deterministic simulation (can adjust slightly based on attempt id character values for reproducibility)
    const seed = attemptId.charCodeAt(0) + attemptId.charCodeAt(attemptId.length - 1);
    
    steps.forEach((step, idx) => {
      // Deterministically complete steps, making sure at least sequence 1 is always true
      const complete = (seed + idx) % 5 !== 0 || step.sequenceOrder === 1;
      if (complete) {
        completedSteps.push(step.description);
      } else {
        missedSteps.push(step.description);
        checklistScore -= step.penaltyPoints;
      }
    });

    checklistScore = Math.max(0.0, checklistScore);

    // Deterministic motion efficiency score calculation
    const motionScore = Math.round(78 + (seed % 18)); // 78-95 range
    const weightMotion = attempt.rubric.motionEfficiencyWeight;
    const weightChecklist = attempt.rubric.checklistWeight;
    const compositeScore = Math.round((checklistScore * weightChecklist) + (motionScore * weightMotion));

    // Structured Video Annotation Timelines
    const detectedEvents = [
      { eventType: "HANDS_DETECTED", timestamp: 1.2, details: "Hands positioned inside guided framing boundary." },
      { eventType: "INSTRUMENT_GRIP", timestamp: 2.5, details: "Needle holder grip verified on suturing needle." },
      { eventType: "NEEDLE_ENTRY", timestamp: 5.4, details: "Suturing needle entered tissue layer." },
      { eventType: "NEEDLE_EXIT", timestamp: 8.1, details: "Suturing needle exited tissue layer." },
      { eventType: "KNOT_TIED", timestamp: 14.2, details: "Instrument tie secured successfully." },
    ];

    const detectedErrors: Array<{ errorType: string; timestamp: number; details: string }> = [];
    if (missedSteps.length > 0) {
      detectedErrors.push({
        errorType: "CHECKLIST_DEVIATION",
        timestamp: 9.5,
        details: `Skipped or out-of-order execution detected: '${missedSteps[0]}'`,
      });
    }

    if (seed % 2 === 0) {
      detectedErrors.push({
        errorType: "EXCESSIVE_FORCE",
        timestamp: 6.8,
        details: "Sudden acceleration spike detected during tissue penetration.",
      });
    }

    // MediaPipe spatial tracking output data (simulated frames)
    const landmarks = Array.from({ length: 10 }, (_, index) => ({
      frame: index * 10,
      timestamp: index * 0.33,
      leftHand: { x: 0.45 + (seed % 10) * 0.005, y: 0.55 + (seed % 5) * 0.005 },
      rightHand: { x: 0.55 - (seed % 5) * 0.005, y: 0.52 + (seed % 10) * 0.005 },
      instrumentCentroid: { x: 0.5 + (seed % 2) * 0.01, y: 0.5 - (seed % 3) * 0.01 },
    }));

    // Generate VLM Feedback Report markdown
    const feedbackMarkdown = `### AI Technique & Assessment Feedback Report
**Station**: ${attempt.station.name}
**Rubric Version**: v${attempt.rubric.version}
**Composite Surgical Score**: ${compositeScore}/100

#### 1. Procedural Adherence Checklist (Score: ${checklistScore.toFixed(1)}/100)
${steps.map(s => {
  const isOk = completedSteps.includes(s.description);
  return `- [${isOk ? "x" : " "}] ${s.description} ${isOk ? "*(Completed)*" : `*(Missed — Penalty: -${s.penaltyPoints} pts)*`}`;
}).join("\n")}

#### 2. Instrument & Motion Quality (Score: ${motionScore}/100)
- **Path Length (Efficiency)**: Normal range. Movement trajectories indicate smooth loop entries.
- **Hand Tremor / Jitter**: Minimum jitter detected. Instrument handling shows high stability.
- **Speed Bounds**: Speed profile was consistent with standard residency thresholds.

#### 3. Critical Improvements for Repeat Practice
${missedSteps.length > 0 
  ? `- **Checklist Compliance**: Ensure you perform step: *${missedSteps[0]}* next time.`
  : "- **Checklist Compliance**: Excellent step execution sequence."}
- **Needle Penetration Angle**: Maintain a strict perpendicular entry angle of 90 degrees to limit tissue micro-tearing.
`;

    return {
      checklistScore,
      motionScore,
      compositeScore,
      feedbackMarkdown,
      landmarks,
      detectedEvents,
      detectedErrors,
    };
  }
}
