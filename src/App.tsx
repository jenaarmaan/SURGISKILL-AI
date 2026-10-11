/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppShell } from './components/layout/AppShell.tsx';
import { PublicLandingView } from './views/PublicLandingView.tsx';
import { StudentDashboardView } from './views/StudentDashboardView.tsx';
import { RealTimeWorkspaceView } from './views/RealTimeWorkspaceView.tsx';
import { AttemptReportView } from './views/AttemptReportView.tsx';
import { FacultyReviewConsoleView } from './views/FacultyReviewConsoleView.tsx';
import { DigitalOsceView } from './views/DigitalOsceView.tsx';
import { ClinicalLeadDashboardView } from './views/ClinicalLeadDashboardView.tsx';
import { StationsCatalogView } from './views/StationsCatalogView.tsx';
import { AttemptsListView } from './views/AttemptsListView.tsx';
import { CohortManagementView } from './views/CohortManagementView.tsx';
import { DeviceIntegrationsView } from './views/DeviceIntegrationsView.tsx';
import { AdminDiagnosticsView } from './views/AdminDiagnosticsView.tsx';
import { HelpReferenceView } from './views/HelpReferenceView.tsx';
import { DocumentationView } from './views/DocumentationView.tsx';
import {
  MOCK_STATIONS,
  MOCK_ATTEMPTS,
  MOCK_OSCE_EXAMS,
  MOCK_INTEGRATIONS,
  MOCK_AUDIT_LOGS,
} from './data/mockSurgicalData.ts';
import {
  SurgicalStation,
  AttemptRecord,
  OSCEExam,
  DeviceIntegrationRecord,
  AuditLogEntry,
} from './types/index.ts';
import { ApiClient } from './services/apiClient.ts';

function MainAppContent() {
  const { role, currentUser, switchRole } = useAuth();

  const [currentView, setCurrentView] = useState<string>('student-dashboard');
  const [activeStationId, setActiveStationId] = useState<string>('stn_interrupted_suture');
  const [activeAttemptId, setActiveAttemptId] = useState<string>('att_chen_interrupted_001');

  // Live state
  const [stations, setStations] = useState<SurgicalStation[]>(MOCK_STATIONS);
  const [attempts, setAttempts] = useState<AttemptRecord[]>(MOCK_ATTEMPTS);
  const [osceExams, setOsceExams] = useState<OSCEExam[]>(MOCK_OSCE_EXAMS);
  const [integrations, setIntegrations] = useState<DeviceIntegrationRecord[]>(MOCK_INTEGRATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);

  const fetchData = async () => {
    try {
      const [stnRes, attRes, oscRes, intRes, audRes] = await Promise.all([
        ApiClient.getStations(),
        ApiClient.getAttempts(),
        ApiClient.getOSCEExams(),
        ApiClient.getIntegrations(),
        ApiClient.getAuditLogs(),
      ]);

      if (stnRes.stations) setStations(stnRes.stations);
      if (attRes.attempts) setAttempts(attRes.attempts);
      if (oscRes.osceExams) setOsceExams(oscRes.osceExams);
      if (intRes.integrations) setIntegrations(intRes.integrations);
      if (audRes.auditLogs) setAuditLogs(audRes.auditLogs);
    } catch (err) {
      console.log('Using local baseline mock data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    (window as any).__navigateToView = handleNavigate;
    (window as any).__switchRole = switchRole;
  }, [switchRole]);

  const handleNavigate = (view: string, id?: string) => {
    if (view === 'workspace' && id) {
      setActiveStationId(id);
    } else if (view === 'attempt-detail' && id) {
      setActiveAttemptId(id);
    } else if (view === 'faculty-review' && id) {
      setActiveAttemptId(id);
    }
    setCurrentView(view);
  };

  // If public landing page is requested
  if (currentView === 'public-home') {
    return (
      <PublicLandingView
        onEnterApp={() => {
          setCurrentView('student-dashboard');
        }}
        onOpenDocs={() => {
          setCurrentView('docs');
        }}
      />
    );
  }

  const activeStation =
    stations.find((s) => s.id === activeStationId) || stations[0];
  const activeAttempt =
    attempts.find((a) => a.id === activeAttemptId) || attempts[0];
  const activeOSCE = osceExams[0];

  return (
    <AppShell currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'student-dashboard' && (
        <StudentDashboardView
          stations={stations}
          attempts={attempts}
          osceExams={osceExams}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'stations' && (
        <StationsCatalogView
          stations={stations}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'workspace' && (
        <RealTimeWorkspaceView
          station={activeStation}
          onAttemptCompleted={(newAttId) => {
            fetchData();
            setActiveAttemptId(newAttId);
            setCurrentView('attempt-detail');
          }}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'attempts-list' && (
        <AttemptsListView
          attempts={attempts}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'attempt-detail' && (
        <AttemptReportView
          attempt={activeAttempt}
          onNavigate={handleNavigate}
        />
      )}

      {(currentView === 'faculty-dashboard' || currentView === 'faculty-review') && (
        <FacultyReviewConsoleView
          attempt={activeAttempt}
          onReviewSubmitted={() => {
            fetchData();
            setCurrentView('attempts-list');
          }}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'osce' && (
        <DigitalOsceView
          exam={activeOSCE}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'clinical-lead' && (
        <ClinicalLeadDashboardView
          stations={stations}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'cohort-management' && (
        <CohortManagementView
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'integrations' && (
        <DeviceIntegrationsView
          integrations={integrations}
          onRefresh={fetchData}
        />
      )}

      {currentView === 'diagnostics' && (
        <AdminDiagnosticsView
          auditLogs={auditLogs}
          onRefresh={fetchData}
        />
      )}

      {currentView === 'docs' && (
        <DocumentationView onNavigate={handleNavigate} />
      )}

      {currentView === 'help' && <HelpReferenceView />}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
