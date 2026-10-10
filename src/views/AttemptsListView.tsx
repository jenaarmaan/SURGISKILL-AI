import React, { useState } from 'react';
import {
  FileText,
  Search,
  Award,
  ChevronRight,
  Clock,
  User,
  Filter,
} from 'lucide-react';
import { AttemptRecord } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';

interface AttemptsListViewProps {
  attempts: AttemptRecord[];
  onNavigate: (view: string, id?: string) => void;
}

export const AttemptsListView: React.FC<AttemptsListViewProps> = ({ attempts, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  const filtered = attempts.filter((att) => {
    const matchesSearch =
      att.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.stationTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.stationCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerification =
      filterVerified === 'ALL'
        ? true
        : filterVerified === 'VERIFIED'
        ? att.isFacultyVerified
        : !att.isFacultyVerified;

    return matchesSearch && matchesVerification;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge status="INFO" size="sm">SIMULATION ATTEMPTS REPOSITORY</Badge>
            <span className="text-xs text-slate-400">Timestamped Multi-Modal Records</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Attempt Performance Reports
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Searchable registry of resident suturing recordings, computer vision evaluations, and faculty score overrides.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterVerified('ALL')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filterVerified === 'ALL'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Attempts ({attempts.length})
          </button>
          <button
            onClick={() => setFilterVerified('PENDING')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filterVerified === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilterVerified('VERIFIED')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filterVerified === 'VERIFIED'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Faculty Verified
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trainee, station, code..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Attempts Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-medium">TRAINEE / RESIDENT</th>
                <th className="pb-3 font-medium">STATION / PROCEDURE</th>
                <th className="pb-3 font-medium">DATE / DURATION</th>
                <th className="pb-3 font-medium">AI SCORE</th>
                <th className="pb-3 font-medium">FINAL SCORE</th>
                <th className="pb-3 font-medium">STATUS</th>
                <th className="pb-3 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((att) => (
                <tr key={att.id} className="group hover:bg-slate-850/50">
                  <td className="py-3">
                    <span className="font-semibold text-white block">{att.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{att.userRank}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-white block">{att.stationTitle}</span>
                    <span className="text-[10px] text-teal-400 font-mono">{att.stationCode}</span>
                  </td>
                  <td className="py-3 text-slate-400">
                    <div>{new Date(att.startTime).toLocaleDateString()}</div>
                    <span className="text-[10px] text-slate-500 font-mono">{att.durationSeconds}s duration</span>
                  </td>
                  <td className="py-3 font-mono font-bold text-teal-400">
                    {att.compositeScore ? `${att.compositeScore}%` : 'Evaluating'}
                  </td>
                  <td className="py-3 font-mono font-bold text-emerald-400">
                    {att.facultyFinalScore ? `${att.facultyFinalScore}%` : <span className="text-slate-500">Pending</span>}
                  </td>
                  <td className="py-3">
                    {att.isFacultyVerified ? (
                      <Badge size="sm" status="VERIFIED">VERIFIED</Badge>
                    ) : (
                      <Badge size="sm" status="PENDING">IN REVIEW QUEUE</Badge>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onNavigate('attempt-detail', att.id)}
                        className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 hover:text-white"
                      >
                        Report
                      </button>
                      <button
                        onClick={() => onNavigate('faculty-review', att.id)}
                        className="rounded bg-teal-500/20 border border-teal-500/40 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-500 hover:text-slate-950 transition"
                      >
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
