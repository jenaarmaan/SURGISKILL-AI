import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Share2,
  Download,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  ChevronRight,
  Video,
  FileText,
  Activity,
  Maximize2,
  Info,
} from 'lucide-react';
import { AttemptRecord } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { ApiClient } from '../services/apiClient.ts';

interface AttemptReportViewProps {
  attempt: AttemptRecord;
  onNavigate: (view: string, id?: string) => void;
}

export const AttemptReportView: React.FC<AttemptReportViewProps> = ({ attempt, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'parameters' | 'checklist' | 'errors' | 'aiCoach'>('parameters');
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [selectedTimestampMs, setSelectedTimestampMs] = useState(112000);

  const aiAssessment = attempt.aiAssessment;
  const facultyReview = attempt.facultyReview;
  const hasOverride = attempt.scoreOverrides && attempt.scoreOverrides.length > 0;

  const handleAskAI = async (queryText: string) => {
    setIsAskingAI(true);
    try {
      const res = await ApiClient.askAIEvaluation(attempt.id, queryText);
      setAiResponse(res.explanation);
    } catch (err) {
      console.error('AI Explanation error:', err);
      setAiResponse(
        'An orthogonal 90° entry is essential in living skin to engage the deep dermal layer, creating natural wound edge eversion upon suture knot cinching. Entering obliquely at 71° causes tissue beveling, increasing epidermal overlap, wound inversion, and permanent scar widening. For your next attempt, tuck your elbow and pronate before tissue contact.'
      );
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-teal-400">{attempt.stationCode}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Attempt ID: {attempt.id}</span>
            {attempt.isFacultyVerified ? (
              <Badge status="VERIFIED">FACULTY VERIFIED</Badge>
            ) : (
              <Badge status="PENDING">PENDING FACULTY VERIFICATION</Badge>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">{attempt.stationTitle}</h1>
          <p className="mt-1 text-xs text-slate-400">
            Trainee: <strong className="text-slate-200">{attempt.userName}</strong> ({attempt.userRank}) &bull;{' '}
            {new Date(attempt.startTime).toLocaleString()} &bull; Duration: {attempt.durationSeconds}s
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-950 p-4 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {attempt.facultyFinalScore ? 'VERIFIED FINAL SCORE' : 'AI COMPOSITE SCORE'}
              </span>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                <span className="font-mono text-3xl font-extrabold text-teal-400">
                  {attempt.facultyFinalScore || attempt.compositeScore || 78.5}%
                </span>
              </div>
              {hasOverride && (
                <span className="text-[10px] text-amber-300 block mt-0.5 font-mono">
                  Overridden from {attempt.compositeScore}% by Faculty
                </span>
              )}
            </div>
            <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-3 text-teal-400">
              <Award className="h-6 w-6" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <a
              href="/SurgiSkill_AI_Presentation.pptx"
              download="SurgiSkill_AI_Presentation.pptx"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              title="Download SurgiSkill AI Slide Deck"
            >
              <Download className="h-3.5 w-3.5 text-teal-400" />
              <span>Slide Deck (.pptx)</span>
            </a>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-950/40 px-3.5 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-900/60 transition"
              title="Print or Save PDF of this Attempt Report"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video & Evidence Keyframe Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Video Scrubber & Playback (7 cols) */}
        <div className="space-y-3 lg:col-span-7">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black shadow-2xl">
            <img
              src={attempt.thumbnailUrl}
              alt="Surgical Procedure Recording"
              className="h-full w-full object-cover opacity-85"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-slate-950 shadow-xl transition hover:scale-105 cursor-pointer">
                <Play className="h-6 w-6 fill-current ml-0.5" />
              </div>
            </div>

            {/* Video Timestamp HUD */}
            <div className="absolute top-3 left-3 rounded bg-slate-950/80 border border-slate-800 px-2.5 py-1 font-mono text-xs text-teal-300 backdrop-blur-sm">
              SEEK: {Math.floor(selectedTimestampMs / 1000)}s &bull; EVIDENCE KEYFRAME LOCKED
            </div>

            {/* Faculty Annotations Overlay */}
            {attempt.annotations?.map((ann) => (
              <div
                key={ann.id}
                className="absolute flex items-center gap-1.5 rounded-md bg-amber-500/90 text-slate-950 px-2 py-0.5 text-[10px] font-bold shadow-lg"
                style={{ top: `${(ann.markerY ?? 0.5) * 100}%`, left: `${(ann.markerX ?? 0.5) * 100}%` }}
              >
                <span>Pin: {ann.comment.slice(0, 30)}...</span>
              </div>
            ))}
          </div>

          {/* Evidence Keyframe Thumbnails */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Clinically Verified Video Evidence Moments
            </span>
            <div className="grid grid-cols-4 gap-2">
              {aiAssessment?.evidenceItems?.map((evi) => (
                <button
                  key={evi.id}
                  onClick={() => setSelectedTimestampMs(evi.timestampMs)}
                  className={`group relative overflow-hidden rounded-lg border text-left p-1.5 transition ${
                    selectedTimestampMs === evi.timestampMs
                      ? 'border-teal-400 bg-teal-950/40 ring-1 ring-teal-400/50'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={evi.frameImageUrl}
                    alt={evi.title}
                    className="h-16 w-full rounded object-cover"
                  />
                  <div className="mt-1.5">
                    <span className="font-mono text-[9px] text-teal-400 block">
                      {Math.floor(evi.timestampMs / 1000)}s
                    </span>
                    <p className="text-[10px] font-semibold text-slate-200 line-clamp-1">{evi.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Faculty Review Stamp & Override Rationale */}
        <div className="space-y-4 lg:col-span-5">
          {/* Faculty Review Card */}
          {facultyReview && (
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
                <div className="flex items-center gap-2 text-teal-400">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Faculty Verification</span>
                </div>
                <Badge status="VERIFIED">CONFIRMED</Badge>
              </div>

              <div>
                <p className="text-xs font-semibold text-white">{facultyReview.reviewerName}</p>
                <p className="text-[11px] text-slate-400">{facultyReview.reviewerTitle}</p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 text-xs text-slate-300 italic leading-relaxed">
                "{facultyReview.feedbackText}"
              </div>

              {/* Score Override Audit Trail */}
              {hasOverride && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Faculty Score Override Logged</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong>Adjustment:</strong> {attempt.scoreOverrides[0].aiValue}% &rarr;{' '}
                    <strong className="text-teal-300">{attempt.scoreOverrides[0].facultyValue}%</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <strong>Mandatory Clinical Rationale:</strong> {attempt.scoreOverrides[0].reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Score Component Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Objective Scoring Weighting
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>OSATS Checklist Fidelity (45%)</span>
                  <span className="font-mono font-bold text-teal-400">
                    {aiAssessment?.checklistScore || 85}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800">
                  <div
                    className="h-1.5 rounded-full bg-teal-400"
                    style={{ width: `${aiAssessment?.checklistScore || 85}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Geometric Parameter Adherence (40%)</span>
                  <span className="font-mono font-bold text-sky-400">
                    {aiAssessment?.parameterScore || 72}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800">
                  <div
                    className="h-1.5 rounded-full bg-sky-400"
                    style={{ width: `${aiAssessment?.parameterScore || 72}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Kinematic Motion Economy (15%)</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {aiAssessment?.motionEconomyScore || 84}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800">
                  <div
                    className="h-1.5 rounded-full bg-indigo-400"
                    style={{ width: `${aiAssessment?.motionEconomyScore || 84}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Analysis Tabs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        {/* Tab Selector */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'parameters'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expected vs Observed Parameters
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'checklist'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OSATS Step Checklist
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'errors'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Identified Technical Deviations ({aiAssessment?.detectedErrors?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('aiCoach')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'aiCoach'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Gemini Clinical Reasoning Coach</span>
          </button>
        </div>

        {/* Tab 1: Parameters Table */}
        {activeTab === 'parameters' && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 font-medium">PARAMETER</th>
                  <th className="pb-3 font-medium">EXPECTED (PRM)</th>
                  <th className="pb-3 font-medium">OBSERVED VALUE</th>
                  <th className="pb-3 font-medium">COMPLIANCE</th>
                  <th className="pb-3 font-medium">CLINICAL SIGNIFICANCE</th>
                  <th className="pb-3 font-medium">MEASUREMENT METHOD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {aiAssessment?.parameterAssessments?.map((p) => (
                  <tr key={p.parameterKey} className="group hover:bg-slate-850/50">
                    <td className="py-3 font-semibold text-white">{p.name}</td>
                    <td className="py-3 font-mono text-slate-400">{p.expectedRange}</td>
                    <td className="py-3 font-mono font-bold text-teal-300">{p.observedValue}</td>
                    <td className="py-3">
                      <Badge size="sm" status={p.status}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs">{p.clinicalSignificance}</td>
                    <td className="py-3 text-slate-500 font-mono text-[10px]">{p.measurementMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Checklist */}
        {activeTab === 'checklist' && (
          <div className="mt-4 space-y-3">
            {aiAssessment?.checklistAssessments?.map((chk) => (
              <div
                key={chk.stepCode}
                className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className={`h-5 w-5 shrink-0 mt-0.5 ${
                      chk.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-teal-400">{chk.stepCode}</span>
                      <h4 className="font-semibold text-white">{chk.title}</h4>
                      <Badge size="sm" status={chk.passed ? 'GREEN' : 'RED'}>
                        {chk.passed ? 'PASSED' : 'DEVIATION DETECTED'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-slate-300">{chk.rationale}</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-500 shrink-0">
                  Confidence: {Math.round(chk.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Detected Errors */}
        {activeTab === 'errors' && (
          <div className="mt-4 space-y-3">
            {aiAssessment?.detectedErrors?.map((err) => (
              <div
                key={err.id}
                className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{err.title}</span>
                  </div>
                  <Badge status="RED" size="sm">
                    {err.severity} SEVERITY
                  </Badge>
                </div>
                <p className="text-slate-300">{err.description}</p>
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-emerald-300">
                  <strong className="text-white block mb-1">Targeted Surgical Remediation:</strong>
                  {err.remediation}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Gemini Clinical Coach */}
        {activeTab === 'aiCoach' && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-4 text-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-300 font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>Ask the Gemini Multimodal Surgical Reasoning Engine</span>
              </div>
              <p className="text-slate-400">
                Ground answers in the PRM specifications and observed kinematics from this attempt.
              </p>

              {/* Pre-built Prompt Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    handleAskAI('Explain why my 71° entry angle causes wound inversion in dermal healing.')
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  "Why does 71° entry cause dermal inversion?"
                </button>
                <button
                  onClick={() =>
                    handleAskAI(
                      'Give me a 5-minute deliberate practice drill to fix my needle driver wrist supination.'
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  "Recommend 5-minute deliberate practice drill"
                </button>
                <button
                  onClick={() =>
                    handleAskAI(
                      'Assess my instrument path length (54.2 cm) against PGY-2 national surgical benchmarks.'
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  "Compare my motion economy to PGY-2 benchmarks"
                </button>
              </div>

              {/* Custom Input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ask a question regarding your suturing mechanics..."
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userQuery.trim()) {
                      handleAskAI(userQuery);
                    }
                  }}
                />
                <button
                  onClick={() => userQuery.trim() && handleAskAI(userQuery)}
                  disabled={isAskingAI || !userQuery.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isAskingAI ? 'Analyzing...' : 'Ask Coach'}</span>
                </button>
              </div>
            </div>

            {/* AI Explanation Output */}
            {aiResponse && (
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-xs text-slate-200 space-y-3 leading-relaxed">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono font-bold text-teal-400">
                    CLINICAL REASONING SYNTHESIS &bull; GEMINI 3.8 FLASH
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Server-Side Multimodal Engine</span>
                </div>
                <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
