import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  badge?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  badge,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm transition hover:border-slate-700/80">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="font-mono text-2xl font-bold tracking-tight text-white">{value}</h4>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          {change && (
            <p
              className={`mt-2 text-xs font-medium ${
                changeType === 'positive'
                  ? 'text-emerald-400'
                  : changeType === 'negative'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-2.5 text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
