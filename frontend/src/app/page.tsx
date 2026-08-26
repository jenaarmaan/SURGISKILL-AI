"use client";

import Link from "next/link";
import { 
  Activity, 
  Award, 
  Video, 
  ChevronRight, 
  Eye, 
  ShieldCheck, 
  Check, 
  Info, 
  AlertTriangle 
} from "lucide-react";

// Reusable Container component based on Google design layout principles
function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-7xl mx-auto px-6 md:px-8 w-full ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#040711] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#040711]/80 border-b border-[#1d2433]/60">
        <Container className="h-16 flex justify-between items-center">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">
                SurgiSkill <span className="text-cyan-400 font-semibold">AI</span>
              </span>
              <span className="text-[9px] text-slate-500 block -mt-1 font-mono tracking-widest uppercase">Clinical OSCE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <a href="#platform" className="hover:text-white transition-colors duration-150">Platform</a>
            <a href="#pipeline" className="hover:text-white transition-colors duration-150">Workflow</a>
            <a href="#kinematics" className="hover:text-white transition-colors duration-150">Telemetry</a>
            <a href="#validation" className="hover:text-white transition-colors duration-150">Validation</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <button className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors px-3 py-2">
                Sign In
              </button>
            </Link>
            <Link href="/auth">
              <button className="bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-[#040711] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-lg shadow-cyan-500/10 transition-all flex items-center gap-1.5">
                Get Started <ChevronRight size={14} />
              </button>
            </Link>
          </div>
        </Container>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-28 border-b border-[#1d2433]/30">
        {/* Subtle radial ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-10">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500 rounded-full filter blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-500 rounded-full filter blur-[120px]" />
        </div>

        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left Column: Text */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#121826] border border-[#1d2433] text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-6">
              <Activity size={10} className="animate-pulse" /> AI-Powered Digital OSCE Assessment
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
              Objective Surgical Skill Assessment with <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Computer Vision</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 mb-8 leading-relaxed max-w-xl">
              SurgiSkill AI translates raw residency videos into normalized spatial landmarks and kinematics features, providing transparent, evidence-based assessment and grading workflows.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/auth" className="w-full sm:w-auto">
                <button className="bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-[#040711] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all w-full sm:w-auto">
                  Start an Assessment
                </button>
              </Link>
              <a href="#platform" className="w-full sm:w-auto">
                <button className="px-6 py-3.5 text-xs uppercase tracking-wider font-bold border border-[#1d2433] bg-[#121826]/30 hover:bg-[#121826]/80 text-slate-300 rounded-lg transition-colors w-full sm:w-auto">
                  Explore the Platform
                </button>
              </a>
            </div>
          </div>

          {/* Right Column: Surgical Workspace Mock */}
          <div className="relative w-full aspect-video rounded-xl bg-[#121826] border border-[#1d2433] shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            
            {/* Camera feed indicator */}
            <div className="flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/20 px-3 py-1 rounded-md text-red-400 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> LIVE CV TRACKING
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Latency: 8ms · 60 FPS</span>
            </div>

            {/* Simulated Workspace graphics */}
            <div className="flex-grow flex items-center justify-center relative my-4">
              {/* Suture Pad outline */}
              <div className="w-56 h-28 rounded-lg border border-[#1d2433] bg-[#040711]/60 flex items-center justify-center relative shadow-inner">
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Working Area Boundary</span>
                
                {/* Tracked Trajectory Line (Left Hand) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 224 112">
                  <path d="M 30,60 Q 90,20 130,80 T 190,40" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
                  <circle cx="190" cy="40" r="3.5" fill="#10b981" />
                </svg>
              </div>

              {/* Forceps tracker overlay */}
              <div className="absolute top-1/4 right-8 p-2 rounded-lg bg-[#040711]/90 border border-cyan-500/30 text-[9px] font-mono flex flex-col gap-0.5 shadow-lg">
                <span className="text-cyan-400 font-bold uppercase tracking-wider">● Instrument Trajectory</span>
                <span className="text-slate-400">X: 0.58  Y: 0.49</span>
                <span className="text-slate-500 font-semibold mt-0.5">V: 0.12 units/s</span>
              </div>

              {/* Left Hand tracker overlay */}
              <div className="absolute bottom-1/4 left-8 p-2 rounded-lg bg-[#040711]/90 border border-emerald-500/30 text-[9px] font-mono flex flex-col gap-0.5 shadow-lg">
                <span className="text-emerald-400 font-bold uppercase tracking-wider">● Left Hand Path</span>
                <span className="text-slate-400">X: 0.42  Y: 0.51</span>
              </div>
            </div>

            {/* Quality overlays */}
            <div className="flex justify-between items-center z-10 relative border-t border-[#1d2433] pt-3">
              <span className="text-[10px] text-slate-500">Tracking: Needle Holder & Forceps</span>
              <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                <span className="text-emerald-400">✓ LIGHTING OK</span>
                <span className="text-emerald-400">✓ NO BLUR</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* PIPELINE SECTION */}
      <section id="pipeline" className="py-24 md:py-32 border-b border-[#1d2433]/30">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-xs text-cyan-400 uppercase tracking-widest font-mono font-bold mb-3">Assessment Process</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">OSCE Assessment Pipeline</p>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              SurgiSkill AI processes assessment attempts systematically using frame-by-frame coordinate extraction, translation to movement kinematics, and matching against rubrics.
            </p>
          </div>

          {/* 4-Step grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-[#121826] border border-[#1d2433] p-6 rounded-xl flex flex-col gap-4">
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest">PHASE 01</span>
              <div className="w-10 h-10 rounded-lg bg-[#040711] border border-[#1d2433] flex items-center justify-center text-cyan-400 shadow-inner">
                <Video size={16} />
              </div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">Guided Capture</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Visual alignment guides overlay the live feed to ensure standard camera distance, angle, and framing of the suture pad.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#121826] border border-[#1d2433] p-6 rounded-xl flex flex-col gap-4">
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest">PHASE 02</span>
              <div className="w-10 h-10 rounded-lg bg-[#040711] border border-[#1d2433] flex items-center justify-center text-cyan-400 shadow-inner">
                <Eye size={16} />
              </div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">Landmark Tracking</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Asynchronous tracking models extract coordinates of left/right hands and needle driver centroids.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#121826] border border-[#1d2433] p-6 rounded-xl flex flex-col gap-4">
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest">PHASE 03</span>
              <div className="w-10 h-10 rounded-lg bg-[#040711] border border-[#1d2433] flex items-center justify-center text-cyan-400 shadow-inner">
                <Activity size={16} />
              </div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">Kinematics Profile</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                The framework calculates path length, speed, smoothness index, and pauses to index surgical movement economy.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#121826] border border-[#1d2433] p-6 rounded-xl flex flex-col gap-4">
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest">PHASE 04</span>
              <div className="w-10 h-10 rounded-lg bg-[#040711] border border-[#1d2433] flex items-center justify-center text-cyan-400 shadow-inner">
                <Award size={16} />
              </div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">Scoring & Audit</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Generates a baseline scorecard mapped to active rubrics, giving examiners review controls for overrides.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* PLATFORM PREVIEW SECTION */}
      <section id="platform" className="py-24 md:py-32 bg-[#090e1a]/40 border-b border-[#1d2433]/30">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Text Description */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <h2 className="text-xs text-cyan-400 uppercase tracking-widest font-mono font-bold mb-3">Telemetry Console</h2>
            <h3 className="text-3xl font-extrabold text-white leading-tight">Evidence-Based Clinical Dashboards</h3>
            <p className="text-slate-400 text-sm leading-relaxed mt-4">
              Review attempt logs with precision. SurgiSkill AI presents residents and faculty with interactive kinematics profiles, checklist compliance steps, and detected event annotations.
            </p>
            <span className="text-[10px] text-slate-500 italic mt-6 block">• Mock dashboard representation showing simulated resident telemetry.</span>
          </div>

          {/* Dashboard Preview Card */}
          <div className="lg:col-span-7 w-full p-6 rounded-xl bg-[#121826] border border-[#1d2433] flex flex-col gap-6 shadow-xl relative">
            <div className="flex justify-between items-center border-b border-[#1d2433] pb-4">
              <div>
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Attempt ID: #98d1a1b</span>
                <span className="font-bold text-base text-white">Interrupted Suture Technique</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
                COMPLETED
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#040711] border border-[#1d2433] text-center shadow-inner">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Composite</span>
                <span className="text-xl font-black text-white block mt-1">88<span className="text-xs text-slate-500 font-semibold">/100</span></span>
              </div>
              <div className="p-4 rounded-lg bg-[#040711] border border-[#1d2433] text-center shadow-inner">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Checklist</span>
                <span className="text-xl font-black text-cyan-400 block mt-1">92%</span>
              </div>
              <div className="p-4 rounded-lg bg-[#040711] border border-[#1d2433] text-center shadow-inner">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Kinematics</span>
                <span className="text-xl font-black text-indigo-400 block mt-1">84%</span>
              </div>
            </div>

            {/* Details panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Suture checklists */}
              <div className="p-4 rounded-lg bg-[#040711]/40 border border-[#1d2433]/80 flex flex-col gap-2.5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">OSCE Checklist Steps</span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={11} /> Correct needle load angle</div>
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={11} /> 90-degree tissue entry</div>
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={11} /> Equal wound edge margins</div>
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={11} /> Square knot configuration</div>
                </div>
              </div>

              {/* Warning events */}
              <div className="p-4 rounded-lg bg-[#040711]/40 border border-[#1d2433]/80 flex flex-col gap-2.5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Detected Timeline Events</span>
                <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                  <div className="flex gap-2 items-center text-amber-500 font-semibold"><AlertTriangle size={11} /> Needle slip event (12.4s)</div>
                  <div className="flex gap-2 items-center"><Info size={11} /> Instrument regrip (18.1s)</div>
                  <div className="flex gap-2 items-center text-emerald-400"><Check size={11} /> Tie tension secured (24.2s)</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CV DETAILS SECTION */}
      <section id="kinematics" className="py-24 md:py-32 border-b border-[#1d2433]/30">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text parameters */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs text-cyan-400 uppercase tracking-widest font-mono font-bold">Kinematic Profiler</h2>
            <h3 className="text-3xl font-extrabold text-white">Spatial Trajectory Graphing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              The tracking console monitors motion path lengths, displacement vectors, average speed peaks, and pauses. It captures precision telemetry, feeding indicators directly to the scoring plugin.
            </p>

            <div className="flex flex-col gap-2 mt-4 text-xs">
              <div className="flex justify-between border-b border-[#1d2433] py-2">
                <span className="text-slate-400 font-medium">Total Path Length (Left / Right)</span>
                <span className="font-mono font-bold text-white">0.42 / 1.56 units</span>
              </div>
              <div className="flex justify-between border-b border-[#1d2433] py-2">
                <span className="text-slate-400 font-medium">Average Suture Speed</span>
                <span className="font-mono font-bold text-white">0.056 units/s</span>
              </div>
              <div className="flex justify-between border-b border-[#1d2433] py-2">
                <span className="text-slate-400 font-medium">Movement Smoothness (StDev)</span>
                <span className="font-mono font-bold text-white">0.124</span>
              </div>
              <div className="flex justify-between border-b border-[#1d2433] py-2">
                <span className="text-slate-400 font-medium">Incision Alignment Precision</span>
                <span className="font-mono font-bold text-white">96.4%</span>
              </div>
            </div>
          </div>

          {/* Right: SVG Diagram */}
          <div className="p-6 rounded-xl bg-[#121826] border border-[#1d2433] flex flex-col gap-4">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Surgical Suture Trajectory Graph</span>
            <div className="w-full aspect-video rounded-lg bg-[#040711] relative flex items-center justify-center border border-[#1d2433] shadow-inner">
              <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 400 200">
                <path d="M 40,160 Q 120,40 200,120 T 360,60" fill="none" stroke="#06b6d4" strokeWidth="2" />
                <path d="M 40,160 L 360,60" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="5 3" />
                
                {/* Dots */}
                <circle cx="40" cy="160" r="4.5" fill="#6366f1" />
                <circle cx="200" cy="120" r="4.5" fill="#6366f1" />
                <circle cx="360" cy="60" r="4.5" fill="#6366f1" />

                {/* Text tags */}
                <text x="50" y="165" fill="#94a3b8" fontSize="9" fontFamily="monospace">Start</text>
                <text x="210" y="125" fill="#94a3b8" fontSize="9" fontFamily="monospace">Penetration</text>
                <text x="315" y="55" fill="#94a3b8" fontSize="9" fontFamily="monospace">Exit Point</text>
              </svg>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Solid Cyan: Suture needle tip path</span>
              <span>Dashed Slate: Displacement path</span>
            </div>
          </div>
        </Container>
      </section>

      {/* CLINICAL VALIDATION INFO */}
      <section id="validation" className="py-24 md:py-32">
        <Container>
          <div className="p-8 md:p-12 rounded-xl bg-gradient-to-br from-[#121826] via-[#090e1a] to-[#040711] border border-[#1d2433] relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-500 to-indigo-600" />
            
            <div className="max-w-3xl text-left flex flex-col gap-4">
              <h2 className="text-xs text-cyan-400 uppercase tracking-widest font-mono font-bold">Integrity Framework</h2>
              <p className="text-3xl font-extrabold text-white leading-tight">Designed for Clinical Validation</p>
              <p className="text-slate-400 text-sm leading-relaxed mt-2">
                SurgiSkill AI combines computer-vision tracking metrics with custom expert-vetted scoring rubrics. The platform prioritizes examiner logging, transparent scoring evidence, and human-in-the-loop audit trails.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="p-5 rounded-lg bg-[#040711]/60 border border-[#1d2433]/80">
                <span className="text-[10px] text-cyan-400 block font-mono font-bold uppercase mb-2">Audit Logs</span>
                <p className="text-xs text-slate-400 leading-relaxed">All student assessment data, score updates, and system parameters are logged in an immutable database audit log.</p>
              </div>
              <div className="p-5 rounded-lg bg-[#040711]/60 border border-[#1d2433]/80">
                <span className="text-[10px] text-cyan-400 block font-mono font-bold uppercase mb-2">Examiner Override</span>
                <p className="text-xs text-slate-400 leading-relaxed">Faculty examiners retain final authority over score overrides, appending reason annotations directly to the student record.</p>
              </div>
              <div className="p-5 rounded-lg bg-[#040711]/60 border border-[#1d2433]/80">
                <span className="text-[10px] text-cyan-400 block font-mono font-bold uppercase mb-2">Immutability</span>
                <p className="text-xs text-slate-400 leading-relaxed">Rubrics cannot be overwritten mid-cohort. Modifications generate a version increment to maintain scoring consistency.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-[#040711] border-t border-[#1d2433]/50">
        <Container className="py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white" size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">SurgiSkill AI</span>
          </div>

          <div className="flex flex-wrap gap-8 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            <a href="#platform" className="hover:text-slate-300 transition-colors">Platform</a>
            <a href="#pipeline" className="hover:text-slate-300 transition-colors">Workflow</a>
            <a href="#kinematics" className="hover:text-slate-300 transition-colors">Telemetry</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>

          <span className="text-xs text-slate-600 font-medium">
            © {new Date().getFullYear()} SurgiSkill AI Inc. All rights reserved.
          </span>
        </Container>
      </footer>
    </div>
  );
}
