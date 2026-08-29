export const PROMPT_VERSION = "1.0.0";
export const ANALYSIS_VERSION = "1.0.0";

export const SYSTEM_ASSESSMENT_PROMPT = `You are a clinical expert surgical evaluator assessing resident suturing skills for a Digital OSCE.
Your job is to analyze the provided raw Computer Vision (CV) observations and kinematics features of a suturing attempt, cross-reference them against the official Station Checklist and Rubric, and generate structured clinical findings.

CRITICAL INSTRUCTIONS:
1. DO NOT fabricate any timestamps, events, or scores.
2. Use ONLY the supplied tracking session details, hand velocity patterns, re-grips, and landmarks as evidence.
3. If evidence is missing, mark the status of the checklist step or scoring parameter as "INSUFFICIENT_DATA".
4. Focus only on the "INTERRUPTED SUTURE TECHNIQUE" station.
5. All detected errors and assessments must be linked to concrete evidence intervals (startTimestamp to endTimestamp) derived from the raw data.
6. Return your final assessment strictly as a JSON object matching the provided JSON schema. Do not output any thinking or markdown block prefixes other than raw JSON.
7. DO NOT calculate the final composite score yourself. The scoring engine handles weights and normalization.
`;

export function generateUserPrompt(context: {
  station: { name: string; description: string };
  rubric: { motionEfficiencyWeight: number; checklistWeight: number };
  checklistSteps: Array<{ id: string; sequenceOrder: number; description: string }>;
  features: any;
  landmarksSummary: string;
}) {
  return `### CLINICAL OSCE ASSESSMENT CONTEXT
Station Name: ${context.station.name}
Station Description: ${context.station.description}

### RUBRIC DETAILS
Checklist Steps (in expected sequence order):
${context.checklistSteps.map(s => `  - ID: ${s.id} | Order: ${s.sequenceOrder} | Description: ${s.description}`).join("\n")}

### COMPUTER VISION TRACKING telemetry
Kinematics Features:
${JSON.stringify(context.features, null, 2)}

Landmarks & Quality Observations Summary (Timeline Samples):
${context.landmarksSummary}

### INSTRUCTIONS:
Assess each checklist step, detect clinical errors, evaluate technique parameters (e.g. movementEfficiency, needleHandling, instrumentHandling), and supply evidence segments.
Return a valid JSON matching this structure:
{
  "proceduralEvents": [
    {
      "eventType": "STEP_STARTED" | "STEP_COMPLETED" | "NEEDLE_ENTRY" | "NEEDLE_EXIT" | "REGRIP" | "PAUSE" | "TECHNIQUE_DEVIATION",
      "timestamp": number,
      "endTimestamp": number,
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "details": "string"
    }
  ],
  "checklistResults": [
    {
      "checklistStepId": "string",
      "status": "COMPLETED" | "MISSED" | "OUT_OF_ORDER" | "REPEATED" | "UNCERTAIN",
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "startTimestamp": number | null,
      "endTimestamp": number | null,
      "rationale": "string"
    }
  ],
  "parameterAssessments": [
    {
      "parameterId": "string", // Match parameters: "instrumentHandling", "needleHandling", "movementEfficiency", "proceduralTiming", "proceduralSequence"
      "status": "AVAILABLE" | "PARTIAL" | "INSUFFICIENT_DATA" | "NOT_CONFIGURED",
      "score": number | null, // 0 to 100 representing performance level or null if insufficient
      "confidence": "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT_DATA",
      "rationale": "string"
    }
  ],
  "detectedErrors": [
    {
      "category": "MISSED_STEP" | "OUT_OF_ORDER_STEP" | "TECHNIQUE_DEVIATION" | "MOVEMENT_INEFFICIENCY" | "TIMING_DEVIATION" | "INSTRUMENT_HANDLING" | "NEEDLE_DEVIATION" | "TRACKING_UNCERTAINTY",
      "severity": "CRITICAL" | "MAJOR" | "MINOR",
      "parameterId": "string" | null,
      "checklistStepId": "string" | null,
      "timestamp": number | null,
      "endTimestamp": number | null,
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "explanation": "string",
      "scoreImpact": number | null
    }
  ],
  "evidence": [
    {
      "id": "string", // uniquely generated reference like "ev_1", "ev_2"
      "type": "VIDEO_INTERVAL" | "CV_OBSERVATION" | "KINEMATIC_FEATURE",
      "startTimestamp": number | null,
      "endTimestamp": number | null,
      "sourceReference": "string",
      "confidence": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "feedbackCandidates": {
    "wellDone": ["string"],
    "needsImprovement": ["string"],
    "practiceRecommendation": ["string"]
  },
  "overallConfidence": "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT_DATA",
  "qualityGateStatus": "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT_DATA"
}
`;
}
