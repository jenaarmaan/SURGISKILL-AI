import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Eye,
  CheckCircle,
  FileCheck,
  Video,
  Award,
  Layers,
  ChevronRight,
  Stethoscope,
  Terminal,
  Play,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface PublicLandingViewProps {
  onEnterApp: () => void;
  onOpenDocs?: () => void;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ onEnterApp, onOpenDocs }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'platform' | 'workflow' | 'principles' | 'contact'>('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Public Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md shadow-teal-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-mono text-lg font-bold tracking-tight text-white">
                SurgiSkill<span className="text-teal-400">AI</span>
              </span>
              <span className="ml-2 rounded border border-teal-500/30 bg-teal-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300">
                MEDICAL TECH
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition hover:text-white ${activeTab === 'overview' ? 'text-teal-400 font-semibold' : ''}`}
            >
              Platform Overview
            </button>
            <button
              onClick={() => setActiveTab('platform')}
              className={`transition hover:text-white ${activeTab === 'platform' ? 'text-teal-400 font-semibold' : ''}`}
            >
              Computer Vision
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`transition hover:text-white ${activeTab === 'workflow' ? 'text-teal-400 font-semibold' : ''}`}
            >
              Digital OSCE
            </button>
            <button
              onClick={() => setActiveTab('principles')}
              className={`transition hover:text-white ${activeTab === 'principles' ? 'text-teal-400 font-semibold' : ''}`}
            >
              Clinical Governance
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDocs || onEnterApp}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-white transition"
            >
              <BookOpen className="h-3.5 w-3.5 text-teal-400" />
              <span>System Docs & Specs</span>
            </button>
            <button
              onClick={onEnterApp}
              className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-teal-500/20 transition hover:bg-teal-400"
            >
              <span>Launch Clinical Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 py-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/40 px-3.5 py-1.5 text-xs font-mono text-teal-300">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span>AI-POWERED SURGICAL SKILLS INTELLIGENCE & DIGITAL OSCE</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Objective Surgical Skills Assessment with{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              Explainable Computer Vision
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base text-slate-400 leading-relaxed sm:text-lg">
            SurgiSkill AI observes surgical training tasks through calibrated video, characterizes wound margins, tracks needle trajectories and instrument kinematics against clinically curated reference models, and produces evidence-linked formative feedback with faculty verification.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/25 transition hover:bg-teal-400"
            >
              <span>Enter Trainee / Faculty Portal</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenDocs || onEnterApp}
              className="flex items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-950/40 px-5 py-3 text-sm font-semibold text-teal-300 hover:bg-teal-900/50 transition"
            >
              <BookOpen className="h-4 w-4 text-teal-400" />
              <span>Features & Concept Guide</span>
            </button>
            <button
              onClick={() => setActiveTab('principles')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <Shield className="h-4 w-4 text-teal-400" />
              <span>Read Clinical Reference Standards</span>
            </button>
          </div>

          {/* Clinical Disclaimer Notice */}
          <div className="mt-12 inline-block rounded-xl border border-amber-500/30 bg-amber-950/30 p-3.5 text-left text-xs text-amber-200/90 max-w-2xl">
            <span className="font-bold text-amber-400 uppercase tracking-wide mr-1.5">Educational Scope:</span>
            SurgiSkill AI is engineered strictly for surgical residency education, simulation training centers, and standardized digital OSCE examinations. It does not independently direct real-patient surgical procedures.
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-xs font-bold tracking-widest text-teal-400 uppercase">System Architecture</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">
              End-to-End Surgical Competency Infrastructure
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/50 text-teal-400">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Real-Time Computer Vision</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Calibrated 60fps tracking of needle pose, tissue puncture points, Adson forceps tissue handling, suture loop geometry, and tool travel path length.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Bite Width mm</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">90° Entry Angle</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Stitch Pitch</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/50 text-teal-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Procedure Reference Models (PRMs)</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Clinically curated expected geometric standards: wound margin dimensions, needle chord radii, orthogonal angle tolerances, and knot throw structures.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Versioned Rubrics</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Lock History</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Faculty Consensus</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/50 text-teal-400">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Digital OSCE Engine</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Automated examination stations rotation, timed countdowns, validated Objective Structured Assessment of Technical Skills (OSATS) global rating scales, and examiner workflow.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Cohort Rotations</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Timed Audits</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">GRS Scales</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/50 text-teal-400">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Faculty-in-the-Loop Verification</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Surgeons inspect timestamped video evidence frames, side-by-side AI vs faculty scoring, and record mandatory clinical rationale for any score overrides.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Mandatory Rationale</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Video Annotation</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/50 text-teal-400">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Gemini 3.8 Multimodal Reasoning</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Server-side multimodal synthesis translates raw CV kinematics into personalized deliberate practice drills, explaining the histological consequences of technique flaws.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Biomechanical Rationale</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Targeted Drills</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/50 text-teal-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">Hardware-Independent Matrix</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Interfaces with standard webcams, overhead 4K surgical cameras, Stryker laparoscopic video towers, Intel RealSense depth sensors, and ATI force transducers.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">UVC Direct</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">RTSP Stream</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">Explicit Proxies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-slate-800/80 bg-slate-900/40 py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Experience the Complete Surgical Training Workspace
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Access the resident dashboard, run the 13-stage computer vision tracking engine, inspect evidence-linked reports, and evaluate OSCE examinations.
          </p>
          <div className="mt-8">
            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/25 transition hover:bg-teal-400"
            >
              <span>Enter SurgiSkill AI Platform</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
