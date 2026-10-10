// SurgiSkill AI - Clinically Grounded Surgical Simulation Data
// Designed according to Royal College of Surgeons / ACS / APDS surgical training guidelines

import {
  UserProfile,
  SurgicalStation,
  AttemptRecord,
  OSCEExam,
  DeviceIntegrationRecord,
  NotificationItem,
  AuditLogEntry,
} from '../types/index.ts';

export const MOCK_USERS: Record<string, UserProfile> = {
  student: {
    id: 'usr_student_alex_chen',
    email: 'alex.chen@med.edu',
    fullName: 'Dr. Alex Chen',
    medicalDegree: 'MD',
    academicRank: 'PGY-2 General Surgery Resident',
    role: 'STUDENT',
    institutionId: 'inst_hopkins_sim',
    institutionName: 'Center for Surgical Simulation & Innovation',
    cohortId: 'cohort_pgy2_2026',
    cohortName: 'General Surgery Class of 2026 (PGY-2)',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  faculty: {
    id: 'usr_faculty_sarah_jenkins',
    email: 's.jenkins@med.edu',
    fullName: 'Prof. Sarah Jenkins, MD, FACS',
    medicalDegree: 'MD, FACS',
    academicRank: 'Associate Professor & Director of Surgical Skills',
    role: 'FACULTY',
    institutionId: 'inst_hopkins_sim',
    institutionName: 'Center for Surgical Simulation & Innovation',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813620-424a6e4d5fb0?w=150&auto=format&fit=crop&q=80',
  },
  clinicalLead: {
    id: 'usr_lead_marcus_vance',
    email: 'm.vance@med.edu',
    fullName: 'Dr. Marcus Vance, MD, FRCSI',
    medicalDegree: 'MD, FRCSI, MEd',
    academicRank: 'Vice Chair of Surgical Education & Digital OSCE Chair',
    role: 'CLINICAL_LEAD',
    institutionId: 'inst_hopkins_sim',
    institutionName: 'Center for Surgical Simulation & Innovation',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  },
  institutionAdmin: {
    id: 'usr_admin_elena_rostova',
    email: 'admin.sim@med.edu',
    fullName: 'Elena Rostova, MS, CHSE',
    medicalDegree: 'MS, CHSE',
    academicRank: 'Director of Healthcare Simulation Operations',
    role: 'INSTITUTION_ADMIN',
    institutionId: 'inst_hopkins_sim',
    institutionName: 'Center for Surgical Simulation & Innovation',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  superAdmin: {
    id: 'usr_super_admin',
    email: 'sysadmin@surgiskill.ai',
    fullName: 'Lead Systems Engineer',
    academicRank: 'Platform Architect',
    role: 'SUPER_ADMIN',
    institutionId: 'inst_hopkins_sim',
    institutionName: 'Center for Surgical Simulation & Innovation',
  }
};

export const MOCK_STATIONS: SurgicalStation[] = [
  {
    id: 'stn_interrupted_suture',
    institutionId: 'inst_hopkins_sim',
    title: 'Interrupted Suture Technique (Skin & Subcutis Closure)',
    code: 'SURG-STN-101',
    category: 'Open Suturing',
    difficulty: 'Fundamental',
    description: 'Placement of multiple simple interrupted sutures across a linear synthetic incision to achieve anatomical edge eversion without ischemia or excessive tissue tension.',
    clinicalContext: 'Primary closure of clean surgical incisions and lacerations. Critical surgical benchmark for PGY-1/PGY-2 competency validation prior to live operating room case participation.',
    learningObjectives: [
      'Grasp curved needle at 2/3 distance from tip with needle driver jaws perpendicular to needle arc.',
      'Achieve orthogonal (90°) needle entry to synthetic epidermal plane with smooth wrist supination.',
      'Maintain symmetric bite widths (4.0 mm ± 0.8 mm) on both opposing wound edges.',
      'Maintain equidistant stitch pitch (5.0 mm ± 1.0 mm) along the longitudinal incision line.',
      'Throw square surgical knot (2:1:1 double surgeon throw followed by opposing square throws) without air knots.',
      'Trim suture tails to clinically safe length (3.0 mm - 5.0 mm).'
    ],
    requiredInstruments: [
      'Mayo-Hegar Needle Driver (14 cm)',
      'Adson-Brown Tissue Forceps (toothed)',
      'Straight Iris Suture Scissors',
      '3-0 Ethilon (Nylon) with PS-2 Reverse Cutting Needle',
      'Dual-layer synthetic skin training pad with realistic dermal resistance'
    ],
    trainingModelType: 'High-Fidelity Synthetic Epidermal/Dermal Pad (50 mm Incision)',
    cameraSetup: 'Top-Down 90° Calibrated Video at 35 cm working distance (1080p, 60fps)',
    passThreshold: 75.0,
    timeLimitSeconds: 600,
    totalAttemptsCount: 48,
    averageCohortScore: 81.4,
    assignedToUser: true,
    currentRubric: {
      id: 'rub_interrupted_v3',
      stationId: 'stn_interrupted_suture',
      versionNumber: 3,
      isCurrent: true,
      approvedBy: 'Prof. Sarah Jenkins, MD, FACS',
      approvalDate: '2026-08-15',
      checklist: [
        {
          id: 'chk_1',
          stepCode: 'INS-01',
          title: 'Needle Loading & Grip Angle',
          description: 'Curved needle grasped firmly at junction of middle and posterior third with needle driver tip.',
          isCritical: true,
          points: 15,
        },
        {
          id: 'chk_2',
          stepCode: 'INS-02',
          title: 'Forceps Tissue Stabilization',
          description: 'Toothed Adson forceps used gently to evert wound margin without crushing or tearing synthetic epidermis.',
          isCritical: false,
          points: 15,
        },
        {
          id: 'chk_3',
          stepCode: 'PEN-01',
          title: 'Orthogonal Entry & Curvature Drive',
          description: 'Needle tip enters tissue at 85°-95° perpendicular angle; needle driven through arc following its natural curvature.',
          isCritical: true,
          points: 20,
        },
        {
          id: 'chk_4',
          stepCode: 'SYM-01',
          title: 'Symmetric Exit on Far Margin',
          description: 'Needle emerges equidistant from opposite cut edge with minimal lateral deflection.',
          isCritical: true,
          points: 20,
        },
        {
          id: 'chk_5',
          stepCode: 'KNT-01',
          title: 'Surgeon Double Throw & Square Closure',
          description: 'First throw is a double loop tension knot; second and third throws are reversed square ties laid completely flat.',
          isCritical: true,
          points: 20,
        },
        {
          id: 'chk_6',
          stepCode: 'TRM-01',
          title: 'Precise Tail Trimming',
          description: 'Suture tails sheared cleanly at 4 mm ± 1 mm without compromising knot security.',
          isCritical: false,
          points: 10,
        }
      ],
      parameters: [
        {
          id: 'prm_bite_width',
          parameterKey: 'bite_width',
          name: 'Entry Bite Width',
          unit: 'mm',
          targetMin: 3.2,
          targetMax: 4.8,
          weight: 1.2,
          measurementType: 'CV_GEOMETRY',
          clinicalDescription: 'Distance from entry puncture point to wound margin. Under 3mm risks wound dehiscence; over 5mm causes tissue strangulation.'
        },
        {
          id: 'prm_exit_symmetry',
          parameterKey: 'exit_bite_width',
          name: 'Exit Bite Width (Far Margin)',
          unit: 'mm',
          targetMin: 3.2,
          targetMax: 4.8,
          weight: 1.2,
          measurementType: 'CV_GEOMETRY',
          clinicalDescription: 'Distance from exit puncture point to opposing margin. Must match entry bite width within ±0.6mm.'
        },
        {
          id: 'prm_entry_angle',
          parameterKey: 'entry_angle',
          name: 'Needle Entry Angle',
          unit: 'deg',
          targetMin: 80.0,
          targetMax: 100.0,
          weight: 1.0,
          measurementType: 'CV_GEOMETRY',
          clinicalDescription: 'Angle of needle shaft relative to tissue plane at moment of penetration. Ideally 90° to ensure full dermal eversion.'
        },
        {
          id: 'prm_stitch_spacing',
          parameterKey: 'stitch_spacing',
          name: 'Inter-Stitch Spacing (Pitch)',
          unit: 'mm',
          targetMin: 4.0,
          targetMax: 6.0,
          weight: 1.0,
          measurementType: 'CV_GEOMETRY',
          clinicalDescription: 'Distance between adjacent suture points along the incision axis. 5mm is optimal for tension distribution.'
        },
        {
          id: 'prm_motion_economy',
          parameterKey: 'motion_economy',
          name: 'Instrument Path Length',
          unit: 'cm',
          targetMin: 35.0,
          targetMax: 85.0,
          weight: 0.8,
          measurementType: 'SENSOR_TELEMETRY',
          clinicalDescription: 'Cumulative spatial travel distance of needle driver tip. Lower values indicate mature kinematic economy of motion.'
        },
        {
          id: 'prm_knot_structure',
          parameterKey: 'knot_throws',
          name: 'Total Completed Throws',
          unit: 'throws',
          targetMin: 3.0,
          targetMax: 4.0,
          weight: 1.0,
          measurementType: 'VISUAL_PROXY',
          clinicalDescription: 'Confirmed throws: 1 surgeon double throw + 2 opposing square throws (minimum 3 throws for nylon suture security).'
        }
      ]
    },
    currentPRM: {
      id: 'prm_interrupted_model_v2',
      stationId: 'stn_interrupted_suture',
      versionNumber: 2,
      procedureName: 'Simple Interrupted Surgical Suture',
      woundGeometry: {
        lengthMm: 50.0,
        depthMmEstimated: 4.5,
        orientationAngleDeg: 0.0,
        incisionAxis: 'HORIZONTAL',
        targetMarginsMm: 4.0
      },
      needleSpecification: {
        type: '3-0 Ethilon Reverse Cutting (PS-2)',
        chordLengthMm: 19.0,
        radiusMm: 9.5,
        recommendedGraspPointFraction: 0.67
      },
      expectedEntryZone: {
        distanceFromEdgeMinMm: 3.2,
        distanceFromEdgeMaxMm: 4.8,
        orthogonalAngleTargetDeg: 90.0,
        orthogonalAngleToleranceDeg: 10.0
      },
      expectedExitZone: {
        distanceFromEdgeMinMm: 3.2,
        distanceFromEdgeMaxMm: 4.8,
        symmetryToleranceMm: 0.6
      },
      expectedStitchSpacing: {
        pitchMinMm: 4.0,
        pitchMaxMm: 6.0,
        targetPitchMm: 5.0
      },
      knotRequirements: {
        totalThrowsRequired: 3,
        firstThrowStructure: 'SURGEON_DOUBLE',
        subsequentThrows: 'SQUARE_ALTERNATING',
        tailLengthMinMm: 3.0,
        tailLengthMaxMm: 5.0
      },
      permittedDeviations: [
        'Instrument-assisted knot tying permitted in lieu of hand ties',
        'Slight bite asymmetry (<=0.8mm) acceptable at wound apex',
        'Fourth security throw optional if monofilament slippage noted'
      ],
      facultyApprovedBy: 'Prof. Sarah Jenkins, MD, FACS',
      approvalTimestamp: '2026-08-15T09:30:00Z'
    }
  },
  {
    id: 'stn_simple_continuous',
    institutionId: 'inst_hopkins_sim',
    title: 'Simple Continuous Suture (Running Closure)',
    code: 'SURG-STN-102',
    category: 'Continuous Suturing',
    difficulty: 'Intermediate',
    description: 'Rapid, watertight approximation of visceral or subcutaneous layers using an uninterrupted running suture line.',
    clinicalContext: 'Abdominal wall fascial closure, vascular anastomoses, and dermatologic layered closures.',
    learningObjectives: [
      'Anchor initial stitch with secure knot at proximal wound apex.',
      'Maintain continuous tension with non-dominant hand or assistant hook.',
      'Execute uniform spiral advance with uniform 5 mm spacing and bite width.',
      'Perform Aberdeen termination knot with three locked loops.'
    ],
    requiredInstruments: [
      'Mayo-Hegar Needle Driver',
      'Debakey Vascular Forceps',
      'Straight Mayo Scissors',
      '2-0 Vicryl Synthetic Absorbable Suture with SH Taper Needle'
    ],
    trainingModelType: 'Synthetic Multi-Layer Fascia Simulation Model',
    cameraSetup: 'Top-Down 90° Overhead Camera',
    passThreshold: 78.0,
    timeLimitSeconds: 720,
    totalAttemptsCount: 32,
    averageCohortScore: 76.8,
    assignedToUser: true,
    currentRubric: {
      id: 'rub_continuous_v1',
      stationId: 'stn_simple_continuous',
      versionNumber: 1,
      isCurrent: true,
      approvedBy: 'Prof. Sarah Jenkins, MD, FACS',
      approvalDate: '2026-08-20',
      checklist: [
        { id: 'chk_c1', stepCode: 'ANC-01', title: 'Proximal Anchor Knot', description: 'Surgeon knot locked 3mm beyond wound apex.', isCritical: true, points: 25 },
        { id: 'chk_c2', stepCode: 'TNS-01', title: 'Uniform Suture Line Tension', description: 'No slack in loops; no tissue puckering.', isCritical: true, points: 25 },
        { id: 'chk_c3', stepCode: 'ADV-01', title: 'Equal Pitch Advance', description: 'Loops advance with consistent 5mm distance.', isCritical: false, points: 25 },
        { id: 'chk_c4', stepCode: 'TRM-02', title: 'Aberdeen Knot Termination', description: 'Loop knot secured without tension loss.', isCritical: true, points: 25 }
      ],
      parameters: [
        { id: 'prm_c_pitch', parameterKey: 'stitch_spacing', name: 'Spiral Pitch Uniformity', unit: 'mm', targetMin: 4.5, targetMax: 5.5, weight: 1.0, measurementType: 'CV_GEOMETRY', clinicalDescription: 'Distance between loops.' },
        { id: 'prm_c_motion', parameterKey: 'motion_economy', name: 'Total Path Length', unit: 'cm', targetMin: 60.0, targetMax: 120.0, weight: 1.0, measurementType: 'SENSOR_TELEMETRY', clinicalDescription: 'Efficiency of motion.' }
      ]
    },
    currentPRM: {
      id: 'prm_continuous_v1',
      stationId: 'stn_simple_continuous',
      versionNumber: 1,
      procedureName: 'Simple Continuous Suture Technique',
      woundGeometry: { lengthMm: 60.0, depthMmEstimated: 5.0, orientationAngleDeg: 0.0, incisionAxis: 'HORIZONTAL', targetMarginsMm: 5.0 },
      needleSpecification: { type: '2-0 Vicryl SH Taper', chordLengthMm: 26.0, radiusMm: 13.0, recommendedGraspPointFraction: 0.67 },
      expectedEntryZone: { distanceFromEdgeMinMm: 4.0, distanceFromEdgeMaxMm: 6.0, orthogonalAngleTargetDeg: 90.0, orthogonalAngleToleranceDeg: 12.0 },
      expectedExitZone: { distanceFromEdgeMinMm: 4.0, distanceFromEdgeMaxMm: 6.0, symmetryToleranceMm: 0.8 },
      expectedStitchSpacing: { pitchMinMm: 4.5, pitchMaxMm: 5.5, targetPitchMm: 5.0 },
      knotRequirements: { totalThrowsRequired: 4, firstThrowStructure: 'SURGEON_DOUBLE', subsequentThrows: 'SQUARE_ALTERNATING', tailLengthMinMm: 4.0, tailLengthMaxMm: 6.0 },
      permittedDeviations: ['Loop-assisted final knot or Aberdeen lock permitted'],
      facultyApprovedBy: 'Prof. Sarah Jenkins, MD, FACS',
      approvalTimestamp: '2026-08-20T10:00:00Z'
    }
  },
  {
    id: 'stn_mattress_horizontal',
    institutionId: 'inst_hopkins_sim',
    title: 'Horizontal Mattress Hemostatic Tension Suture',
    code: 'SURG-STN-103',
    category: 'Mattress Suturing',
    difficulty: 'Intermediate',
    description: 'Eversion and high-tension approximation of fragile skin and friable tissues; disperses wound closure tension horizontally along wound edges.',
    clinicalContext: 'Used in high-tension areas (palms, soles, joint creases) and where hemostasis of wound edges is required.',
    learningObjectives: [
      'Execute initial wide bite (6mm) far-to-far across incision.',
      'Reverse needle orientation in driver without manual repalping.',
      'Re-enter 4mm laterally on same side; exit opposite side with equal bite.',
      'Tie knot without causing tissue ischemia under the horizontal bar.'
    ],
    requiredInstruments: ['Mayo-Hegar Needle Driver', 'Adson-Brown Forceps', 'Iris Scissors', '3-0 Prolene Monofilament'],
    trainingModelType: 'High-Tension Dermal Simulation Pad',
    cameraSetup: 'Top-Down 90° Overhead Camera',
    passThreshold: 80.0,
    timeLimitSeconds: 600,
    totalAttemptsCount: 26,
    averageCohortScore: 83.1,
    assignedToUser: false,
    currentRubric: {
      id: 'rub_mattress_v1',
      stationId: 'stn_mattress_horizontal',
      versionNumber: 1,
      isCurrent: true,
      approvedBy: 'Dr. Marcus Vance, MD, FRCSI',
      approvalDate: '2026-08-10',
      checklist: [
        { id: 'chk_m1', stepCode: 'FAR-01', title: 'Far-to-Far Primary Pass', description: 'Bite width 6mm on both sides.', isCritical: true, points: 30 },
        { id: 'chk_m2', stepCode: 'REV-01', title: 'Needle Reverse in Driver', description: 'Reversed smoothly with instrument jaws.', isCritical: false, points: 20 },
        { id: 'chk_m3', stepCode: 'LAT-01', title: 'Lateral Advance & Return Pass', description: '4mm lateral shift followed by return pass.', isCritical: true, points: 30 },
        { id: 'chk_m4', stepCode: 'EVR-01', title: 'Edge Eversion Verification', description: 'Margins evert neatly without strangulation.', isCritical: true, points: 20 }
      ],
      parameters: [
        { id: 'prm_m_width', parameterKey: 'bite_width', name: 'Primary Bite Width', unit: 'mm', targetMin: 5.0, targetMax: 7.0, weight: 1.0, measurementType: 'CV_GEOMETRY', clinicalDescription: 'Primary pass width.' },
        { id: 'prm_m_shift', parameterKey: 'stitch_spacing', name: 'Lateral Bar Width', unit: 'mm', targetMin: 3.5, targetMax: 4.5, weight: 1.0, measurementType: 'CV_GEOMETRY', clinicalDescription: 'Horizontal bar span.' }
      ]
    },
    currentPRM: {
      id: 'prm_mattress_v1',
      stationId: 'stn_mattress_horizontal',
      versionNumber: 1,
      procedureName: 'Horizontal Mattress Technique',
      woundGeometry: { lengthMm: 45.0, depthMmEstimated: 5.0, orientationAngleDeg: 0.0, incisionAxis: 'HORIZONTAL', targetMarginsMm: 6.0 },
      needleSpecification: { type: '3-0 Prolene PS-2', chordLengthMm: 19.0, radiusMm: 9.5, recommendedGraspPointFraction: 0.67 },
      expectedEntryZone: { distanceFromEdgeMinMm: 5.0, distanceFromEdgeMaxMm: 7.0, orthogonalAngleTargetDeg: 90.0, orthogonalAngleToleranceDeg: 10.0 },
      expectedExitZone: { distanceFromEdgeMinMm: 5.0, distanceFromEdgeMaxMm: 7.0, symmetryToleranceMm: 0.6 },
      expectedStitchSpacing: { pitchMinMm: 3.5, pitchMaxMm: 4.5, targetPitchMm: 4.0 },
      knotRequirements: { totalThrowsRequired: 4, firstThrowStructure: 'SURGEON_DOUBLE', subsequentThrows: 'SQUARE_ALTERNATING', tailLengthMinMm: 3.0, tailLengthMaxMm: 5.0 },
      permittedDeviations: ['Bolster placement simulation optional'],
      facultyApprovedBy: 'Dr. Marcus Vance, MD, FRCSI',
      approvalTimestamp: '2026-08-10T11:00:00Z'
    }
  },
  {
    id: 'stn_laparoscopic_knot',
    institutionId: 'inst_hopkins_sim',
    title: 'Laparoscopic Intracorporeal Knot Tying (FLS Task 5)',
    code: 'SURG-STN-104',
    category: 'Laparoscopic Suturing',
    difficulty: 'Advanced',
    description: 'Fundamentals of Laparoscopic Surgery (FLS) benchmark: passage of suture through Penrose drain slit and intracorporeal double throw square knot tying under 2D monitor visualization.',
    clinicalContext: 'Laparoscopic bowel defect closure, bleeding vessel oversewing, and hernia repair.',
    learningObjectives: [
      'Grasp needle with right laparoscopic needle holder and introduce into cannula.',
      'Pierce marked target dots on Penrose drain slit.',
      'Form "C-loop" with suture and wrap double throw around left instrument.',
      'Cinch first double throw flat with opposing instrument vectors without tearing rubber.'
    ],
    requiredInstruments: ['Two Laparoscopic Needle Holders (5mm)', 'Simulated Pelvi-Trainer Box', 'Penrose Drain Pad (12mm slit)', '3-0 Silk Suture on Curved Needle'],
    trainingModelType: 'FLS-Standardized Penrose Drain with Calibrated Target Marks',
    cameraSetup: 'FLS 0° Laparoscopic Endoscope (1080p, 60fps)',
    passThreshold: 85.0,
    timeLimitSeconds: 600,
    totalAttemptsCount: 19,
    averageCohortScore: 72.3,
    assignedToUser: false,
    currentRubric: {
      id: 'rub_lap_v1',
      stationId: 'stn_laparoscopic_knot',
      versionNumber: 1,
      isCurrent: true,
      approvedBy: 'Dr. Marcus Vance, MD, FRCSI',
      approvalDate: '2026-07-22',
      checklist: [
        { id: 'chk_l1', stepCode: 'DOT-01', title: 'Target Dot Puncturing', description: 'Needle passes accurately within 1mm of pre-printed dots.', isCritical: true, points: 25 },
        { id: 'chk_l2', stepCode: 'CLP-01', title: 'C-Loop Spatial Geometry', description: 'Thread formed into relaxed open C-shape.', isCritical: false, points: 25 },
        { id: 'chk_l3', stepCode: 'THW-01', title: 'Double Throw Wrap', description: 'Two instrument wraps executed without dropping short tail.', isCritical: true, points: 25 },
        { id: 'chk_l4', stepCode: 'CNC-01', title: 'Horizontal Cinch Vector', description: 'Instruments pulled horizontally 180° apart to seat knot.', isCritical: true, points: 25 }
      ],
      parameters: [
        { id: 'prm_l_time', parameterKey: 'task_completion_time', name: 'Elapsed Time', unit: 'sec', targetMin: 90.0, targetMax: 180.0, weight: 1.0, measurementType: 'SENSOR_TELEMETRY', clinicalDescription: 'FLS time cut-off.' },
        { id: 'prm_l_accuracy', parameterKey: 'entry_accuracy', name: 'Penrose Dot Offset', unit: 'mm', targetMin: 0.0, targetMax: 1.0, weight: 1.5, measurementType: 'CV_GEOMETRY', clinicalDescription: 'Puncture precision.' }
      ]
    },
    currentPRM: {
      id: 'prm_lap_v1',
      stationId: 'stn_laparoscopic_knot',
      versionNumber: 1,
      procedureName: 'FLS Laparoscopic Intracorporeal Knot',
      woundGeometry: { lengthMm: 12.0, depthMmEstimated: 1.0, orientationAngleDeg: 90.0, incisionAxis: 'VERTICAL', targetMarginsMm: 3.0 },
      needleSpecification: { type: '3-0 Silk 20cm pre-cut', chordLengthMm: 16.0, radiusMm: 8.0, recommendedGraspPointFraction: 0.67 },
      expectedEntryZone: { distanceFromEdgeMinMm: 2.5, distanceFromEdgeMaxMm: 3.5, orthogonalAngleTargetDeg: 90.0, orthogonalAngleToleranceDeg: 15.0 },
      expectedExitZone: { distanceFromEdgeMinMm: 2.5, distanceFromEdgeMaxMm: 3.5, symmetryToleranceMm: 0.5 },
      expectedStitchSpacing: { pitchMinMm: 3.0, pitchMaxMm: 4.0, targetPitchMm: 3.5 },
      knotRequirements: { totalThrowsRequired: 3, firstThrowStructure: 'SURGEON_DOUBLE', subsequentThrows: 'SQUARE_ALTERNATING', tailLengthMinMm: 3.0, tailLengthMaxMm: 5.0 },
      permittedDeviations: ['Gliding knot permitted if secondary lock throw added'],
      facultyApprovedBy: 'Dr. Marcus Vance, MD, FRCSI',
      approvalTimestamp: '2026-07-22T14:00:00Z'
    }
  }
];

export const MOCK_ATTEMPTS: AttemptRecord[] = [
  {
    id: 'att_chen_interrupted_001',
    stationId: 'stn_interrupted_suture',
    stationTitle: 'Interrupted Suture Technique (Skin & Subcutis Closure)',
    stationCode: 'SURG-STN-101',
    userId: 'usr_student_alex_chen',
    userName: 'Dr. Alex Chen',
    userRank: 'PGY-2 Resident',
    userCohort: 'Class of 2026',
    rubricVersionNumber: 3,
    prmVersionNumber: 2,
    status: 'COMPLETED',
    startTime: '2026-09-21T14:15:20Z',
    endTime: '2026-09-21T14:21:40Z',
    durationSeconds: 380,
    videoUrl: 'https://storage.googleapis.com/surgiskill-sim-vault/recordings/att_chen_interrupted_001.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80',
    compositeScore: 78.5,
    facultyFinalScore: 82.0,
    isFacultyVerified: true,
    verifiedAt: '2026-09-22T08:45:00Z',
    verifiedByName: 'Prof. Sarah Jenkins, MD, FACS',
    trackingTelemetry: {
      pathLengthCm: 54.2,
      motionSmoothness: 86.4,
      idleTimeSeconds: 18.5,
      averageBiteWidthMm: 3.9,
      averageAngleDeg: 83.2,
    },
    events: [
      { id: 'evt_1', attemptId: 'att_chen_interrupted_001', timestampMs: 1200, state: 'WORKSPACE_DETECTED', label: 'Field Initialized', description: 'Training pad and lighting plane confirmed.', confidence: 0.98, isEvidence: false },
      { id: 'evt_2', attemptId: 'att_chen_interrupted_001', timestampMs: 3400, state: 'WOUND_DETECTED', label: 'Wound Profile Segmented', description: '50mm linear simulated incision detected at 0° axis.', confidence: 0.96, isEvidence: true, keyframeRef: 'kf_wound_init' },
      { id: 'evt_3', attemptId: 'att_chen_interrupted_001', timestampMs: 9100, state: 'NEEDLE_ACQUIRED', label: 'Needle Grasp Confirmed', description: 'Needle grasped 65% from tip with Mayo-Hegar driver.', confidence: 0.93, isEvidence: false },
      { id: 'evt_4', attemptId: 'att_chen_interrupted_001', timestampMs: 14200, state: 'APPROACHING_WOUND', label: 'Tissue Stabilization', description: 'Adson forceps everted near wound edge cleanly.', confidence: 0.91, isEvidence: false },
      { id: 'evt_5', attemptId: 'att_chen_interrupted_001', timestampMs: 18900, state: 'ENTRY_DETECTED', label: 'Needle Entry Point #1', description: 'Entry at 3.9mm from cut edge (target 4.0mm).', confidence: 0.95, isEvidence: true, keyframeRef: 'kf_entry_1' },
      { id: 'evt_6', attemptId: 'att_chen_interrupted_001', timestampMs: 25600, state: 'NEEDLE_DRIVE', label: 'Curvature Rotation', description: 'Smooth wrist rotation following needle arc.', confidence: 0.88, isEvidence: false },
      { id: 'evt_7', attemptId: 'att_chen_interrupted_001', timestampMs: 32400, state: 'EXIT_DETECTED', label: 'Needle Exit Point #1', description: 'Exit at 4.1mm on far margin; symmetric apposition.', confidence: 0.94, isEvidence: true, keyframeRef: 'kf_exit_1' },
      { id: 'evt_8', attemptId: 'att_chen_interrupted_001', timestampMs: 46100, state: 'THREAD_PULL', label: 'Thread Advance', description: '3cm short tail maintained without needle pull-through.', confidence: 0.92, isEvidence: false },
      { id: 'evt_9', attemptId: 'att_chen_interrupted_001', timestampMs: 64200, state: 'LOOP_FORMATION', label: 'Double Surgeon Loop', description: 'Double instrument wrap formed over needle driver jaws.', confidence: 0.91, isEvidence: false },
      { id: 'evt_10', attemptId: 'att_chen_interrupted_001', timestampMs: 82000, state: 'KNOT_OR_THROW', label: 'Knot #1 Seated', description: 'First surgeon throw + 2 square throws seated flat without air knot.', confidence: 0.94, isEvidence: true, keyframeRef: 'kf_knot_1' },
      { id: 'evt_11', attemptId: 'att_chen_interrupted_001', timestampMs: 112000, state: 'ENTRY_DETECTED', label: 'Needle Entry Point #2 (Deviation)', description: 'Entry angle tilted at 71° (target 85°-95°); minor dermal oblique shear.', confidence: 0.89, isEvidence: true, keyframeRef: 'kf_entry_2_dev' },
      { id: 'evt_12', attemptId: 'att_chen_interrupted_001', timestampMs: 220000, state: 'STITCH_COMPLETED', label: '4 Suture Stitches Placed', description: 'Uniform 5.1mm inter-stitch pitch across incision line.', confidence: 0.97, isEvidence: true, keyframeRef: 'kf_final_closure' },
      { id: 'evt_13', attemptId: 'att_chen_interrupted_001', timestampMs: 378000, state: 'PROCEDURE_COMPLETED', label: 'Task Finished & Inspected', description: 'All suture tails trimmed to 4.2mm.', confidence: 0.99, isEvidence: false }
    ],
    aiAssessment: {
      id: 'ai_ass_001',
      attemptId: 'att_chen_interrupted_001',
      modelProvider: 'gemini-3.8-flash (via Server-Side Multimodal Engine)',
      modelVersion: 'v2026.1-clinical',
      overallScore: 78.5,
      checklistScore: 85.0,
      parameterScore: 72.0,
      motionEconomyScore: 84.0,
      confidenceStatus: 'HIGH_CONFIDENCE',
      clinicalSummary: 'Trainee demonstrates solid fundamental technique in simple interrupted closure with consistent 4.0mm bite symmetry and secure 3-throw knot tying. Notable minor deviation observed on stitch #2, where needle entered at 71° resulting in slight oblique dermal shear. Overall apposition is sound with physiological edge eversion.',
      strengths: [
        'Exemplary knot security: 100% square throw orientation with no slippage or loosening.',
        'Symmetric lateral margins: Entry bite (3.9mm) and exit bite (4.1mm) show excellent bilateral parity.',
        'High kinematic efficiency: Total path length of 54.2 cm is well within the PGY-2 expert benchmark range (<65 cm).'
      ],
      recommendedDrills: [
        'Orthogonal Entry Micro-Drill: Practice 10 consecutive entries with explicit 90° wrist supination on synthetic foam before skin closure.',
        'Instrument-Tissue Distance Awareness: Maintain Adson forceps within 5mm of puncture site to prevent lateral skin dragging.'
      ],
      generatedAt: '2026-09-21T14:22:15Z',
      checklistAssessments: [
        { stepCode: 'INS-01', title: 'Needle Loading & Grip Angle', passed: true, confidence: 0.96, evidenceTimeMs: 9100, rationale: 'Needle loaded at 65% posterior chord with jaws perpendicular.' },
        { stepCode: 'INS-02', title: 'Forceps Tissue Stabilization', passed: true, confidence: 0.92, evidenceTimeMs: 14200, rationale: 'Gentle stabilization of dermal edge without excessive crush force.' },
        { stepCode: 'PEN-01', title: 'Orthogonal Entry & Curvature Drive', passed: false, confidence: 0.91, evidenceTimeMs: 112000, rationale: 'Stitch #2 failed orthogonal requirement (71° vs 85°-95° target).' },
        { stepCode: 'SYM-01', title: 'Symmetric Exit on Far Margin', passed: true, confidence: 0.94, evidenceTimeMs: 32400, rationale: 'Exit margin matches entry within 0.2mm across all stitches.' },
        { stepCode: 'KNT-01', title: 'Surgeon Double Throw & Square Closure', passed: true, confidence: 0.95, evidenceTimeMs: 82000, rationale: 'All knots locked with double initial throw followed by opposing squares.' },
        { stepCode: 'TRM-01', title: 'Precise Tail Trimming', passed: true, confidence: 0.97, evidenceTimeMs: 378000, rationale: 'Tails measured at 4.2mm average (target 3-5mm).' }
      ],
      parameterAssessments: [
        {
          parameterKey: 'bite_width',
          name: 'Entry Bite Width',
          expectedRange: '3.2 - 4.8 mm',
          observedValue: '3.9 mm',
          unit: 'mm',
          deviation: -0.1,
          status: 'GREEN',
          confidence: 0.95,
          clinicalSignificance: 'Optimal tissue volume captured to avoid ischemia while providing tensile strength.',
          evidenceTimeMs: 18900,
          measurementMethod: 'Calibrated CV 2D Planar Caliper (0.12mm/px)'
        },
        {
          parameterKey: 'exit_bite_width',
          name: 'Exit Bite Width (Far Margin)',
          expectedRange: '3.2 - 4.8 mm',
          observedValue: '4.1 mm',
          unit: 'mm',
          deviation: 0.1,
          status: 'GREEN',
          confidence: 0.94,
          clinicalSignificance: 'Near-identical bilateral bite prevents wound edge step-off and vertical mismatch.',
          evidenceTimeMs: 32400,
          measurementMethod: 'Calibrated CV 2D Planar Caliper'
        },
        {
          parameterKey: 'entry_angle',
          name: 'Needle Entry Angle',
          expectedRange: '80.0° - 100.0°',
          observedValue: '71.0° (Stitch #2)',
          unit: 'deg',
          deviation: -9.0,
          status: 'RED',
          confidence: 0.89,
          clinicalSignificance: 'Acute entry creates inverted wound margins and increased scarring risk in living tissue.',
          evidenceTimeMs: 112000,
          measurementMethod: 'Pose Estimation & Vector Angle Calculation'
        },
        {
          parameterKey: 'stitch_spacing',
          name: 'Inter-Stitch Spacing (Pitch)',
          expectedRange: '4.0 - 6.0 mm',
          observedValue: '5.1 mm',
          unit: 'mm',
          deviation: 0.1,
          status: 'GREEN',
          confidence: 0.97,
          clinicalSignificance: 'Equidistant pitch distributes closure stress uniformly along the cut margin.',
          evidenceTimeMs: 220000,
          measurementMethod: 'Multi-Point Spatial Landmark CV'
        },
        {
          parameterKey: 'motion_economy',
          name: 'Instrument Path Length',
          expectedRange: '35.0 - 85.0 cm',
          observedValue: '54.2 cm',
          unit: 'cm',
          deviation: -10.8,
          status: 'GREEN',
          confidence: 0.93,
          clinicalSignificance: 'Direct tool trajectories without hesitations or superfluous mid-air repositioning.',
          evidenceTimeMs: 378000,
          measurementMethod: 'Kinematic 3D Optical Tracking Vector'
        },
        {
          parameterKey: 'knot_throws',
          name: 'Total Completed Throws',
          expectedRange: '3 - 4 throws',
          observedValue: '3 throws (2:1:1)',
          unit: 'throws',
          deviation: 0.0,
          status: 'GREEN',
          confidence: 0.96,
          clinicalSignificance: 'Standard monofilament nylon configuration ensures node security.',
          evidenceTimeMs: 82000,
          measurementMethod: 'Temporal Loop Recognition Classifier'
        }
      ],
      detectedErrors: [
        {
          id: 'err_001',
          timestampMs: 112000,
          severity: 'MODERATE',
          errorCode: 'ACUTE_ENTRY_ANGLE',
          title: 'Acute Needle Entry Angle (71°)',
          description: 'Needle shaft penetrated epidermis at 71° instead of orthogonal (90°). This predisposes the wound to dermal inversion.',
          remediation: 'Supinate wrist fully before contact and ensure needle point is perpendicular to skin before driving through arc.'
        },
        {
          id: 'err_002',
          timestampMs: 148000,
          severity: 'MINOR',
          errorCode: 'ASYMMETRIC_PULL_VECTOR',
          title: 'Unilateral Thread Pull Vector',
          description: 'Suture was pulled slightly obliquely across the wound line during cinch, creating minor lateral shear.',
          remediation: 'Pull both suture ends in direct 180° opposition parallel to the wound incision line.'
        }
      ],
      evidenceItems: [
        {
          id: 'evi_01',
          timestampMs: 3400,
          title: 'Initial Wound Geometry Baseline',
          frameImageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80',
          metricSummary: 'Incision: 50.2mm, Margin Gap: 1.8mm',
          findingType: 'OVERALL_APPOSITION'
        },
        {
          id: 'evi_02',
          timestampMs: 18900,
          title: 'Stitch #1 Needle Penetration',
          frameImageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&auto=format&fit=crop&q=80',
          metricSummary: 'Bite: 3.9mm, Angle: 88.4° (Compliant)',
          findingType: 'NEEDLE_ENTRY'
        },
        {
          id: 'evi_03',
          timestampMs: 112000,
          title: 'Stitch #2 Acute Entry Deviation',
          frameImageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
          metricSummary: 'Angle: 71.0° (Target 85°-95°)',
          findingType: 'CRITICAL_DEVIATION'
        },
        {
          id: 'evi_04',
          timestampMs: 220000,
          title: 'Completed 4-Stitch Closure',
          frameImageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80',
          metricSummary: 'Spacing: 5.1mm avg, Edge Eversion: Verified',
          findingType: 'OVERALL_APPOSITION'
        }
      ]
    },
    facultyReview: {
      id: 'rev_001',
      attemptId: 'att_chen_interrupted_001',
      reviewerId: 'usr_faculty_sarah_jenkins',
      reviewerName: 'Prof. Sarah Jenkins, MD, FACS',
      reviewerTitle: 'Director of Surgical Simulation',
      status: 'CONFIRMED',
      globalRating: 4,
      feedbackText: 'Very well executed session, Alex. Your knot squareness and tension control have improved noticeably since PGY-1. While the AI flagged stitch #2 for an entry angle of 71°, the resulting epidermal edge eversion remained anatomically sound, and you compensated well on the exit. Suture tails are appropriately trimmed.',
      verifiedScore: 82.0,
      reviewedAt: '2026-09-22T08:45:00Z'
    },
    scoreOverrides: [
      {
        id: 'ovr_001',
        attemptId: 'att_chen_interrupted_001',
        facultyId: 'usr_faculty_sarah_jenkins',
        facultyName: 'Prof. Sarah Jenkins, MD, FACS',
        targetField: 'OVERALL_SCORE',
        aiValue: 78.5,
        facultyValue: 82.0,
        reason: 'Adjusted upward by 3.5 points: The acute entry angle on stitch #2 was non-destructive in this simulated tissue pad and final closure showed zero dermal inversion or blanching. Overall clinical execution warrants 82%.',
        timestamp: '2026-09-22T08:45:00Z'
      }
    ],
    annotations: [
      {
        id: 'ann_001',
        attemptId: 'att_chen_interrupted_001',
        authorId: 'usr_faculty_sarah_jenkins',
        authorName: 'Prof. Sarah Jenkins, MD, FACS',
        timestampMs: 112000,
        markerX: 0.48,
        markerY: 0.52,
        comment: 'Notice here: your forearm dropped slightly, causing the needle to enter at 71°. Keep your elbow tucked to maintain the 90° arc.',
        category: 'TECHNIQUE',
        createdAt: '2026-09-22T08:40:00Z'
      },
      {
        id: 'ann_002',
        attemptId: 'att_chen_interrupted_001',
        authorId: 'usr_faculty_sarah_jenkins',
        authorName: 'Prof. Sarah Jenkins, MD, FACS',
        timestampMs: 82000,
        markerX: 0.52,
        markerY: 0.48,
        comment: 'Excellent first surgeon double throw; nice flat lay.',
        category: 'INSTRUMENT_HANDLING',
        createdAt: '2026-09-22T08:42:00Z'
      }
    ]
  },
  {
    id: 'att_patel_interrupted_002',
    stationId: 'stn_interrupted_suture',
    stationTitle: 'Interrupted Suture Technique (Skin & Subcutis Closure)',
    stationCode: 'SURG-STN-101',
    userId: 'usr_student_priya_patel',
    userName: 'Dr. Priya Patel',
    userRank: 'PGY-1 Resident',
    userCohort: 'Class of 2027',
    rubricVersionNumber: 3,
    prmVersionNumber: 2,
    status: 'ASSESSMENT_READY',
    startTime: '2026-09-22T16:10:00Z',
    endTime: '2026-09-22T16:19:15Z',
    durationSeconds: 555,
    videoUrl: 'https://storage.googleapis.com/surgiskill-sim-vault/recordings/att_patel_interrupted_002.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&auto=format&fit=crop&q=80',
    compositeScore: 66.0,
    isFacultyVerified: false,
    trackingTelemetry: {
      pathLengthCm: 89.4,
      motionSmoothness: 68.2,
      idleTimeSeconds: 45.0,
      averageBiteWidthMm: 5.4,
      averageAngleDeg: 74.0,
    },
    events: [],
    scoreOverrides: [],
    annotations: []
  },
  {
    id: 'att_oconnor_mattress_003',
    stationId: 'stn_mattress_horizontal',
    stationTitle: 'Horizontal Mattress Hemostatic Tension Suture',
    stationCode: 'SURG-STN-103',
    userId: 'usr_student_liam_oconnor',
    userName: 'Dr. Liam O\'Connor',
    userRank: 'PGY-2 Resident',
    userCohort: 'Class of 2026',
    rubricVersionNumber: 1,
    prmVersionNumber: 1,
    status: 'COMPLETED',
    startTime: '2026-09-20T11:00:00Z',
    endTime: '2026-09-20T11:08:30Z',
    durationSeconds: 510,
    videoUrl: 'https://storage.googleapis.com/surgiskill-sim-vault/recordings/att_oconnor_mattress_003.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
    compositeScore: 91.0,
    facultyFinalScore: 91.0,
    isFacultyVerified: true,
    verifiedAt: '2026-09-20T15:00:00Z',
    verifiedByName: 'Dr. Marcus Vance, MD, FRCSI',
    trackingTelemetry: {
      pathLengthCm: 42.1,
      motionSmoothness: 92.5,
      idleTimeSeconds: 8.0,
      averageBiteWidthMm: 5.9,
      averageAngleDeg: 89.0,
    },
    events: [],
    scoreOverrides: [],
    annotations: []
  }
];

export const MOCK_OSCE_EXAMS: OSCEExam[] = [
  {
    id: 'osce_fall_2026_core',
    title: 'Fall 2026 Core Surgical Skills Digital OSCE',
    academicTerm: 'Autumn Semester 2026',
    scheduledDate: '2026-10-05T08:00:00Z',
    durationTotalMinutes: 60,
    status: 'SCHEDULED',
    assignedCohortName: 'General Surgery Class of 2026 (PGY-2)',
    assignedStudentCount: 16,
    stations: [
      {
        id: 'osce_stn_1',
        stationId: 'stn_interrupted_suture',
        stationNumber: 1,
        stationTitle: 'Station 1: Simple Interrupted Wound Closure',
        category: 'Open Suturing',
        durationMinutes: 10,
        examinerId: 'usr_faculty_sarah_jenkins',
        examinerName: 'Prof. Sarah Jenkins, MD, FACS',
        learningObjectives: ['Symmetric bite placement', 'Square throw knotting', 'Edge eversion']
      },
      {
        id: 'osce_stn_2',
        stationId: 'stn_simple_continuous',
        stationNumber: 2,
        stationTitle: 'Station 2: Continuous Suture Line with Aberdeen Termination',
        category: 'Continuous Suturing',
        durationMinutes: 12,
        examinerId: 'usr_lead_marcus_vance',
        examinerName: 'Dr. Marcus Vance, MD, FRCSI',
        learningObjectives: ['Tension maintenance', 'Spiral advance', 'Aberdeen lock']
      },
      {
        id: 'osce_stn_3',
        stationId: 'stn_mattress_horizontal',
        stationNumber: 3,
        stationTitle: 'Station 3: Horizontal Mattress Hemostatic Placement',
        category: 'Mattress Suturing',
        durationMinutes: 10,
        examinerId: 'usr_faculty_sarah_jenkins',
        examinerName: 'Prof. Sarah Jenkins, MD, FACS',
        learningObjectives: ['Far-to-far pass', 'Lateral reverse return', 'Tension distribution']
      },
      {
        id: 'osce_stn_4',
        stationId: 'stn_laparoscopic_knot',
        stationNumber: 4,
        stationTitle: 'Station 4: Laparoscopic Intracorporeal Knot (FLS Task 5)',
        category: 'Laparoscopic',
        durationMinutes: 12,
        examinerId: 'usr_lead_marcus_vance',
        examinerName: 'Dr. Marcus Vance, MD, FRCSI',
        learningObjectives: ['Penrose puncture', 'Instrument wrap', 'Opposing vector seating']
      }
    ]
  }
];

export const MOCK_INTEGRATIONS: DeviceIntegrationRecord[] = [
  {
    id: 'int_webcam_overhead',
    deviceType: 'WEBCAM',
    displayName: 'Overhead Surgical Training Camera (USB 3.0 / 4K)',
    endpointConfig: {
      portOrId: 'dev_video0',
      resolution: '1920x1080',
      framerate: 60,
      protocol: 'UVC_DIRECT'
    },
    status: 'CONNECTED',
    lastTestedAt: '2026-09-23T10:45:12Z',
    lastLatencyMs: 14,
    calibrationData: {
      scaleMmPerPixel: 0.124,
      opticalDistortionCalibrated: true,
      zeroOffsetMm: 0.0
    }
  },
  {
    id: 'int_laparoscopic_stream',
    deviceType: 'LAPAROSCOPIC_CAMERA',
    displayName: 'Stryker 1688 Laparoscopic Video Stream',
    endpointConfig: {
      portOrId: 'rtsp://10.0.4.120:554/live/surg-tower-1',
      resolution: '1920x1080',
      framerate: 60,
      protocol: 'RTSP_H264'
    },
    status: 'CONFIGURED',
    lastTestedAt: '2026-09-21T09:12:00Z',
    lastLatencyMs: 42
  },
  {
    id: 'int_stereo_depth',
    deviceType: 'STEREO_DEPTH_CAMERA',
    displayName: 'Intel RealSense D435i Structured Light Depth Sensor',
    endpointConfig: {
      portOrId: 'librealsense_d435i_sn83921',
      resolution: '1280x720 (Z-depth 16-bit)',
      framerate: 30,
      protocol: 'V4L2_DEPTH'
    },
    status: 'CONNECTED',
    lastTestedAt: '2026-09-23T11:02:00Z',
    lastLatencyMs: 18,
    calibrationData: {
      scaleMmPerPixel: 0.180,
      opticalDistortionCalibrated: true,
      zeroOffsetMm: 2.1
    }
  },
  {
    id: 'int_force_sensor',
    deviceType: 'FORCE_SENSOR',
    displayName: 'ATI Nano17 6-Axis Suture Tension Loadcell',
    endpointConfig: {
      portOrId: '/dev/ttyUSB_ATI0',
      modelOrChannel: 'ATI-NANO17-E-SI-25-0.25',
      protocol: 'SERIAL_MODBUS'
    },
    status: 'CONNECTED',
    lastTestedAt: '2026-09-23T11:05:30Z',
    lastLatencyMs: 4
  },
  {
    id: 'int_gemini_api',
    deviceType: 'AI_PROVIDER',
    displayName: 'Google Gemini 3.8 Flash Multimodal Reasoning Engine',
    endpointConfig: {
      modelOrChannel: 'gemini-3.8-flash',
      protocol: 'HTTPS_REST'
    },
    status: 'VERIFIED',
    lastTestedAt: '2026-09-23T11:10:00Z',
    lastLatencyMs: 245
  },
  {
    id: 'int_s3_storage',
    deviceType: 'OBJECT_STORAGE',
    displayName: 'Secure Medical Simulation Video Vault (S3 Compatible)',
    endpointConfig: {
      portOrId: 'surgiskill-sim-vault.s3.internal',
      protocol: 'AWS_S3_SSE'
    },
    status: 'VERIFIED',
    lastTestedAt: '2026-09-23T10:00:00Z',
    lastLatencyMs: 65
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'usr_student_alex_chen',
    type: 'REVIEW_READY',
    title: 'Faculty Assessment Verified',
    message: 'Prof. Sarah Jenkins, MD reviewed your Interrupted Suture attempt and adjusted your score to 82.0%.',
    linkUrl: '/attempts/att_chen_interrupted_001',
    isRead: false,
    createdAt: '2026-09-22T08:46:00Z'
  },
  {
    id: 'notif_2',
    userId: 'usr_student_alex_chen',
    type: 'OSCE',
    title: 'Upcoming Fall 2026 OSCE Examination',
    message: 'You are enrolled in Station Rotation A scheduled for October 5, 2026 at 08:00 AM.',
    linkUrl: '/osce',
    isRead: false,
    createdAt: '2026-09-20T12:00:00Z'
  },
  {
    id: 'notif_3',
    userId: 'usr_student_alex_chen',
    type: 'ASSIGNMENT',
    title: 'New Suture Station Assigned',
    message: 'Simple Continuous Suture Technique has been assigned to your cohort with target due date Oct 12.',
    linkUrl: '/workspace/stn_simple_continuous',
    isRead: true,
    createdAt: '2026-09-18T10:00:00Z'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_001',
    userId: 'usr_faculty_sarah_jenkins',
    userName: 'Prof. Sarah Jenkins, MD, FACS',
    userRole: 'FACULTY',
    action: 'SCORE_OVERRIDE',
    entityType: 'Attempt',
    entityId: 'att_chen_interrupted_001',
    details: 'Overrode composite score from 78.5 to 82.0 with mandatory clinical rationale recorded.',
    timestamp: '2026-09-22T08:45:00Z',
    ipAddress: '10.14.22.8'
  },
  {
    id: 'aud_002',
    userId: 'usr_lead_marcus_vance',
    userName: 'Dr. Marcus Vance, MD, FRCSI',
    userRole: 'CLINICAL_LEAD',
    action: 'RUBRIC_APPROVED',
    entityType: 'RubricVersion',
    entityId: 'rub_interrupted_v3',
    details: 'Formally approved v3 revision for Interrupted Suture Technique incorporating APDS 2026 guidelines.',
    timestamp: '2026-08-15T09:30:00Z',
    ipAddress: '10.14.22.4'
  },
  {
    id: 'aud_003',
    userId: 'usr_student_alex_chen',
    userName: 'Dr. Alex Chen',
    userRole: 'STUDENT',
    action: 'ATTEMPT_SUBMITTED',
    entityType: 'Attempt',
    entityId: 'att_chen_interrupted_001',
    details: 'Submitted 380-second training recording for AI assessment pipeline.',
    timestamp: '2026-09-21T14:21:40Z',
    ipAddress: '192.168.1.105'
  }
];
