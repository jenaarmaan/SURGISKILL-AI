import React from 'react';
import {
  Activity,
  Layers,
  Award,
  Video,
  Clock,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { SurgicalStation, AttemptRecord, OSCEExam } from '../types/index.ts';
import { MetricCard } from '../components/common/MetricCard.tsx';
import { Badge } from '../components/common/Badge.tsx';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface StudentDashboardViewProps {
  stations: SurgicalStation[];
  attempts: AttemptRecord[];
  osceExams: OSCEExam[];
  onNavigate: (view: string, id?: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  stations,
  attempts,
  osceExams,
  onNavigate,
}) => {
  const { currentUser } = useAuth();

  const userAttempts = attempts.filter((a) => a.userId === currentUser.id || a.userId === 'usr_student_alex_chen');
  const latestAttempt = userAttempts[0] || attempts[0];
  const upcomingOSCE = osceExams[0];

  const radarData = [
    { subject: 'Needle Handling', score: 88, benchmark: 90 },
    { subject: 'Entry Angle (90°)', score: 76, benchmark: 90 },
    { subject: 'Bite Symmetry', score: 85, benchmark: 90 },
    { subject: 'Pitch Spacing', score: 84, benchmark: 90 },
    { subject: 'Knot Security', score: 92, benchmark: 90 },
    { subject: 'Economy of Motion', score: 80, benchmark: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-mono text-teal-300">
              <span>{currentUser.cohortName || 'General Surgery Residency'}</span>
              <span>&bull;</span>
              <span>ACCREDITATION LEVEL: PGY-2</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Welcome back, {currentUser.fullName}
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Your surgical skills training station assignments, digital OSCE schedule, and verified objective assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('workspace', 'stn_interrupted_suture')}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition"
            >
              <Video className="h-4 w-4" />
              <span>Launch Suturing Station</span>
            </button>
            <button
              onClick={() => onNavigate('osce')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Calendar className="h-4 w-4 text-teal-400" />
              <span>View OSCE Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="COMPOSITE BENCHMARK"
          value="82.0%"
          subtitle="Faculty Verified Score"
          change="+3.5% vs AI Baseline"
          changeType="positive"
          icon={Award}
          badge={<Badge status="VERIFIED">VERIFIED</Badge>}
        />
        <MetricCard
          title="STATIONS ASSIGNED"
          value={stations.length}
          subtitle="2 Completed &bull; 2 In Progress"
          icon={Layers}
        />
        <MetricCard
          title="NEEDLE KINEMATICS"
          value="54.2 cm"
          subtitle="Path Length (Target <65cm)"
          change="Optimal Economy"
          changeType="positive"
          icon={Activity}
        />
        <MetricCard
          title="UPCOMING OSCE"
          value="Oct 05"
          subtitle="Station Rotation A (08:00 AM)"
          icon={Clock}
          badge={<Badge status="CAUTION">12 DAYS</Badge>}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Assigned Stations & Recent Attempts */}
        <div className="space-y-6 lg:col-span-2">
          {/* Assigned Stations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Assigned Surgical Stations</h3>
                <p className="text-xs text-slate-400">Curriculum benchmarks assigned to your residency cohort</p>
              </div>
              <button
                onClick={() => onNavigate('stations')}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                View All &rarr;
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {stations.map((stn) => {
                const hasAttempt = userAttempts.some((a) => a.stationId === stn.id);
                return (
                  <div
                    key={stn.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/80 p-4 transition hover:border-slate-700"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-400">{stn.code}</span>
                        <span className="text-xs font-medium text-slate-500">&bull;</span>
                        <span className="text-xs font-medium text-slate-400">{stn.category}</span>
                        <Badge size="sm" status={stn.difficulty === 'Fundamental' ? 'INFO' : 'CAUTION'}>
                          {stn.difficulty}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{stn.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{stn.clinicalContext}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {hasAttempt ? (
                        <button
                          onClick={() => onNavigate('attempt-detail', latestAttempt.id)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                        >
                          Review Report
                        </button>
                      ) : null}
                      <button
                        onClick={() => onNavigate('workspace', stn.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 px-3.5 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-500 hover:text-slate-950 transition"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Start Practice</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Attempts History */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Recent Attempt History</h3>
                <p className="text-xs text-slate-400">Timestamped recordings with objective CV scoring</p>
              </div>
              <button
                onClick={() => onNavigate('attempts-list')}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300"
              >
                Full Log &rarr;
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-3 font-medium">STATION</th>
                    <th className="pb-3 font-medium">DATE / DURATION</th>
                    <th className="pb-3 font-medium">AI SCORE</th>
                    <th className="pb-3 font-medium">FACULTY SCORE</th>
                    <th className="pb-3 font-medium">VERIFICATION</th>
                    <th className="pb-3 font-medium text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {userAttempts.map((att) => (
                    <tr key={att.id} className="group hover:bg-slate-850/50">
                      <td className="py-3 font-semibold text-white">
                        <div>{att.stationTitle}</div>
                        <span className="font-mono text-[10px] text-slate-500">{att.stationCode}</span>
                      </td>
                      <td className="py-3 text-slate-400">
                        <div>{new Date(att.startTime).toLocaleDateString()}</div>
                        <span className="text-[10px] text-slate-500 font-mono">{att.durationSeconds}s</span>
                      </td>
                      <td className="py-3 font-mono font-bold text-teal-400">
                        {att.compositeScore ? `${att.compositeScore}%` : 'Pending'}
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-200">
                        {att.facultyFinalScore ? (
                          <span className="text-emerald-400">{att.facultyFinalScore}%</span>
                        ) : (
                          <span className="text-slate-500">Unreviewed</span>
                        )}
                      </td>
                      <td className="py-3">
                        {att.isFacultyVerified ? (
                          <Badge size="sm" status="VERIFIED">VERIFIED</Badge>
                        ) : (
                          <Badge size="sm" status="PENDING">IN QUEUE</Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onNavigate('attempt-detail', att.id)}
                          className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Competency Radar & Faculty Feedback */}
        <div className="space-y-6">
          {/* Competency Radar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">Competency Profile</h3>
              <span className="text-[10px] font-mono text-teal-400">PGY-2 BENCHMARK</span>
            </div>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
                  <Radar name="Resident" dataKey="score" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.4} />
                  <Radar name="Benchmark" dataKey="benchmark" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400" /> Dr. Alex Chen
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" /> PGY-2 Target
              </span>
            </div>
          </div>

          {/* Latest Verified Faculty Feedback */}
          {latestAttempt?.facultyReview && (
            <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-teal-400">
                <Award className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wide">Faculty Assessment Rationale</h4>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Reviewed by <strong className="text-slate-200">{latestAttempt.facultyReview.reviewerName}</strong>
              </p>
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs leading-relaxed text-slate-300 italic">
                "{latestAttempt.facultyReview.feedbackText}"
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Global Rating (OSATS):</span>
                <span className="font-mono font-bold text-teal-300">
                  {latestAttempt.facultyReview.globalRating} / 5.0 (Proficient)
                </span>
              </div>
            </div>
          )}

          {/* Recommended Practice Tasks */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400">
              <Zap className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wide">Targeted Deliberate Practice</h4>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">AI-curated based on observed 71° entry angle deviation</p>
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 text-xs">
                <p className="font-semibold text-white">90° Orthogonal Entry Micro-Drill</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  10 consecutive needle passes on synthetic foam verifying perpendicular puncture orientation before wrist rotation.
                </p>
                <button
                  onClick={() => onNavigate('workspace', 'stn_interrupted_suture')}
                  className="mt-2 text-[10px] font-bold text-teal-400 hover:underline"
                >
                  Start Drill &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
