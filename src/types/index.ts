// SurgiSkill AI - Domain Type Definitions
// Clinically Grounded Surgical Skills Intelligence & Digital OSCE

export type UserRole = 
  | 'STUDENT'
  | 'FACULTY'
  | 'CLINICAL_LEAD'
  | 'INSTITUTION_ADMIN'
  | 'SUPER_ADMIN';

export type ComplianceStatus = 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';

export type AttemptStatus =
  | 'CREATED'
  | 'RECORDING'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'CV_PROCESSING'
  | 'CV_COMPLETED'
  | 'AI_PROCESSING'
  | 'ASSESSMENT_READY'
  | 'COMPLETED'
  | 'CAPTURE_FAILED'
  | 'UPLOAD_FAILED'
  | 'PROCESSING_FAILED'
  | 'CV_PROCESSING_FAILED'
  | 'AI_PROCESSING_FAILED'
  | 'AI_INSUFFICIENT_DATA'
  | 'MANUAL_REVIEW_REQUIRED';

export type ProceduralState =
  | 'WORKSPACE_DETECTED'
  | 'WOUND_DETECTED'
  | 'NEEDLE_ACQUIRED'
  | 'NEEDLE_ORIENTED'
  | 'APPROACHING_WOUND'
  | 'ENTRY_DETECTED'
  | 'NEEDLE_DRIVE'
  | 'EXIT_DETECTED'
  | 'THREAD_PULL'
  | 'LOOP_FORMATION'
  | 'KNOT_OR_THROW'
  | 'STITCH_COMPLETED'
  | 'PROCEDURE_COMPLETED'
  | 'UNKNOWN_STATE'
  | 'LOW_CONFIDENCE_STATE'
  | 'TRACKING_LOST'
  | 'PROCEDURE_INTERRUPTED'
  | 'MANUAL_REVIEW_REQUIRED';

export type IntegrationType =
  | 'WEBCAM'
  | 'USB_CAMERA'
  | 'LAPAROSCOPIC_CAMERA'
  | 'STEREO_DEPTH_CAMERA'
  | 'FORCE_SENSOR'
  | 'ROBOTIC_TELEMETRY'
  | 'VIDEO_CAPTURE_SERVICE'
  | 'OBJECT_STORAGE'
  | 'AI_PROVIDER'
  | 'QUEUE_PROVIDER';

export type IntegrationStatus =
  | 'CONFIGURED'
  | 'CONNECTED'
  | 'VERIFIED'
  | 'UNAVAILABLE'
  | 'FAILED';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  medicalDegree?: string; // MD, DO, MBBS
  academicRank?: string; // PGY-2 Resident, Associate Professor
  role: UserRole;
  institutionId: string;
  institutionName: string;
  cohortId?: string;
  cohortName?: string;
  avatarUrl?: string;
}

export interface ChecklistItem {
  id: string;
  stepCode: string;
  title: string;
  description: string;
  isCritical: boolean;
  points: number;
}

export interface RubricParameter {
  id: string;
  parameterKey: string;
  name: string;
  unit: string;
  targetMin: number;
  targetMax: number;
  weight: number;
  measurementType: 'CV_GEOMETRY' | 'SENSOR_TELEMETRY' | 'VISUAL_PROXY';
  clinicalDescription: string;
}

export interface RubricVersion {
  id: string;
  stationId: string;
  versionNumber: number;
  isCurrent: boolean;
  approvedBy: string;
  approvalDate: string;
  checklist: ChecklistItem[];
  parameters: RubricParameter[];
}

export interface ProcedureReferenceModel {
  id: string;
  stationId: string;
  versionNumber: number;
  procedureName: string;
  woundGeometry: {
    lengthMm: number;
    depthMmEstimated: number;
    orientationAngleDeg: number;
    incisionAxis: 'HORIZONTAL' | 'VERTICAL' | 'OBLIQUE';
    targetMarginsMm: number;
  };
  needleSpecification: {
    type: string; // e.g. "3-0 Ethilon Reverse Cutting (PS-2)"
    chordLengthMm: number;
    radiusMm: number;
    recommendedGraspPointFraction: number; // 0.67 (2/3 from needle tip)
  };
  expectedEntryZone: {
    distanceFromEdgeMinMm: number;
    distanceFromEdgeMaxMm: number;
    orthogonalAngleTargetDeg: number;
    orthogonalAngleToleranceDeg: number;
  };
  expectedExitZone: {
    distanceFromEdgeMinMm: number;
    distanceFromEdgeMaxMm: number;
    symmetryToleranceMm: number;
  };
  expectedStitchSpacing: {
    pitchMinMm: number;
    pitchMaxMm: number;
    targetPitchMm: number;
  };
  knotRequirements: {
    totalThrowsRequired: number; // e.g. 3 or 4
    firstThrowStructure: 'SURGEON_DOUBLE' | 'SQUARE_SINGLE';
    subsequentThrows: 'SQUARE_ALTERNATING';
    tailLengthMinMm: number;
    tailLengthMaxMm: number;
  };
  permittedDeviations: string[];
  facultyApprovedBy: string;
  approvalTimestamp: string;
}

export interface SurgicalStation {
  id: string;
  institutionId: string;
  title: string;
  code: string;
  category: string;
  difficulty: 'Fundamental' | 'Intermediate' | 'Advanced';
  description: string;
  clinicalContext: string;
  learningObjectives: string[];
  requiredInstruments: string[];
  trainingModelType: string;
  cameraSetup: string;
  passThreshold: number;
  timeLimitSeconds: number;
  currentRubric: RubricVersion;
  currentPRM: ProcedureReferenceModel;
  totalAttemptsCount: number;
  averageCohortScore: number;
  assignedToUser?: boolean;
}

export interface CVTrackingFrame {
  timestampMs: number;
  frameIndex: number;
  state: ProceduralState;
  stateConfidence: number;
  detections: {
    woundBoundingBox?: [number, number, number, number]; // [x, y, w, h] normalized
    incisionVector?: [[number, number], [number, number]]; // line points
    needleTip?: [number, number];
    needleSwage?: [number, number];
    needleCurvatureConfidence?: number;
    needleGraspPositionFraction?: number; // 0..1
    driverJawPosition?: [number, number];
    forcepsTipPosition?: [number, number];
    threadVisiblePath?: Array<[number, number]>;
    activeEntryMarker?: [number, number];
    activeExitMarker?: [number, number];
  };
  liveMeasurements: {
    entryBiteWidthMm?: number;
    exitBiteWidthMm?: number;
    needleEntryAngleDeg?: number;
    stitchPitchMm?: number;
    pathLengthCm: number;
    motionSmoothnessMetric: number;
    depthProxyMm?: number;
    depthStatus: 'VISUAL_PROXY' | 'CALIBRATED_DEPTH' | 'UNAVAILABLE';
    tensionProxyEstimated?: string;
  };
  feedbackAlert?: {
    level: 'INFO' | 'CAUTION' | 'CRITICAL_WARNING';
    message: string;
    timestampMs: number;
  };
}

export interface AttemptEventRecord {
  id: string;
  attemptId: string;
  timestampMs: number;
  state: ProceduralState;
  label: string;
  description: string;
  confidence: number;
  keyframeRef?: string;
  isEvidence: boolean;
}

export interface AIChecklistResult {
  stepCode: string;
  title: string;
  passed: boolean;
  confidence: number;
  evidenceTimeMs?: number;
  rationale: string;
}

export interface AIParameterResult {
  parameterKey: string;
  name: string;
  expectedRange: string;
  observedValue: string;
  unit: string;
  deviation: number;
  status: ComplianceStatus;
  confidence: number;
  clinicalSignificance: string;
  evidenceTimeMs: number;
  measurementMethod: string;
}

export interface AIDetectedErrorRecord {
  id: string;
  timestampMs: number;
  severity: 'MINOR' | 'MODERATE' | 'CRITICAL';
  errorCode: string;
  title: string;
  description: string;
  remediation: string;
  evidenceFrameUrl?: string;
}

export interface AIEvidenceItem {
  id: string;
  timestampMs: number;
  title: string;
  frameImageUrl: string;
  metricSummary: string;
  findingType: 'NEEDLE_ENTRY' | 'NEEDLE_EXIT' | 'KNOT_TIED' | 'CRITICAL_DEVIATION' | 'OVERALL_APPOSITION';
}

export interface AIAssessmentData {
  id: string;
  attemptId: string;
  modelProvider: string;
  modelVersion: string;
  overallScore: number;
  checklistScore: number;
  parameterScore: number;
  motionEconomyScore: number;
  clinicalSummary: string;
  strengths: string[];
  recommendedDrills: string[];
  confidenceStatus: 'HIGH_CONFIDENCE' | 'MODERATE' | 'QUALITY_FLAGGED';
  generatedAt: string;
  checklistAssessments: AIChecklistResult[];
  parameterAssessments: AIParameterResult[];
  detectedErrors: AIDetectedErrorRecord[];
  evidenceItems: AIEvidenceItem[];
}

export interface ScoreOverrideRecord {
  id: string;
  attemptId: string;
  facultyId: string;
  facultyName: string;
  targetField: string;
  aiValue: number;
  facultyValue: number;
  reason: string;
  timestamp: string;
}

export interface FacultyAnnotationRecord {
  id: string;
  attemptId: string;
  authorId: string;
  authorName: string;
  timestampMs: number;
  markerX?: number;
  markerY?: number;
  comment: string;
  category: 'TECHNIQUE' | 'SAFETY' | 'SPEED' | 'INSTRUMENT_HANDLING';
  createdAt: string;
}

export interface FacultyReviewData {
  id: string;
  attemptId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerTitle: string;
  status: 'CONFIRMED' | 'REVISED' | 'REJECTED' | 'REASSESSMENT_REQUESTED';
  globalRating: number; // 1-5 OSATS scale
  feedbackText: string;
  verifiedScore: number;
  reviewedAt: string;
}

export interface AttemptRecord {
  id: string;
  stationId: string;
  stationTitle: string;
  stationCode: string;
  userId: string;
  userName: string;
  userRank: string;
  userCohort: string;
  rubricVersionNumber: number;
  prmVersionNumber: number;
  status: AttemptStatus;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  videoUrl: string;
  thumbnailUrl: string;
  compositeScore?: number;
  facultyFinalScore?: number;
  isFacultyVerified: boolean;
  verifiedAt?: string;
  verifiedByName?: string;
  events: AttemptEventRecord[];
  aiAssessment?: AIAssessmentData;
  facultyReview?: FacultyReviewData;
  scoreOverrides: ScoreOverrideRecord[];
  annotations: FacultyAnnotationRecord[];
  trackingTelemetry?: {
    pathLengthCm: number;
    motionSmoothness: number;
    idleTimeSeconds: number;
    averageBiteWidthMm: number;
    averageAngleDeg: number;
  };
}

export interface OSCEStationConfig {
  id: string;
  stationId: string;
  stationNumber: number;
  stationTitle: string;
  category: string;
  durationMinutes: number;
  examinerId?: string;
  examinerName?: string;
  learningObjectives: string[];
}

export interface OSCEExam {
  id: string;
  title: string;
  academicTerm: string;
  scheduledDate: string;
  durationTotalMinutes: number;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  assignedCohortName: string;
  assignedStudentCount: number;
  stations: OSCEStationConfig[];
}

export interface DeviceIntegrationRecord {
  id: string;
  deviceType: IntegrationType;
  displayName: string;
  endpointConfig: {
    portOrId?: string;
    resolution?: string;
    framerate?: number;
    modelOrChannel?: string;
    protocol?: string;
  };
  status: IntegrationStatus;
  lastTestedAt?: string;
  lastLatencyMs?: number;
  lastErrorMessage?: string;
  calibrationData?: {
    scaleMmPerPixel: number;
    opticalDistortionCalibrated: boolean;
    zeroOffsetMm: number;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'ASSIGNMENT' | 'OSCE' | 'REVIEW_READY' | 'SCORE_OVERRIDE' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
