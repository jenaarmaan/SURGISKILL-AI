import React, { useState } from 'react';
import {
  Users,
  Award,
  Calendar,
  Layers,
  Plus,
  Mail,
  UserCheck,
  Search,
} from 'lucide-react';
import { Badge } from '../components/common/Badge.tsx';

interface CohortManagementViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const CohortManagementView: React.FC<CohortManagementViewProps> = ({ onNavigate }) => {
  const cohorts = [
    {
      id: 'cohort_pgy2_2026',
      name: 'General Surgery Class of 2026 (PGY-2)',
      academicYear: '2026-2027',
      residentCount: 16,
      programDirector: 'Prof. Sarah Jenkins, MD, FACS',
      activeStationsCount: 4,
      osceScheduledDate: 'Oct 05, 2026',
      residents: [
        { id: '1', name: 'Dr. Alex Chen', email: 'alex.chen@med.edu', status: 'ON_TRACK', completedStations: 3, averageScore: 82.0 },
        { id: '2', name: 'Dr. Liam O\'Connor', email: 'liam.oc@med.edu', status: 'HONORS', completedStations: 4, averageScore: 91.0 },
        { id: '3', name: 'Dr. Michael Chang', email: 'm.chang@med.edu', status: 'ON_TRACK', completedStations: 3, averageScore: 84.5 },
        { id: '4', name: 'Dr. Samantha Blake', email: 's.blake@med.edu', status: 'NEEDS_REMEDIATION', completedStations: 2, averageScore: 69.0 },
      ],
    },
    {
      id: 'cohort_pgy1_2027',
      name: 'General Surgery Class of 2027 (PGY-1)',
      academicYear: '2026-2027',
      residentCount: 18,
      programDirector: 'Dr. Marcus Vance, MD, FRCSI',
      activeStationsCount: 2,
      osceScheduledDate: 'Nov 14, 2026',
      residents: [
        { id: '5', name: 'Dr. Priya Patel', email: 'p.patel@med.edu', status: 'ON_TRACK', completedStations: 1, averageScore: 66.0 },
        { id: '6', name: 'Dr. David Kim', email: 'd.kim@med.edu', status: 'ON_TRACK', completedStations: 2, averageScore: 74.0 },
      ],
    },
  ];

  const [selectedCohort, setSelectedCohort] = useState(cohorts[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge status="INFO" size="sm">ACADEMIC PROGRAM ROSTERS</Badge>
            <span className="text-xs text-slate-400">Institutional Residency Governance</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Residency Cohort & User Management
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Cohort rosters, station curriculum assignments, and individual competency milestone tracking.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Cohorts List (4 cols) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-3 lg:col-span-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Residency Classes</h3>
          <div className="space-y-2">
            {cohorts.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCohort(c)}
                className={`cursor-pointer rounded-xl border p-4 text-xs transition ${
                  selectedCohort.id === c.id
                    ? 'border-teal-400 bg-teal-950/40 ring-1 ring-teal-400/50'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-teal-400 font-bold">{c.academicYear}</span>
                  <Badge size="sm" status="INFO">{c.residentCount} Residents</Badge>
                </div>
                <h4 className="font-bold text-white text-sm">{c.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Director: {c.programDirector}</p>
                <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                  <span>Active Stations: {c.activeStationsCount}</span>
                  <span>OSCE: {c.osceScheduledDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Resident Roster Table (8 cols) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedCohort.name}</h3>
              <p className="text-xs text-slate-400">Class Roster & Individual Milestone Progress</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 font-medium">RESIDENT</th>
                  <th className="pb-3 font-medium">EMAIL</th>
                  <th className="pb-3 font-medium">STATIONS DONE</th>
                  <th className="pb-3 font-medium">MEAN SCORE</th>
                  <th className="pb-3 font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedCohort.residents.map((res) => (
                  <tr key={res.id} className="group hover:bg-slate-850/50">
                    <td className="py-3 font-semibold text-white">{res.name}</td>
                    <td className="py-3 font-mono text-slate-400">{res.email}</td>
                    <td className="py-3 font-mono text-slate-300">{res.completedStations} / {selectedCohort.activeStationsCount}</td>
                    <td className="py-3 font-mono font-bold text-teal-300">{res.averageScore}%</td>
                    <td className="py-3">
                      <Badge
                        size="sm"
                        status={
                          res.status === 'HONORS'
                            ? 'VERIFIED'
                            : res.status === 'ON_TRACK'
                            ? 'GREEN'
                            : 'CRITICAL'
                        }
                      >
                        {res.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
