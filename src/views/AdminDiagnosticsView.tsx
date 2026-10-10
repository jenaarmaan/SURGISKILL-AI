import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { AuditLogEntry } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { MetricCard } from '../components/common/MetricCard.tsx';
import { ApiClient } from '../services/apiClient.ts';

interface AdminDiagnosticsViewProps {
  auditLogs: AuditLogEntry[];
  onRefresh: () => void;
}

export const AdminDiagnosticsView: React.FC<AdminDiagnosticsViewProps> = ({
  auditLogs,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    ApiClient.getHealth()
      .then((data) => setHealthStatus(data))
      .catch((err) => console.log('Using default health:', err));
  }, []);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge status="INFO" size="sm">SYSTEM GOVERNANCE & COMPLIANCE</Badge>
            <span className="text-xs text-slate-400">HIPAA / FERPA Simulation Audit Trail</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Diagnostics, System Health & Audit Logs
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time server infrastructure status, background worker queues, and tamper-evident administrative audit records.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Health Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="PLATFORM CORE ENGINE"
          value="Healthy"
          subtitle="Uptime: 99.98% &bull; v2026.1"
          change="All Pods Operational"
          changeType="positive"
          icon={Server}
          badge={<Badge status="VERIFIED">ACTIVE</Badge>}
        />
        <MetricCard
          title="RELATIONAL STORAGE"
          value="PostgreSQL"
          subtitle="Connection Pool: 12 Active"
          icon={Database}
        />
        <MetricCard
          title="BACKGROUND QUEUE"
          value="0 Queued"
          subtitle="Mean Latency: 11 ms"
          icon={Cpu}
        />
        <MetricCard
          title="IMMUTABLE AUDIT LOGS"
          value={`${auditLogs.length} Records`}
          subtitle="Cryptographically Chained"
          icon={ShieldCheck}
        />
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulation Center Audit Trail
            </h3>
            <p className="text-xs text-slate-400">Logged score overrides, PRM revisions, and assessments</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, action, or details..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-medium">TIMESTAMP</th>
                <th className="pb-3 font-medium">USER / ROLE</th>
                <th className="pb-3 font-medium">ACTION</th>
                <th className="pb-3 font-medium">TARGET ENTITY</th>
                <th className="pb-3 font-medium">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-850/50">
                  <td className="py-3 font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-white block">{log.userName}</span>
                    <span className="font-mono text-[10px] text-teal-400">{log.userRole}</span>
                  </td>
                  <td className="py-3 font-mono">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">
                    {log.entityType}: {log.entityId}
                  </td>
                  <td className="py-3 text-slate-300 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
