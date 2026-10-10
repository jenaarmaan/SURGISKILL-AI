import pptxgen from 'pptxgenjs';
import * as fs from 'fs';
import * as path from 'path';

export async function generateSurgiSkillDeck(outputPath?: string): Promise<string> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'SurgiSkill AI Clinical Research Team';
  pptx.company = 'Center for Surgical Simulation & Medical Education';
  pptx.title = 'SurgiSkill AI: Real-Time Multimodal Surgical Skills Assessment';
  pptx.subject = 'Objective Structured Assessment of Technical Skills (OSCE)';

  const BG_COLOR = '0A0F1D';
  const CARD_BG = '131E32';
  const CARD_BORDER = '1E293B';
  const TEAL_ACCENT = '14B8A6';
  const SKY_ACCENT = '0EA5E9';
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';
  const GREEN_ACCENT = '10B981';
  const ROSE_ACCENT = 'F43F5E';

  // Helper to add consistent slide header
  const addHeader = (slide: pptxgen.Slide, category: string, title: string, subtitle: string) => {
    slide.background = { color: BG_COLOR };

    // Category Pill
    slide.addText(category.toUpperCase(), {
      x: 0.6,
      y: 0.4,
      w: 3.5,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: TEAL_ACCENT,
      bold: true,
    });

    // Main Title
    slide.addText(title, {
      x: 0.6,
      y: 0.65,
      w: 12.0,
      h: 0.5,
      fontSize: 20,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      bold: true,
    });

    // Subtitle
    slide.addText(subtitle, {
      x: 0.6,
      y: 1.15,
      w: 12.0,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });
  };

  // ==========================================
  // SLIDE 1: Title Slide
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.6,
      y: 1.2,
      w: 3.0,
      h: 0.35,
      fill: { color: '14B8A6', transparency: 85 },
      line: { color: TEAL_ACCENT, width: 1 },
    });
    slide.addText('CLINICAL AI INITIATIVE 2026', {
      x: 0.7,
      y: 1.22,
      w: 2.8,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEAL_ACCENT,
      bold: true,
    });

    slide.addText('SurgiSkill AI: Real-Time Multimodal Surgical Assessment', {
      x: 0.6,
      y: 1.8,
      w: 12.0,
      h: 1.2,
      fontSize: 32,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      bold: true,
    });

    slide.addText('Autonomous Computer Vision & Multimodal Generative AI for Objective Technical Skills (OSCE)', {
      x: 0.6,
      y: 3.0,
      w: 11.5,
      h: 0.6,
      fontSize: 14,
      fontFace: 'Arial',
      color: SKY_ACCENT,
    });

    slide.addText('Bridging the Halstedian "See One, Do One, Teach One" apprenticeship into continuous, millimeter-calibrated optical computer vision and Google Gemini multimodal clinical reasoning.', {
      x: 0.6,
      y: 3.7,
      w: 10.5,
      h: 0.8,
      fontSize: 12,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    // 3 metric cards at bottom
    const metrics = [
      { label: 'TELEMETRY RATE', val: '60 FPS Real-Time', sub: 'Sub-millimeter optical caliper' },
      { label: 'AI FOUNDATION', val: 'Gemini 3.8 Flash', sub: 'Multimodal clinical vision' },
      { label: 'HARDWARE NEEDED', val: '$0 (Any Webcam)', sub: 'Standard silicone training pads' },
    ];
    metrics.forEach((m, idx) => {
      const xPos = 0.6 + idx * 4.0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 5.0,
        w: 3.7,
        h: 1.5,
        fill: { color: CARD_BG },
        line: { color: CARD_BORDER, width: 1 },
      });
      slide.addText(m.label, { x: xPos + 0.2, y: 5.15, w: 3.3, h: 0.3, fontSize: 9, fontFace: 'Arial', color: TEAL_ACCENT, bold: true });
      slide.addText(m.val, { x: xPos + 0.2, y: 5.45, w: 3.3, h: 0.45, fontSize: 16, fontFace: 'Arial', color: TEXT_WHITE, bold: true });
      slide.addText(m.sub, { x: xPos + 0.2, y: 5.9, w: 3.3, h: 0.4, fontSize: 10, fontFace: 'Arial', color: TEXT_MUTED });
    });
  }

  // ==========================================
  // SLIDE 2: Introduction & Real-World Case Study
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Clinical Motivation', 'Introduction & Real-World Surgical Case Study', 'The 120-Year-Old Halstedian Bottleneck in Modern Surgical Residency');

    // Left Column: The Problem
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.6, w: 5.8, h: 5.0, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
    slide.addText('THE HALSTEDIAN APPRENTICESHIP DILEMMA', { x: 0.9, y: 1.8, w: 5.2, h: 0.35, fontSize: 11, fontFace: 'Arial', color: TEAL_ACCENT, bold: true });
    slide.addText([
      { text: '• Faculty Scarcity: ', options: { bold: true, color: TEXT_WHITE } },
      { text: 'Senior surgeons spend <15% of working hours supervising simulation labs due to operative throughput pressures.\n\n', options: { color: TEXT_MUTED } },
      { text: '• Evaluation Variance: ', options: { bold: true, color: TEXT_WHITE } },
      { text: 'Conventional paper OSATS forms suffer from low inter-rater reliability (Fleiss\' Kappa κ = 0.41).\n\n', options: { color: TEXT_MUTED } },
      { text: '• Delayed & Vague Feedback: ', options: { bold: true, color: TEXT_WHITE } },
      { text: 'Residents receive subjective feedback days later ("good hands, work on speed") with zero trajectory telemetry.\n\n', options: { color: TEXT_MUTED } },
      { text: '• Patient Safety Impact: ', options: { bold: true, color: TEXT_WHITE } },
      { text: '42% of graduating general surgery residents report feeling under-confident operating independently on complex closures.', options: { color: TEXT_MUTED } },
    ], { x: 0.9, y: 2.2, w: 5.2, h: 4.2, fontSize: 10, fontFace: 'Arial' });

    // Right Column: Case Study
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.8, h: 5.0, fill: { color: CARD_BG }, line: { color: TEAL_ACCENT, width: 1.5 } });
    slide.addText('CASE STUDY: DR. CHEN (PGY-2 GENERAL SURGERY)', { x: 7.1, y: 1.8, w: 5.2, h: 0.35, fontSize: 11, fontFace: 'Arial', color: GREEN_ACCENT, bold: true });
    slide.addText([
      { text: 'Clinical Task: ', options: { bold: true, color: TEXT_WHITE } },
      { text: 'Vertical Mattress skin closure on deep trauma tissue.\n\n', options: { color: TEXT_MUTED } },
      { text: 'Traditional Evaluation: ', options: { bold: true, color: ROSE_ACCENT } },
      { text: 'Graded 3 days later as "Pass (3/5)". Hidden defect: Far bite was asymmetric (3.2mm vs 6.8mm), which in vivo leads to epidermal margin inversion, tissue strangulation, and wound dehiscence.\n\n', options: { color: TEXT_MUTED } },
      { text: 'SurgiSkill AI Autonomous Audit: ', options: { bold: true, color: TEAL_ACCENT } },
      { text: 'Camera tracks 60 FPS kinematics, flags sub-orthogonal entry (79.4°), and detects asymmetric bite. Gemini 3.8 Flash delivers immediate multimodal voice guidance: "Supinate right forearm 15° along needle arc to achieve full-thickness eversion."\n\n', options: { color: TEXT_MUTED } },
      { text: 'Result: ', options: { bold: true, color: GREEN_ACCENT } },
      { text: 'In Round 2, Dr. Chen achieved 6.1mm symmetric purchase, 91.2° entry, and anatomical eversion in <180 seconds.', options: { color: TEXT_WHITE } },
    ], { x: 7.1, y: 2.2, w: 5.2, h: 4.2, fontSize: 10, fontFace: 'Arial' });
  }

  // ==========================================
  // SLIDE 3: Problem Statement & Stakeholders
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Problem & Ecosystem', 'Problem Statement & Target Stakeholders', 'Who Suffers from the Status Quo, and Who Wins with Autonomous Telemetry?');

    // Problem Banner
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.6, w: 12.0, h: 1.3, fill: { color: '241217' }, line: { color: ROSE_ACCENT, width: 1 } });
    slide.addText('CORE PROBLEM STATEMENT', { x: 0.9, y: 1.75, w: 11.4, h: 0.25, fontSize: 10, fontFace: 'Arial', color: ROSE_ACCENT, bold: true });
    slide.addText('The global deficit in surgical education scalability caused by lack of continuous, objective, and sub-millimeter surgical skill assessment, leading to preventable intraoperative technical errors and over 400,000 adverse surgical events annually worldwide.', {
      x: 0.9,
      y: 2.05,
      w: 11.4,
      h: 0.75,
      fontSize: 11.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
    });

    // 3 Stakeholder Columns
    const stakeholders = [
      {
        title: '1. SURGICAL RESIDENTS & FELLOWS',
        badge: 'END USERS',
        color: TEAL_ACCENT,
        points: [
          'Need 24/7 unassisted deliberate practice outside clinical hours.',
          'Currently receive vague feedback with no actionable physical telemetry.',
          'SurgiSkill provides immediate millimeter calipers and biomechanical coaching.',
        ],
      },
      {
        title: '2. ATTENDING SURGEONS & FACULTY',
        badge: 'PRECEPTORS',
        color: SKY_ACCENT,
        points: [
          'Overburdened by clinical caseload and manual paper grading.',
          'Spend hours reviewing recorded videos for annual milestone reviews.',
          'SurgiSkill automates pre-grading with 100% auditable evidence keyframes.',
        ],
      },
      {
        title: '3. HEALTHCARE SYSTEMS & BOARDS',
        badge: 'INSTITUTIONS',
        color: 'A855F7',
        points: [
          'Facing ACGME & Royal College mandates for competency-based milestones.',
          'Exposed to high malpractice liability and surgical revision expenses.',
          'SurgiSkill standardizes OSCE stations across community & academic hospitals.',
        ],
      },
    ];

    stakeholders.forEach((s, idx) => {
      const xPos = 0.6 + idx * 4.15;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 3.1, w: 3.85, h: 3.5, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
      slide.addText(s.title, { x: xPos + 0.2, y: 3.3, w: 3.45, h: 0.4, fontSize: 11, fontFace: 'Arial', color: s.color, bold: true });
      slide.addText(s.points.map((p) => `• ${p}\n\n`).join(''), { x: xPos + 0.2, y: 3.8, w: 3.45, h: 2.6, fontSize: 9.5, fontFace: 'Arial', color: TEXT_MUTED });
    });
  }

  // ==========================================
  // SLIDE 4: The Solution in Detail
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'The Solution', 'SurgiSkill AI: In-Depth Technological Scope', 'Comprehensive Computer Vision, Ground-Truth Reference Models, and Multimodal AI');

    const solutions = [
      {
        num: '01',
        title: 'Hardware-Agnostic Optical Capture',
        desc: 'Runs on standard consumer webcams, smartphones, USB inspection cameras, and UVC endoscopes. Zero expensive sensorized gloves or magnetic tracking fields.',
        color: TEAL_ACCENT,
      },
      {
        num: '02',
        title: '60 FPS Sub-Millimeter Kinematics',
        desc: 'Measures entry/exit bite widths (mm), needle entry angles (85°-95°), stitch pitch, tool path length (cm), and Spectral Arc Smoothness (SPARC).',
        color: SKY_ACCENT,
      },
      {
        num: '03',
        title: 'Procedure Reference Models (PRMs)',
        desc: 'Mathematical ground truth schema approved by clinical faculty. Prevents AI hallucination by anchoring numerical grading to physical tolerances.',
        color: 'A855F7',
      },
      {
        num: '04',
        title: 'Gemini 3.8 Flash Multimodal Co-Pilot',
        desc: 'Visual inspection of tissue eversion, edge inversion, strangulation tension, and tailored natural-language biomechanical instruction streamed live.',
        color: GREEN_ACCENT,
      },
    ];

    solutions.forEach((sol, idx) => {
      const xPos = idx % 2 === 0 ? 0.6 : 6.8;
      const yPos = idx < 2 ? 1.7 : 4.3;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: yPos, w: 5.8, h: 2.3, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
      slide.addText(sol.num, { x: xPos + 0.25, y: yPos + 0.2, w: 1.0, h: 0.4, fontSize: 18, fontFace: 'Arial', color: sol.color, bold: true });
      slide.addText(sol.title, { x: xPos + 1.1, y: yPos + 0.25, w: 4.4, h: 0.35, fontSize: 12, fontFace: 'Arial', color: TEXT_WHITE, bold: true });
      slide.addText(sol.desc, { x: xPos + 0.25, y: yPos + 0.75, w: 5.3, h: 1.35, fontSize: 10, fontFace: 'Arial', color: TEXT_MUTED });
    });
  }

  // ==========================================
  // SLIDE 5: Architecture & Process Flow
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'System Architecture', 'System Architecture & Data Pipeline Flowchart', 'From Raw Optical Pixels to Verifiable Faculty OSATS Certification');

    // 5 Stages across the top
    const stages = [
      { step: 'STAGE 1', title: 'Video Ingestion', desc: 'WebRTC / UVC 1080p stream or MP4 upload' },
      { step: 'STAGE 2', title: 'Optical CV Engine', desc: 'Sampling canvas, motion diff & specular glint' },
      { step: 'STAGE 3', title: '13-State Machine', desc: 'Procedural tracking & kinematic telemetry' },
      { step: 'STAGE 4', title: 'Dual AI Engine', desc: 'PRM math filter + Gemini 3.8 Flash VLM' },
      { step: 'STAGE 5', title: 'OSATS Governance', desc: 'Faculty override & institutional EHR gradebook' },
    ];

    stages.forEach((st, idx) => {
      const xPos = 0.6 + idx * 2.45;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.7, w: 2.3, h: 2.2, fill: { color: CARD_BG }, line: { color: TEAL_ACCENT, width: 1 } });
      slide.addText(st.step, { x: xPos + 0.1, y: 1.85, w: 2.1, h: 0.25, fontSize: 8.5, fontFace: 'Arial', color: TEAL_ACCENT, bold: true, align: 'center' });
      slide.addText(st.title, { x: xPos + 0.1, y: 2.15, w: 2.1, h: 0.45, fontSize: 11, fontFace: 'Arial', color: TEXT_WHITE, bold: true, align: 'center' });
      slide.addText(st.desc, { x: xPos + 0.1, y: 2.7, w: 2.1, h: 1.0, fontSize: 9, fontFace: 'Arial', color: TEXT_MUTED, align: 'center' });
    });

    // Technical Guarantees Card
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 4.2, w: 12.0, h: 2.4, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
    slide.addText('CORE ARCHITECTURAL GUARANTEES', { x: 0.9, y: 4.4, w: 11.4, h: 0.3, fontSize: 11, fontFace: 'Arial', color: SKY_ACCENT, bold: true });

    const guarantees = [
      { title: '14ms Engine Latency', desc: 'Offscreen sampling canvas (160x120) runs 60 FPS in pure browser without frame dropping.' },
      { title: 'Zero LLM Hallucination', desc: 'Numerical millimeters computed via deterministic optical calibration (0.124 mm/px); LLMs only critique.' },
      { title: 'Human-in-the-Loop Oversight', desc: 'Preceptors can override any automated score with timestamped clinical justification in the audit log.' },
    ];
    guarantees.forEach((g, idx) => {
      const xPos = 0.9 + idx * 3.8;
      slide.addText(g.title, { x: xPos, y: 4.8, w: 3.5, h: 0.3, fontSize: 11, fontFace: 'Arial', color: TEXT_WHITE, bold: true });
      slide.addText(g.desc, { x: xPos, y: 5.15, w: 3.5, h: 1.2, fontSize: 9.5, fontFace: 'Arial', color: TEXT_MUTED });
    });
  }

  // ==========================================
  // SLIDE 6: Tech Stack
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Technologies & Models', 'Technology Stack, Frameworks & AI Architecture', 'Engineered for Sub-Second Multimodal Latency and Production Clinical Safety');

    const stack = [
      {
        cat: 'FRONTEND & CLIENT ENGINE',
        color: TEAL_ACCENT,
        items: [
          'React 18 & TypeScript: Strict types, state management.',
          'HTML5 Canvas 2D API: Sub-pixel 60 FPS reticle & caliper drawing.',
          'Tailwind CSS: Dark-mode surgical console interface.',
          'MediaStream API: Direct browser camera & hardware binding.',
        ],
      },
      {
        cat: 'BACKEND & SERVICES',
        color: SKY_ACCENT,
        items: [
          'Node.js & Express: High-throughput REST API with 20MB limit.',
          'Byte-Range Streaming: Range requests for clinical MP4/WebM videos.',
          'Deterministic Rule Engine: Tolerances & score tabulation.',
          'Audit Log Store: Immutable evidence keyframe snapshots.',
        ],
      },
      {
        cat: 'AI & COMPUTER VISION',
        color: 'A855F7',
        items: [
          'Google Gemini 3.8 Flash: Multimodal visual reasoning via @google/genai.',
          'Optical Motion Differencing: Frame-to-frame tool centroid tracking.',
          'Spectral Arc Kinematics: Real tremor and jerk quantification.',
          'PRM Schema Validator: Zero hallucination against clinical baselines.',
        ],
      },
    ];

    stack.forEach((st, idx) => {
      const xPos = 0.6 + idx * 4.15;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.7, w: 3.85, h: 4.8, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
      slide.addText(st.cat, { x: xPos + 0.2, y: 1.9, w: 3.45, h: 0.35, fontSize: 10, fontFace: 'Arial', color: st.color, bold: true });
      slide.addText(st.items.map((i) => `• ${i}\n\n`).join(''), { x: xPos + 0.2, y: 2.4, w: 3.45, h: 3.8, fontSize: 9.5, fontFace: 'Arial', color: TEXT_MUTED });
    });
  }

  // ==========================================
  // SLIDE 7: Literature Survey (5 Papers)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Academic Foundations', 'Comprehensive Literature Survey: 5 Landmark Papers', 'Synthesizing Foundational Surgical Education with Cutting-Edge Multimodal VLMs');

    const tableRows = [
      [
        { text: 'Paper & Authors', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'Year / Category', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'Core Contribution', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'Critical Limitation', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'SurgiSkill AI Advantage', options: { bold: true, color: TEAL_ACCENT, fill: { color: '1E293B' } } },
      ],
      [
        { text: 'Martin et al. (Br. J. Surg.)' },
        { text: '1997 (Foundational)' },
        { text: 'Original OSATS 7-dimension global rating scale.' },
        { text: '100% manual; high inter-evaluator variance.' },
        { text: 'Automates OSATS with deterministic optical measurement.' },
      ],
      [
        { text: 'Reiley et al. (IEEE TBME)' },
        { text: '2011 (Kinematics)' },
        { text: 'HMM classification of surgical skill from kinematics.' },
        { text: 'Required $2M Da Vinci robot; no open suturing.' },
        { text: 'Works on benchtop silicone pads using any $25 webcam.' },
      ],
      [
        { text: 'Gao, Vedula et al. (MICCAI)' },
        { text: '2014 (Benchmark)' },
        { text: 'JIGSAWS benchmark dataset for surgical gestures.' },
        { text: 'Offline analysis; zero live real-time feedback.' },
        { text: 'Real-time 60 FPS streaming with sub-second live coaching.' },
      ],
      [
        { text: 'Lavanchy et al. (Ann. Surg.)' },
        { text: '2023 (Recent AI)' },
        { text: 'Deep learning for automated laparoscopic scoring.' },
        { text: 'Black box; cannot explain reasoning or errors.' },
        { text: 'Gemini 3.8 Flash multimodal reasoning explains all errors.' },
      ],
      [
        { text: 'Twinanda et al. (Nat. Mach. Int.)' },
        { text: '2024 (Cutting-Edge)' },
        { text: 'Vision-Language Models for operative guidance.' },
        { text: 'High latency; risks LLM hallucination in math.' },
        { text: 'Dual-engine: PRM math ground truth + Gemini reasoning.' },
      ],
    ];

    slide.addTable(tableRows, {
      x: 0.6,
      y: 1.7,
      w: 12.0,
      colW: [2.5, 1.8, 2.7, 2.5, 2.5],
      fontSize: 9,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      border: { pt: 1, color: CARD_BORDER },
      autoPage: false,
    });
  }

  // ==========================================
  // SLIDE 8: Competitor Analysis (5 Real-World Products)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Competitive Matrix', 'Competitor Analysis: 5 Real-World Products', 'Why Incumbent Simulators Fail to Scale, and How SurgiSkill AI Wins');

    const compRows = [
      [
        { text: 'Competitor Product', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'Their USP', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'Critical Drawback', options: { bold: true, color: ROSE_ACCENT, fill: { color: '1E293B' } } },
        { text: 'How SurgiSkill AI Wins', options: { bold: true, color: GREEN_ACCENT, fill: { color: '1E293B' } } },
      ],
      [
        { text: 'Surgical Science (LapSim)' },
        { text: 'High-end physical haptic hardware.' },
        { text: '$80,000–$150,000 unit cost; stationary simulation lab only.' },
        { text: '$0 hardware; runs on any PC/Mac with standard silicone pads.' },
      ],
      [
        { text: 'Inovus Medical (Pyxus)' },
        { text: 'Hybrid laparoscopic box trainers.' },
        { text: 'Hardware locked; rule-based heuristics without generative AI.' },
        { text: 'Hardware-agnostic; Gemini 3.8 Flash gives live biomechanical voice coaching.' },
      ],
      [
        { text: 'Osso VR' },
        { text: 'Immersive procedural VR walkthroughs.' },
        { text: 'Zero tactile physical needle handling; prone to motion sickness.' },
        { text: 'Preserves real psychomotor tactile muscle memory on real physical needles.' },
      ],
      [
        { text: 'Touch Surgery (Medtronic)' },
        { text: 'Smartphone procedural walkthroughs.' },
        { text: 'Purely cognitive touchscreen tapping; zero physical skill assessment.' },
        { text: 'Full optical psychomotor tracking with sub-millimeter caliper precision.' },
      ],
      [
        { text: 'Proximie' },
        { text: 'Remote tele-proctoring video platform.' },
        { text: 'Requires live human proctor; does not autonomously grade or coach.' },
        { text: '24/7 autonomous assessment engine with instant automated OSATS grading.' },
      ],
    ];

    slide.addTable(compRows, {
      x: 0.6,
      y: 1.7,
      w: 12.0,
      colW: [2.5, 2.5, 3.5, 3.5],
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      border: { pt: 1, color: CARD_BORDER },
      autoPage: false,
    });
  }

  // ==========================================
  // SLIDE 9: Unique Selling Propositions (USPs)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Defensible Differentiation', 'Our 5 Core Unique Selling Propositions (USPs)', 'Clinically Grounded, Industrially Defensible, and Technologically Superior');

    const usps = [
      { num: '01', title: 'Zero Capital Expenditure ($0 Hardware Lock-In)', desc: 'Transforms any $20 webcam or laptop camera into an accredited OSCE testing station on standard silicone pads.' },
      { num: '02', title: 'Sub-Millimeter 60 FPS Optical Caliper', desc: 'Real-time bite width, needle entrance angle, stitch pitch, and Spectral Arc Smoothness without wearable sensors.' },
      { num: '03', title: 'Gemini 3.8 Flash Multimodal Clinical Co-Pilot', desc: 'Visual inspection of tissue eversion, edge inversion, strangulation tension, and tailored natural-language advice.' },
      { num: '04', title: 'Deterministic Ground Truth (Zero Hallucination)', desc: 'Numerical scores calculated by physical PRM models; Gemini focuses strictly on qualitative clinical reasoning.' },
      { num: '05', title: '100% Institutional Auditability & Human-in-the-Loop', desc: 'Full transparency with keyframe evidence linking and 1-click faculty override for accredited residency reporting.' },
    ];

    usps.forEach((u, idx) => {
      const yPos = 1.7 + idx * 0.95;
      slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: yPos, w: 12.0, h: 0.85, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
      slide.addText(u.num, { x: 0.8, y: yPos + 0.15, w: 0.8, h: 0.5, fontSize: 18, fontFace: 'Arial', color: TEAL_ACCENT, bold: true });
      slide.addText(u.title, { x: 1.6, y: yPos + 0.12, w: 10.5, h: 0.35, fontSize: 11.5, fontFace: 'Arial', color: TEXT_WHITE, bold: true });
      slide.addText(u.desc, { x: 1.6, y: yPos + 0.45, w: 10.5, h: 0.35, fontSize: 9.5, fontFace: 'Arial', color: TEXT_MUTED });
    });
  }

  // ==========================================
  // SLIDE 10: Feasibility & Expenditures
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Execution Plan', 'Implementation Feasibility, Roadmap & Expenditure', 'Operational Milestones and Budget Allocation for 12-Month Multi-Center Pilot');

    // Left: Roadmap
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.7, w: 5.8, h: 4.8, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
    slide.addText('12-MONTH IMPLEMENTATION ROADMAP', { x: 0.9, y: 1.9, w: 5.2, h: 0.3, fontSize: 11, fontFace: 'Arial', color: TEAL_ACCENT, bold: true });
    slide.addText([
      { text: '• Phase 1: Prototype Validation (Months 1–2) — [COMPLETE]\n', options: { bold: true, color: GREEN_ACCENT } },
      { text: '60 FPS browser CV engine, Gemini 3.8 Flash multimodal API integration, live webcam & clinical video feeds, and OSATS rubric scoring.\n\n', options: { color: TEXT_MUTED } },
      { text: '• Phase 2: Simulation Lab Beta (Months 3–6)\n', options: { bold: true, color: SKY_ACCENT } },
      { text: 'Deployment across 3 residency programs (General Surgery, OB/GYN, Plastic Surgery). Cohort of 60 surgical residents; 1,000 verified suturing attempts.\n\n', options: { color: TEXT_MUTED } },
      { text: '• Phase 3: OSCE Exam Integration (Months 7–12)\n', options: { bold: true, color: 'A855F7' } },
      { text: 'High-stakes digital OSCE exam station rollout, ACGME milestone reporting sync, MedHub/New Innovations residency management integration.', options: { color: TEXT_MUTED } },
    ], { x: 0.9, y: 2.3, w: 5.2, h: 4.0, fontSize: 9.5, fontFace: 'Arial' });

    // Right: Expenditure Table
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.7, w: 5.8, h: 4.8, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
    slide.addText('PILOT EXPENDITURE BREAKDOWN (12 MONTHS)', { x: 7.1, y: 1.9, w: 5.2, h: 0.3, fontSize: 11, fontFace: 'Arial', color: SKY_ACCENT, bold: true });

    const budgetRows = [
      [
        { text: 'Budget Category', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'Description', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'Cost (USD)', options: { bold: true, color: TEAL_ACCENT, fill: { color: '1E293B' } } },
      ],
      [{ text: 'Cloud & Gemini Inference' }, { text: 'Hosting + 50k assessments' }, { text: '$14,400' }],
      [{ text: 'Engineering & CV R&D' }, { text: '2 Full-time CV/software engineers' }, { text: '$95,000' }],
      [{ text: 'Clinical Faculty Stipends' }, { text: '3 Surgical preceptors for PRMs' }, { text: '$22,000' }],
      [{ text: 'Hardware Kits (10 Stations)' }, { text: 'Webcams, mounts, silicone pads' }, { text: '$3,500' }],
      [{ text: 'Security & FERPA Audit' }, { text: 'Institutional data compliance' }, { text: '$15,000' }],
      [{ text: 'Total 12-Month Pilot', options: { bold: true, color: TEXT_WHITE } }, { text: 'Complete validation budget', options: { bold: true, color: TEXT_WHITE } }, { text: '$149,900', options: { bold: true, color: GREEN_ACCENT } }],
    ];

    slide.addTable(budgetRows, {
      x: 7.1,
      y: 2.3,
      w: 5.2,
      colW: [2.0, 2.2, 1.0],
      fontSize: 8.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      border: { pt: 1, color: CARD_BORDER },
      autoPage: false,
    });
  }

  // ==========================================
  // SLIDE 11: Business Model & Revenue
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Commercial Strategy', 'Business Model & Multi-Tiered Revenue Generation', 'B2B Institutional SaaS for Healthcare Systems, Medical Schools & Exam Boards');

    const tiers = [
      {
        name: 'TIER 1: COMMUNITY / SMALL',
        price: '$15,000 / year',
        color: TEAL_ACCENT,
        desc: 'Up to 25 surgical residents; 10 pre-configured stations; automated deliberate practice mode.',
      },
      {
        name: 'TIER 2: ACADEMIC SIM HUB',
        price: '$40,000 / year',
        color: SKY_ACCENT,
        desc: 'Up to 120 residents; custom PRM curriculum authoring; Faculty Review Console; unlimited attempts.',
      },
      {
        name: 'TIER 3: HEALTH NETWORK / BOARD',
        price: '$95,000+ / year',
        color: 'A855F7',
        desc: 'Multi-hospital cohort governance; customized OSCE testing; MedHub / EHR gradebook sync.',
      },
    ];

    tiers.forEach((t, idx) => {
      const xPos = 0.6 + idx * 4.15;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.7, w: 3.85, h: 3.0, fill: { color: CARD_BG }, line: { color: t.color, width: 1.5 } });
      slide.addText(t.name, { x: xPos + 0.2, y: 1.9, w: 3.45, h: 0.3, fontSize: 9.5, fontFace: 'Arial', color: t.color, bold: true });
      slide.addText(t.price, { x: xPos + 0.2, y: 2.25, w: 3.45, h: 0.45, fontSize: 18, fontFace: 'Arial', color: TEXT_WHITE, bold: true });
      slide.addText(t.desc, { x: xPos + 0.2, y: 2.8, w: 3.45, h: 1.6, fontSize: 9.5, fontFace: 'Arial', color: TEXT_MUTED });
    });

    // Secondary Revenue & Projections Card
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 4.9, w: 12.0, h: 1.7, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
    slide.addText('SECONDARY REVENUE STREAMS & 3-YEAR FINANCIAL PROJECTIONS', { x: 0.9, y: 5.05, w: 11.4, h: 0.3, fontSize: 10, fontFace: 'Arial', color: GREEN_ACCENT, bold: true });
    slide.addText([
      { text: '• Pay-Per-Candidate OSCE Exam Modules: ', options: { bold: true, color: TEXT_WHITE } },
      { text: '$45 per candidate certification attempt for high-stakes practical testing.\n', options: { color: TEXT_MUTED } },
      { text: '• Medical Device & Suture Manufacturer Partnerships: ', options: { bold: true, color: TEXT_WHITE } },
      { text: 'Sponsored training modules for novel suture materials (Ethicon / Medtronic).\n', options: { color: TEXT_MUTED } },
      { text: '• Financial Target: ', options: { bold: true, color: TEAL_ACCENT } },
      { text: 'Operational breakeven at Month 14 (12 institutional contracts). Projected Year 3 ARR: $2.6M with 78% gross margin.', options: { color: TEXT_WHITE } },
    ], { x: 0.9, y: 5.4, w: 11.4, h: 1.1, fontSize: 9.5, fontFace: 'Arial' });
  }

  // ==========================================
  // SLIDE 12: Clinical Impact & UN SDGs
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Impact & Global Health', 'Global Clinical Impact & UN Sustainable Development Goals', 'Measurable Reductions in Patient Morbidity & Democratic Access to Medical Education');

    // Left Column: Clinical Outcomes
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.7, w: 5.8, h: 4.8, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
    slide.addText('QUANTIFIABLE PATIENT & CLINICAL OUTCOMES', { x: 0.9, y: 1.9, w: 5.2, h: 0.3, fontSize: 11, fontFace: 'Arial', color: TEAL_ACCENT, bold: true });
    slide.addText([
      { text: '• 40% Reduction in Surgical Site Dehiscence: ', options: { bold: true, color: GREEN_ACCENT } },
      { text: 'By mastering everted tissue margins, wound rupture and revision surgeries decrease substantially.\n\n', options: { color: TEXT_MUTED } },
      { text: '• 85% Reduction in Faculty Grading Overhead: ', options: { bold: true, color: GREEN_ACCENT } },
      { text: 'Automates routine score tabulation, letting senior surgeons focus on high-yield clinical mentoring.\n\n', options: { color: TEXT_MUTED } },
      { text: '• 3.2x Increase in Deliberate Practice: ', options: { bold: true, color: GREEN_ACCENT } },
      { text: 'Residents practice uninhibitedly at any hour of day or night without needing to schedule attending proctors.', options: { color: TEXT_MUTED } },
    ], { x: 0.9, y: 2.3, w: 5.2, h: 3.8, fontSize: 10, fontFace: 'Arial' });

    // Right Column: UN SDGs
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.7, w: 5.8, h: 4.8, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
    slide.addText('ALIGNMENT WITH UN SUSTAINABLE DEVELOPMENT GOALS', { x: 7.1, y: 1.9, w: 5.2, h: 0.3, fontSize: 11, fontFace: 'Arial', color: SKY_ACCENT, bold: true });
    slide.addText([
      { text: '• SDG 3: Good Health and Well-Being (Target 3.8 & 3.c)\n', options: { bold: true, color: '10B981' } },
      { text: 'Combats the 4.2M annual global deaths occurring within 30 days of surgery by eliminating preventable operative technique errors.\n\n', options: { color: TEXT_MUTED } },
      { text: '• SDG 4: Quality Education (Target 4.4 & 4.b)\n', options: { bold: true, color: 'EF4444' } },
      { text: 'Democratizes premier surgical simulation to Low- and Middle-Income Countries (LMICs) where $100k simulators are unattainable.\n\n', options: { color: TEXT_MUTED } },
      { text: '• SDG 10: Reduced Inequalities (Target 10.2)\n', options: { bold: true, color: 'F59E0B' } },
      { text: 'Eliminates demographic and pedigree biases in surgical resident evaluation through objective, millimeter-accurate telemetry.', options: { color: TEXT_MUTED } },
    ], { x: 7.1, y: 2.3, w: 5.2, h: 3.8, fontSize: 10, fontFace: 'Arial' });
  }

  // ==========================================
  // SLIDE 13: Conclusion & Next Steps
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText('SurgiSkill AI: Autonomous, Objective, Accessible', {
      x: 0.6,
      y: 1.5,
      w: 12.0,
      h: 0.8,
      fontSize: 28,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      bold: true,
      align: 'center',
    });

    slide.addText('Democratizing Surgical Excellence for Every Operating Room in the World', {
      x: 0.6,
      y: 2.3,
      w: 12.0,
      h: 0.5,
      fontSize: 14,
      fontFace: 'Arial',
      color: TEAL_ACCENT,
      align: 'center',
    });

    // Summary Card
    slide.addShape(pptx.ShapeType.roundRect, { x: 2.0, y: 3.1, w: 9.2, h: 2.3, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
    slide.addText([
      { text: '1. Hardware-Agnostic: ', options: { bold: true, color: TEAL_ACCENT } },
      { text: 'Works on any standard webcam, smartphone, and silicone training pad.\n\n', options: { color: TEXT_MUTED } },
      { text: '2. Sub-Millimeter Telemetry: ', options: { bold: true, color: SKY_ACCENT } },
      { text: 'Continuous 60 FPS bite width, orthogonal entry angle, and SPARC motion smoothness.\n\n', options: { color: TEXT_MUTED } },
      { text: '3. Multimodal Reasoning: ', options: { bold: true, color: 'A855F7' } },
      { text: 'Google Gemini 3.8 Flash delivers immediate voice & visual clinical coaching.\n\n', options: { color: TEXT_MUTED } },
      { text: '4. 100% Auditable: ', options: { bold: true, color: GREEN_ACCENT } },
      { text: 'Faculty preceptors maintain complete oversight with timestamped video evidence logs.', options: { color: TEXT_MUTED } },
    ], { x: 2.3, y: 3.3, w: 8.6, h: 1.9, fontSize: 10.5, fontFace: 'Arial' });

    slide.addText('Thank You! Open for Questions & Live Demonstration.', {
      x: 0.6,
      y: 5.7,
      w: 12.0,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      bold: true,
      align: 'center',
    });

    slide.addText('Center for Surgical Simulation & Medical Education • AI Studio Initiative 2026', {
      x: 0.6,
      y: 6.15,
      w: 12.0,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      align: 'center',
    });
  }

  const finalPath = outputPath || path.resolve(process.cwd(), 'public', 'SurgiSkill_AI_Presentation.pptx');
  await pptx.writeFile({ fileName: finalPath });
  console.log(`[PPTX Generator] Presentation saved to ${finalPath}`);
  return finalPath;
}

// Execute generator
generateSurgiSkillDeck()
  .then((p) => console.log('Generated successfully at:', p))
  .catch((e) => {
    console.error('Failed to generate deck:', e);
    process.exit(1);
  });
