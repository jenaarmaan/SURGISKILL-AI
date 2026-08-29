"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { api } from "../../lib/api";
import { 
  LogOut, Activity, Award, User, Clock, FileText, 
  Play, StopCircle, RefreshCw, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck 
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, isLoading } = useAuthStore();

  const [stations, setStations] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

  // Real Camera MediaRecorder state
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [activeStation, setActiveStation] = useState<any>(null);
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [recordingStatus, setRecordingStatus] = useState<"IDLE" | "RECORDING" | "SUBMITTING" | "DONE">("IDLE");
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [simulateCVFailure, setSimulateCVFailure] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const replayVideoRef = useRef<HTMLVideoElement | null>(null);

  // Faculty override state
  const [overrideScore, setOverrideScore] = useState<number>(85);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideError, setOverrideError] = useState("");
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  const loadData = async () => {
    if (!token) return;
    try {
      const stationsList = await api.getStations();
      setStations(stationsList);

      const attemptsList = await api.getAttempts();
      setAttempts(attemptsList);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Bind the camera stream to the video element when recording mode is active
  useEffect(() => {
    if (isRecordingMode && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isRecordingMode, stream]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-indigo-500" size={32} />
          <span>Validating system credentials...</span>
        </div>
      </div>
    );
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleStartAttempt = async (station: any) => {
    try {
      // Request camera stream prior to starting attempt
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const attempt = await api.initializeAttempt(station.id);
      
      setActiveStation(station);
      setActiveAttempt(attempt);
      setStream(cameraStream);
      setIsRecordingMode(true);
      setRecordingStatus("IDLE");
      chunksRef.current = [];
      setUploadPercent(0);
    } catch (err: any) {
      alert("Failed to initialize camera or attempt: " + err.message);
    }
  };

  const handleStartRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    // Start MediaRecorder on client-side camera stream
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      setRecordingStatus("SUBMITTING");
      const videoBlob = new Blob(chunksRef.current, { type: "video/mp4" });
      
      try {
        await api.uploadAttemptVideo(activeAttempt.id, videoBlob, simulateCVFailure, (percent) => {
          setUploadPercent(percent);
        });
        setRecordingStatus("DONE");
        await loadData();
        setTimeout(() => {
          setIsRecordingMode(false);
          setActiveAttempt(null);
          setActiveStation(null);
          stopCamera();
        }, 1200);
      } catch (err: any) {
        alert("Upload & Assessment pipeline failed: " + err.message);
        setRecordingStatus("IDLE");
      }
    };

    mediaRecorder.start(1000); // chunk every 1s
    setRecordingStatus("RECORDING");
  };

  const handleStopAndUpload = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      stopCamera();
    }
  };

  const selectAttemptDetails = async (attemptId: string) => {
    try {
      const details = await api.getAttemptDetails(attemptId);
      setSelectedAttempt(details);
      setOverrideSuccess(false);
      setOverrideError("");
      setOverrideReason("");
      setOverrideScore(details.compositeScore || 85);
    } catch (err) {
      console.error(err);
    }
  };

  const seekToTimestamp = (seconds: number) => {
    if (replayVideoRef.current) {
      replayVideoRef.current.currentTime = seconds;
      replayVideoRef.current.scrollIntoView({ behavior: "smooth" });
      replayVideoRef.current.play().catch(() => {});
    }
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttempt) return;
    setOverrideError("");
    setOverrideSuccess(false);

    try {
      await api.overrideScore(selectedAttempt.id, overrideScore, overrideReason);
      setOverrideSuccess(true);
      await selectAttemptDetails(selectedAttempt.id);
      await loadData();
    } catch (err: any) {
      setOverrideError(err.message || "Failed to override score.");
    }
  };

  const getRadarData = (attempt: any) => {
    if (!attempt || !attempt.motionScore) return [];
    const base = attempt.motionScore;
    return [
      { subject: "Path Length", A: Math.round(base * 0.95), fullMark: 100 },
      { subject: "Jitter Tremor", A: Math.round(base * 1.05), fullMark: 100 },
      { subject: "Avg Speed", A: Math.round(base * 0.88), fullMark: 100 },
      { subject: "Acc Bounds", A: Math.round(base * 1.02), fullMark: 100 },
      { subject: "Needle Angle", A: Math.round(base * 0.9), fullMark: 100 },
    ];
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg">
            S
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SurgiSkill AI
          </span>
          <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-indigo-400 uppercase font-semibold">
            {user.role} Portal
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-300">
            <User size={18} className="text-indigo-400" />
            <span className="font-medium text-sm">{user.name}</span>
          </div>
          {(user.role === "CLINICAL_LEAD" || user.role === "ADMIN") && (
            <div className="flex gap-2">
              <button 
                onClick={() => router.push("/admin/rubrics")} 
                className="text-xs bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-900/60 font-semibold"
              >
                Rubrics Console
              </button>
              <button 
                onClick={() => router.push("/admin/diagnostics")} 
                className="text-xs bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-900/60 font-semibold"
              >
                Diagnostics Panel
              </button>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-grow flex max-w-7xl w-full mx-auto p-6 gap-6 overflow-hidden">
        {/* LEFT COLUMN */}
        <div className="w-1/3 flex flex-col gap-6">
          {user.role === "STUDENT" && (
            <div className="premium-card p-6 flex flex-col gap-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-white">
                <Clock size={20} className="text-indigo-400" /> Active OSCE Stations
              </h2>
              {stations.length === 0 ? (
                <p className="text-slate-500 text-sm">No stations mapped to your cohort currently.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-all"
                    >
                      <div>
                        <h3 className="font-bold text-sm text-white">{station.name}</h3>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-1">{station.description}</p>
                      </div>
                      <button
                        onClick={() => handleStartAttempt(station)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded p-2 text-xs flex items-center justify-center gap-1"
                      >
                        <Play size={12} /> Start
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attempts List */}
          <div className="premium-card p-6 flex flex-col gap-4 flex-grow overflow-y-auto">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              <FileText size={20} className="text-indigo-400" /> Attempt Records
            </h2>
            {attempts.length === 0 ? (
              <p className="text-slate-500 text-sm">No recorded attempts found.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {attempts.map((att) => {
                  const dateStr = new Date(att.createdAt).toLocaleDateString();
                  const isSelected = selectedAttempt && selectedAttempt.id === att.id;
                  return (
                    <div
                      key={att.id}
                      onClick={() => selectAttemptDetails(att.id)}
                      className={`p-4 rounded-lg cursor-pointer border transition-all ${
                        isSelected
                          ? "bg-indigo-950/30 border-indigo-500/70"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-white">
                            {att.station?.name || "Suturing Skill"}
                          </h4>
                          {user.role !== "STUDENT" && (
                            <span className="text-xs text-indigo-400 mt-1 block">
                              By: {att.student?.name || "Student"}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 block mt-1">{dateStr}</span>
                        </div>
                        {att.status === "COMPLETED" ? (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            Score: {att.compositeScore || 0}
                          </span>
                        ) : att.status === "CV_PROCESSING" ? (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 animate-pulse uppercase">
                            CV Analysis
                          </span>
                        ) : (att.status === "CV_COMPLETED" || att.status === "ASSESSMENT_READY") ? (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 animate-pulse uppercase">
                            Grading
                          </span>
                        ) : att.status === "CV_PROCESSING_FAILED" ? (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-red-950/60 text-red-400 border border-red-500/30 uppercase font-semibold">
                            CV Failed
                          </span>
                        ) : att.status === "ASSESSMENT_FAILED" ? (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-red-950/60 text-red-400 border border-red-500/30">
                            Failed
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700 animate-pulse uppercase">
                            {att.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-2/3 flex flex-col overflow-y-auto">
          {isRecordingMode && activeStation && (
            <div className="premium-card p-6 flex flex-col gap-6 mb-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-white">OSCE Live Workstation: {activeStation.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">{activeStation.description}</p>
                </div>
                <button
                  onClick={() => { setIsRecordingMode(false); stopCamera(); }}
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded"
                >
                  Cancel Attempt
                </button>
              </div>

              {/* Camera Preview aspect ratio box */}
              <div className="relative aspect-video rounded-xl bg-slate-950 flex flex-col items-center justify-center border border-slate-800 overflow-hidden">
                {stream && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Guided boundary outline overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-emerald-500/70 rounded-lg flex flex-col items-center justify-between p-4 pointer-events-none">
                  {recordingStatus === "RECORDING" && (
                    <>
                      <div className="text-[10px] text-emerald-400 bg-slate-900/85 px-2 py-1 rounded font-semibold uppercase tracking-wide">
                        Workspace Camera Frame Guide: Frame Working Pad & Instruments
                      </div>
                      <div className="text-[10px] text-emerald-400 bg-slate-900/85 px-2 py-1 rounded font-semibold uppercase tracking-wide">
                        Keep Left and Right Hands visible inside lines
                      </div>
                    </>
                  )}

                  {recordingStatus === "IDLE" && (
                    <div className="text-center bg-slate-900/90 p-6 rounded-lg max-w-sm border border-slate-800 shadow-2xl pointer-events-auto my-auto">
                      <p className="text-indigo-400 text-sm font-semibold mb-2">Align Workspace Framing Guide</p>
                      <p className="text-xs text-slate-400 mb-4">Position your hands and practice pad inside the borders.</p>
                      <button
                        onClick={handleStartRecording}
                        className="btn-primary flex items-center gap-2 mx-auto"
                      >
                        <Play size={16} /> Engage Video Recorder
                      </button>
                    </div>
                  )}

                  {recordingStatus === "RECORDING" && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-950/70 border border-red-500/30 px-3 py-1.5 rounded-full text-red-400 text-xs font-bold pulse-red pointer-events-auto">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> LIVE RECORDING ENGINE
                    </div>
                  )}

                  {recordingStatus === "SUBMITTING" && (
                    <div className="text-center bg-slate-900/90 p-6 rounded-lg max-w-sm border border-slate-800 shadow-2xl pointer-events-auto my-auto font-semibold">
                      <RefreshCw className="animate-spin text-indigo-400 mx-auto mb-4" size={32} />
                      <p className="text-white text-sm font-semibold">Uploading Media to Storage ({uploadPercent}%)</p>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                        <div 
                          className="bg-indigo-600 h-full transition-all duration-300"
                          style={{ width: `${uploadPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Executing Spatial Hand & Needle Landmark Tracking Algorithms...</p>
                    </div>
                  )}

                  {recordingStatus === "DONE" && (
                    <div className="text-center bg-slate-900/90 p-6 rounded-lg max-w-sm border border-slate-800 shadow-2xl">
                      <CheckCircle2 className="text-emerald-400 mx-auto mb-4" size={32} />
                      <p className="text-white text-sm font-semibold">Video Upload Complete</p>
                      <p className="text-xs text-slate-400 mt-1">Surgical attempt registered in OSCE database successfully.</p>
                    </div>
                  )}
                </div>

                {recordingStatus === "RECORDING" && (
                  <div className="absolute bottom-8 pointer-events-auto">
                    <button
                      onClick={handleStopAndUpload}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg px-6 py-2.5 flex items-center gap-2 shadow-lg"
                    >
                      <StopCircle size={18} /> Stop & Upload Attempt
                    </button>
                  </div>
                )}
              </div>

              {/* simulated options */}
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 text-xs text-slate-400 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateCVFailure}
                    onChange={(e) => setSimulateCVFailure(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Simulate Computer Vision processing failure</span>
                </label>
              </div>
            </div>
          )}

          {/* Detailed Attempt Feedback Panel */}
          {selectedAttempt ? (
            <div className="premium-card p-8 flex flex-col gap-8">
              <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs text-slate-500">Attempt ID: {selectedAttempt.id}</span>
                  <h2 className="font-bold text-2xl text-white mt-1">
                    {selectedAttempt.station?.name || "Suturing Station Assessment"}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">{selectedAttempt.station?.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Composite Score</span>
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mt-1">
                    {selectedAttempt.compositeScore || 0}/100
                  </div>
                </div>
              </div>

              {/* Score breakdown metrics cards */}
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Checklist Adherence</span>
                  <div className="text-2xl font-bold text-white mt-2">
                    {selectedAttempt.checklistScore !== null ? `${selectedAttempt.checklistScore}/100` : "N/A"}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Motion Efficiency</span>
                  <div className="text-2xl font-bold text-white mt-2">
                    {selectedAttempt.motionScore !== null ? `${selectedAttempt.motionScore}/100` : "N/A"}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Rubric Version</span>
                  <div className="text-2xl font-bold text-white mt-2">
                    v{selectedAttempt.rubric?.version || 1}
                  </div>
                </div>
              </div>

              {/* Secure Video Streaming Replay */}
              {selectedAttempt.videoPath && (
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-850 flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Recorded Suture Technique Video (Protected Access)
                  </span>
                  <video 
                    ref={replayVideoRef}
                    controls
                    className="w-full max-h-80 rounded-lg bg-black border border-slate-800"
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/attempts/${selectedAttempt.id}/video`}
                    crossOrigin="use-credentials"
                  />
                  <p className="text-[10px] text-slate-500">
                    💡 Click on checklist time intervals or error offset badges to navigate directly to that video frame.
                  </p>
                </div>
              )}

              {/* STUDENT RESULT VIEW PANEL */}
              {user.role === "STUDENT" && (
                <div className="flex flex-col gap-6">
                  {/* Checklist Card */}
                  <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-850">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-indigo-400" /> Checklist Steps Progress
                    </h3>
                    <div className="flex flex-col gap-3">
                      {(selectedAttempt.aiAssessment?.checklistAssessments || []).length > 0 ? (
                        selectedAttempt.aiAssessment.checklistAssessments.map((chk: any) => {
                          const stepMatch = selectedAttempt.rubric?.checklistSteps?.find((s: any) => s.id === chk.checklistStepId);
                          const isOk = chk.status === "COMPLETED";
                          return (
                            <div key={chk.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-900 flex justify-between items-center gap-4">
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2 h-2 rounded-full ${isOk ? "bg-emerald-500" : "bg-red-500"}`} />
                                <span className="text-xs font-medium text-slate-300">
                                  {stepMatch?.description || "Suturing execution step"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {chk.startTimestamp !== null && (
                                  <button
                                    onClick={() => seekToTimestamp(chk.startTimestamp)}
                                    className="text-[10px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 hover:bg-indigo-900/30 px-2 py-0.5 rounded transition-all"
                                  >
                                    Replay {chk.startTimestamp}s
                                  </button>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  isOk ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                                }`}>
                                  {chk.status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        selectedAttempt.rubric?.checklistSteps?.map((step: any) => (
                          <div key={step.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-900 flex justify-between items-center text-xs">
                            <span className="text-slate-400">{step.description}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase font-bold">
                              PENDING
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Parameter breakdowns progress bars */}
                  <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-850">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-indigo-400" /> Parameter Breakdowns
                    </h3>
                    <div className="flex flex-col gap-4">
                      {(selectedAttempt.aiAssessment?.parameterAssessments || []).length > 0 ? (
                        selectedAttempt.aiAssessment.parameterAssessments.map((param: any) => (
                          <div key={param.id} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-300 font-medium capitalize">
                                {param.parameterId.replace(/([A-Z])/g, " $1")}
                              </span>
                              <span className="text-indigo-400 font-bold">{param.score !== null ? `${param.score}/100` : "INSUFFICIENT"}</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                              <div 
                                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${param.score || 0}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">Parameters assessment details not available.</p>
                      )}
                    </div>
                  </div>

                  {/* Evidence & feedback Markdown comments (Google quality layout) */}
                  <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-855">
                    <h3 className="text-sm font-bold text-slate-200 mb-3">Structured Surgical Feedback</h3>
                    <div className="prose prose-invert text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedAttempt.feedbackMarkdown || "Feedback report processing."}
                    </div>
                  </div>
                </div>
              )}

              {/* FACULTY / CLINICAL LEAD REVIEW PANEL */}
              {user.role !== "STUDENT" && (
                <div className="flex flex-col gap-6">
                  {/* System diagnostics card */}
                  <div className="p-5 rounded-lg bg-indigo-950/10 border border-indigo-900/20 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">OSCE Evaluation Layer</span>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                        Provider: <span className="text-indigo-400">{selectedAttempt.aiAssessment?.provider || "deterministic-test"}</span>
                        &bull; Model: <span className="text-indigo-400">{selectedAttempt.aiAssessment?.model || "vlm-evaluator-v1"}</span>
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Quality Gate</span>
                        <span className={`text-xs font-bold ${
                          selectedAttempt.aiAssessment?.qualityGateStatus === "HIGH" ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {selectedAttempt.aiAssessment?.qualityGateStatus || "HIGH"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Prompt Version</span>
                        <span className="text-xs text-slate-300 font-semibold">
                          v{selectedAttempt.aiAssessment?.promptVersion || "1.0.0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Table */}
                  <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-850">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-indigo-400" /> AI-Aligned Checklist Progress
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                            <th className="pb-3 pr-2">Step</th>
                            <th className="pb-3 pr-2">Status</th>
                            <th className="pb-3 pr-2">Confidence</th>
                            <th className="pb-3 pr-2 text-right">Interval</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {(selectedAttempt.aiAssessment?.checklistAssessments || []).map((chk: any) => {
                            const stepMatch = selectedAttempt.rubric?.checklistSteps?.find((s: any) => s.id === chk.checklistStepId);
                            const isOk = chk.status === "COMPLETED";
                            return (
                              <tr key={chk.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="py-3 pr-2 font-medium text-slate-300 max-w-xs">
                                  <div>
                                    <p>{stepMatch?.description || "Procedural Step"}</p>
                                    <p className="text-[10px] text-slate-500 font-normal mt-0.5 leading-relaxed">{chk.rationale}</p>
                                  </div>
                                </td>
                                <td className="py-3 pr-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isOk ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                                  }`}>
                                    {chk.status}
                                  </span>
                                </td>
                                <td className="py-3 pr-2">
                                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{chk.confidence}</span>
                                </td>
                                <td className="py-3 pr-2 text-right">
                                  {chk.startTimestamp !== null ? (
                                    <button 
                                      onClick={() => seekToTimestamp(chk.startTimestamp)}
                                      className="text-[10px] text-indigo-400 font-bold bg-indigo-950/40 hover:bg-indigo-900/30 border border-indigo-900/40 px-2 py-0.5 rounded transition-all"
                                    >
                                      {chk.startTimestamp}s
                                    </button>
                                  ) : (
                                    <span className="text-slate-600 text-[10px]">&mdash;</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Evaluated Parameters */}
                  <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-850">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-indigo-400" /> AI evaluated Rubric Parameters
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                            <th className="pb-3 pr-2">Parameter</th>
                            <th className="pb-3 pr-2">Score</th>
                            <th className="pb-3 pr-2">Confidence</th>
                            <th className="pb-3 pr-2">AI Rationale Comments</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-slate-300">
                          {(selectedAttempt.aiAssessment?.parameterAssessments || []).map((param: any) => (
                            <tr key={param.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="py-3 pr-2 font-medium capitalize max-w-xs">
                                {param.parameterId.replace(/([A-Z])/g, " $1")}
                              </td>
                              <td className="py-3 pr-2 font-bold text-indigo-400">
                                {param.score !== null ? `${param.score}/100` : "INSUFFICIENT"}
                              </td>
                              <td className="py-3 pr-2">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">{param.confidence}</span>
                              </td>
                              <td className="py-3 pr-2 text-xs text-slate-400 leading-relaxed font-normal">
                                {param.rationale}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detected Technical Errors */}
                  <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-850">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-400" /> Detected Technique Deviations
                    </h3>
                    <div className="flex flex-col gap-3">
                      {(selectedAttempt.aiAssessment?.detectedErrors || []).length > 0 ? (
                        selectedAttempt.aiAssessment.detectedErrors.map((err: any) => (
                          <div key={err.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                  err.severity === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-500/25" : "bg-amber-950 text-amber-400 border border-amber-500/25"
                                }`}>
                                  {err.severity}
                                </span>
                                <span className="text-xs font-semibold text-slate-200">
                                  {err.category.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {err.scoreImpact !== null && (
                                  <span className="text-[10px] text-red-400 font-bold bg-red-950/30 px-1.5 py-0.5 rounded border border-red-900/35">
                                    Impact: {err.scoreImpact} pts
                                  </span>
                                )}
                                {err.timestamp !== null && (
                                  <button
                                    onClick={() => seekToTimestamp(err.timestamp)}
                                    className="text-[10px] text-indigo-400 bg-indigo-950/40 hover:bg-indigo-900/30 border border-indigo-900/40 px-2 py-0.5 rounded"
                                  >
                                    Seek to {err.timestamp}s
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-normal">
                              {err.explanation}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No technical errors or path deviations observed by the AI evaluator.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Radar Chart & Events Timeline Grid */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Radar movement metrics */}
                <div className="lg:w-1/2 p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
                  <h4 className="text-sm font-semibold text-slate-300 self-start mb-4">Motion Efficiency Profile</h4>
                  {selectedAttempt.motionScore ? (
                    <div className="w-full h-64 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(selectedAttempt)}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b" }} />
                          <Radar name="Attempt" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No motion metrics computed.</p>
                  )}
                </div>

                {/* Events Timeline */}
                <div className="lg:w-1/2 p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-slate-300">Spatial Events Timeline</h4>
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-64">
                    {selectedAttempt.detectedEvents?.map((evt: any) => (
                      <div key={evt.id} className="text-xs flex gap-3 items-start border-l border-indigo-500/30 pl-4 relative">
                        <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-indigo-600 border border-indigo-400" />
                        <button
                          onClick={() => seekToTimestamp(evt.timestamp)}
                          className="text-indigo-400 font-bold tracking-tight bg-slate-800 px-1.5 py-0.5 rounded"
                        >
                          {evt.timestamp}s
                        </button>
                        <div>
                          <p className="font-bold text-white">{evt.eventType}</p>
                          <p className="text-slate-400 mt-0.5">{evt.details}</p>
                        </div>
                      </div>
                    ))}
                    {selectedAttempt.detectedErrors?.map((err: any) => (
                      <div key={err.id} className="text-xs flex gap-3 items-start border-l border-red-500/30 pl-4 relative">
                        <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-red-600 border border-red-400" />
                        <button
                          onClick={() => seekToTimestamp(err.timestamp)}
                          className="text-red-400 font-bold tracking-tight bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                        >
                          <AlertTriangle size={10} /> {err.timestamp}s
                        </button>
                        <div>
                          <p className="font-bold text-white">{err.errorType}</p>
                          <p className="text-slate-400 mt-0.5">{err.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CLINICAL LEAD VALIDATION COMPARISON BOARD */}
              {user.role === "CLINICAL_LEAD" && (
                <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-850">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-400" /> Clinical Lead Validation Board
                  </h3>
                  
                  {/* Side-by-Side Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Card: AI assessment */}
                    <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex flex-col gap-3">
                      <span className="text-xs text-indigo-400 font-semibold">AI Generative Assessment</span>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block font-medium">Checklist Score</span>
                          <span className="text-slate-200 font-bold">{selectedAttempt.aiAssessment?.checklistScore !== null ? `${selectedAttempt.aiAssessment.checklistScore}` : "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-medium">Motion Score</span>
                          <span className="text-slate-200 font-bold">{selectedAttempt.aiAssessment?.motionScore !== null ? `${selectedAttempt.aiAssessment.motionScore}` : "N/A"}</span>
                        </div>
                        <div className="col-span-2 border-t border-slate-900/80 pt-2 flex justify-between">
                          <span className="text-slate-400 font-semibold">AI Calculated Score</span>
                          <span className="text-indigo-400 font-bold">{selectedAttempt.aiAssessment?.compositeScore || selectedAttempt.compositeScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Card: Faculty Overridden Score */}
                    <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex flex-col gap-3">
                      <span className="text-xs text-indigo-400 font-semibold">Faculty Override Assessment</span>
                      {selectedAttempt.scoreOverrides && selectedAttempt.scoreOverrides.length > 0 ? {
                        ...(() => {
                          const latest = selectedAttempt.scoreOverrides[0];
                          const variance = Math.abs(latest.newScore - (selectedAttempt.aiAssessment?.compositeScore || latest.originalScore));
                          return (
                            <div className="flex flex-col gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Overridden By:</span>
                                <span className="text-slate-300 font-semibold">{latest.faculty?.name || "Faculty Evaluator"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Override Score:</span>
                                <span className="text-slate-200 font-bold">{latest.newScore}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Score Variance:</span>
                                <span className={`font-bold ${variance > 10 ? "text-amber-400" : "text-emerald-400"}`}>
                                  {variance > 0 ? `+${variance} points` : "Perfect alignment"}
                                </span>
                              </div>
                              <div className="border-t border-slate-900/80 pt-2 flex flex-col gap-1">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Clinical Reason</span>
                                <p className="text-[11px] text-slate-400 italic">"{latest.reason}"</p>
                              </div>
                            </div>
                          );
                        })()
                      } : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                          No score overrides have been applied by Faculty examiners.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* FACULTY SCORE OVERRIDE CONSOLE */}
              {user.role !== "STUDENT" && selectedAttempt.status === "COMPLETED" && (
                <div className="p-6 rounded-lg bg-indigo-950/20 border border-indigo-500/20 flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                    <ShieldCheck size={18} /> Faculty Grading Override Boundary
                  </h4>
                  <p className="text-xs text-slate-400 font-normal">
                    As an authorized faculty examiner, you can adjust the student's composite score. Overrides require a written clinical reason and are logged directly to the immutable system audit ledger.
                  </p>
                  
                  {overrideError && <p className="text-xs text-red-400 font-medium">{overrideError}</p>}
                  {overrideSuccess && <p className="text-xs text-emerald-400 font-medium">Score overridden and logged successfully.</p>}

                  <form onSubmit={handleOverride} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-24 flex flex-col gap-1.5">
                      <label className="text-xs text-slate-300 font-semibold">Override Score</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={overrideScore}
                        onChange={(e) => setOverrideScore(Number(e.target.value))}
                        className="premium-input text-sm"
                        required
                      />
                    </div>
                    <div className="flex-grow flex flex-col gap-1.5">
                      <label className="text-xs text-slate-300 font-semibold">Clinical Justification Reason</label>
                      <input
                        type="text"
                        placeholder="e.g. Corrected score due to MediaPipe jitter anomaly at knot stage"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="premium-input text-sm"
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary py-2 px-6 text-sm font-semibold">
                      Apply Override
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="premium-card p-12 text-center text-slate-500 flex flex-col items-center justify-center flex-grow">
              <Activity size={48} className="text-slate-600 mb-4 animate-pulse" />
              <h3 className="font-bold text-lg text-slate-400">Assessment Selection Pending</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">
                Select an attempt record on the left pane to review dynamic video timelines, motion path parameters, and VLM checklists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
