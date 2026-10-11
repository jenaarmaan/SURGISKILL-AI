import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  Users,
  Award,
  ChevronRight,
  Play,
  RotateCw,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { OSCEExam } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export interface OSATSGlobalRating {
  respectForTissue: number;
  timeAndMotion: number;
  instrumentHandling: number;
  knowledgeOfInstruments: number;
  flowOfOperation: number;
  useOfAssistants: number;
  overallPerformance: number;
}

interface DigitalOsceViewProps {
  exam: OSCEExam;
  onNavigate: (view: string, id?: string) => void;
}

export const DigitalOsceView: React.FC<DigitalOsceViewProps> = ({ exam, onNavigate }) => {
  const { role, currentUser } = useAuth();
  const isFaculty = role === 'FACULTY' || role === 'CLINICAL_LEAD' || role === 'INSTITUTION_ADMIN';

  const [activeStationIndex, setActiveStationIndex] = useState(0);
  const [stationSecondsRemaining, setStationSecondsRemaining] = useState(600); // 10 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('Dr. Alex Chen (PGY-2)');
  const [osatsRatings, setOsatsRatings] = useState<OSATSGlobalRating>({
    respectForTissue: 4,
    timeAndMotion: 4,
    instrumentHandling: 4,
    knowledgeOfInstruments: 5,
    flowOfOperation: 4,
    useOfAssistants: 4,
    overallPerformance: 4,
  });

  const [isExamCompleted, setIsExamCompleted] = useState(false);

  const activeStation = exam.stations[activeStationIndex] || exam.stations[0];

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTimerRunning && stationSecondsRemaining > 0) {
      timer = setInterval(() => {
        setStationSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, stationSecondsRemaining]);

  const handleNextStation = () => {
    if (activeStationIndex < exam.stations.length - 1) {
      setActiveStationIndex(activeStationIndex + 1);
      setStationSecondsRemaining(600);
      setIsTimerRunning(false);
    } else {
      setIsExamCompleted(true);
      setIsTimerRunning(false);
    }
  };

  const handleRatingChange = (key: keyof OSATSGlobalRating, val: number) => {
    setOsatsRatings((prev: OSATSGlobalRating) => ({ ...prev, [key]: val }));
  };

  const osatsCriteria: Array<{ key: keyof OSATSGlobalRating; label: string; desc: string }> = [
    { key: 'respectForTissue', label: 'Respect for Tissue', desc: 'Frequently used unnecessary force on tissue vs carefully handled with minimal damage' },
    { key: 'timeAndMotion', label: 'Time and Motion', desc: 'Many unnecessary moves vs clear economy of movement and maximum efficiency' },
    { key: 'instrumentHandling', label: 'Instrument Handling', desc: 'Repeatedly made tentative moves vs fluid moves with expert instrument grip' },
    { key: 'knowledgeOfInstruments', label: 'Knowledge of Instruments', desc: 'Frequently asked for wrong instrument vs proficient knowledge of instruments' },
    { key: 'flowOfOperation', label: 'Flow of Operation', desc: 'Lacked plan or frequently hesitated vs planned course of action smoothly executed' },
    { key: 'overallPerformance', label: 'Overall Performance', desc: 'Global competence assessment benchmarked against PGY-2 level' },
  ];

  return (
    <div className="space-y-6">
      {/* OSCE Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge status="INFO" size="sm">STANDARDIZED DIGITAL OSCE</Badge>
            <span className="text-xs text-slate-400 font-mono">{exam.academicTerm}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">{exam.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            Assigned Cohort: <strong className="text-slate-200">{exam.assignedCohortName}</strong> &bull;{' '}
            {exam.assignedStudentCount} Registered Candidates &bull; 4 Synchronous Stations
          </p>
        </div>

        {/* Station Station Timer */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-950 p-4 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              STATION CLOCK
            </span>
            <span className="font-mono text-3xl font-extrabold text-teal-400">
              {String(Math.floor(stationSecondsRemaining / 60)).padStart(2, '0')}:
              {String(stationSecondsRemaining % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="rounded bg-teal-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-teal-400 transition"
            >
              {isTimerRunning ? 'Pause Clock' : 'Start Clock'}
            </button>
            <button
              onClick={() => {
                setStationSecondsRemaining(600);
                setIsTimerRunning(false);
              }}
              className="rounded border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-[10px] text-slate-400 hover:text-white"
            >
              Reset 10m
            </button>
          </div>
        </div>
      </div>

      {/* Station Stepper Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {exam.stations.map((stn, idx) => {
          const isActive = idx === activeStationIndex;
          const isCompleted = idx < activeStationIndex;
          return (
            <div
              key={stn.id}
              onClick={() => setActiveStationIndex(idx)}
              className={`cursor-pointer rounded-xl border p-3.5 transition ${
                isActive
                  ? 'border-teal-400 bg-teal-950/30 ring-1 ring-teal-400/50'
                  : isCompleted
                  ? 'border-emerald-500/30 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-bold text-teal-400">STATION {stn.stationNumber}</span>
                <span className="text-[10px] text-slate-400">{stn.durationMinutes} min</span>
              </div>
              <p className="text-xs font-semibold text-white line-clamp-1">{stn.stationTitle}</p>
              <span className="text-[10px] text-slate-400 block mt-1">Examiner: {stn.examinerName}</span>
            </div>
          );
        })}
      </div>

      {/* Active Station Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Candidate & Station Overview (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Candidate Under Evaluation
              </span>
              <Badge status="INFO" size="sm">ACTIVE STATION</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-300">
                AC
              </div>
              <div>
                <p className="text-sm font-bold text-white">{selectedStudent}</p>
                <p className="text-xs text-slate-400">Candidate ID: SURG-2026-0812 &bull; Station {activeStation.stationNumber}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Station Task Mandate:</span>
              <p className="text-slate-200">{activeStation.stationTitle}</p>
              <div className="mt-2 space-y-1">
                {activeStation.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('workspace', activeStation.stationId)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-500/20 border border-teal-500/40 py-2.5 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-slate-950 transition"
              >
                <span>Launch Live CV Assessment Feed</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: OSATS Global Rating Form (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  OSATS Standardized Examiner Rating
                </h3>
                <p className="text-[11px] text-slate-400">Objective Structured Assessment of Technical Skills</p>
              </div>
              <button
                onClick={handleNextStation}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeStationIndex === exam.stations.length - 1
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                }`}
              >
                {activeStationIndex === exam.stations.length - 1
                  ? 'Finalize OSCE Exam & Save ✓'
                  : 'Submit Station Score →'}
              </button>
            </div>

            {isExamCompleted && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>OSCE Examination Completed & Synchronized</span>
                </div>
                <p className="text-slate-300">
                  All 4 clinical stations for candidate <strong>{selectedStudent}</strong> have been evaluated and recorded. OSATS score synthesis transmitted to the Institutional Residency Registry.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onNavigate('attempts-list')}
                    className="rounded-lg bg-teal-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-teal-400"
                  >
                    View All Performance Reports
                  </button>
                  <button
                    onClick={() => {
                      setIsExamCompleted(false);
                      setActiveStationIndex(0);
                      setStationSecondsRemaining(600);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:text-white"
                  >
                    Evaluate Next Candidate
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {osatsCriteria.map((crit) => {
                const currentVal = osatsRatings[crit.key];
                return (
                  <div key={String(crit.key)} className="space-y-1.5 border-b border-slate-800/60 pb-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-white">{crit.label}</span>
                      <span className="font-mono font-bold text-teal-400">{currentVal} / 5</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{crit.desc}</p>
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleRatingChange(crit.key, val)}
                          className={`rounded border py-1.5 text-xs font-mono font-bold transition ${
                            currentVal === val
                              ? 'border-teal-400 bg-teal-950 text-teal-300 ring-1 ring-teal-400'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
