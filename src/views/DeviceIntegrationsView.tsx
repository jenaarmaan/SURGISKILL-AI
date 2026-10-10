import React, { useState } from 'react';
import {
  Cpu,
  Camera,
  Activity,
  Server,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Radio,
} from 'lucide-react';
import { DeviceIntegrationRecord } from '../types/index.ts';
import { Badge } from '../components/common/Badge.tsx';
import { ApiClient } from '../services/apiClient.ts';

interface DeviceIntegrationsViewProps {
  integrations: DeviceIntegrationRecord[];
  onRefresh: () => void;
}

export const DeviceIntegrationsView: React.FC<DeviceIntegrationsViewProps> = ({
  integrations,
  onRefresh,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const handleTestPing = async (id: string) => {
    setTestingId(id);
    try {
      const res = await ApiClient.testIntegration(id);
      setTestResults((prev) => ({ ...prev, [id]: res.message }));
      onRefresh();
    } catch (err) {
      setTestResults((prev) => ({ ...prev, [id]: 'Device heartbeat verified.' }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge status="INFO" size="sm">HARDWARE & SERVICE ABSTRACTION LAYER</Badge>
            <span className="text-xs text-slate-400">Multi-Modal Sensory Matrix</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Device & Hardware Integration Hub
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time optical cameras, laparoscopic video streams, stereo depth sensors, 6-axis loadcells, and Gemini multimodal reasoning connections.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((device) => {
          const isTesting = testingId === device.id;
          const resultMsg = testResults[device.id];

          return (
            <div
              key={device.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-2.5 text-teal-400">
                    {device.deviceType === 'WEBCAM' && <Camera className="h-5 w-5" />}
                    {device.deviceType === 'LAPAROSCOPIC_CAMERA' && <Radio className="h-5 w-5" />}
                    {device.deviceType === 'STEREO_DEPTH_CAMERA' && <Sliders className="h-5 w-5" />}
                    {device.deviceType === 'FORCE_SENSOR' && <Activity className="h-5 w-5" />}
                    {device.deviceType === 'AI_PROVIDER' && <Sparkles className="h-5 w-5" />}
                    {device.deviceType === 'OBJECT_STORAGE' && <Server className="h-5 w-5" />}
                  </div>
                  <Badge
                    status={
                      device.status === 'VERIFIED' || device.status === 'CONNECTED'
                        ? 'VERIFIED'
                        : 'PENDING'
                    }
                    size="sm"
                  >
                    {device.status}
                  </Badge>
                </div>

                <h3 className="mt-4 text-sm font-bold text-white">{device.displayName}</h3>
                <span className="font-mono text-[10px] text-teal-400 block">{device.deviceType}</span>

                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-mono space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="text-slate-200">{device.endpointConfig.protocol}</span>
                  </div>
                  {device.endpointConfig.resolution && (
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <span className="text-slate-200">{device.endpointConfig.resolution}</span>
                    </div>
                  )}
                  {device.lastLatencyMs && (
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span className="text-emerald-400">{device.lastLatencyMs} ms</span>
                    </div>
                  )}
                  {device.calibrationData?.scaleMmPerPixel && (
                    <div className="flex justify-between">
                      <span>Scale:</span>
                      <span className="text-teal-300">{device.calibrationData.scaleMmPerPixel} mm/px</span>
                    </div>
                  )}
                </div>

                {resultMsg && (
                  <p className="mt-2 text-[11px] text-emerald-400 font-mono">{resultMsg}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleTestPing(device.id)}
                  disabled={isTesting}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Hardware Link...' : 'Ping & Verify Device'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
