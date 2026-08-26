"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { api } from "../../lib/api";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [cohortId, setCohortId] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        loginStore(res.user, res.token);
        router.push("/dashboard");
      } else {
        const res = await api.register({
          email,
          password,
          name,
          role,
          cohortId: cohortId || undefined,
        });
        loginStore(res.user, res.token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] px-6">
      <div className="w-full max-w-md premium-card p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-2xl text-white">
            S
          </div>
          <h2 className="font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SurgiSkill AI Assessment
          </h2>
          <p className="text-slate-400 text-sm">
            {isLogin ? "Sign in to access your platform dashboard" : "Register a new clinical user account"}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-lg mb-6 border border-slate-800">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              isLogin ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              !isLogin ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                placeholder="Dr. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="premium-input"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              placeholder="jane.doe@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="premium-input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="premium-input"
            />
          </div>

          {!isLogin && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-300">Platform Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="premium-input"
                >
                  <option value="STUDENT">Student Practitioner</option>
                  <option value="FACULTY">Faculty Evaluator</option>
                  <option value="CLINICAL_LEAD">Clinical Lead Director</option>
                </select>
              </div>

              {role === "STUDENT" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">Cohort ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter cohort UUID if provided"
                    value={cohortId}
                    onChange={(e) => setCohortId(e.target.value)}
                    className="premium-input"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 mt-4 text-base font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? "Authenticating..." : isLogin ? "Access Dashboard" : "Register Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
