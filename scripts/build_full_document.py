import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx_helpers import set_cell_background, set_cell_margins, add_callout_box, add_step_table

def build_manual():
    doc = Document()

    # Configure Margins (0.75 in)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    screenshots_dir = os.path.join(base_dir, "Document", "screenshots")
    output_docx_path = os.path.join(base_dir, "Document", "SurgiSkill_AI_Complete_Documentation_and_User_Manual.docx")

    # =========================================================================
    # TITLE / COVER SECTION
    # =========================================================================
    p_badge = doc.add_paragraph()
    r_badge = p_badge.add_run("SURGICAL INTELLIGENCE & DIGITAL OSCE PLATFORM  •  VERSION 2026.1")
    r_badge.font.name = "Arial"
    r_badge.font.size = Pt(9.5)
    r_badge.bold = True
    r_badge.font.color.rgb = RGBColor(13, 148, 136) # Teal
    p_badge.paragraph_format.space_after = Pt(4)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("SurgiSkill AI — Comprehensive Platform Documentation & Complete User Manual")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(24)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
    p_title.paragraph_format.space_after = Pt(6)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run(
        "A Full-Stack Clinical Simulation System Featuring Explainable Computer Vision, "
        "Procedure Reference Models (PRMs), Gemini 3.8 Flash Multimodal Reasoning, "
        "Standardized Digital OSCE Exam Rotations, and Institutional Governance"
    )
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(71, 85, 105) # Slate 600
    p_sub.paragraph_format.space_after = Pt(16)

    # Metadata Table
    meta_tbl = doc.add_table(rows=2, cols=3)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_tbl.autofit = False
    col_widths = [Inches(2.2), Inches(2.4), Inches(2.4)]
    
    headers_meta = ["PROJECT ARCHITECTURE", "CLINICAL SPECIALTY", "TARGET AUDIENCE"]
    vals_meta = [
        "React 19, TypeScript, Tailwind 4\nNode.js, Express, Gemini 3.8 Flash",
        "General Surgery, Simulation Education\nDigital OSCE Board Examination",
        "Surgical Residents, Faculty Reviewers,\nClinical Leads, Simulation Directors"
    ]

    for c_idx in range(3):
        meta_tbl.cell(0, c_idx).width = col_widths[c_idx]
        set_cell_background(meta_tbl.cell(0, c_idx), "0F172A")
        set_cell_margins(meta_tbl.cell(0, c_idx), top=80, bottom=80, left=100, right=100)
        p0 = meta_tbl.cell(0, c_idx).paragraphs[0]
        r0 = p0.add_run(headers_meta[c_idx])
        r0.font.name = "Arial"
        r0.font.size = Pt(8.5)
        r0.bold = True
        r0.font.color.rgb = RGBColor(255, 255, 255)

        meta_tbl.cell(1, c_idx).width = col_widths[c_idx]
        set_cell_background(meta_tbl.cell(1, c_idx), "F1F5F9")
        set_cell_margins(meta_tbl.cell(1, c_idx), top=80, bottom=80, left=100, right=100)
        p1 = meta_tbl.cell(1, c_idx).paragraphs[0]
        r1 = p1.add_run(vals_meta[c_idx])
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Applicant Details Table
    app_meta_tbl = doc.add_table(rows=2, cols=2)
    app_meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    app_meta_tbl.autofit = False
    col_lead_widths = [Inches(3.5), Inches(3.5)]
    headers_leads = ["APPLICANT 1", "APPLICANT 2"]
    vals_leads = [
        "Dr. VIJAYANANDA\nClinical Simulation Director & Professor of Surgery\nDepartment of General Surgery",
        "Armaan Samir Jena\nSystem Architect & Lead Software Engineer\nSurgiSkill AI Engineering Team"
    ]
    for c_idx in range(2):
        app_meta_tbl.cell(0, c_idx).width = col_lead_widths[c_idx]
        set_cell_background(app_meta_tbl.cell(0, c_idx), "0D9488")
        set_cell_margins(app_meta_tbl.cell(0, c_idx), top=70, bottom=70, left=100, right=100)
        p0 = app_meta_tbl.cell(0, c_idx).paragraphs[0]
        r0 = p0.add_run(headers_leads[c_idx])
        r0.font.name = "Arial"
        r0.font.size = Pt(8.5)
        r0.bold = True
        r0.font.color.rgb = RGBColor(255, 255, 255)

        app_meta_tbl.cell(1, c_idx).width = col_lead_widths[c_idx]
        set_cell_background(app_meta_tbl.cell(1, c_idx), "F0FDFA")
        set_cell_margins(app_meta_tbl.cell(1, c_idx), top=70, bottom=70, left=100, right=100)
        p1 = app_meta_tbl.cell(1, c_idx).paragraphs[0]
        r1 = p1.add_run(vals_leads[c_idx])
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    add_callout_box(
        doc,
        "CLINICAL EDUCATIONAL SCOPE",
        "SurgiSkill AI is engineered strictly for surgical residency education, simulation training centers, "
        "and standardized digital Objective Structured Assessment of Technical Skills (OSATS/OSCE) examinations. "
        "It provides objective, explainable, evidence-linked kinematic measurements to accelerate procedural mastery "
        "without replacing master surgical educators."
    )

    doc.add_page_break()

    # =========================================================================
    # SECTION 1: EXECUTIVE SUMMARY & ARCHITECTURE
    # =========================================================================
    h1 = doc.add_heading("Section 1: Executive Summary & Project Architecture", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)

    p_exec = doc.add_paragraph()
    p_exec.add_run(
        "For over a century, surgical training has relied on the Halstedian apprenticeship model ('see one, do one, teach one'). "
        "While foundational, this model suffers from subjective, retrospective evaluations that vary dramatically between attending surgeons. "
        "Traditional surgical grading typically occurs hours or days after a procedure via informal qualitative feedback like 'good knot tying' or 'handle tissue more gently', "
        "lacking millimeter-accurate geometric precision or biomechanical telemetry.\n\n"
        "SurgiSkill AI transforms this paradigm into an Objective Structured Assessment of Technical Skills (OSATS) intelligence platform. "
        "By fusing 60 FPS real-time computer vision, ground-truth Procedure Reference Models (PRMs), and Google Gemini 3.8 Flash multimodal reasoning, "
        "the platform continuously tracks surgical needle orientation, entry/exit bite symmetry, tissue apposition forces, instrument path lengths, and economy of motion."
    )

    doc.add_heading("Core Clinical Principles", level=2)
    doc.add_paragraph(
        "1. Explainable, Not Opaque AI: SurgiSkill AI rejects black-box scoring. Every deduction is linked to millimeter-accurate measurements "
        "(e.g., 'Needle Entry Angle was 71° versus PRM required 85°–95°') and timestamped video keyframes.\n"
        "2. Biomechanical Grounding: Scores are not arbitrary rankings; deviations explain clinical tissue biology (e.g., acute entry causes wound inversion, "
        "scar widening, and ischemia).\n"
        "3. Dual Evaluation Governance: The system empowers attending surgeons with score override capabilities accompanied by mandatory clinical rationales.\n"
        "4. Sensory Transparency: The platform explicitly distinguishes between true physical loadcell measurements and visual proxy estimations."
    )

    doc.add_heading("Full-Stack Technology Architecture", level=2)
    tech_table = doc.add_table(rows=6, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tech_headers = ["Layer", "Technology Stack", "Core Operational Role"]
    tech_rows = [
        ("Frontend Client", "React 19, TypeScript, Lucide Icons", "Single-Page Application with sub-16ms responsive UI and dark mode"),
        ("Styling & Design System", "Tailwind CSS 4, Motion", "Tailored clinical dark palette (Slate-950, Emerald, Amber, Rose accents)"),
        ("Computer Vision & Canvas", "HTML5 Canvas API, Custom CV Engine", "60 FPS optical tracking, dynamic reticles, caliper overlays, 13-stage FSM"),
        ("Full-Stack Backend", "Node.js, Express, Vite Middlewares", "Port 3000 REST API v1 endpoints with range-request video streaming"),
        ("AI & Multimodal Reasoning", "Google Gemini 3.8 Flash (@google/genai)", "Real-time webcam video frame analysis & biomechanical coaching synthesis")
    ]
    for i, h in enumerate(tech_headers):
        tech_table.cell(0, i).width = Inches(2.2)
        set_cell_background(tech_table.cell(0, i), "0F172A")
        set_cell_margins(tech_table.cell(0, i), top=80, bottom=80, left=100, right=100)
        p = tech_table.cell(0, i).paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, (col0, col1, col2) in enumerate(tech_rows, 1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate([col0, col1, col2]):
            tech_table.cell(r_idx, c_idx).width = Inches(2.2)
            set_cell_background(tech_table.cell(r_idx, c_idx), bg)
            set_cell_margins(tech_table.cell(r_idx, c_idx), top=60, bottom=60, left=100, right=100)
            p = tech_table.cell(r_idx, c_idx).paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_page_break()

    # =========================================================================
    # SECTION 2: SYSTEM FEATURES DIRECTORY
    # =========================================================================
    h1 = doc.add_heading("Section 2: Complete System Features Directory", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)

    features_catalog = [
        ("Feature 1: Multi-Role Institutional Access Control",
         "The platform supports 4 distinct surgical personas with tailored permission envelopes: Trainee/Resident (PGY-1/2), "
         "Faculty Reviewer (Prof. Sarah Jenkins), Clinical Lead & OSCE Chair (Dr. Marcus Vance), and Institution Admin (Elena Rostova). "
         "The role selector dynamically reconfigures sidebar items, simulation privileges, and scoring authority in real-time."),
        
        ("Feature 2: Trainee Dashboard & Competency Radar",
         "Presents overall composite skill ratings (82.0% benchmark), cumulative needle path lengths (54.2 cm), "
         "upcoming OSCE countdown timers, six-axis hexagonal competency radar plots (Needle Handling, Entry Angle, Bite Symmetry, "
         "Pitch Spacing, Knot Security, Economy of Motion), and direct links to assigned clinical curriculum modules."),
        
        ("Feature 3: Surgical Stations Catalog & Difficulty Tiering",
         "Features a catalog of accredited surgical stations ranging from Fundamental Simple Interrupted Suturing, "
         "Intermediate Continuous Running Suture, Intermediate Horizontal Mattress Suture, to Advanced Laparoscopic Intracorporeal Knot Tying (FLS Task 5). "
         "Each station exposes target durations, clinical objectives, and locked PRM ground truths."),

        ("Feature 4: Real-Time Suturing Workspace (Live 60 FPS CV Engine)",
         "High-frequency computer vision workspace rendering millimeter-calibrated bounding boxes, bite calipers, "
         "orthogonal 90° entry angle arc indicators, dynamic tension warnings, and a 13-stage procedural finite state machine. "
         "Supports multi-input feeds including WebRTC UVC webcams, recorded clinical vertical mattress video, and synthetic dermal pad simulators."),

        ("Feature 5: Objective Attempt Performance Reports & Millimeter Kinematics",
         "Post-session debrief synthesizing the objective weighted score formula: 45% OSATS Checklist Fidelity + 40% Geometric Parameter Adherence + "
         "15% Kinematic Motion Economy. Compares observed millimeter values against PRM tolerances and links each technical flaw to video keyframes."),

        ("Feature 6: Gemini 3.8 Flash Multimodal Clinical Reasoning Coach",
         "Server-side Gemini 3.8 Flash engine that ingests measured kinematic deviations and generates structured clinical summaries: "
         "(1) Clinical analysis of observed deviations on living skin healing; (2) Biomechanical wrist/elbow corrections; and (3) Tailored 5-minute deliberate practice drills. "
         "Includes robust offline rule-grounded clinical fallback."),

        ("Feature 7: Faculty Review Console & Score Override Audit Trail",
         "Dual-evaluation portal allowing surgical attendings to review trainee recordings, slide verified score bars, "
         "pin timestamped critique comments directly onto the video canvas, and modify AI composite scores with mandatory clinical justifications."),

        ("Feature 8: Standardized Digital OSCE Examination Module",
         "Synchronous clinical examination station with an automated 10-minute countdown clock, station rotations, candidate mandate briefings, "
         "and the standardized 5-point OSATS Global Rating Scale (Respect for Tissue, Time and Motion, Instrument Handling, Flow of Operation)."),

        ("Feature 9: Clinical Lead Curricular Analytics & Concordance Modeling",
         "Institutional data analytics tracking residency cohort learning curves (PGY-1 vs PGY-2), high-frequency curricular gap analysis, "
         "statistical concordance modeling (Pearson correlation r = 0.89, mean AI-faculty bias +2.8 points), and PRM version approval locks."),

        ("Feature 10: Residency Cohort & User Rosters",
         "Manages residency classes (General Surgery Class of 2026/2027), tracks individual student readiness status (Honors, On Track, Needs Remediation), "
         "and manages curricular station assignments across the simulation lab."),

        ("Feature 11: Hardware Abstraction Layer (HAL) & Multi-Modal Sensory Hub",
         "Live hardware hub verifying connectivity and latency heartbeats across surgical webcams, Stryker laparoscopic video towers, "
         "Intel RealSense stereo depth cameras, ATI 6-axis loadcells, and cloud storage vaults."),

        ("Feature 12: System Health, Diagnostics & Tamper-Evident Audit Logs",
         "Monitors platform core engine pods, PostgreSQL relational connection pools, background worker queues, and maintains an immutable, "
         "cryptographically timestamped audit log of every score override and PRM revision for HIPAA/FERPA simulation compliance."),

        ("Feature 13: Clinical Reference Standards & Procedures Guide",
         "Comprehensive clinical reference manual detailing ACS/APDS metric benchmarks, mathematical formulas for instrument path length, "
         "and transparent definitions of sensory proxies vs true transducers."),

        ("Feature 14: Automated PowerPoint Slide Deck & PDF/Print Export",
         "Built-in presentation generation creating 16:9 widescreen slide decks (via pptxgenjs) and instant print-to-PDF report generation for simulation committees.")
    ]

    for title, desc in features_catalog:
        h2 = doc.add_heading(title, level=2)
        h2.paragraph_format.space_before = Pt(8)
        h2.paragraph_format.space_after = Pt(2)
        p = doc.add_paragraph(desc)
        p.paragraph_format.space_after = Pt(6)

    doc.add_page_break()

    # =========================================================================
    # SECTION 3: STEP-BY-STEP USER MANUAL WITH SCREENSHOTS & SPECIFICATIONS
    # =========================================================================
    h1 = doc.add_heading("Section 3: Step-by-Step User Manual & Screenshot Guide", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(4)

    p_intro_manual = doc.add_paragraph()
    p_intro_manual.add_run(
        "This section constitutes the complete, operational User Manual for SurgiSkill AI. "
        "Each core screen is presented with its verified high-resolution screenshot, a functional layout breakdown, "
        "and an exhaustive Step Table specifying exact click locations, interaction techniques, immediate UI reactions, "
        "and corresponding backend/CV system executions."
    )
    p_intro_manual.paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------------------
    # Screen 1: Public Portal
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 1: Public Portal & Medical Tech Landing Page", level=2)
    img_path = os.path.join(screenshots_dir, "01_landing_page.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 1.1: SurgiSkill AI Public Medical Technology Landing Page")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Serves as the public institutional entry point, explaining the platform's clinical mission, "
        "explainable computer vision methodology, and providing access to institutional login and documentation."
    )

    steps_screen1 = [
        ("Launch Clinical Workspace", "Top-right navigation bar (Teal pill button)", "Single Left-Click",
         "Instantly transitions from public splash to Trainee Dashboard in AppShell", "Authenticates session and mounts live WebSocket / REST state"),
        ("Enter Trainee / Faculty Portal", "Center hero section (Large teal call-to-action button)", "Single Left-Click",
         "Navigates trainee or faculty user into active simulation dashboard", "Sets currentView='student-dashboard' in App.tsx"),
        ("System Docs & Specs", "Top header next to Launch button (Dark gray outlined button)", "Single Left-Click",
         "Opens comprehensive Documentation & Concept Guide", "Sets currentView='docs' in App.tsx"),
        ("Platform Overview / Computer Vision Tabs", "Header navigation links (Center nav bar)", "Single Left-Click",
         "Switches public landing tab between Overview, CV, OSCE, and Governance", "Renders corresponding architectural section smoothly")
    ]
    add_step_table(doc, steps_screen1)
    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Screen 2: Trainee Dashboard
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 2: Trainee Dashboard & Competency Overview", level=2)
    img_path = os.path.join(screenshots_dir, "02_trainee_dashboard.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 2.1: Trainee Dashboard with Competency Radar & Station Modules")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Central hub for surgical trainees (e.g., Dr. Alex Chen, PGY-2). Displays assigned curriculum modules, "
        "verified composite benchmark scores, kinematic path lengths, upcoming OSCE exam countdowns, and six-axis competency radar."
    )

    steps_screen2 = [
        ("Launch Suturing Station", "Top right action group (Bright teal button with camera icon)", "Single Left-Click",
         "Transitions immediately into the Real-Time Suturing Workspace for the active station", "Initializes CV engine and starts optical telemetry feed"),
        ("View OSCE Schedule", "Top right action group (Dark bordered button next to Launch)", "Single Left-Click",
         "Opens Digital OSCE examination view with active candidate station countdown", "Sets currentView='osce' and mounts timed examination clock"),
        ("Start Practice (Card Button)", "Inside each station card (e.g. Interrupted Suture, Continuous Suture)", "Single Left-Click",
         "Selects the specific surgical station and opens live workspace", "Sets activeStationId and mounts target PRM criteria"),
        ("Review Report", "On completed station cards (e.g. SURG-STN-101 card)", "Single Left-Click",
         "Opens detailed Attempt Performance Report for that station", "Loads att_chen_interrupted_001 record with full telemetry"),
        ("Role Switcher Dropdown", "Top navigation bar (Right side showing 'STUDENT (Dr.)')", "Click dropdown pill",
         "Expands menu of 4 institutional roles (Faculty, Clinical Lead, Admin)", "Allows switching personas for cross-role evaluation")
    ]
    add_step_table(doc, steps_screen2)
    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Screen 3: Surgical Stations Catalog
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 3: Surgical Stations Catalog", level=2)
    img_path = os.path.join(screenshots_dir, "03_stations_catalog.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 3.1: Surgical Stations Catalog with Procedural Difficulty Tiers")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Complete catalog of surgical simulation tasks categorized by clinical tier (Fundamental, Intermediate, Advanced). "
        "Trainees and educators can review PRM tolerances, required tools, and launch simulated exercises."
    )

    steps_screen3 = [
        ("Filter by Specialty/Difficulty", "Top filter pills (Fundamental, Intermediate, Advanced)", "Single Left-Click",
         "Filters station grid to matching procedural category", "Client-side array filter updating station view instantly"),
        ("Station Card - Enter Workspace", "Inside station card ('Enter Simulation Workspace' button)", "Single Left-Click",
         "Directly loads the selected station into the 60 FPS CV simulation canvas", "Transfers station ID to workspace and configures PRM thresholds"),
        ("Review PRM Specifications", "Inside station card ('View Reference PRM' link)", "Single Left-Click",
         "Opens Procedure Reference Model modal with submillimeter tolerances", "Fetches active PRM version from /api/v1/stations/:id")
    ]
    add_step_table(doc, steps_screen3)
    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Screen 4: Real-Time Suturing Workspace
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 4: Real-Time Suturing Workspace (Live CV Engine)", level=2)
    img_path = os.path.join(screenshots_dir, "04_realtime_workspace.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 4.1: Real-Time Suturing Workspace with Optical Calipers & Live AI Co-Pilot")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Core simulation cockpit. Renders live computer vision overlays at 60 FPS, including caliper bite markers, "
        "entry angle arcs, dynamic wound margins, needle trajectory tracking, and real-time Gemini AI Co-Pilot guidance."
    )

    steps_screen4 = [
        ("Input Feed Switcher", "Toolbar above video feed (Webcam, Clinical Video, Synthetic Sim)", "Click desired mode pill",
         "Switches video stream source instantly between live webcam, recorded surgery, or synthetic canvas", "Rebinds HTML5 video element or starts synthetic FSM loop"),
        ("Start / Pause Recording", "Top right action bar ('Start Recording' teal pill button)", "Single Left-Click",
         "Initiates session clock, begins recording CV telemetry data points, and changes button to 'Pause'", "Emits ATTEMPT_START audit event and buffers frames"),
        ("Inspect Live Frame Now", "Gemini 3.8 Flash Co-Pilot box (Right sidebar button with sparkles)", "Single Left-Click",
         "Captures current video frame, base64 encodes it, and sends to Gemini multimodal vision engine", "POST /api/v1/ai/analyze-video-frame returning clinical critique"),
        ("Complete & Evaluate Attempt", "Top right action bar (Appears when recording is active)", "Single Left-Click",
         "Finalizes attempt, calculates weighted composite score, and redirects to Attempt Performance Report", "POST /api/v1/attempts/:id/complete and loads report"),
        ("Scale Calibration", "Workspace toolbar ('Calibrate Scale' button)", "Click and drag on canvas",
         "Draws caliper line over reference scale bar on pad (e.g. 10mm grid)", "Recalculates scaleMmPerPx for millimeter tracking accuracy")
    ]
    add_step_table(doc, steps_screen4)
    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Screens 5 to 9: Attempt Performance Reports & Gemini Coach
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 5: Attempt Performance Report — Overview & Score Synthesis", level=2)
    img_path = os.path.join(screenshots_dir, "05_attempt_report_overview.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 5.1: Attempt Performance Report with Keyframe Scrubbing & Score Weights")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: In-depth debriefing view displaying verified scores, video keyframe scrubbers, "
        "faculty stamp cards, and objective scoring weights (45% OSATS Checklist, 40% Geometric Parameters, 15% Motion Economy)."
    )

    steps_screen5 = [
        ("Evidence Keyframe Buttons", "Below video player (Grid of 4 timestamped thumbnail keyframes)", "Click any thumbnail",
         "Jumps video seek position to that exact millimeter deviation instant", "Locks HUD to timestamp and displays pinned faculty annotation"),
        ("Slide Deck (.pptx) Download", "Header action bar (Dark pill button with download icon)", "Single Left-Click",
         "Instantly downloads 16:9 widescreen SurgiSkill presentation deck", "Downloads /SurgiSkill_AI_Presentation.pptx to user machine"),
        ("Print / PDF Export", "Header action bar (Teal pill button with file icon)", "Single Left-Click",
         "Opens browser print dialogue formatted for clean multi-page PDF generation", "Triggers window.print() with print-optimized CSS styles"),
        ("Analysis Tabs Selector", "Bottom card tab bar (Parameters, Checklist, Errors, Gemini Coach)", "Click tab title",
         "Switches lower detail table to display selected analytical dimension", "Renders corresponding data sub-view")
    ]
    add_step_table(doc, steps_screen5)
    doc.add_page_break()

    # Screen 6: Parameters Table
    doc.add_heading("Screen 6: Attempt Report — Expected vs. Observed Parameters", level=2)
    img_path = os.path.join(screenshots_dir, "06_attempt_report_parameters.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 6.1: Expected vs Observed Geometric Parameters Compliance Table")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Tabulates every geometric metric (Bite Width, Entry Angle, Inter-Stitch Pitch, Knot Configuration, Path Length) "
        "contrasting observed values against the Procedure Reference Model (PRM) ground truth with clinical rationale."
    )

    steps_screen6 = [
        ("Sort / Inspect Parameters", "Table rows (Bite Width, Entry Angle, Knot Security)", "Hover over row",
         "Highlights row and displays measurement method (e.g. Optical Caliper mm/px)", "Displays clinical significance tooltip regarding dermal eversion"),
        ("Jump to Flawed Timestamp", "Click on flagged deviation value in table", "Single Left-Click",
         "Synchronizes top video player to the exact second where deviation occurred", "Highlights keyframe and displays kinematic calipers")
    ]
    add_step_table(doc, steps_screen6)
    doc.add_page_break()

    # Screen 7: Checklist Tab
    doc.add_heading("Screen 7: Attempt Report — OSATS Step Checklist", level=2)
    img_path = os.path.join(screenshots_dir, "07_attempt_report_checklist.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 7.1: Objective Structured Assessment of Technical Skills (OSATS) Step Checklist")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Step-by-step checklist of standard procedural tasks (Needle Loading INS-01, Forceps Stabilization INS-02, "
        "Orthogonal Entry PEN-01, Symmetric Exit SYM-01, Square Knot KNT-01, Tail Trimming TRM-01) with AI confidence ratings."
    )

    steps_screen7 = [
        ("Inspect Step Rationale", "Each checklist card in list", "Click step card",
         "Reveals detailed AI rationale explaining why the step passed or failed", "Displays confidence percentage (e.g. 94% verified)")
    ]
    add_step_table(doc, steps_screen7)
    doc.add_page_break()

    # Screen 8: Identified Technical Deviations
    doc.add_heading("Screen 8: Attempt Report — Identified Technical Deviations", level=2)
    img_path = os.path.join(screenshots_dir, "08_attempt_report_deviations.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 8.1: Identified Technical Deviations with Targeted Surgical Remediation")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Focuses exclusively on technical flaws detected during the simulation (e.g., Acute Entry Angle on Stitch #2 at 71°), "
        "categorizing them by clinical severity (Minor, Moderate, Critical) and providing concrete deliberate remediation instructions."
    )

    steps_screen8 = [
        ("Review Remediation Box", "Inside deviation alert card (Emerald callout container)", "Read remediation guidelines",
         "Provides concrete biomechanical advice (e.g. pronate forearm prior to skin puncture)", "Links to PRM deliberate practice drill specifications")
    ]
    add_step_table(doc, steps_screen8)
    doc.add_page_break()

    # Screen 9: Gemini Clinical Coach
    doc.add_heading("Screen 9: Attempt Report — Gemini 3.8 Flash Clinical Coach", level=2)
    img_path = os.path.join(screenshots_dir, "09_attempt_report_gemini_coach.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 9.1: Gemini 3.8 Flash Multimodal Clinical Reasoning Coach Output")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Interactive AI mentorship dialogue grounded in the trainee's actual attempt kinematics. "
        "Synthesizes biological tissue consequences, biomechanical motor corrections, and 5-minute micro-drills."
    )

    steps_screen9 = [
        ("Pre-built Clinical Prompt Buttons", "Top prompt pill bar (e.g. 'Why does 71° entry cause dermal inversion?')", "Single Left-Click",
         "Populates query, triggers spinner, and loads Gemini surgical reasoning response", "POST /api/v1/attempts/:id/ai-explain with attempt telemetry"),
        ("Custom Question Input Box", "Bottom input text field", "Type query and press Enter / click 'Ask Coach'",
         "Submits bespoke trainee query to Gemini engine", "Returns structured 3-part pedagogical response")
    ]
    add_step_table(doc, steps_screen9)
    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Screen 10: Faculty Review Console
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 10: Faculty Review Console & Score Override Audit Trail", level=2)
    img_path = os.path.join(screenshots_dir, "10_faculty_review_console.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 10.1: Faculty Review Console with Score Override Slider & Mandatory Rationale")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Dedicated console for surgical educators (e.g. Prof. Sarah Jenkins). Allows attendings to inspect AI telemetry, "
        "adjust composite scores using an interactive slider, document mandatory clinical rationales, and drop video pin annotations."
    )

    steps_screen10 = [
        ("Faculty Score Slider", "Right side control panel ('Faculty Adjusted Score')", "Click and drag slider thumb",
         "Updates verified score display in real-time and highlights override status", "Compares value against AI baseline (e.g. 78.5% -> 82%)"),
        ("Mandatory Override Rationale", "Amber-bordered text area below slider", "Type clinical justification",
         "Fulfills mandatory governance requirement for score divergence", "Stores reason in immutable audit log upon submission"),
        ("OSATS Global Rating Buttons", "5-button rating selector (1: Novice to 5: Expert Master)", "Click rating number",
         "Sets overall standardized OSATS global competence grade", "Stores rating in attempt faculty review record"),
        ("Qualitative Formative Feedback", "Text area below OSATS rating", "Type personalized mentoring commentary",
         "Saves personal feedback shown to trainee in their performance report", "Transmitted to student notification center"),
        ("Attach Video Pin Annotation", "Bottom toolbar below video scrubber", "Type timestamp & comment, click Pin",
         "Places an interactive annotation marker on the video playback line", "Stores annotation in attempt.annotations array"),
        ("Confirm & Publish Review", "Top right action bar (Teal button with document check icon)", "Single Left-Click",
         "Submits verified review, logs audit record, and updates queue status", "POST /api/v1/faculty/reviews and alerts student")
    ]
    add_step_table(doc, steps_screen10)
    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Screen 11: Digital OSCE Examination
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 11: Standardized Digital OSCE Examination Module", level=2)
    img_path = os.path.join(screenshots_dir, "11_digital_osce_station.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 11.1: Digital OSCE Station with Synchronized 10-Minute Clock & Rating Form")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Formal Objective Structured Clinical Examination platform managing timed 10-minute station rotations, "
        "candidate task mandates, examiner scoring rubrics, and final examination score synchronization."
    )

    steps_screen11 = [
        ("Start / Pause Station Clock", "Top right station clock panel (Teal button)", "Single Left-Click",
         "Toggles 10:00 station countdown timer with warning colors at <2 mins", "Runs high-precision JavaScript interval timer"),
        ("Reset 10m Clock", "Below Start Clock button", "Single Left-Click",
         "Resets timer back to 10 minutes (600 seconds)", "Clears interval and resets remaining seconds"),
        ("Station Rotation Tabs", "Horizontal cards (Station 1: Interrupted, Station 2: Continuous, etc.)", "Click station tab",
         "Switches active evaluation station, objectives, and examiner assignment", "Updates activeStationIndex in component state"),
        ("OSATS Examiner Ratings (1-5)", "Right side rating form for each of 6 criteria", "Click rating button (1 to 5)",
         "Selects score for criteria (Respect for Tissue, Time/Motion, etc.)", "Updates osatsRatings state object"),
        ("Submit Station Score / Finalize", "Top right of OSATS form (Teal/Emerald button)", "Single Left-Click",
         "Advances to next station; on final station displays 'OSCE Completed' banner", "Synchronizes candidate exam record with residency registry")
    ]
    add_step_table(doc, steps_screen11)
    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Screen 12: Clinical Lead Analytics
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 12: Clinical Lead Curricular Analytics & PRMs", level=2)
    img_path = os.path.join(screenshots_dir, "12_clinical_lead_analytics.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 12.1: Clinical Lead Analytics with AI-Faculty Concordance Curves")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Institutional analytics for program directors and OSCE chairs (e.g. Dr. Marcus Vance). "
        "Displays AI-to-faculty concordance models (Pearson r = 0.89), PGY-1 vs PGY-2 progression curves, and PRM lock governance."
    )

    steps_screen12 = [
        ("Concordance Analytics Tab", "Sub-navigation tab bar", "Single Left-Click",
         "Renders Pearson correlation curve, Bland-Altman limits, and bias stats", "Fetches /api/v1/analytics dataset"),
        ("PRM Specifications & Approvals Tab", "Sub-navigation tab bar", "Single Left-Click",
         "Displays geometric tolerance matrix and formal sign-off button", "Loads PRM schema with version locking controls"),
        ("Formally Approve & Lock PRM", "Inside PRM specifications tab", "Single Left-Click",
         "Locks procedure reference model to version 2.0 with cryptographic signature", "PUT /api/v1/stations/:id/prm and logs audit entry")
    ]
    add_step_table(doc, steps_screen12)
    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Screens 13 to 17: Cohort, Devices, Diagnostics, Docs, Help
    # -------------------------------------------------------------------------
    doc.add_heading("Screen 13: Residency Cohort & User Rosters", level=2)
    img_path = os.path.join(screenshots_dir, "13_cohort_management.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 13.1: Residency Cohort & User Management Roster")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Academic roster governance managing residency classes (Class of 2026/2027), tracking readiness badges "
        "(Honors, On Track, Needs Remediation), station completion counts, and cohort performance averages."
    )

    steps_screen13 = [
        ("Select Active Cohort Card", "Left column cohort class list (PGY-2 Class of 2026)", "Click cohort card",
         "Updates right-hand table with trainee roster for that specific class", "Filters resident array by selected cohort ID"),
        ("Search Resident Table", "Top search input above table", "Type resident name (e.g. 'Alex')",
         "Filters resident table rows in real-time", "Client-side search on name and email fields")
    ]
    add_step_table(doc, steps_screen13)
    doc.add_page_break()

    # Screen 14: Device Hub
    doc.add_heading("Screen 14: Hardware Abstraction Layer & Device Integrations", level=2)
    img_path = os.path.join(screenshots_dir, "14_device_integrations.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 14.1: Multi-Modal Sensory & Hardware Abstraction Layer")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Diagnostics and calibration hub for connected surgical input devices: Overhead Training Webcams, "
        "Stryker 1688 Laparoscopic Towers, Intel RealSense Depth Sensors, ATI Nano17 6-axis loadcells, and Gemini AI endpoints."
    )

    steps_screen14 = [
        ("Ping & Verify Device Button", "Inside each hardware card ('Ping & Verify Device')", "Single Left-Click",
         "Triggers round-trip latency probe and updates latency badge (e.g. 14ms)", "POST /api/v1/integrations/:id/test verifying endpoint status")
    ]
    add_step_table(doc, steps_screen14)
    doc.add_page_break()

    # Screen 15: Admin Diagnostics & Audit Logs
    doc.add_heading("Screen 15: System Health & Immutable Audit Logs", level=2)
    img_path = os.path.join(screenshots_dir, "15_admin_diagnostics.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 15.1: System Pod Health & Immutable Audit Logs Trail")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Enterprise security and compliance monitoring verifying Express platform uptime (99.98%), "
        "PostgreSQL connection pools (12 active), background queues (11ms latency), and searchable cryptographic audit trails."
    )

    steps_screen15 = [
        ("Refresh Diagnostics Button", "Top right action bar", "Single Left-Click",
         "Refreshes system health telemetry and reloads audit logs", "GET /api/v1/health and GET /api/v1/audit-logs"),
        ("Audit Search Input", "Search input field above audit log table", "Type query (e.g. 'OVERRIDE')",
         "Filters log table to matching action types or user names", "Real-time client filtering over audit log entries")
    ]
    add_step_table(doc, steps_screen15)
    doc.add_page_break()

    # Screen 16: Documentation & Features Matrix
    doc.add_heading("Screen 16: Documentation & Active Features Matrix", level=2)
    img_path = os.path.join(screenshots_dir, "16_documentation_features.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 16.1: Documentation View with Active Features Matrix & Specs")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Built-in platform encyclopedia cataloging all 8 core feature modules, operational specifications, "
        "and direct links to test each capability live."
    )

    steps_screen16 = [
        ("Slide Deck (.pptx) Download", "Header action bar (Teal pill button)", "Single Left-Click",
         "Downloads full 16:9 presentation slide deck directly", "Initiates download of /SurgiSkill_AI_Presentation.pptx"),
        ("Test Live Workspace", "Header action bar (Bright teal button)", "Single Left-Click",
         "Jumps directly to Real-Time Workspace to test features live", "Navigates to workspace with active station"),
        ("Feature Filter / Tabs", "Pill buttons (Features, Concept, State Machine, PRM Specs)", "Click tab pill",
         "Switches view to display procedural state machine diagrams or PRM equations", "Updates activeTab in DocumentationView")
    ]
    add_step_table(doc, steps_screen16)
    doc.add_page_break()

    # Screen 17: Clinical Reference Standards Guide
    doc.add_heading("Screen 17: Clinical Reference Standards & Procedures Guide", level=2)
    img_path = os.path.join(screenshots_dir, "17_clinical_reference.png")
    if os.path.exists(img_path):
        doc.add_picture(img_path, width=Inches(6.3))
        p_cap = doc.add_paragraph("Figure 17.1: Clinical Reference Standards & Metric Definitions Guide")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].italic = True
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Screen Purpose: Pedagogical reference defining ACS/APDS objective metrics, mathematical formulas for instrument path length, "
        "and explicit declarations of sensory proxies versus direct physical transducers."
    )

    steps_screen17 = [
        ("Metric Reference Cards", "Cards for Bite Width, Orthogonal Entry, Spacing, Knot Security", "Read clinical criteria",
         "Displays expected ranges (e.g. 5.0-8.0mm entry bite) and clinical rationale", "Informs simulation practice standards")
    ]
    add_step_table(doc, steps_screen17)
    doc.add_page_break()

    # =========================================================================
    # SECTION 4: REST API DIRECTORY & DEPLOYMENT GUIDE
    # =========================================================================
    h1 = doc.add_heading("Section 4: Technical REST API Directory & Deployment Guide", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)

    doc.add_heading("REST API v1 Endpoint Directory", level=2)
    api_tbl = doc.add_table(rows=11, cols=4)
    api_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    api_headers = ["Endpoint", "Method", "Request Payload", "Clinical Response / Action"]
    api_rows = [
        ("/api/v1/health", "GET", "None", "Reports pod uptime, PostgreSQL pool, queue latency, and hardware matrix"),
        ("/api/v1/auth/me", "GET", "None", "Returns currently authenticated UserProfile (role, permissions, rank)"),
        ("/api/v1/auth/switch-role", "POST", "{ role: string }", "Switches active role and logs SESSION_ROLE_SWITCH audit entry"),
        ("/api/v1/stations", "GET", "None", "Lists all accredited surgical stations with current PRMs and rubrics"),
        ("/api/v1/stations/:id/prm", "PUT", "Partial<PRM>", "Updates PRM parameters and increments locked version number"),
        ("/api/v1/attempts", "GET / POST", "{ stationId?: string }", "Queries attempts history or initializes new recording attempt"),
        ("/api/v1/attempts/:id/complete", "POST", "{ durationSeconds, events, aiAssessment }", "Finalizes attempt, computes weighted score, alerts faculty"),
        ("/api/v1/attempts/:id/ai-explain", "POST", "{ userQuestion, parameterContext }", "Gemini 3.8 Flash biomechanics synthesis with PRM fallback"),
        ("/api/v1/ai/analyze-video-frame", "POST", "{ imageBase64, procedureName, rubricChecklist }", "Multimodal live frame analysis evaluating checklist steps"),
        ("/api/v1/faculty/reviews", "POST", "{ attemptId, verifiedScore, overrideReason }", "Submits faculty verification and logs mandatory rationale")
    ]
    for i, h in enumerate(api_headers):
        api_tbl.cell(0, i).width = Inches(1.6)
        set_cell_background(api_tbl.cell(0, i), "0F172A")
        set_cell_margins(api_tbl.cell(0, i), top=80, bottom=80, left=100, right=100)
        p = api_tbl.cell(0, i).paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, (ep, meth, req, res) in enumerate(api_rows, 1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate([ep, meth, req, res]):
            api_tbl.cell(r_idx, c_idx).width = Inches(1.6)
            set_cell_background(api_tbl.cell(r_idx, c_idx), bg)
            set_cell_margins(api_tbl.cell(r_idx, c_idx), top=60, bottom=60, left=100, right=100)
            p = api_tbl.cell(r_idx, c_idx).paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8)
            if c_idx == 1:
                r.bold = True
                r.font.color.rgb = RGBColor(13, 148, 136) if meth == "GET" else RGBColor(14, 165, 233)
            else:
                r.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    doc.add_heading("How to Run SurgiSkill AI Locally", level=2)
    doc.add_paragraph(
        "Prerequisites: Node.js (v20+ or v24+), npm (v10+ or v11+), and modern Google Chrome / Edge.\n\n"
        "1. Install Dependencies:\n"
        "   npm install\n\n"
        "2. Configure Environment (.env):\n"
        "   GEMINI_API_KEY=\"YOUR_API_KEY\"\n"
        "   APP_URL=\"http://localhost:3000\"\n\n"
        "3. Start Development Server:\n"
        "   npm run dev\n\n"
        "4. Access Application:\n"
        "   Open http://localhost:3000 in your web browser.\n\n"
        "5. Production Bundle Build:\n"
        "   npm run build\n"
        "   npm start"
    )

    # Save document
    doc.save(output_docx_path)
    print(f"[Document Builder] Successfully created document at: {output_docx_path}")
    return output_docx_path

if __name__ == "__main__":
    build_manual()
