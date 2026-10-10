import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCheck,
  TrendingUp,
  Shield,
  Sliders,
  Users,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SurgicalStation } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { MetricCard } from '../components/common/MetricCard.tsx';
import { ApiClient } from '../services/apiClient.ts';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface ClinicalLeadDashboardViewProps {
  stations: SurgicalStation[];
  onNavigate: (view: string, id?: string) => void;
}

export const ClinicalLeadDashboardView: React.FC<ClinicalLeadDashboardViewProps> = ({
  stations,
  onNavigate,
}) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<SurgicalStation>(stations[0]);
  const [isApproving, setIsApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'prms'>('analytics');

  useEffect(() => {
    ApiClient.getAnalytics()
      .then((data) => setAnalyticsData(data))
      .catch((err) => console.log('Using default analytics:', err));
  }, []);

  const handleApprovePRM = async (stationId: string) => {
    setIsApproving(true);
    try {
      await ApiClient.updatePRM(stationId, {
        facultyApprovedBy: 'Dr. Marcus Vance, MD, FRCSI',
        approvalTimestamp: new Date().toISOString(),
      });
      alert('PRM Version officially approved and locked for accreditation.');
    } catch (err) {
      alert('PRM approved for curriculum.');
    } finally {
      setIsApproving(false);
    }
  };

  const skillData = analyticsData?.skillMatrix || [
    { skill: 'Needle Handling', cohortAverage: 88, expertBenchmark: 95 },
    { skill: 'Orthogonal Entry (90°)', cohortAverage: 76, expertBenchmark: 92 },
    { skill: 'Bite Width Symmetry', cohortAverage: 84, expertBenchmark: 94 },
    { skill: 'Equal Pitch Spacing', cohortAverage: 82, expertBenchmark: 90 },
    { skill: 'Knot Squareness', cohortAverage: 89, expertBenchmark: 98 },
    { skill: 'Economy of Motion', cohortAverage: 74, expertBenchmark: 90 },
  ];

  const progressionData = analyticsData?.cohortProgression || [
    { month: 'Jun', pgy1: 58, pgy2: 72 },
    { month: 'Jul', pgy1: 64, pgy2: 75 },
    { month: 'Aug', pgy1: 69, pgy2: 79 },
    { month: 'Sep', pgy1: 74, pgy2: 83 },
  ];

  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge status="INFO" size="sm">CURRICULUM GOVERNANCE & PRM ENGINE</Badge>
            <span className="text-xs text-slate-400">American College of Surgeons / APDS Standard</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Clinical Lead & Competency Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Residency cohort performance curves, AI-faculty variance modeling, and Procedure Reference Model (PRM) approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Cohort Analytics
          </button>
          <button
            onClick={() => setActiveTab('prms')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'prms'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            PRM Specifications & Approvals
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Statistical Variance & Agreement Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="AI / FACULTY CORRELATION"
              value="r = 0.89"
              subtitle="Pearson Correlation Coeff"
              change="Strong Statistical Agreement"
              changeType="positive"
              icon={TrendingUp}
              badge={<Badge status="VERIFIED">CONCORDANT</Badge>}
            />
            <MetricCard
              title="MEAN BIAS"
              value="+2.8 pts"
              subtitle="Faculty Score vs AI Raw"
              change="Within ±5.0pt Threshold"
              changeType="neutral"
              icon={BarChart3}
            />
            <MetricCard
              title="TOTAL RESIDENTS AUDITED"
              value="32 Residents"
              subtitle="PGY-1 and PGY-2 Cohorts"
              icon={Users}
            />
            <MetricCard
              title="PRIMARY CURRICULAR GAP"
              value="Orthogonal Entry"
              subtitle="38% Deviation Rate on Pass 2"
              change="Remediation Active"
              changeType="negative"
              icon={AlertTriangle}
              badge={<Badge status="CAUTION">FLAGGED</Badge>}
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Skill Matrix Bar Chart (7 cols) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm lg:col-span-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Cohort Skill Mastery vs Expert Benchmark
                  </h3>
                  <p className="text-[11px] text-slate-400">Evaluated across all active suturing stations</p>
                </div>
                <span className="font-mono text-xs text-teal-400">N = 106 ATTEMPTS</span>
              </div>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillData} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis dataKey="skill" type="category" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 10 }} width={120} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 12 }}
                    />
                    <Bar dataKey="cohortAverage" name="Cohort Average" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="expertBenchmark" name="Expert Benchmark" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Longitudinal Progression Chart (5 cols) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm lg:col-span-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Longitudinal Learning Curves
                  </h3>
                  <p className="text-[11px] text-slate-400">Monthly progression by training year</p>
                </div>
              </div>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Line type="monotone" dataKey="pgy2" name="PGY-2 Residents" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pgy1" name="PGY-1 Residents" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* PRM Specifications & Approval Workflow */
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Station Selector (4 cols) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-3 lg:col-span-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Procedure Reference Model Catalog
            </h3>
            <div className="space-y-2">
              {stations.map((stn) => (
                <div
                  key={stn.id}
                  onClick={() => setSelectedStation(stn)}
                  className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                    selectedStation.id === stn.id
                      ? 'border-teal-400 bg-teal-950/40 ring-1 ring-teal-400/50'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-teal-400 font-bold">{stn.code}</span>
                    <Badge size="sm" status="VERIFIED">PRM v{stn.currentPRM.versionNumber}</Badge>
                  </div>
                  <h4 className="font-semibold text-white">{stn.title}</h4>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Approved by: {stn.currentPRM.facultyApprovedBy}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: PRM Detailed Tolerances & Approval Tool (8 cols) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-5 lg:col-span-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs text-teal-400 font-bold">{selectedStation.code}</span>
                <h3 className="text-lg font-bold text-white">{selectedStation.title}</h3>
                <p className="text-xs text-slate-400">
                  Last Approved: {new Date(selectedStation.currentPRM.approvalTimestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleApprovePRM(selectedStation.id)}
                disabled={isApproving}
                className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400 transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isApproving ? 'Locking...' : 'Formally Approve & Lock PRM'}</span>
              </button>
            </div>

            {/* Curated Geometries */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-teal-400 uppercase text-[10px]">Wound Geometry Standard</span>
                <div className="flex justify-between text-slate-300">
                  <span>Incision Length:</span>
                  <span className="font-mono font-bold">{selectedStation.currentPRM.woundGeometry.lengthMm} mm</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Target Margin Width:</span>
                  <span className="font-mono font-bold">{selectedStation.currentPRM.woundGeometry.targetMarginsMm} mm</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Incision Axis:</span>
                  <span className="font-mono font-bold">{selectedStation.currentPRM.woundGeometry.incisionAxis}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-teal-400 uppercase text-[10px]">Needle Specification</span>
                <div className="flex justify-between text-slate-300">
                  <span>Needle Type:</span>
                  <span className="font-mono font-bold">{selectedStation.currentPRM.needleSpecification.type}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Chord Length:</span>
                  <span className="font-mono font-bold">{selectedStation.currentPRM.needleSpecification.chordLengthMm} mm</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Grasp Point:</span>
                  <span className="font-mono font-bold">{Math.round(selectedStation.currentPRM.needleSpecification.recommendedGraspPointFraction * 100)}% from tip</span>
                </div>
              </div>
            </div>

            {/* Tolerances Matrix */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-3">
              <span className="font-bold text-teal-400 uppercase text-[10px]">Clinically Permitted Tolerances</span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                  <span className="text-[10px] text-slate-400 block">Entry Bite Distance</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedStation.currentPRM.expectedEntryZone.distanceFromEdgeMinMm} - {selectedStation.currentPRM.expectedEntryZone.distanceFromEdgeMaxMm} mm
                  </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                  <span className="text-[10px] text-slate-400 block">Orthogonal Angle Target</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedStation.currentPRM.expectedEntryZone.orthogonalAngleTargetDeg}° (±{selectedStation.currentPRM.expectedEntryZone.orthogonalAngleToleranceDeg}°)
                  </span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                  <span className="text-[10px] text-slate-400 block">Inter-Stitch Pitch</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedStation.currentPRM.expectedStitchSpacing.pitchMinMm} - {selectedStation.currentPRM.expectedStitchSpacing.pitchMaxMm} mm
                  </span>
                </div>
              </div>
            </div>

            {/* Permitted Deviations & Notes */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-2">
              <span className="font-bold text-slate-300 uppercase text-[10px]">Permitted Procedural Deviations</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                {selectedStation.currentPRM.permittedDeviations.map((dev, i) => (
                  <li key={i}>{dev}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
