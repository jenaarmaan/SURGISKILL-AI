// SurgiSkill AI - Unified Frontend API Client
// Interfaces seamlessly with Express /api/v1 backend endpoints

import {
  UserProfile,
  SurgicalStation,
  AttemptRecord,
  OSCEExam,
  DeviceIntegrationRecord,
  NotificationItem,
  AuditLogEntry,
} from '../types/index.ts';

const BASE_URL = '/api/v1';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API request failed: ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.error) errorMsg = body.error;
    } catch {
      // no JSON body
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const ApiClient = {
  // Health
  getHealth: () => request<{ status: string; geminiConfigured: boolean; databaseStatus: string }>('/health'),

  // Auth & Roles
  getCurrentUser: () => request<{ user: UserProfile }>('/auth/me'),
  switchRole: (role: string) =>
    request<{ success: boolean; user: UserProfile }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // Stations
  getStations: () => request<{ stations: SurgicalStation[] }>('/stations'),
  getStation: (id: string) => request<{ station: SurgicalStation }>(`/stations/${id}`),
  createStation: (station: Partial<SurgicalStation>) =>
    request<{ station: SurgicalStation }>('/stations', {
      method: 'POST',
      body: JSON.stringify(station),
    }),
  updatePRM: (stationId: string, prmUpdate: any) =>
    request<{ success: boolean; prm: any }>(`/stations/${stationId}/prm`, {
      method: 'PUT',
      body: JSON.stringify(prmUpdate),
    }),

  // Attempts
  getAttempts: (params?: { userId?: string; stationId?: string }) => {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.stationId) query.set('stationId', params.stationId);
    return request<{ attempts: AttemptRecord[] }>(`/attempts?${query.toString()}`);
  },
  getAttempt: (id: string) => request<{ attempt: AttemptRecord }>(`/attempts/${id}`),
  createAttempt: (stationId: string) =>
    request<{ attempt: AttemptRecord }>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ stationId }),
    }),
  completeAttempt: (id: string, payload: any) =>
    request<{ success: boolean; attempt: AttemptRecord }>(`/attempts/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  askAIEvaluation: (attemptId: string, userQuestion?: string, parameterContext?: string) =>
    request<{ success: boolean; source: string; explanation: string }>(
      `/attempts/${attemptId}/ai-explain`,
      {
        method: 'POST',
        body: JSON.stringify({ userQuestion, parameterContext }),
      }
    ),
  analyzeVideoFrame: (payload: {
    currentVideoTime?: number;
    currentState?: string;
    measurements?: any;
    procedureName?: string;
    imageBase64?: string;
    rubricChecklist?: any[];
    feedMode?: string;
  }) =>
    request<{
      success: boolean;
      source: string;
      analysis: {
        sceneDescription?: string;
        surgicalFieldDetected?: boolean;
        instrumentsDetected?: string[];
        actualObservedPhase?: string;
        checklistEvaluation?: Array<{
          stepCode: string;
          passed: boolean;
          status?: string;
          observation: string;
        }>;
        visualMeasurements?: {
          needleAngleDeg: number | null;
          biteWidthMm: number | null;
          tissueContactStatus: string;
          tensionStatus: string;
        };
        realTimeAlert?: string;
        phaseAccuracy: string;
        instrumentHandling: string;
        tissueRespect: string;
        criticalRisks: string[];
        coachingTip: string;
        liveOsatsBreakdown: {
          respectForTissue: number;
          timeAndMotion: number;
          instrumentHandling: number;
          flowOfOperation: number;
        };
        overallCompliance: string;
      };
    }>('/ai/analyze-video-frame', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Faculty Reviews
  submitFacultyReview: (payload: {
    attemptId: string;
    verifiedScore: number;
    globalRating: number;
    feedbackText: string;
    overrideReason?: string;
    annotations?: any[];
  }) =>
    request<{ success: boolean; attempt: AttemptRecord }>('/faculty/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // OSCE
  getOSCEExams: () => request<{ osceExams: OSCEExam[] }>('/osce'),
  getOSCEExam: (id: string) => request<{ exam: OSCEExam }>(`/osce/${id}`),

  // Integrations & Hardware
  getIntegrations: () => request<{ integrations: DeviceIntegrationRecord[] }>('/integrations'),
  testIntegration: (id: string) =>
    request<{ success: boolean; integration: DeviceIntegrationRecord; message: string }>(
      `/integrations/${id}/test`,
      { method: 'POST' }
    ),

  // Notifications
  getNotifications: () => request<{ notifications: NotificationItem[] }>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Audit Logs
  getAuditLogs: () => request<{ auditLogs: AuditLogEntry[] }>('/audit-logs'),

  // Analytics
  getAnalytics: () =>
    request<{
      totalCompleted: number;
      averageScore: number;
      varianceStats: any;
      skillMatrix: any[];
      cohortProgression: any[];
    }>('/analytics'),
};
