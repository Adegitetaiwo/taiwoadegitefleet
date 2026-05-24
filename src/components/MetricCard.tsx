import React, { ReactNode } from 'react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
  accent?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
}

export default function MetricCard({
  id,
  title,
  value,
  subtext,
  trend,
  trendType = 'neutral',
  icon,
  accent = 'cyan',
}: MetricCardProps) {
  
  // Custom design specs and layouts based on the metric's accent aura
  const themeMap = {
    cyan: {
      border: 'border-cyan-500/10 dark:border-cyan-500/15 group-hover:border-cyan-500/40',
      glow: 'via-cyan-500',
      glowShadow: 'group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)]',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border border-cyan-100/50 dark:border-cyan-950/50',
      chip: 'bg-cyan-100/70 dark:bg-cyan-950/45 text-cyan-800 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-800/30',
    },
    emerald: {
      border: 'border-emerald-500/10 dark:border-emerald-500/15 group-hover:border-emerald-500/40',
      glow: 'via-emerald-500',
      glowShadow: 'group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-950/50',
      chip: 'bg-emerald-100/70 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30',
    },
    amber: {
      border: 'border-amber-500/10 dark:border-amber-500/15 group-hover:border-amber-500/40',
      glow: 'via-amber-500',
      glowShadow: 'group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)]',
      iconBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-950/50',
      chip: 'bg-amber-100/70 dark:bg-amber-950/45 text-amber-805 dark:text-amber-305 border-amber-200/50 dark:border-amber-800/30',
    },
    rose: {
      border: 'border-rose-500/10 dark:border-rose-500/15 group-hover:border-rose-500/40',
      glow: 'via-rose-500',
      glowShadow: 'group-hover:shadow-[0_8px_30px_rgba(244,63,94,0.12)]',
      iconBg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-950/50',
      chip: 'bg-rose-100/70 dark:bg-rose-950/45 text-rose-800 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/30',
    },
    violet: {
      border: 'border-violet-500/10 dark:border-violet-500/15 group-hover:border-violet-500/40',
      glow: 'via-violet-500',
      glowShadow: 'group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)]',
      iconBg: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-100/50 dark:border-violet-950/50',
      chip: 'bg-violet-100/70 dark:bg-violet-950/45 text-violet-800 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/30',
    },
  }[accent];

  return (
    <div
      id={`metric-card-${id}`}
      className={`glass-panel p-5 rounded-2xl border ${themeMap.border} ${themeMap.glowShadow} transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
    >
      {/* Laser Gradient Accent Glow Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent ${themeMap.glow} to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />

      <div>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest font-sans">
              {title}
            </p>
            <h3 className="text-2xl font-black font-sans tracking-tight text-slate-900 dark:text-white mt-1">
              {value}
            </h3>
          </div>
          <div className={`p-2.5 rounded-xl ${themeMap.iconBg} transition-all duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-medium">
          {subtext}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-100/40 dark:border-white/5">
        <span className="text-[9px] text-slate-400/80 font-mono tracking-wide">MODELING KPI</span>
        
        {trend && (
          <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border uppercase ${themeMap.chip}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
