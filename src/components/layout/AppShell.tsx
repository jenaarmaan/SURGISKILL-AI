import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Video,
  Award,
  Users,
  Cpu,
  BarChart3,
  ShieldCheck,
  Bell,
  Settings,
  HelpCircle,
  Stethoscope,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Radio,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';

interface AppShellProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentView, onNavigate, children }) => {
  const { currentUser, role, switchRole, notifications, unreadCount, markNotificationAsRead } =
    useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const rolesList: Array<{ role: UserRole; title: string; desc: string }> = [
    { role: 'STUDENT', title: 'Trainee / Resident', desc: 'Dr. Alex Chen (PGY-2)' },
    { role: 'FACULTY', title: 'Faculty Reviewer', desc: 'Prof. Sarah Jenkins, MD, FACS' },
    { role: 'CLINICAL_LEAD', title: 'Clinical Lead & OSCE Chair', desc: 'Dr. Marcus Vance, MD, FRCSI' },
    { role: 'INSTITUTION_ADMIN', title: 'Institution Admin', desc: 'Elena Rostova, MS, CHSE' },
    { role: 'SUPER_ADMIN', title: 'Platform Systems Lead', desc: 'Global Health & Integrations' },
  ];

  const navItems = [
    {
      label: 'TRAINING & PRACTICE',
      items: [
        { id: 'student-dashboard', label: 'Trainee Dashboard', icon: Activity, roles: ['STUDENT', 'FACULTY', 'CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'] },
        { id: 'stations', label: 'Surgical Stations Catalog', icon: Layers, roles: ['STUDENT', 'FACULTY', 'CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'] },
        { id: 'workspace', label: 'Real-Time Suturing Workspace', icon: Video, roles: ['STUDENT', 'FACULTY', 'CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'], badge: 'LIVE CV' },
      ],
    },
    {
      label: 'ASSESSMENT & OSCE',
      items: [
        { id: 'attempts-list', label: 'Attempt Performance Reports', icon: FileText, roles: ['STUDENT', 'FACULTY', 'CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'] },
        { id: 'faculty-dashboard', label: 'Faculty Review Console', icon: Award, roles: ['FACULTY', 'CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'], badge: '1 PENDING' },
        { id: 'osce', label: 'Digital OSCE Examination', icon: Stethoscope, roles: ['STUDENT', 'FACULTY', 'CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'], badge: 'OCT 5' },
      ],
    },
    {
      label: 'CURRICULUM & GOVERNANCE',
      items: [
        { id: 'clinical-lead', label: 'Clinical Lead Analytics & PRMs', icon: BarChart3, roles: ['CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'] },
        { id: 'cohort-management', label: 'Cohort & User Rosters', icon: Users, roles: ['INSTITUTION_ADMIN', 'SUPER_ADMIN', 'CLINICAL_LEAD'] },
      ],
    },
    {
      label: 'DOCUMENTATION & SYSTEM GUIDE',
      items: [
        { id: 'docs', label: 'Documentation & Concept Guide', icon: BookOpen, roles: ['STUDENT', 'FACULTY', 'CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'], badge: 'GUIDE' },
      ],
    },
    {
      label: 'INFRASTRUCTURE & COMPLIANCE',
      items: [
        { id: 'integrations', label: 'Device & Hardware Hub', icon: Cpu, roles: ['INSTITUTION_ADMIN', 'SUPER_ADMIN', 'FACULTY'] },
        { id: 'diagnostics', label: 'System Health & Audit Logs', icon: ShieldCheck, roles: ['INSTITUTION_ADMIN', 'SUPER_ADMIN'] },
        { id: 'help', label: 'Clinical Reference & Guide', icon: HelpCircle, roles: ['STUDENT', 'FACULTY', 'CLINICAL_LEAD', 'INSTITUTION_ADMIN', 'SUPER_ADMIN'] },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Sidebar */}
      <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900/90 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md shadow-teal-500/20">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-base font-extrabold tracking-tight text-white">
                SurgiSkill<span className="text-teal-400">AI</span>
              </span>
              <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300 border border-teal-500/20">
                CLINICAL
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">Surgical Intelligence & OSCE</p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navItems.map((group, idx) => {
            const allowedItems = group.items.filter((item) => item.roles.includes(role));
            if (allowedItems.length === 0) return null;

            return (
              <div key={idx}>
                <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {group.label}
                </p>
                <div className="mt-1 space-y-0.5">
                  {allowedItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                          isActive
                            ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 transition ${
                              isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                              item.badge.includes('LIVE')
                                ? 'bg-rose-950 text-rose-300 border border-rose-700/50'
                                : 'bg-teal-950 text-teal-300 border border-teal-700/40'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Public Landing Link & Training Pad Status */}
        <div className="border-t border-slate-800/80 p-3">
          <button
            onClick={() => onNavigate('public-home')}
            className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <span>Public Medical Portal</span>
            <span className="text-[10px] text-teal-400">View Site &rarr;</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="relative z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 backdrop-blur-md">
          {/* Breadcrumb / Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CV PIPELINE 60 FPS</span>
              <span className="text-emerald-500/50">|</span>
              <span className="text-[10px] text-emerald-400/80">LATENCY 14MS</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
              <span>Center for Surgical Simulation</span>
              <span>/</span>
              <span className="text-slate-200 font-medium">{currentUser.cohortName || 'General Surgery'}</span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Quick Documentation Link */}
            <button
              onClick={() => onNavigate('docs')}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                currentView === 'docs'
                  ? 'border-teal-400 bg-teal-500/20 text-teal-300'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
              title="SurgiSkill AI Concept, Feature Matrix & Technical Docs"
            >
              <BookOpen className="h-3.5 w-3.5 text-teal-400" />
              <span className="hidden sm:inline">Documentation & Concept</span>
              <span className="sm:hidden">Docs</span>
            </button>

            {/* Direct Role Switcher (For Multi-Persona Testing) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
              >
                <div className="h-2 w-2 rounded-full bg-teal-400" />
                <span className="font-mono uppercase text-[11px] text-teal-300">{role}</span>
                <span className="text-slate-400">({currentUser.fullName.split(' ')[0]})</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black ring-1 ring-slate-700/60 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-800 mb-1 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Active User Role
                      </p>
                      <span className="text-[9px] font-mono text-teal-400">Persona Testing</span>
                    </div>
                    <div className="space-y-1">
                      {rolesList.map((item) => {
                        const isSelected = role === item.role;
                        return (
                          <button
                            key={item.role}
                            onClick={() => {
                              switchRole(item.role);
                              setShowRoleMenu(false);
                            }}
                            className={`flex w-full items-start justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                              isSelected
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                                : 'text-slate-200 hover:bg-slate-800/90 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className={`font-semibold ${isSelected ? 'text-teal-300' : 'text-white'}`}>
                                {item.title}
                              </span>
                              <span className="text-[11px] text-slate-300 mt-0.5">{item.desc}</span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-teal-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative rounded-lg border border-slate-800 bg-slate-800/60 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-black ring-1 ring-slate-700/60 z-50">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white">Notifications</span>
                      <span className="text-[10px] text-teal-400 font-mono">{unreadCount} Unread</span>
                    </div>
                    <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-400">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationAsRead(n.id);
                              if (n.linkUrl) {
                                if (n.linkUrl.includes('/attempts/')) {
                                  onNavigate('attempt-detail', n.linkUrl.split('/attempts/')[1]);
                                } else if (n.linkUrl.includes('/osce')) {
                                  onNavigate('osce');
                                } else {
                                  onNavigate('workspace');
                                }
                              }
                              setShowNotifMenu(false);
                            }}
                            className={`cursor-pointer rounded-lg p-2.5 text-xs transition ${
                              n.isRead ? 'bg-slate-800/30 text-slate-400' : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            <p className="font-semibold text-white">{n.title}</p>
                            <p className="mt-0.5 text-[11px] text-slate-300">{n.message}</p>
                            <span className="mt-1 block text-[9px] text-slate-500">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
              <img
                src={
                  currentUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentUser.fullName}
                className="h-8 w-8 rounded-full border border-slate-700 object-cover"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-none">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-400 mt-1">{currentUser.academicRank || role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Container */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">{children}</main>
      </div>
    </div>
  );
};
