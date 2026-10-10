import React from 'react';
import { ComplianceStatus } from '../../types/index.ts';

interface BadgeProps {
  status?: ComplianceStatus | 'INFO' | 'CAUTION' | 'CRITICAL' | 'VERIFIED' | 'PENDING';
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'INFO',
  children,
  size = 'md',
  className = '',
}) => {
  let styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (status === 'GREEN' || status === 'VERIFIED') {
    styleClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/20';
  } else if (status === 'YELLOW' || status === 'CAUTION' || status === 'PENDING') {
    styleClasses = 'bg-amber-950/60 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/20';
  } else if (status === 'RED' || status === 'CRITICAL') {
    styleClasses = 'bg-rose-950/60 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/20';
  } else if (status === 'GRAY') {
    styleClasses = 'bg-slate-800/80 text-slate-400 border-slate-700';
  } else if (status === 'INFO') {
    styleClasses = 'bg-teal-950/60 text-teal-300 border-teal-500/30';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-mono'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border ${sizeClasses} ${styleClasses} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
};
