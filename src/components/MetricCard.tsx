/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
}

export default function MetricCard({
  id,
  title,
  value,
  subtext,
  trend,
  trendType = 'neutral',
  icon,
}: MetricCardProps) {
  const getTrendClass = () => {
    switch (trendType) {
      case 'positive':
        return 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30';
      case 'negative':
        return 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30';
      default:
        return 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-605 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30';
    }
  };

  return (
    <div
      id={`metric-card-${id}`}
      className="glass-panel p-5 rounded-2xl hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Decorative colored glow on top of the card */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {value}
          </h3>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-55 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {subtext}
        </p>
        
        {trend && (
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getTrendClass()}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
