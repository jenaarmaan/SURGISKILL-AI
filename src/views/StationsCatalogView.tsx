import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Video,
  ChevronRight,
  Clock,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { SurgicalStation } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';

interface StationsCatalogViewProps {
  stations: SurgicalStation[];
  onNavigate: (view: string, id?: string) => void;
}

export const StationsCatalogView: React.FC<StationsCatalogViewProps> = ({
  stations,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Open Suturing', 'Continuous Suturing', 'Mattress Suturing', 'Laparoscopic Suturing'];

  const filtered = stations.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge status="INFO" size="sm">CURRICULUM BENCHMARK CATALOG</Badge>
            <span className="text-xs text-slate-400">ACS/APDS Standardized Simulation Units</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Surgical Stations & Procedural Rubrics
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Calibrated suture training environments with embedded PRM geometries, OSATS rubrics, and automated CV metrics.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stations or codes..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Stations Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((stn) => (
          <div
            key={stn.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition hover:border-slate-700"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-400">{stn.code}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-xs text-slate-400">{stn.category}</span>
                </div>
                <Badge
                  status={stn.difficulty === 'Fundamental' ? 'INFO' : stn.difficulty === 'Intermediate' ? 'CAUTION' : 'CRITICAL'}
                  size="sm"
                >
                  {stn.difficulty}
                </Badge>
              </div>

              <h3 className="mt-3 text-lg font-bold text-white">{stn.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{stn.description}</p>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs">
                <span className="font-mono text-[10px] text-teal-400 uppercase font-bold block">
                  Core Learning Objectives:
                </span>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  {stn.learningObjectives.slice(0, 3).map((obj, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                <span>Pass Threshold: <strong className="text-slate-200">{stn.passThreshold}%</strong></span>
                <span>Time Limit: <strong className="text-slate-200">{stn.timeLimitSeconds}s</strong></span>
                <span>Cohort Mean: <strong className="text-teal-300">{stn.averageCohortScore}%</strong></span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => onNavigate('workspace', stn.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:bg-teal-400 transition"
              >
                <Video className="h-4 w-4" />
                <span>Launch Suturing Station</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
