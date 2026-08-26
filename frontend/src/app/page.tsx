"use client";

import Link from "next/link";
import { 
  Activity, 
  Award, 
  Video, 
  ChevronRight, 
  Play, 
  Eye, 
  ClipboardCheck, 
  ShieldCheck, 
  Check, 
  Info, 
  FileText, 
  Clock, 
  AlertTriangle 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f19]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                SurgiSkill <span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-mono tracking-widest uppercase">OSCE Grade</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-semibold">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#pipeline" className="hover:text-white transition-colors">How It Works</a>
            <a href="#kinematics" className="hover:text-white transition-colors">Computer Vision</a>
            <a href="#validation" className="hover:text-white transition-colors">Designed for Validation</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <button className="text-sm font-semibold text-slate-400 hover:text-white transition-colors px-4 py-2">
                Sign In
              </button>
            </Link>
            <Link href="/auth">
              <button className="btn-primary flex items-center gap-2 text-sm">
                Get Started <ChevronRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-slate-900">
        {/* Background glow grids */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-[128px]" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[128px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column: Text */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Activity size={12} className="animate-pulse" /> AI-Powered Digital OSCE Surgical Assessment
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
              Objective Surgical Skill Assessment with <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Computer Vision</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed">
              SurgiSkill AI translates raw residency videos into normalized spatial landmarks and kinematics features, providing transparent, evidence-based assessment and grading.
            </p>

            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <Link href="/auth">
                <button className="btn-primary px-6 py-3 text-sm shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 w-full sm:w-auto">
                  Start an Assessment
                </button>
              </Link>
              <a href="#platform" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3 text-sm font-semibold border border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-950/40 text-slate-300 rounded-lg transition-colors">
                  Explore the Platform
                </button>
              </a>
            </div>
          </div>

          {/* Right Column: Surgical Workspace Mock */}
          <div className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl p-6 flex flex-col justify-between overflow-hidden group">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b1a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b1a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            {/* Camera feed indicator */}
            <div className="flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-2 bg-red-950/70 border border-red-500/30 px-3 py-1 rounded-full text-red-400 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> LIVE CV TRACKING
              </div>
              <span className="text-[10px] font-mono text-slate-500">60 FPS · LATENCY: 8ms</span>
            </div>

            {/* Simulated Workspace graphics */}
            <div className="flex-grow flex items-center justify-center relative my-4">
              {/* Suture Pad outline */}
              <div className="w-48 h-24 rounded-lg border border-indigo-500/30 bg-indigo-950/10 flex items-center justify-center relative">
                <span className="text-[9px] font-mono text-indigo-500/60 uppercase">Working Pad Boundary</span>
                
                {/* Tracked Trajectory Line (Left Hand) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 192 96">
                  <path d="M 30,50 Q 70,20 110,70 T 160,30" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" />
                  {/* Tracked point */}
                  <circle cx="160" cy="30" r="3.5" fill="#10b981" />
                </svg>
              </div>

              {/* Forceps tracker overlay */}
              <div className="absolute top-1/4 right-1/3 p-2 rounded bg-slate-900/90 border border-purple-500/50 text-[9px] font-mono flex flex-col gap-0.5">
                <span className="text-purple-400 font-bold">● RIGHT HAND (NEEDLE DRIVER)</span>
                <span className="text-slate-400">X: 0.58  Y: 0.49</span>
                <span className="text-slate-400">V: 0.12 units/s</span>
              </div>

              {/* Left Hand tracker overlay */}
              <div className="absolute bottom-1/4 left-1/4 p-2 rounded bg-slate-900/90 border border-emerald-500/50 text-[9px] font-mono flex flex-col gap-0.5">
                <span className="text-emerald-400 font-bold">● LEFT HAND (FORCEPS)</span>
                <span className="text-slate-400">X: 0.42  Y: 0.51</span>
              </div>
            </div>

            {/* Quality overlays */}
            <div className="flex justify-between items-center z-10 relative border-t border-slate-900 pt-3">
              <span className="text-[10px] text-slate-500">Tracking: Hands & Needle Driver</span>
              <div className="flex gap-4 text-[10px] text-slate-400 font-semibold">
                <span className="text-emerald-400">✓ LIGHTING OK</span>
                <span className="text-emerald-400">✓ NO BLUR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIPELINE SECTION */}
      <section id="pipeline" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs text-indigo-400 uppercase tracking-widest font-mono font-bold mb-3">Assessment Workflow</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">How SurgiSkill AI Operates</p>
          <p className="text-slate-400 text-sm mt-3">From raw camera streams to a validated clinical assessment score.</p>
        </div>

        {/* 4-Step grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="premium-card p-6 flex flex-col gap-4 relative">
            <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-wider">STEP 01</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Video size={18} />
            </div>
            <h3 className="font-bold text-base text-white">Capture Attempt</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Guided camera framing bounds verify workspace illumination, pad positioning, and hand visibility.
            </p>
          </div>

          {/* Step 2 */}
          <div className="premium-card p-6 flex flex-col gap-4 relative">
            <span className="text-[10px] font-mono text-purple-400 font-bold tracking-wider">STEP 02</span>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Eye size={18} />
            </div>
            <h3 className="font-bold text-base text-white">Computer Vision</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Tracks coordinates and movement velocity profiles of hands and instruments in the background.
            </p>
          </div>

          {/* Step 3 */}
          <div className="premium-card p-6 flex flex-col gap-4 relative">
            <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">STEP 03</span>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity size={18} />
            </div>
            <h3 className="font-bold text-base text-white">Kinematic Profiling</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Computes total path length, average speed, directional changes, pause frequency, and efficiency indexes.
            </p>
          </div>

          {/* Step 4 */}
          <div className="premium-card p-6 flex flex-col gap-4 relative">
            <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider">STEP 04</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award size={18} />
            </div>
            <h3 className="font-bold text-base text-white">Clinical Review</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Scores are cross-referenced with version-controlled rubrics, providing review timelines for faculty.
            </p>
          </div>
        </div>
      </section>

      {/* PLATFORM PREVIEW SECTION */}
      <section id="platform" className="py-20 bg-slate-950/20 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Description */}
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <h2 className="text-xs text-indigo-400 uppercase tracking-widest font-mono font-bold mb-3">Platform Preview</h2>
            <p className="text-3xl font-extrabold text-white">Comprehensive Resident Dashboard</p>
            <p className="text-slate-400 text-xs leading-relaxed mt-4">
              Our assessment dashboard provides students and faculty with unified visualization of scores, timeline checklists, spatial charts, and examiner logs.
            </p>
            <span className="text-[10px] text-slate-500 italic mt-6 block">• Visual representation demonstrating platform layout.</span>
          </div>

          {/* Dashboard Preview Widget */}
          <div className="lg:col-span-8 w-full p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <div>
                <span className="text-[10px] text-slate-500 block">Suturing Attempt ID: #82a941b</span>
                <span className="font-bold text-sm text-white">Interrupted Suture Assessment</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold">
                COMPLETED
              </span>
            </div>

            {/* Score grids */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Composite Score</span>
                <span className="text-2xl font-black text-white block mt-1">88<span className="text-xs text-slate-500 font-normal">/100</span></span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Checklist Score</span>
                <span className="text-2xl font-black text-indigo-400 block mt-1">92%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Motion Score</span>
                <span className="text-2xl font-black text-purple-400 block mt-1">84%</span>
              </div>
            </div>

            {/* Steps & Annotations breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Steps list */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 flex flex-col gap-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Checklist Checklist</span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={12} /> Correct needle load angle</div>
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={12} /> 90-degree penetration path</div>
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={12} /> Equal wound edge margins</div>
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={12} /> Square knot configuration</div>
                </div>
              </div>

              {/* Warnings logs */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 flex flex-col gap-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Detected Timeline Events</span>
                <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                  <div className="flex gap-2 items-center text-amber-400"><AlertTriangle size={12} /> Needle slip event (at 12.4s)</div>
                  <div className="flex gap-2 items-center"><Info size={12} /> Instrument regrip (at 18.1s)</div>
                  <div className="flex gap-2 items-center"><Info size={12} /> Suture sequence completed (24.8s)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPUTER VISION METRICS SECTION */}
      <section id="kinematics" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Metric Details Panel */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs text-indigo-400 uppercase tracking-widest font-mono font-bold">Kinematic Profiler</h2>
            <h3 className="text-3xl font-extrabold text-white">Spatial Trajectory Analysis</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              SurgiSkill's tracking module quantifies hand trajectories and needle placement intervals, resolving raw video into measurable kinematic properties.
            </p>

            <div className="flex flex-col gap-2 mt-4 text-xs">
              <div className="flex justify-between border-b border-slate-900 py-2">
                <span className="text-slate-400">Total Path Length (Left / Right)</span>
                <span className="font-bold text-white">0.42 / 1.56 units</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 py-2">
                <span className="text-slate-400">Average Velocity (Right Hand)</span>
                <span className="font-bold text-white">0.056 units/s</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 py-2">
                <span className="text-slate-400">Calculated Movement Smoothness</span>
                <span className="font-bold text-white">Standard Dev: 0.124</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 py-2">
                <span className="text-slate-400">Wound Spacing Compliance</span>
                <span className="font-bold text-white">96% Accuracy</span>
              </div>
            </div>
          </div>

          {/* SVG Diagram Widget representing tool paths */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-4">
            <span className="text-[10px] text-slate-500 font-mono">Mock Tracking Graph overlay</span>
            <div className="w-full aspect-video rounded-xl bg-slate-900/40 relative flex items-center justify-center border border-slate-850">
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 200">
                <path d="M 40,160 Q 120,40 200,120 T 360,60" fill="none" stroke="#6366f1" strokeWidth="2.5" />
                <path d="M 40,160 L 360,60" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="6 4" />
                
                {/* Track points */}
                <circle cx="40" cy="160" r="5" fill="#a855f7" />
                <circle cx="200" cy="120" r="5" fill="#a855f7" />
                <circle cx="360" cy="60" r="5" fill="#a855f7" />

                {/* Text tags */}
                <text x="50" y="170" fill="#64748b" fontSize="9">Start point</text>
                <text x="210" y="130" fill="#64748b" fontSize="9">Incision entry</text>
                <text x="310" y="50" fill="#64748b" fontSize="9">Wound exit</text>
              </svg>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Solid: Real hand trajectory path</span>
              <span>Dashed: Linear displacement vector</span>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGNED FOR CLINICAL VALIDATION */}
      <section id="validation" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-[#0d1220] to-[#0b0f19] border border-indigo-500/20 text-center flex flex-col items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
          
          <h2 className="text-xs text-indigo-400 uppercase tracking-widest font-mono font-bold">Integrity Framework</h2>
          <p className="text-3xl font-extrabold text-white max-w-2xl leading-snug">Designed for Clinical Validation</p>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            SurgiSkill AI combines computer-vision tracking metrics with custom expert-vetted scoring rubrics. The platform prioritizes examiner logging, transparent scoring evidence, and human-in-the-loop audit trails.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left mt-6">
            <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-900">
              <span className="text-[10px] text-indigo-400 block font-mono uppercase mb-2">Audit Trails</span>
              <p className="text-xs text-slate-400">All student assessment data, score updates, and system parameters are logged in an immutable database audit log.</p>
            </div>
            <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-900">
              <span className="text-[10px] text-indigo-400 block font-mono uppercase mb-2">Examiner Control</span>
              <p className="text-xs text-slate-400">Faculty examiners retain final authority over score overrides, appending reason annotations directly to the student record.</p>
            </div>
            <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-900">
              <span className="text-[10px] text-indigo-400 block font-mono uppercase mb-2">Versioned Rubrics</span>
              <p className="text-xs text-slate-400">Rubrics cannot be overwritten mid-cohort. Modifications generate a version increment to maintain scoring consistency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white" size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">SurgiSkill AI</span>
          </div>

          <div className="flex flex-wrap gap-8 text-xs text-slate-500">
            <a href="#platform" className="hover:text-slate-300">Platform</a>
            <a href="#pipeline" className="hover:text-slate-300">How It Works</a>
            <a href="#kinematics" className="hover:text-slate-300">Clinical Validation</a>
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>

          <span className="text-xs text-slate-600">
            © {new Date().getFullYear()} SurgiSkill AI Inc. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
