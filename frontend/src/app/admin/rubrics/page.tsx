"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";
import { api } from "../../../lib/api";
import { LogOut, ArrowLeft, Plus, Trash, Settings, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RubricsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [rubric, setRubric] = useState<any>(null);

  // Form states for creating a new station
  const [newStationName, setNewStationName] = useState("");
  const [newStationDesc, setNewStationDesc] = useState("");
  const [showCreateStation, setShowCreateStation] = useState(false);

  // Form states for rolling a new version
  const [motionWeight, setMotionWeight] = useState(0.4);
  const [checklistWeight, setChecklistWeight] = useState(0.6);
  const [checklistSteps, setChecklistSteps] = useState<any[]>([
    { sequenceOrder: 1, description: "Engage surgical mask and sterile gloves", penaltyPoints: 5 },
    { sequenceOrder: 2, description: "Position needle perpendicular at 90 degrees to practice pad", penaltyPoints: 10 },
    { sequenceOrder: 3, description: "Drive needle curved trajectory through tissue simulation", penaltyPoints: 10 },
    { sequenceOrder: 4, description: "Perform primary double throw knot tie", penaltyPoints: 10 },
    { sequenceOrder: 5, description: "Snug knot throw flat without micro-tearing pad", penaltyPoints: 5 },
  ]);

  const [newStepDesc, setNewStepDesc] = useState("");
  const [newStepPenalty, setNewStepPenalty] = useState(5);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "CLINICAL_LEAD" && user?.role !== "ADMIN"))) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, isLoading, router]);

  const loadStations = async () => {
    try {
      const data = await api.getStations();
      setStations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStations();
    }
  }, [isAuthenticated]);

  const handleSelectStation = async (station: any) => {
    setSelectedStation(station);
    setSaveSuccess(false);
    setSaveError("");
    try {
      const activeRubric = await api.getRubric(station.id);
      setRubric(activeRubric);
      setMotionWeight(activeRubric.motionEfficiencyWeight);
      setChecklistWeight(activeRubric.checklistWeight);
      setChecklistSteps(activeRubric.checklistSteps || []);
    } catch (err) {
      // If no rubric configured yet
      setRubric(null);
      setChecklistSteps([]);
    }
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    try {
      await api.createStation({
        name: newStationName,
        description: newStationDesc,
        checklistSteps: [
          { sequenceOrder: 1, description: "Verify patient identity and sign consent forms", penaltyPoints: 10 },
          { sequenceOrder: 2, description: "Apply antiseptic swab to incisions boundaries", penaltyPoints: 10 },
        ],
        motionEfficiencyWeight: 0.4,
        checklistWeight: 0.6,
      });
      setNewStationName("");
      setNewStationDesc("");
      setShowCreateStation(false);
      await loadStations();
    } catch (err: any) {
      setSaveError(err.message || "Failed to create station.");
    }
  };

  const handleAddStep = () => {
    if (!newStepDesc) return;
    const nextSeq = checklistSteps.length + 1;
    setChecklistSteps([
      ...checklistSteps,
      { sequenceOrder: nextSeq, description: newStepDesc, penaltyPoints: newStepPenalty },
    ]);
    setNewStepDesc("");
    setNewStepPenalty(5);
  };

  const handleRemoveStep = (index: number) => {
    const updated = checklistSteps.filter((_, idx) => idx !== index).map((step, idx) => ({
      ...step,
      sequenceOrder: idx + 1,
    }));
    setChecklistSteps(updated);
  };

  const handleRollVersion = async () => {
    if (!selectedStation) return;
    setSaveError("");
    setSaveSuccess(false);

    try {
      const rolled = await api.addRubricVersion(selectedStation.id, {
        motionEfficiencyWeight: motionWeight,
        checklistWeight: checklistWeight,
        checklistSteps: checklistSteps,
      });
      setRubric(rolled);
      setSaveSuccess(true);
      await loadStations();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save new rubric version.");
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SurgiSkill Clinical Manager
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs bg-indigo-950 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded">
            {user.role} Control
          </span>
        </div>
      </header>

      <div className="flex-grow flex max-w-7xl w-full mx-auto p-6 gap-6 overflow-hidden">
        {/* Left column: Stations list */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="premium-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-white">OSCE Assessment Stations</h2>
              <button
                onClick={() => setShowCreateStation(!showCreateStation)}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1.5 rounded flex items-center gap-1 font-semibold"
              >
                <Plus size={12} /> New Station
              </button>
            </div>

            {showCreateStation && (
              <form onSubmit={handleCreateStation} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Station Name"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="premium-input text-xs"
                  required
                />
                <textarea
                  placeholder="Instructions description"
                  value={newStationDesc}
                  onChange={(e) => setNewStationDesc(e.target.value)}
                  className="premium-input text-xs h-16"
                  required
                />
                <button type="submit" className="btn-primary py-1.5 text-xs">
                  Create Station Record
                </button>
              </form>
            )}

            <div className="flex flex-col gap-3">
              {stations.map((st) => {
                const isSelected = selectedStation && selectedStation.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => handleSelectStation(st)}
                    className={`p-4 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? "bg-indigo-950/30 border-indigo-500/70"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <h3 className="font-bold text-sm text-white">{st.name}</h3>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-1">{st.description}</p>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400 mt-2 inline-block">
                      Active Rubric: v{st.rubrics?.find((r: any) => r.active)?.version || 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Rubric Checklist editor */}
        <div className="w-2/3 flex flex-col overflow-y-auto">
          {selectedStation ? (
            <div className="premium-card p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-xl text-white">Rubric Configuration: {selectedStation.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{selectedStation.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Active Version</span>
                  <div className="text-xl font-bold text-indigo-400 mt-1">
                    v{rubric?.version || 1}
                  </div>
                </div>
              </div>

              {saveError && <p className="text-sm text-red-400">{saveError}</p>}
              {saveSuccess && (
                <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} /> New Rubric version created and set active successfully.
                </div>
              )}

              {/* Parameter weights editing */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    <Settings size={14} /> Checklist Score weight (0.0 to 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={checklistWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setChecklistWeight(val);
                      setMotionWeight(Number((1 - val).toFixed(2)));
                    }}
                    className="premium-input text-xs"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    <Settings size={14} /> Motion Score weight (0.0 to 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={motionWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMotionWeight(val);
                      setChecklistWeight(Number((1 - val).toFixed(2)));
                    }}
                    className="premium-input text-xs"
                  />
                </div>
              </div>

              {/* Checklist steps list */}
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-slate-300">Procedural Steps Sequence</h4>

                <div className="flex flex-col gap-3">
                  {checklistSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                          {step.sequenceOrder}
                        </span>
                        <span className="text-slate-300">{step.description}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-red-400 font-bold">-{step.penaltyPoints} pts</span>
                        <button
                          onClick={() => handleRemoveStep(idx)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Step Form */}
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex gap-4 items-end">
                  <div className="flex-grow flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400">Step Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Inspect incision parameters and apply suture knot"
                      value={newStepDesc}
                      onChange={(e) => setNewStepDesc(e.target.value)}
                      className="premium-input text-xs"
                    />
                  </div>
                  <div className="w-24 flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400">Penalty pts</label>
                    <input
                      type="number"
                      value={newStepPenalty}
                      onChange={(e) => setNewStepPenalty(Number(e.target.value))}
                      className="premium-input text-xs"
                    />
                  </div>
                  <button
                    onClick={handleAddStep}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2.5 rounded font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Step
                  </button>
                </div>
              </div>

              {/* Submit / Roll version */}
              <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20 flex flex-col gap-4 mt-4">
                <h4 className="text-xs font-semibold text-indigo-400 flex items-center gap-2">
                  <ShieldCheck size={16} /> Rubric Version Lock & Calibration
                </h4>
                <p className="text-xs text-slate-400">
                  Saving updates increments the rubric version index. Active evaluation sessions in progress will continue using their initial locked version to prevent student grading bias.
                </p>
                <button
                  onClick={handleRollVersion}
                  className="btn-primary self-start py-2 px-6 text-xs"
                >
                  Roll New Rubric Version
                </button>
              </div>
            </div>
          ) : (
            <div className="premium-card p-12 text-center text-slate-500 flex flex-col items-center justify-center flex-grow">
              <Settings size={48} className="text-slate-600 mb-4" />
              <h3 className="font-bold text-lg text-slate-400">No Station Selected</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">
                Select an assessment station on the left pane to edit sequence alignments, configure penalty deductions, and publish updated grading profiles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
