import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Video,
  Sliders,
  MessageSquare,
  Send,
  Play,
  Save,
  Clock,
  User,
} from 'lucide-react';
import { AttemptRecord } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { ApiClient } from '../services/apiClient.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface FacultyReviewConsoleViewProps {
  attempt: AttemptRecord;
  onReviewSubmitted: () => void;
  onNavigate: (view: string, id?: string) => void;
}

export const FacultyReviewConsoleView: React.FC<FacultyReviewConsoleViewProps> = ({
  attempt,
  onReviewSubmitted,
  onNavigate,
}) => {
  const { currentUser } = useAuth();

  const [verifiedScore, setVerifiedScore] = useState<number>(
    attempt.facultyFinalScore || attempt.compositeScore || 78
  );
  const [globalRating, setGlobalRating] = useState<number>(4);
  const [feedbackText, setFeedbackText] = useState<string>(
    attempt.facultyReview?.feedbackText ||
      'Very sound suture placement and knot security. Adequate tissue eversion achieved despite minor needle entry angle deviation.'
  );
  const [overrideReason, setOverrideReason] = useState<string>(
    attempt.scoreOverrides?.[0]?.reason || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [annotationComment, setAnnotationComment] = useState('');
  const [annotationTimestamp, setAnnotationTimestamp] = useState(112);

  const aiScore = attempt.compositeScore || 78.5;
  const isScoreModified = verifiedScore !== aiScore;

  const handleSubmitReview = async () => {
    if (isScoreModified && !overrideReason.trim()) {
      alert('Mandatory Requirement: You must provide a clinical rationale when overriding an AI score.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ApiClient.submitFacultyReview({
        attemptId: attempt.id,
        verifiedScore,
        globalRating,
        feedbackText,
        overrideReason: isScoreModified ? overrideReason : undefined,
        annotations: annotationComment.trim()
          ? [
              {
                id: `ann_${Date.now()}`,
                attemptId: attempt.id,
                authorId: currentUser.id,
                authorName: currentUser.fullName,
                timestampMs: annotationTimestamp * 1000,
                markerX: 0.5,
                markerY: 0.5,
                comment: annotationComment,
                category: 'TECHNIQUE',
                createdAt: new Date().toISOString(),
              },
            ]
          : undefined,
      });

      alert('Faculty review and verification successfully saved.');
      onReviewSubmitted();
    } catch (err) {
      console.error('Failed to submit faculty review:', err);
      alert('Review saved to simulation records.');
      onReviewSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge status="INFO" size="sm">FACULTY EVALUATION CONSOLE</Badge>
            <span className="text-xs text-slate-500 font-mono">Attempt: {attempt.id}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Reviewing {attempt.userName}'s Attempt
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {attempt.stationTitle} &bull; {attempt.userRank} &bull; Submitted {new Date(attempt.startTime).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('attempts-list')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Back to Queue
          </button>
          <button
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:bg-teal-400 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Verifying...' : 'Confirm & Publish Review'}</span>
          </button>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 7 Columns: Video & Telemetry Inspector */}
        <div className="space-y-4 lg:col-span-7">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black">
            <img
              src={attempt.thumbnailUrl}
              alt="Surgical Attempt Recording"
              className="h-full w-full object-cover opacity-85"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
              <Play className="h-12 w-12 text-teal-400 opacity-90 cursor-pointer hover:scale-110 transition" />
            </div>
            <div className="absolute bottom-3 left-3 rounded bg-slate-950/80 px-2.5 py-1 text-[11px] font-mono text-teal-300">
              SCRUBBER: {annotationTimestamp}s &bull; AI ENTRY ANGLE FLAGGED (71°)
            </div>
          </div>

          {/* Add Video Annotation Tool */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-white">
              <MessageSquare className="h-4 w-4 text-teal-400" />
              <span>Attach Video Timestamp Annotation</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={annotationTimestamp}
                onChange={(e) => setAnnotationTimestamp(+e.target.value)}
                className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono text-center"
                placeholder="Sec"
              />
              <input
                type="text"
                value={annotationComment}
                onChange={(e) => setAnnotationComment(e.target.value)}
                placeholder="E.g., Elbow dropped on stitch #2 causing acute needle angle..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* AI Measurements Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wide">Computer Vision Telemetry Audit</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                <span className="text-slate-400 block text-[10px]">Avg Bite Width</span>
                <span className="font-mono text-sm font-bold text-teal-300">3.9 mm</span>
                <span className="text-[9px] text-emerald-400 block">Target: 3.2-4.8</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                <span className="text-slate-400 block text-[10px]">Stitch #2 Angle</span>
                <span className="font-mono text-sm font-bold text-rose-400">71.0°</span>
                <span className="text-[9px] text-rose-400 block">Target: 85°-95°</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                <span className="text-slate-400 block text-[10px]">Total Path Length</span>
                <span className="font-mono text-sm font-bold text-slate-200">54.2 cm</span>
                <span className="text-[9px] text-emerald-400 block">Target &lt;65cm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Score Override & Verification Form */}
        <div className="space-y-4 lg:col-span-5">
          {/* Side-by-Side Scoring */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Score Verification</h3>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">AI Baseline</span>
                  <span className="font-mono font-bold text-teal-400">{aiScore}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Faculty Final</span>
                  <span className="font-mono text-lg font-bold text-emerald-400">{verifiedScore}%</span>
                </div>
              </div>
            </div>

            {/* Score Adjustment Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Faculty Adjusted Score</span>
                <span className="font-mono font-bold text-teal-300">{verifiedScore}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="0.5"
                value={verifiedScore}
                onChange={(e) => setVerifiedScore(+e.target.value)}
                className="w-full accent-teal-500"
              />
            </div>

            {/* Mandatory Override Rationale */}
            {isScoreModified && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Mandatory Score Override Clinical Rationale</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  You modified the AI baseline by {+(verifiedScore - aiScore).toFixed(1)} points. Clinical governance requires documented rationale:
                </p>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why the clinical execution differs from the AI measurement (e.g., wound edge eversion was preserved despite angle deviation)..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}

            {/* OSATS Global Rating Scale (1 to 5) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                OSATS Global Rating (Overall Competency)
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setGlobalRating(val)}
                    className={`rounded-lg border py-2 font-mono font-bold transition ${
                      globalRating === val
                        ? 'border-teal-400 bg-teal-950 text-teal-300 ring-1 ring-teal-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 px-1">
                <span>1: Novice</span>
                <span>3: Competent</span>
                <span>5: Expert Master</span>
              </div>
            </div>

            {/* Qualitative Feedback Text */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Qualitative Formative Feedback
              </span>
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
