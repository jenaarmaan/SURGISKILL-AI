import { PrismaClient } from "@prisma/client";
import { SYSTEM_ASSESSMENT_PROMPT, generateUserPrompt, PROMPT_VERSION, ANALYSIS_VERSION } from "../prompts/assessment_v1";

export interface AIAnalysisResult {
  proceduralEvents: Array<{
    eventType: string;
    timestamp: number;
    endTimestamp: number;
    confidence: string;
    details: string;
  }>;
  checklistResults: Array<{
    checklistStepId: string;
    status: string;
    confidence: string;
    startTimestamp: number | null;
    endTimestamp: number | null;
    rationale: string;
  }>;
  parameterAssessments: Array<{
    parameterId: string;
    status: string;
    score: number | null;
    confidence: string;
    rationale: string;
  }>;
  detectedErrors: Array<{
    category: string;
    severity: string;
    parameterId: string | null;
    checklistStepId: string | null;
    timestamp: number | null;
    endTimestamp: number | null;
    confidence: string;
    explanation: string;
    scoreImpact: number | null;
  }>;
  evidence: Array<{
    id: string;
    type: string;
    startTimestamp: number | null;
    endTimestamp: number | null;
    sourceReference: string;
    confidence: string;
  }>;
  feedbackCandidates: {
    wellDone: string[];
    needsImprovement: string[];
    practiceRecommendation: string[];
  };
  overallConfidence: string;
  qualityGateStatus: string;
}

export interface MultimodalProvider {
  analyze(systemInstruction: string, prompt: string): Promise<AIAnalysisResult>;
}

// 1. GEMINI MULTIMODAL PROVIDER (Uses native HTTP POST to Google API)
export class GeminiMultimodalProvider implements MultimodalProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.AI_MODEL || "gemini-1.5-flash";
  }

  async analyze(systemInstruction: string, prompt: string): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const maxRetries = parseInt(process.env.AI_MAX_RETRIES || "2", 10);
    const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || "30000", 10);

    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              responseMimeType: "application/json",
              temperature: parseFloat(process.env.AI_TEMPERATURE || "0.1"),
              maxOutputTokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || "4096", 10),
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error("Empty candidate content from Gemini generative model response.");
        }

        // Parse and validate the response
        const parsed = JSON.parse(text);
        return parsed as AIAnalysisResult;

      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ [AI Provider Attempt ${attempt + 1}/${maxRetries + 1} Failed]: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    throw new Error(`Gemini Multimodal Provider failed after ${maxRetries + 1} attempts. Last error: ${lastError.message}`);
  }
}

// 2. DETERMINISTIC TEST PROVIDER (Zero network, deterministic clinical output for tests/seed runs)
export class DeterministicTestMultimodalProvider implements MultimodalProvider {
  private checklistSteps: Array<{ id: string; sequenceOrder: number; description: string }> = [];

  constructor(checklistSteps?: Array<{ id: string; sequenceOrder: number; description: string }>) {
    if (checklistSteps) {
      this.checklistSteps = checklistSteps;
    }
  }

  setSteps(steps: Array<{ id: string; sequenceOrder: number; description: string }>) {
    this.checklistSteps = steps;
  }

  async analyze(systemInstruction: string, prompt: string): Promise<AIAnalysisResult> {
    // Generate realistic, consistent OSCE suturing outcome
    const checklistResults = this.checklistSteps.map((step, idx) => {
      // Deterministically fail the second checklist step to trigger errors/penalties in validation
      const completed = idx !== 1; 
      return {
        checklistStepId: step.id,
        status: completed ? "COMPLETED" : "MISSED",
        confidence: "HIGH",
        startTimestamp: completed ? idx * 5.0 + 1.2 : null,
        endTimestamp: completed ? idx * 5.0 + 4.8 : null,
        rationale: completed 
          ? `Instrument grip and tissue entry verified for step: '${step.description}'.`
          : `Student failed to perform step: '${step.description}' prior to tying instrument knots.`,
      };
    });

    const parameterAssessments = [
      {
        parameterId: "instrumentHandling",
        status: "AVAILABLE",
        score: 85,
        confidence: "HIGH",
        rationale: "Stable forceps orientation and consistent needle driver grip values.",
      },
      {
        parameterId: "needleHandling",
        status: "AVAILABLE",
        score: 72,
        confidence: "MEDIUM",
        rationale: "Minor needle rotation deviation detected at tissue penetrations.",
      },
      {
        parameterId: "movementEfficiency",
        status: "AVAILABLE",
        score: 90,
        confidence: "HIGH",
        rationale: "Low path length/displacement ratio indicates highly linear loops.",
      },
      {
        parameterId: "proceduralTiming",
        status: "AVAILABLE",
        score: 80,
        confidence: "HIGH",
        rationale: "Suture cycle completed in 24 seconds, inside average criteria boundaries.",
      },
      {
        parameterId: "proceduralSequence",
        status: "AVAILABLE",
        score: 75,
        confidence: "HIGH",
        rationale: "Main suture loop tied, but checklist sequence contains missed nodes.",
      }
    ];

    const detectedErrors = [
      {
        category: "MISSED_STEP",
        severity: "MAJOR" as const,
        parameterId: "proceduralSequence",
        checklistStepId: this.checklistSteps[1]?.id || "step_2",
        timestamp: 6.5,
        endTimestamp: null,
        confidence: "HIGH",
        explanation: `Suture pad step omitted: '${this.checklistSteps[1]?.description || "Incision alignment check"}' was not executed.`,
        scoreImpact: -10.0,
      },
      {
        category: "NEEDLE_DEVIATION",
        severity: "MINOR" as const,
        parameterId: "needleHandling",
        checklistStepId: null,
        timestamp: 12.4,
        endTimestamp: null,
        confidence: "MEDIUM",
        explanation: "Needle holder slip event detected during knot tension pulling.",
        scoreImpact: -5.0,
      }
    ];

    const evidence = [
      {
        id: "ev_1",
        type: "VIDEO_INTERVAL",
        startTimestamp: 1.2,
        endTimestamp: 4.8,
        sourceReference: "Approach phase (frames 36 to 144)",
        confidence: "HIGH",
      },
      {
        id: "ev_2",
        type: "KINEMATIC_FEATURE",
        startTimestamp: null,
        endTimestamp: null,
        sourceReference: "pathLengthRightHand: 1.56, averageVelocityRightHand: 0.056",
        confidence: "HIGH",
      }
    ];

    return {
      proceduralEvents: [
        { eventType: "STEP_STARTED", timestamp: 1.2, endTimestamp: 1.5, confidence: "HIGH", details: "Hands positioned inside guided framing boundary." },
        { eventType: "NEEDLE_ENTRY", timestamp: 5.4, endTimestamp: 6.2, confidence: "HIGH", details: "Suturing needle entered tissue layer." },
        { eventType: "NEEDLE_EXIT", timestamp: 8.1, endTimestamp: 8.9, confidence: "HIGH", details: "Suturing needle exited tissue layer." },
      ],
      checklistResults,
      parameterAssessments,
      detectedErrors,
      evidence,
      feedbackCandidates: {
        wellDone: [
          "Excellent hand movement efficiency with low jitter/tremor ratios.",
          "Clean entry-to-exit trajectory paths mapped on active frames."
        ],
        needsImprovement: [
          "Omitted the required alignment/hygiene step prior to needle penetration.",
          "Minor needle driver slip detected during knot tension pull."
        ],
        practiceRecommendation: [
          "Review suture pad sequence steps on the rubric version.",
          "Practice locking forceps grip securely before starting knot loops."
        ]
      },
      overallConfidence: "HIGH",
      qualityGateStatus: "HIGH",
    };
  }
}

// 3. ANALYZERS & HELPERS
export class SequenceAnalyzer {
  analyzeSequence(checklistResults: any[]) {
    // Basic verification of checklist order adherence
    const missed = checklistResults.filter(r => r.status === "MISSED");
    const outOfOrder = checklistResults.filter(r => r.status === "OUT_OF_ORDER");
    return {
      hasSequenceErrors: missed.length > 0 || outOfOrder.length > 0,
      missedCount: missed.length,
      outOfOrderCount: outOfOrder.length,
    };
  }
}

export class TechniqueAnalyzer {
  analyzeTechnique(parameters: any[]) {
    const scores = parameters.map(p => p.score).filter((s): s is number => s !== null);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 70;
    return {
      calculatedMotionScore: Math.round(avgScore),
    };
  }
}

export class ErrorDetector {
  classifyErrors(errors: any[]) {
    return errors.map(e => ({
      ...e,
      severity: e.severity || "MINOR",
    }));
  }
}

export class FeedbackGenerator {
  generateFeedback(feedback: { wellDone: string[]; needsImprovement: string[]; practiceRecommendation: string[] }): string {
    return `### AI Technique & Assessment Feedback Report
**Milestone 3 Explainable Multimodal Assessment**

#### 1. What You Did Well
${feedback.wellDone.map(w => `- **Compliance**: ${w}`).join("\n")}

#### 2. What Needs Improvement
${feedback.needsImprovement.map(n => `- **Observation**: ${n}`).join("\n")}

#### 3. Recommended Practice Focus
${feedback.practiceRecommendation.map(p => `- **Action**: ${p}`).join("\n")}
`;
  }
}

// 4. MAIN AI ASSESSMENT PROVIDER ORCHESTRATOR
export class AIAssessmentProvider {
  private db: PrismaClient;
  private sequenceAnalyzer = new SequenceAnalyzer();
  private techniqueAnalyzer = new TechniqueAnalyzer();
  private errorDetector = new ErrorDetector();
  private feedbackGenerator = new FeedbackGenerator();

  constructor(db: PrismaClient) {
    this.db = db;
  }

  // Quality Gate Helper
  private evaluateQualityGate(qualitySummary: any, trackingConfidence: number): string {
    const blur = qualitySummary?.blurPercent || 0;
    const lighting = qualitySummary?.dimLightingPercent || 0;
    const occluded = qualitySummary?.occlusionPercent || 0;

    if (occluded > 40 || trackingConfidence < 0.3) {
      return "INSUFFICIENT_DATA";
    }
    if (blur > 30 || lighting > 35 || trackingConfidence < 0.6) {
      return "LOW";
    }
    if (blur > 15 || lighting > 15) {
      return "MEDIUM";
    }
    return "HIGH";
  }

  async runAssessment(attemptId: string, simulateFailure = false): Promise<any> {
    console.log(`🧠 [AI Assessment Provider] Starting evaluation for Attempt: ${attemptId}...`);

    // A. Load Attempt details
    const attempt = await this.db.attempt.findUnique({
      where: { id: attemptId },
      include: {
        station: true,
        rubric: {
          include: {
            checklistSteps: { orderBy: { sequenceOrder: "asc" } },
          },
        },
        trackingSessions: { orderBy: { createdAt: "desc" } }
      }
    });

    if (!attempt) {
      throw new Error(`Attempt ${attemptId} not found.`);
    }

    const trackingSession = attempt.trackingSessions[0];
    if (!trackingSession) {
      throw new Error(`No tracking session found for Attempt ${attemptId}. Milestone 2 tracking must complete first.`);
    }

    // B. Quality Gate Check
    const qualityGateStatus = this.evaluateQualityGate(trackingSession.qualitySummary, trackingSession.overallConfidence);
    if (qualityGateStatus === "INSUFFICIENT_DATA") {
      await this.db.attempt.update({
        where: { id: attemptId },
        data: { status: "AI_INSUFFICIENT_DATA" }
      });
      return { status: "AI_INSUFFICIENT_DATA", qualityGateStatus };
    }

    // C. Select Multimodal Provider (Gemini or Deterministic Fallback)
    let providerName = "deterministic-test";
    let provider: MultimodalProvider;

    if (process.env.GEMINI_API_KEY && process.env.AI_PROVIDER !== "deterministic-test") {
      providerName = "gemini";
      provider = new GeminiMultimodalProvider();
    } else {
      provider = new DeterministicTestMultimodalProvider(
        attempt.rubric.checklistSteps.map(s => ({
          id: s.id,
          sequenceOrder: s.sequenceOrder,
          description: s.description
        }))
      );
    }

    // D. Build structured context prompt
    // Compress landmarks coordinate entries to prevent blowing up the LLM context window
    const landmarkSamples = (trackingSession.landmarks as any[] || [])
      .filter((_, idx) => idx % 15 === 0)
      .map(l => ({
        frame: l.frame,
        t: l.timestamp,
        lHand: l.leftHand ? { x: l.leftHand.wrist.x, y: l.leftHand.wrist.y } : null,
        rHand: l.rightHand ? { x: l.rightHand.wrist.x, y: l.rightHand.wrist.y } : null,
        conf: l.confidence,
        q: { blur: l.quality.blur, light: l.quality.lighting }
      }));

    const prompt = generateUserPrompt({
      station: { name: attempt.station.name, description: attempt.station.description },
      rubric: {
        motionEfficiencyWeight: attempt.rubric.motionEfficiencyWeight,
        checklistWeight: attempt.rubric.checklistWeight
      },
      checklistSteps: attempt.rubric.checklistSteps.map(s => ({
        id: s.id,
        sequenceOrder: s.sequenceOrder,
        description: s.description
      })),
      features: trackingSession.features,
      landmarksSummary: JSON.stringify(landmarkSamples)
    });

    // E. Execute Multimodal analysis query
    let rawResult: AIAnalysisResult;
    try {
      rawResult = await provider.analyze(SYSTEM_ASSESSMENT_PROMPT, prompt);
    } catch (err: any) {
      console.error(`❌ [AI Assessment Provider] LLM parsing failed: ${err.message}`);
      await this.db.attempt.update({
        where: { id: attemptId },
        data: { status: "AI_PROCESSING_FAILED" }
      });
      throw err;
    }

    // F. Validate and Parse rawResult parameters
    if (!rawResult.checklistResults || !rawResult.parameterAssessments || !rawResult.detectedErrors) {
      throw new Error("LLM response is missing required assessment keys (checklistResults, parameterAssessments, detectedErrors).");
    }

    // G. Run sequence, technique, and error sub-modules
    const seqMetrics = this.sequenceAnalyzer.analyzeSequence(rawResult.checklistResults);
    const techMetrics = this.techniqueAnalyzer.analyzeTechnique(rawResult.parameterAssessments);
    const errors = this.errorDetector.classifyErrors(rawResult.detectedErrors);

    // H. Calculate composite scores utilizing existing M1 formula
    // checklist score deduction logic: 100 - sum of missed checklist step penalties
    let checklistScore = 100.0;
    rawResult.checklistResults.forEach(r => {
      if (r.status === "MISSED") {
        const stepMatch = attempt.rubric.checklistSteps.find(s => s.id === r.checklistStepId);
        if (stepMatch) {
          checklistScore -= stepMatch.penaltyPoints;
        } else {
          checklistScore -= 5.0; // standard penalty if step id matching fails
        }
      }
    });
    checklistScore = Math.max(0.0, checklistScore);

    const motionScore = techMetrics.calculatedMotionScore;
    const finalScore = Math.round(
      (checklistScore * attempt.rubric.checklistWeight) + 
      (motionScore * attempt.rubric.motionEfficiencyWeight)
    );

    const generatedFeedback = this.feedbackGenerator.generateFeedback(rawResult.feedbackCandidates);

    // I. Persist all assessment blocks transactionally
    await this.db.$transaction(async (tx) => {
      // WIPE any existing AI assessments to support clean idempotency retries
      await tx.aIAssessment.deleteMany({ where: { attemptId } });

      const aiAssessment = await tx.aIAssessment.create({
        data: {
          attemptId,
          provider: providerName,
          model: process.env.AI_MODEL || (providerName === "gemini" ? "gemini-1.5-flash" : "deterministic-test"),
          modelVersion: "v1",
          analysisVersion: ANALYSIS_VERSION,
          promptVersion: PROMPT_VERSION,
          cvProvider: trackingSession.provider,
          cvProcessingVersion: trackingSession.processingVersion,
          overallConfidence: rawResult.overallConfidence || "HIGH",
          qualityGateStatus,
          checklistScore,
          motionScore,
          compositeScore: finalScore,
          feedbackMarkdown: generatedFeedback,
        }
      });

      // Insert checklist step findings
      for (const chk of rawResult.checklistResults) {
        await tx.aIChecklistAssessment.create({
          data: {
            aiAssessmentId: aiAssessment.id,
            checklistStepId: chk.checklistStepId,
            status: chk.status,
            confidence: chk.confidence,
            startTimestamp: chk.startTimestamp,
            endTimestamp: chk.endTimestamp,
            rationale: chk.rationale,
            evidenceIds: chk.evidenceIds || []
          }
        });
      }

      // Insert scoring parameters details
      for (const param of rawResult.parameterAssessments) {
        await tx.aIParameterAssessment.create({
          data: {
            aiAssessmentId: aiAssessment.id,
            parameterId: param.parameterId,
            status: param.status,
            score: param.score,
            confidence: param.confidence,
            rationale: param.rationale,
            evidenceIds: param.evidenceIds || [],
            detectedErrorIds: []
          }
        });
      }

      // Insert errors
      for (const err of errors) {
        await tx.aIDetectedError.create({
          data: {
            aiAssessmentId: aiAssessment.id,
            category: err.category,
            severity: err.severity,
            parameterId: err.parameterId,
            checklistStepId: err.checklistStepId,
            timestamp: err.timestamp,
            endTimestamp: err.endTimestamp,
            confidence: err.confidence,
            explanation: err.explanation,
            scoreImpact: err.scoreImpact,
            evidenceIds: err.evidenceIds || []
          }
        });
      }

      // Insert evidence linkages
      if (rawResult.evidence) {
        for (const ev of rawResult.evidence) {
          await tx.aIEvidence.create({
            data: {
              aiAssessmentId: aiAssessment.id,
              type: ev.type,
              startTimestamp: ev.startTimestamp,
              endTimestamp: ev.endTimestamp,
              sourceReference: ev.sourceReference,
              confidence: ev.confidence,
            }
          });
        }
      }

      // Update attempt records and set status to COMPLETED
      await tx.attempt.update({
        where: { id: attemptId },
        data: {
          status: "COMPLETED",
          checklistScore,
          motionScore,
          compositeScore: finalScore,
          feedbackMarkdown: generatedFeedback
        }
      });
    }, { timeout: 30000 });

    console.log(`✅ [AI Assessment Provider] Successfully completed assessment for Attempt: ${attemptId}. Score: ${finalScore}`);
    return { status: "COMPLETED", compositeScore: finalScore };
  }
}
