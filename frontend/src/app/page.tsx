"use client";

import Link from "next/link";
import { Activity, ShieldAlert, Award, Video, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg">
            S
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SurgiSkill AI
          </span>
        </div>
        <Link href="/auth">
          <button className="btn-primary flex items-center gap-2">
            Get Started <ChevronRight size={16} />
          </button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-20 flex flex-col items-center text-center flex-grow justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 text-sm font-semibold mb-8">
          <Activity size={16} className="animate-pulse" /> AI-Powered Digital OSCE Surgical Assessment
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Objective Skill Scoring with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Computer Vision
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12">
          SurgiSkill AI evaluates surgical attempts frame-by-frame. Our system analyzes tool path trajectories, hand dynamics, and procedural checklist compliance for explainable, trace-verifiable clinical grading.
        </p>

        <div className="flex gap-6 mb-20">
          <Link href="/auth">
            <button className="btn-primary px-8 py-3 text-lg">Enter Platform</button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left">
          <div className="premium-card p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Video size={24} />
            </div>
            <h3 className="font-bold text-xl text-white">1. Capture Attempt</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Guided framing outlines ensure correct camera placement, proper workspace lighting, and alignment verification before recording starts.
            </p>
          </div>

          <div className="premium-card p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity size={24} />
            </div>
            <h3 className="font-bold text-xl text-white">2. Spatial CV Analysis</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Extract hand coordinates and instrument tips in real-time, measuring path length, average speed, acceleration, and tremor jerk indices.
            </p>
          </div>

          <div className="premium-card p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-xl text-white">3. Objective Scoring</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Scores are calculated blending step compliance and motion parameters, with detailed annotations and clear faculty review paths.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row justify-between items-center border-t border-slate-800 text-sm text-slate-500 gap-4">
        <span>© {new Date().getFullYear()} SurgiSkill AI Inc. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
          <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-300">Clinical Validation</Link>
        </div>
      </footer>
    </div>
  );
}
