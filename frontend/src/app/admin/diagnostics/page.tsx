"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";
import { api } from "../../../lib/api";
import { ArrowLeft, RefreshCw, Activity, ShieldAlert, Award, FileText, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function DiagnosticsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuthStore();

  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [trackingSession, setTrackingSession] = useState<any>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "CLINICAL_LEAD" && user?.role !== "ADMIN"))) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, isLoading, router]);

  const loadAttempts = async () => {
    try {
      const list = await api.getAttempts();
      setAttempts(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAttempts();
    }
  }, [isAuthenticated]);

  const selectAttempt = async (att: any) => {
    setSelectedAttempt(att);
    setTrackingSession(null);
    setLoadingTracking(true);
    setErrorMsg("");

    try {
      const data = await api.getTrackingDetails(att.id);
      setTrackingSession(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load tracking diagnostics. Session might not have processed yet.");
    } finally {
      setLoadingTracking(false);
    }
  };

  // Convert frame coordinates for Recharts plotting
  const getChartData = () => {
    if (!trackingSession || !trackingSession.landmarks) return [];
    return trackingSession.landmarks.map((frame: any) => ({
      time: frame.timestamp,
      leftHandX: frame.leftHand?.wrist?.x || null,
      rightHandX: frame.rightHand?.wrist?.x || null,
      instrumentX: frame.instrument?.centroid?.x || null,
      confidence: frame.confidence,
    }));
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
            SurgiSkill CV Diagnostics
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded">
            Engineering Logs
          </span>
        </div>
      </header>

      <div className="flex-grow flex max-w-7xl w-full mx-auto p-6 gap-6 overflow-hidden">
        {/* Left Side: Attempts */}
        <div className="w-1/3 flex flex-col gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 overflow-y-auto">
          <h3 className="font-bold text-sm text-slate-300 px-2 uppercase tracking-wide">Attempts Queue</h3>
          <div className="flex flex-col gap-2">
            {attempts.map((att) => {
              const isSelected = selectedAttempt?.id === att.id;
              return (
                <div
                  key={att.id}
                  onClick={() => selectAttempt(att)}
                  className={`p-4 rounded-lg cursor-pointer border text-xs transition-all ${
                    isSelected
                      ? "bg-indigo-950/30 border-indigo-500/70"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{att.station?.name}</h4>
                      <p className="text-indigo-400 mt-0.5">By: {att.student?.name}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300">
                      {att.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Diagnostics */}
        <div className="w-2/3 flex flex-col overflow-y-auto bg-slate-900/20 p-6 rounded-xl border border-slate-800/60">
          {selectedAttempt ? (
            <div className="flex flex-col gap-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs text-slate-500">Attempt: {selectedAttempt.id}</span>
                <h2 className="font-bold text-xl text-white mt-1">Spatial Trajectory & Quality Logs</h2>
              </div>

              {loadingTracking && (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                  <RefreshCw className="animate-spin text-indigo-500 mb-3" size={24} />
                  <p className="text-xs">Parsing frame streams & calculating velocity maps...</p>
                </div>
              )}

              {errorMsg && (
                <div className="p-6 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <ShieldAlert size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {trackingSession && (
                <div className="flex flex-col gap-6">
                  {/* Quality check scores */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Overall Confidence</span>
                      <div className="text-xl font-bold text-white mt-1">{(trackingSession.overallConfidence * 100).toFixed(0)}%</div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Motion Blur</span>
                      <div className="text-xl font-bold text-white mt-1">{trackingSession.qualitySummary?.blurPercent}%</div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Dim Lighting</span>
                      <div className="text-xl font-bold text-white mt-1">{trackingSession.qualitySummary?.dimLightingPercent}%</div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Occluded Frames</span>
                      <div className="text-xl font-bold text-white mt-1">{trackingSession.qualitySummary?.occlusionPercent}%</div>
                    </div>
                  </div>

                  {/* Recharts Spatial Trajectory graph */}
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-wider">Spatial Trajectory Graph (X-Axis Coordinates)</h4>
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getChartData()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" name="Time" unit="s" tick={{ fill: "#64748b", fontSize: 10 }} />
                          <YAxis domain={[0.0, 1.0]} name="X Coordinate" tick={{ fill: "#64748b", fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #334155" }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="leftHandX" name="Left Hand" stroke="#10b981" dot={false} strokeWidth={2} />
                          <Line type="monotone" dataKey="rightHandX" name="Right Hand" stroke="#6366f1" dot={false} strokeWidth={2} />
                          <Line type="monotone" dataKey="instrumentX" name="Needle Holder" stroke="#a855f7" dot={false} strokeWidth={2} />
                          <Line type="monotone" dataKey="confidence" name="Tracking Conf" stroke="#f59e0b" strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Kinematics metrics details */}
                  <div className="p-6 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-wider">Computed Kinematics Features (Kinematic Profiler)</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs text-slate-400">
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Left Hand Path Length:</span>
                        <span className="font-bold text-white">{trackingSession.features?.pathLengthLeftHand} units</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Right Hand Path Length:</span>
                        <span className="font-bold text-white">{trackingSession.features?.pathLengthRightHand} units</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Left Hand Displacement:</span>
                        <span className="font-bold text-white">{trackingSession.features?.displacementLeftHand} units</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Right Hand Displacement:</span>
                        <span className="font-bold text-white">{trackingSession.features?.displacementRightHand} units</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Right Hand Peak Speed:</span>
                        <span className="font-bold text-white">{trackingSession.features?.peakVelocityRightHand} units/s</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Right Hand Average Speed:</span>
                        <span className="font-bold text-white">{trackingSession.features?.avgVelocityRightHand} units/s</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Right Hand Smoothness (SD):</span>
                        <span className="font-bold text-white">{trackingSession.features?.smoothnessRightHand}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Right Hand Direction Changes:</span>
                        <span className="font-bold text-white">{trackingSession.features?.directionChangesRightHand}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Right Hand Trajectory Efficiency:</span>
                        <span className="font-bold text-white">{(trackingSession.features?.trajectoryEfficiency * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1.5">
                        <span>Detected Instrument Regrips:</span>
                        <span className="font-bold text-white">{trackingSession.features?.detectedRegrips} (Conf: {(trackingSession.features?.regripConfidence * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Processing metadata logs */}
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex flex-col gap-2">
                    <h4 className="font-semibold text-slate-300">CV Execution Log Metadata</h4>
                    <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                      <p>• Tracking Provider: <span className="text-white font-mono">{trackingSession.provider} (v{trackingSession.providerVersion})</span></p>
                      <p>• Code Version: <span className="text-white font-mono">{trackingSession.processingVersion}</span></p>
                      <p>• Total Extracted Frames: <span className="text-white font-mono">{trackingSession.frameCount}</span></p>
                      <p>• Total Processed Frames: <span className="text-white font-mono">{trackingSession.processedFrameCount}</span></p>
                      <p>• Tracking Run-Duration: <span className="text-white font-mono">{trackingSession.duration.toFixed(2)}s</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 p-12 flex flex-col items-center justify-center flex-grow">
              <Activity size={48} className="text-slate-600 mb-4" />
              <h3 className="font-bold text-slate-400">Diagnostics Viewer</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Select a logged residency attempt in the sidebar queue to inspect high-frequency spatial tracking logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
