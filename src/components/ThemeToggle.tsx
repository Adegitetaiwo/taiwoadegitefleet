/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle"
      onClick={onToggle}
      className="relative flex items-center justify-between p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 transition-all duration-300 w-14 h-8 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 cursor-pointer"
      title={isDark ? 'Switch to Light Mode for readability' : 'Switch to Dark Mode for high contrast'}
      aria-label="Toggle Theme"
    >
      <span className="sr-only">Toggle dark mode</span>
      <div
        className={`absolute top-0.75 left-0.75 w-6 h-6 rounded-full bg-white dark:bg-cyan-500 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-slate-900" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
      <div className="flex items-center justify-around w-full px-1 z-0 select-nonepointer-events-none">
        <Sun className="w-3.5 h-3.5 text-slate-400" />
        <Moon className="w-3.5 h-3.5 text-slate-500" />
      </div>
    </button>
  );
}
