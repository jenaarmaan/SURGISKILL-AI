import React, { useState } from 'react';
import {
  BookOpen,
  Activity,
  Layers,
  Video,
  Award,
  Stethoscope,
  BarChart3,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Terminal,
  Zap,
  Clock,
  Compass,
  FileText,
  Sliders,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Badge } from '../components/common/Badge.tsx';

interface DocumentationViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'concept' | 'features' | 'stateMachine' | 'prmSpecs' | 'architecture'>('features');
  const [featureSearch, setFeatureSearch] = useState('');

  const featuresList = [
    {
      id: 'workspace',
      title: 'Real-Time Suturing Workspace & Live CV Telemetry',
      category: 'TRAINING & PRACTICE',
      status: 'FULLY FUNCTIONAL',
      icon: Video,
      navTarget: 'workspace',
      summary: 'High-frequency (60 Hz) computer vision overlay tracking needle orientation, bite margins, incision boundary, and kinematic economy.',
      howItWorks: [
        'Multi-Input Video Pipeline: Seamlessly detects user webcams/UVC cameras via WebRTC (getUserMedia). If a camera is unavailable or in a headless environment, it automatically switches to a high-fidelity synthetic silicone dermal pad simulator.',
        'Dynamic Caliper Overlays: Measures entry and exit bite widths in millimeters using real-time scale calibration (0.124 mm/px).',
        'Orthogonal Entry Angle Arc: Continuously calculates needle shaft angle relative to tissue plane with real-time green/amber/red indicators for 90° ± 5°.',
        '13-Stage Procedural State Machine: Automatically recognizes surgical phases from initial workspace detection to final stitch completion.',
        'Sensory Modality Transparency: Explicitly tags depth and suture tension as "Visual Proxies" when monocular RGB cameras are used, preventing fabricated sensor claims.',
      ],
      howToTest: 'Navigate to "Real-Time Suturing Workspace", click "Start Recording", observe the real-time calipers and kinematics updating on the canvas, then click "Complete & Evaluate" to generate an assessment.',
    },
    {
      id: 'assessment',
      title: 'Deterministic Assessment Engine & Weighted Scoring',
      category: 'EVALUATION & SCORING',
      status: 'FULLY FUNCTIONAL',
      icon: Award,
      navTarget: 'attempts-list',
      summary: 'Multi-factor surgical assessment comparing observed CV kinematics against Procedure Reference Model (PRM) ground truth.',
      howItWorks: [
        'Composite Score Formula: Calculates score using clinical weighting: 45% OSATS Checklist fidelity + 40% Geometric Parameter adherence + 15% Kinematic Motion Economy.',
        'Parameter Compliance: Evaluates bite width (3.2–4.8 mm), entry angle (85°–95°), inter-stitch pitch (4.0–6.0 mm), and knot configuration (3 square throws).',
        'Kinematic Economy: Analyzes cumulative instrument path length (<65 cm) and motion smoothness metrics.',
        'Evidence Linking: Every recorded technical deviation links directly to video timestamped keyframes for verifiable inspection.',
      ],
      howToTest: 'Open any attempt in "Attempt Performance Reports", select the "Expected vs Observed Parameters" tab, and review the millimeter-accurate comparison against the PRM.',
    },
    {
      id: 'geminiCoach',
      title: 'Gemini 3.8 Flash Multimodal Surgical Reasoning Coach',
      category: 'AI & REASONING',
      status: 'FULLY FUNCTIONAL',
      icon: Sparkles,
      navTarget: 'attempt-detail',
      summary: 'Server-side Gemini 3.8 Flash integration delivering surgical biomechanics analysis and tailored deliberate practice drills.',
      howItWorks: [
        'Secure Server-Side Invocation: Calls the modern @google/genai SDK in server.ts without exposing API credentials to the client.',
        'Clinical Grounding: Feeds observed kinematic deviations (e.g., 71° entry angle on Stitch #2) and PRM tolerances into structured surgical prompts.',
        'Remediation Synthesis: Explains why tangential needle entries cause wound inversion and scar widening, and suggests targeted 5-minute micro-drills to fix wrist supination.',
        'Interactive Inquiries: Trainees can click pre-set clinical questions or type custom surgical inquiries.',
      ],
      howToTest: 'In "Attempt Performance Reports", open Dr. Alex Chen\'s attempt, select the "Gemini Clinical Reasoning Coach" tab, and click any pre-built prompt or submit a custom question.',
    },
    {
      id: 'facultyReview',
      title: 'Faculty Review Console & Score Override Audit Trail',
      category: 'GOVERNANCE & EVALUATION',
      status: 'FULLY FUNCTIONAL',
      icon: ShieldCheck,
      navTarget: 'faculty-dashboard',
      summary: 'Dual evaluation workflow allowing surgical faculty to verify AI assessments, adjust scores with mandatory clinical rationale, and drop video pins.',
      howItWorks: [
        'Side-by-Side Scoring: Compares AI raw composite scores against faculty assessments in real time.',
        'Mandatory Override Rationale: The system requires faculty to document a clinical justification before modifying any AI benchmark score.',
        'Standardized OSATS Rating: 5-point Global Rating Scale covering Respect for Tissue, Time and Motion, Instrument Handling, Knowledge of Instruments, and Flow of Operation.',
        'Timestamped Video Annotations: Faculty can pin specific feedback to exact time offsets on the procedural recording.',
      ],
      howToTest: 'Use the Role Selector in the top right to switch to "Faculty Reviewer", open the Faculty Review Console, adjust the score slider, type a mandatory rationale, and click "Confirm & Publish Review".',
    },
    {
      id: 'digitalOsce',
      title: 'Standardized Digital OSCE Examination Module',
      category: 'SIMULATION & TESTING',
      status: 'FULLY FUNCTIONAL',
      icon: Stethoscope,
      navTarget: 'osce',
      summary: 'Synchronous clinical examination platform with timed station rotations, candidate verification, and examiner scoring rubrics.',
      howItWorks: [
        '10-Minute Station Countdown Clock: Features synchronized timing with warning states and sound cues.',
        'Multi-Station Rotations: Supports four core stations: Simple Interrupted, Continuous Suture, Horizontal Mattress, and Laparoscopic Intracorporeal.',
        'Standardized Examiner HUD: Allows faculty to score OSATS criteria while candidate performance is monitored via live CV assessment.',
        'Cohort Progression: Automated cohort rotation triggers advance candidates through the exam rotation.',
      ],
      howToTest: 'Navigate to "Digital OSCE Examination", click "Start Clock" to test the 10-minute timer, rate the candidate on the OSATS criteria, and click "Submit Station Score" to advance.',
    },
    {
      id: 'clinicalLead',
      title: 'Clinical Lead & Curricular Competency Analytics',
      category: 'INSTITUTIONAL ANALYTICS',
      status: 'FULLY FUNCTIONAL',
      icon: BarChart3,
      navTarget: 'clinical-lead',
      summary: 'Statistical concordance modeling, AI-to-faculty variance analysis, and Procedure Reference Model (PRM) governance.',
      howItWorks: [
        'Statistical Agreement: Analyzes Pearson correlation (r = 0.89) and mean bias (+2.8 pts) between AI metrics and faculty reviews.',
        'Longitudinal Learning Curves: Visualizes month-over-month skill acquisition for PGY-1 vs PGY-2 residency cohorts using Recharts.',
        'Curricular Deviation Radar: Highlights high-frequency residency gaps (e.g., 38% acute entry angle deviation).',
        'PRM Formal Sign-Off: Clinical Leads can inspect submillimeter tolerances and formally sign off on PRM version locks.',
      ],
      howToTest: 'Switch role to "Clinical Lead & OSCE Chair", view the statistical correlation curves, switch to the "PRM Specifications & Approvals" tab, and click "Formally Approve & Lock PRM".',
    },
    {
      id: 'hardwareHub',
      title: 'Hardware Abstraction Layer (HAL) & Device Integrations',
      category: 'HARDWARE & CONNECTIVITY',
      status: 'FULLY FUNCTIONAL',
      icon: Cpu,
      navTarget: 'integrations',
      summary: 'Diagnostic hub with live latency heartbeat pings for surgical webcams, laparoscopic video streams, stereo depth cameras, and loadcells.',
      howItWorks: [
        'Protocol Verification: Monitored endpoints include WebRTC/UVC (webcam), RTSP/SDI (laparoscopic tower), USB3/V4L2 (Intel RealSense), RS-422 (ATI loadcell), and S3 medical video vault.',
        'Interactive Ping Tests: Trigger backend ping diagnostics that report live round-trip latency in milliseconds.',
        'Calibration Tracking: Stores optical scale factors (0.124 mm/px) and calibration dates for connected devices.',
      ],
      howToTest: 'Navigate to "Device & Hardware Hub" and click "Ping & Verify Device" on any card to test the device heartbeat and latency response.',
    },
    {
      id: 'adminDiagnostics',
      title: 'System Health, Pod Status & Immutable Audit Logs',
      category: 'SECURITY & AUDITING',
      status: 'FULLY FUNCTIONAL',
      icon: ShieldCheck,
      navTarget: 'diagnostics',
      summary: 'Enterprise audit trail recording score overrides, PRM revisions, and platform telemetry in an immutable log.',
      howItWorks: [
        'Cryptographic Event Logging: Every score change, PRM approval, and student attempt is timestamped and recorded with user role and entity IDs.',
        'Health Monitoring: Real-time status for the Node/Express core engine, PostgreSQL connection pool, and background queues.',
        'Search & Filter: Real-time search by user, action type, or entity ID.',
      ],
      howToTest: 'Navigate to "System Health & Audit Logs", use the search bar to query "OVERRIDE" or "Alex Chen", and inspect the audit record details.',
    },
  ];

  const filteredFeatures = featuresList.filter((f) => {
    return (
      f.title.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.summary.toLowerCase().includes(featureSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-xl">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-mono text-teal-300">
              <BookOpen className="h-3.5 w-3.5" />
              <span>PLATFORM SPECIFICATION & HOW-TO GUIDE</span>
              <span>&bull;</span>
              <span>VERSION 2026.1</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white tracking-tight sm:text-3xl">
              SurgiSkill AI &mdash; System Documentation & Concept
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-3xl leading-relaxed">
              Complete architectural blueprint, clinical reasoning principles, procedure reference models, and detailed operating instructions for all functional platform capabilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('workspace', 'stn_interrupted_suture')}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition"
            >
              <Video className="h-4 w-4" />
              <span>Test Live Workspace</span>
            </button>
            <button
              onClick={() => onNavigate('public-home')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-teal-400" />
              <span>Public Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'features'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Active Features Matrix ({featuresList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('concept')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'concept'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Core Concept & Clinical Philosophy</span>
        </button>

        <button
          onClick={() => setActiveTab('stateMachine')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'stateMachine'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>13-Stage Procedural State Machine</span>
        </button>

        <button
          onClick={() => setActiveTab('prmSpecs')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'prmSpecs'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>PRM Specifications & Tolerances</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'architecture'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>System Architecture & API</span>
        </button>
      </div>

      {/* Tab 1: Active Features Matrix */}
      {activeTab === 'features' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Functional Feature Capabilities & Operating Guide
              </h2>
              <p className="text-xs text-slate-400">
                Detailed instructions for every operating module, what it does, and how to verify it.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                placeholder="Search features (e.g. CV, Gemini, OSCE)..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-5">
            {filteredFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4 transition hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-2.5 text-teal-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-teal-400 font-bold uppercase">
                            {feat.category}
                          </span>
                          <span className="text-slate-600">&bull;</span>
                          <Badge status="VERIFIED" size="sm">
                            {feat.status}
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">{feat.title}</h3>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate(feat.navTarget)}
                      className="flex items-center gap-1.5 rounded-lg bg-teal-500/15 border border-teal-500/30 px-3 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-slate-950 transition shrink-0"
                    >
                      <span>Try Feature Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{feat.summary}</p>

                  <div className="grid gap-4 md:grid-cols-2 text-xs">
                    {/* How It Operates */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-teal-300 font-bold text-xs uppercase tracking-wide">
                        <Terminal className="h-3.5 w-3.5 text-teal-400" />
                        <span>Under the Hood / How It Works</span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                        {feat.howItWorks.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-teal-400 font-mono text-[10px] shrink-0 mt-0.5">&bull;</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* How to Test in the App */}
                    <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs uppercase tracking-wide">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>How To Test & Verify In App</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed italic">
                        "{feat.howToTest}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Concept & Clinical Philosophy */}
      {activeTab === 'concept' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              The SurgiSkill AI Vision: Why Objective Surgical Intelligence Matters
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Surgical residency education has historically relied on apprenticeship observation: faculty surgeons watch trainees in real time and deliver subjective ratings. In the modern operating theater, duty-hour restrictions (ACGME 80-hour work week), intense caseload pressures, and patient safety imperatives drastically limit opportunities for unstructured trial-and-error learning.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>SurgiSkill AI</strong> bridges this educational gap by converting surgical task execution into objective, continuous, evidence-linked clinical intelligence. Using computer vision, kinematic tracking, Procedure Reference Models (PRMs), and multimodal reasoning, the platform empowers surgical trainees to engage in deliberate practice with immediate formative feedback while providing faculty with high-stakes digital OSCE assessment tooling.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Dual-Paradigm Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The platform is engineered to simultaneously support both <strong>A. Formative Deliberate Training</strong> (real-time live visual guidance, angle guidance, immediate error alerts) and <strong>B. Summative High-Stakes Digital OSCEs</strong> (strict 10-minute rotations, standardized OSATS rubrics, faculty verification).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Procedure Reference Models (PRM)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rather than treating AI as an opaque black box, all evaluations are grounded in clinically curated PRMs created and locked by surgical educators (ACS/APDS guidelines). Every millimeter of bite margin, every degree of needle entry, and every throw is explicitly measured against the model.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Sensory Modality Transparency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adhering to medical simulation ethics, SurgiSkill AI never claims physical measurements it does not possess. Monocular 2D webcams produce validated <em>visual proxies</em> (apposition and 2D geometry); metric depth and tensile force in Newtons are only recorded when calibrated stereo depth or loadcells are connected.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Clinical Significance of Suturing Mechanics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="font-mono text-teal-400 font-bold text-[10px] block">ORTHOGONAL ENTRY (90°)</span>
                <p className="text-slate-300 font-medium">Anatomical Edge Eversion</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Entering perpendicularly forces deep dermal tissue outward, causing wound edges to evert on knot cinching and resulting in flat, minimal scarring.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="font-mono text-teal-400 font-bold text-[10px] block">BITE WIDTH (4.0 mm)</span>
                <p className="text-slate-300 font-medium">Microvascular Perfusion</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Bites &lt;3.0 mm tear under edema tension; bites &gt;5.0 mm strangle capillary microcirculation, leading to edge necrosis and wound breakdown.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="font-mono text-teal-400 font-bold text-[10px] block">EQUAL PITCH (5.0 mm)</span>
                <p className="text-slate-300 font-medium">Uniform Stress Distribution</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Irregular spacing creates focal high-tension stress risers where sutures pull through skin, predisposing to postoperative wound dehiscence.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <span className="font-mono text-teal-400 font-bold text-[10px] block">SQUARE KNOTS (2:1:1)</span>
                <p className="text-slate-300 font-medium">Knot Security & Non-Slip</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Granny knots or uneven throws slip under tension. 3 square throws with alternating directions provide 100% mechanical security.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 13-Stage Procedural State Machine */}
      {activeTab === 'stateMachine' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              13-Stage Finite State Machine (FSM)
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              SurgiSkill AI processes live visual data through a deterministic 13-stage procedural finite state machine. Each state transition enforces clinical prerequisite checks before advancing, ensuring comprehensive procedural integrity.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { num: '01', state: 'WORKSPACE_DETECTED', desc: 'Validates surgical field boundary, optical illumination, and reference grid scale (0.124 mm/px).' },
              { num: '02', state: 'WOUND_DETECTED', desc: 'Extracts linear incision vector, margins, and lateral wound edges via contour segmentation.' },
              { num: '03', state: 'NEEDLE_ACQUIRED', desc: 'Detects needle driver jaw grasp at recommended 67% distance from needle tip.' },
              { num: '04', state: 'NEEDLE_ORIENTED', desc: 'Verifies needle tip perpendicularity (85°–95°) relative to tissue plane prior to contact.' },
              { num: '05', state: 'APPROACHING_WOUND', desc: 'Tracks tool trajectory and stabilization towards the designated entry target zone.' },
              { num: '06', state: 'ENTRY_DETECTED', desc: 'Identifies epidermal puncture, measuring exact entry bite margin (target 4.0 mm ± 0.8 mm).' },
              { num: '07', state: 'NEEDLE_DRIVE', desc: 'Monitors wrist supination and rotational needle curve driving without lateral tearing.' },
              { num: '08', state: 'EXIT_DETECTED', desc: 'Tracks needle emergence on contralateral wound edge, verifying bilateral symmetry.' },
              { num: '09', state: 'THREAD_PULL', desc: 'Measures thread draw-through, reserving a 2–3 cm suture tail for knotting.' },
              { num: '10', state: 'LOOP_FORMATION', desc: 'Observes instrument loop wrapping around needle driver jaws (double-wrap surgeon\'s throw).' },
              { num: '11', state: 'KNOT_OR_THROW', desc: 'Tracks horizontal tensioning, throw squareness, and secure knot cinching across tissue.' },
              { num: '12', state: 'STITCH_COMPLETED', desc: 'Verifies knot stabilization, edge eversion, and scissor tail cut length (3–4 mm).' },
              { num: '13', state: 'PROCEDURE_COMPLETED', desc: 'Calculates cumulative path length, pitch uniformity, and triggers assessment calculation.' },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-1.5 transition hover:border-teal-500/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-400">STAGE {step.num}</span>
                  <Badge size="sm" status="INFO">FSM STAGE</Badge>
                </div>
                <h4 className="text-xs font-bold text-white font-mono">{step.state}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: PRM Specifications & Tolerances */}
      {activeTab === 'prmSpecs' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Procedure Reference Model (PRM) Catalog
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every surgical station is linked to a version-controlled Procedure Reference Model (PRM) signed off by clinical faculty chairs. Below are the clinical target ranges and tolerances enforced by the platform:
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 font-medium">METRIC PARAMETER</th>
                  <th className="pb-3 font-medium">TARGET VALUE</th>
                  <th className="pb-3 font-medium">PERMITTED TOLERANCE</th>
                  <th className="pb-3 font-medium">CRITICAL FAILURE THRESHOLD</th>
                  <th className="pb-3 font-medium">MEASUREMENT METHOD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 font-semibold text-white">Entry Bite Width</td>
                  <td className="py-3 font-mono text-teal-300">4.0 mm</td>
                  <td className="py-3 font-mono text-slate-300">3.2 – 4.8 mm</td>
                  <td className="py-3 font-mono text-rose-400">&lt; 2.5 mm or &gt; 6.0 mm</td>
                  <td className="py-3 text-slate-400">Optical Caliper (0.124 mm/px)</td>
                </tr>
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 font-semibold text-white">Bilateral Symmetry</td>
                  <td className="py-3 font-mono text-teal-300">1.0 ratio</td>
                  <td className="py-3 font-mono text-slate-300">0.85 – 1.15 ratio</td>
                  <td className="py-3 font-mono text-rose-400">&gt; 1.4 ratio (asymmetric)</td>
                  <td className="py-3 text-slate-400">Contralateral Margin Delta</td>
                </tr>
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 font-semibold text-white">Needle Entry Angle</td>
                  <td className="py-3 font-mono text-teal-300">90.0°</td>
                  <td className="py-3 font-mono text-slate-300">85° – 95°</td>
                  <td className="py-3 font-mono text-rose-400">&lt; 75° (causes inversion)</td>
                  <td className="py-3 text-slate-400">Pose Vector vs Surface Normal</td>
                </tr>
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 font-semibold text-white">Inter-Stitch Pitch</td>
                  <td className="py-3 font-mono text-teal-300">5.0 mm</td>
                  <td className="py-3 font-mono text-slate-300">4.0 – 6.0 mm</td>
                  <td className="py-3 font-mono text-rose-400">&lt; 3.0 mm or &gt; 7.5 mm</td>
                  <td className="py-3 text-slate-400">Linear Longitudinal Distance</td>
                </tr>
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 font-semibold text-white">Instrument Path Length</td>
                  <td className="py-3 font-mono text-teal-300">&lt; 65.0 cm</td>
                  <td className="py-3 font-mono text-slate-300">35 – 85 cm</td>
                  <td className="py-3 font-mono text-rose-400">&gt; 110 cm (hesitant movement)</td>
                  <td className="py-3 text-slate-400">Kinematic 3D Trajectory Sum</td>
                </tr>
                <tr className="hover:bg-slate-850/50">
                  <td className="py-3 font-semibold text-white">Knot Configuration</td>
                  <td className="py-3 font-mono text-teal-300">3 square throws</td>
                  <td className="py-3 font-mono text-slate-300">Surgeon\'s 2:1:1 or 1:1:1</td>
                  <td className="py-3 font-mono text-rose-400">&lt; 2 throws or granny slip</td>
                  <td className="py-3 text-slate-400">FSM Loop & Direction Track</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: System Architecture & API */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-3">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Full-Stack Application Architecture
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              SurgiSkill AI is designed as a modular, full-stack application integrating high-frequency client-side rendering with robust server-side processing and AI model orchestration.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Frontend Architecture */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <Code2 className="h-4 w-4" />
                <span>Frontend Layer (React 19 + TypeScript + Vite)</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-white">CvCanvasOverlay:</strong> 60 FPS HTML5 Canvas component that renders live wound contours, caliper measurement brackets, and 90° entry angle guidance arcs directly on top of the video feed.
                </li>
                <li>
                  <strong className="text-white">ComputerVisionEngine:</strong> Client-side kinematic engine executing the 13-stage state machine and calculating live submillimeter distances.
                </li>
                <li>
                  <strong className="text-white">Role-Based Access Control (RBAC):</strong> AuthContext supporting 5 distinct roles with dynamic permission gates for trainees, faculty reviewers, clinical leads, and admins.
                </li>
                <li>
                  <strong className="text-white">Recharts Data Visualizations:</strong> Radar competency profiles, longitudinal learning curves, and statistical concordance distributions.
                </li>
              </ul>
            </div>

            {/* Backend Architecture */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Terminal className="h-4 w-4" />
                <span>Backend Layer (Express + Prisma + Gemini SDK)</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-white">server.ts REST API:</strong> Express server providing authenticated v1 endpoints for stations, attempt lifecycles, faculty overrides, device pings, and analytics.
                </li>
                <li>
                  <strong className="text-white">Gemini 3.8 Flash Integration:</strong> Uses the modern @google/genai TypeScript SDK to perform multimodal reasoning over kinematics and clinical PRM ground truth.
                </li>
                <li>
                  <strong className="text-white">Prisma Schema:</strong> Relational schema with 10 entities modeling users, cohorts, stations, PRMs, rubrics, attempts, evidence keyframes, and score overrides.
                </li>
                <li>
                  <strong className="text-white">Immutable Audit Trail:</strong> Logs every administrative action, score override, and PRM revision with cryptographic audit records.
                </li>
              </ul>
            </div>
          </div>

          {/* REST API Endpoints Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Core REST API Endpoints (/api/v1/*)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2 font-medium">METHOD</th>
                    <th className="pb-2 font-medium">ROUTE</th>
                    <th className="pb-2 font-medium">DESCRIPTION</th>
                    <th className="pb-2 font-medium">AUTH ROLE REQUIRED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 text-teal-400 font-bold">GET</td>
                    <td className="py-2.5 text-white">/api/v1/stations</td>
                    <td className="py-2.5 text-slate-400 font-sans">List all surgical stations with current PRMs and rubrics</td>
                    <td className="py-2.5 text-slate-300">Any Authenticated</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-emerald-400 font-bold">POST</td>
                    <td className="py-2.5 text-white">/api/v1/attempts</td>
                    <td className="py-2.5 text-slate-400 font-sans">Initialize a new surgical suturing recording session</td>
                    <td className="py-2.5 text-slate-300">Trainee / Resident</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-emerald-400 font-bold">POST</td>
                    <td className="py-2.5 text-white">/api/v1/attempts/:id/complete</td>
                    <td className="py-2.5 text-slate-400 font-sans">Submit recorded CV frames and trigger assessment engine</td>
                    <td className="py-2.5 text-slate-300">Trainee / Resident</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-indigo-400 font-bold">POST</td>
                    <td className="py-2.5 text-white">/api/v1/attempts/:id/ai-explain</td>
                    <td className="py-2.5 text-slate-400 font-sans">Server-side Gemini 3.8 Flash surgical reasoning evaluation</td>
                    <td className="py-2.5 text-slate-300">Trainee / Faculty</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-emerald-400 font-bold">POST</td>
                    <td className="py-2.5 text-white">/api/v1/faculty/reviews</td>
                    <td className="py-2.5 text-slate-400 font-sans">Submit verified faculty score, override rationale, and video pins</td>
                    <td className="py-2.5 text-slate-300">Faculty / Clinical Lead</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-amber-400 font-bold">PUT</td>
                    <td className="py-2.5 text-white">/api/v1/stations/:id/prm</td>
                    <td className="py-2.5 text-slate-400 font-sans">Update, formally approve, and lock PRM version tolerances</td>
                    <td className="py-2.5 text-slate-300">Clinical Lead Only</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-emerald-400 font-bold">POST</td>
                    <td className="py-2.5 text-white">/api/v1/integrations/:id/test</td>
                    <td className="py-2.5 text-slate-400 font-sans">Trigger latency heartbeat ping for connected hardware device</td>
                    <td className="py-2.5 text-slate-300">Admin / Faculty</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
