/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  TrendingUp,
  Coins,
  Cpu,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Download,
  Percent,
  Layers,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Vehicle } from '../types';
import { calculateVehicleProjections, calculatePortfolioProjections, calculatePortfolioSummary } from '../utils/finance';
import { generateInvestorPDF } from '../utils/pdfGenerator';
import CalculationDetails from './CalculationDetails';
import LeftAssetSidebar from './LeftAssetSidebar';

interface FinancialsTabProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicleId: (id: string) => void;
  onUpdateVehicle: (updated: Vehicle) => void;
}

export default function FinancialsTab({ 
  vehicles,
  selectedVehicleId,
  onSelectVehicleId,
  onUpdateVehicle
}: FinancialsTabProps) {
  const [isCalculationsExpanded, setIsCalculationsExpanded] = useState(false);

  // Get active vehicle object if a specific one is selected
  const activeVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  // Compute multi-year forecasts dynamically
  const forecasts = useMemo(() => {
    if (selectedVehicleId === 'all') {
      return calculatePortfolioProjections(vehicles, 10);
    } else if (activeVehicle) {
      return calculateVehicleProjections(activeVehicle, 10);
    }
    return [];
  }, [vehicles, selectedVehicleId, activeVehicle]);

  // Compute stats summary
  const summary = useMemo(() => {
    if (selectedVehicleId === 'all') {
      return calculatePortfolioSummary(vehicles);
    } else if (activeVehicle) {
      return calculatePortfolioSummary([activeVehicle]);
    }
    return {
      totalPurchaseValue: 0,
      annualRevenue: 0,
      annualOperatingCost: 0,
      averageRoi: 0,
      averageIrr: 0,
      averageMoic: 1.0,
      projected10YrDividends: 0,
    };
  }, [vehicles, selectedVehicleId, activeVehicle]);

  // Transform TCO breakdown variables for Pie/Donut Chart with driver wages and levies
  const tcoBreakdownData = useMemo(() => {
    if (forecasts.length === 0) return [];
    
    // Aggregate over the 10-year lifespan
    const totalPurchase = summary.totalPurchaseValue;
    const totalMaint = forecasts.reduce((sum, f) => sum + f.maintenanceCost, 0);
    const totalFuel = forecasts.reduce((sum, f) => sum + f.fuelCost, 0);
    const totalIns = forecasts.reduce((sum, f) => sum + f.insuranceCost, 0);
    const totalWages = forecasts.reduce((sum, f) => sum + (f.driverWagesCost || 0), 0);
    const totalLevies = forecasts.reduce((sum, f) => sum + (f.leviesCost || 0), 0);

    return [
      { name: 'Initial Capital Ticket', value: Math.round(totalPurchase), color: '#0fb9b1' },
      { name: 'Driver Labor Wages', value: Math.round(totalWages), color: '#8b5cf6' },
      { name: 'Union Dues / Levies', value: Math.round(totalLevies), color: '#ef4444' },
      { name: 'Inflated Maintenance', value: Math.round(totalMaint), color: '#3b82f6' },
      { name: 'Variable Fuel/Energy', value: Math.round(totalFuel), color: '#f59e0b' },
      { name: 'Insurance Index', value: Math.round(totalIns), color: '#ec4899' },
    ];
  }, [forecasts, summary]);

  // Transform Dividend projections for Bar Chart
  const dividendYearlyData = useMemo(() => {
    return forecasts.map((f) => ({
      year: `Yr ${f.year}`,
      'Annual Dividend': Math.round(f.dividendPayout),
      'Cumulative Dividends': Math.round(f.cumulativeDividends),
    }));
  }, [forecasts]);

  // Initiate PDF Exporter
  const handleExportPDF = () => {
    if (vehicles.length === 0) return;
    generateInvestorPDF(vehicles, calculatePortfolioSummary(vehicles), calculatePortfolioProjections(vehicles, 10));
  };

  // Safe division handler to prevent NaN errors
  const safePercent = (val: number) => {
    return isNaN(val) ? '0%' : `${val.toFixed(1)}%`;
  };

  return (
    <div id="financials-tab-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: ACTIVE MODEL SELECTOR & REAL-TIME ASSUMPTIONS MODIFIER */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 h-fit z-20">
        <LeftAssetSidebar
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicleId={onSelectVehicleId}
          onUpdateVehicle={onUpdateVehicle}
        />
      </div>

      {/* RIGHT COLUMN: CORE FINANCIAL SHEET */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* ACTION PANEL */}
        <div className="flex flex-col sm:flex-row justify-between items-center glass-panel rounded-2xl p-4 gap-4 shadow-sm">
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {selectedVehicleId === 'all' ? 'FULL PORTFOLIO GENERAL FINANCIALS' : `${activeVehicle?.name} Forecast Sheet`}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-505">
              Refined with customized driver overhead and daily union tickets computed in Naira (₦).
            </p>
          </div>

          {vehicles.length > 0 && (
            <button
              id="export-pdf"
              onClick={handleExportPDF}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow hover:shadow-md cursor-pointer scale-100 hover:scale-[1.01]"
            >
              <Download className="w-4 h-4" /> Export Investor PDF Report
            </button>
          )}
        </div>

        {vehicles.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <FileText className="w-12 h-12 text-cyan-500 mx-auto animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Detailed Sheets are Unconfigured
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-balance text-center">
              Create transport vehicle models to generate predictive financial ledger spreadsheets, operating expenses breakdown, and investor returns curves.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* 2. 10-YEAR FINANCIAL MODELING SHEET TABLE */}
            <div className="glass-panel rounded-3xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100/50 dark:border-white/5 text-left">
                <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  10-Year Projections & Returns Sheet (Naira)
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Compounded projections incorporating variable asset depreciation cycles, monthly labor wages, and DAILY local union tickets (scaled monthly).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap border-collapse text-[10px] font-sans">
                  <thead>
                    <tr className="bg-slate-200/50 dark:bg-black/35 font-bold text-slate-555 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100/30 dark:border-white/5">
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Revenue</th>
                      <th className="py-2.5 px-3">Maintenance</th>
                      <th className="py-2.5 px-3">Fuel/Energy</th>
                      <th className="py-2.5 px-3">Insurance</th>
                      <th className="py-2.5 px-3">Driver Wage</th>
                      <th className="py-2.5 px-3">Union Dues</th>
                      <th className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-bold">Accounting Profit</th>
                      <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">Annual Cash Profit</th>
                      <th className="py-2.5 px-3">Resale Book Value</th>
                      <th className="py-2.5 px-3">Dividend</th>
                      <th className="py-2.5 px-3 text-emerald-500">ROI</th>
                      <th className="py-2.5 px-3 text-cyan-500 font-bold">IRR (Hold)</th>
                      <th className="py-2.5 px-3 text-violet-500">MOIC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-white/5 font-mono text-slate-600 dark:text-slate-350">
                    {forecasts.map((f) => {
                      const annualOpex = (f.maintenanceCost || 0) + (f.fuelCost || 0) + (f.insuranceCost || 0) + (f.driverWagesCost || 0) + (f.leviesCost || 0);
                      const cashProfit = (f.revenue || 0) - annualOpex;
                      const accountingProfit = f.netProfit;
                      return (
                        <tr
                          id={`forecast-row-y${f.year}`}
                          key={f.year}
                          className="hover:bg-slate-150/20 dark:hover:bg-white/5 transition-all font-semibold"
                        >
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Y{f.year}</td>
                          <td className="py-3 px-3">₦{Math.round(f.revenue || 0).toLocaleString()}</td>
                          <td className="py-3 px-3">₦{Math.round(f.maintenanceCost || 0).toLocaleString()}</td>
                          <td className="py-3 px-3">₦{Math.round(f.fuelCost || 0).toLocaleString()}</td>
                          <td className="py-3 px-3">₦{Math.round(f.insuranceCost || 0).toLocaleString()}</td>
                          <td className="py-3 px-3">₦{Math.round(f.driverWagesCost || 0).toLocaleString()}</td>
                          <td className="py-3 px-3">₦{Math.round(f.leviesCost || 0).toLocaleString()}</td>
                          <td className={`py-3 px-3 font-bold ${accountingProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {accountingProfit < 0 ? '-' : ''}₦{Math.abs(Math.round(accountingProfit)).toLocaleString()}
                          </td>
                          <td className={`py-3 px-3 font-bold ${cashProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {cashProfit < 0 ? '-' : ''}₦{Math.abs(Math.round(cashProfit)).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">₦{Math.round(f.depreciatedValue || 0).toLocaleString()}</td>
                          <td className="py-3 px-3 text-slate-800 dark:text-slate-200">₦{Math.round(f.dividendPayout || 0).toLocaleString()}</td>
                          <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">{safePercent(f.roi)}</td>
                          <td className="py-3 px-3 font-bold text-cyan-600 dark:text-cyan-400">{safePercent(f.irr)}</td>
                          <td className="py-3 px-3 font-bold text-violet-600 dark:text-violet-400">{f.moic.toFixed(2)}x</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. COST STRUCTURE PIE CHART & DIVIDEND HISTOGRAM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* TCO Lifecycle Breakdown (Donut Chart) */}
              <div className="lg:col-span-12 xl:col-span-5 glass-panel p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-cyan-605" />
                    10-Year Cumulative Operating & TCO Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Calculates aggregate distribution across physical acquisition asset cost pools and running expenses.
                  </p>
                </div>

                <div className="h-60 w-full relative flex items-center justify-center font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tcoBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {tcoBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center total number overlay inside Donut */}
                  <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total TCO Pool</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                      ₦{tcoBreakdownData.reduce((sum, e) => sum + e.value, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Legends */}
                <div className="space-y-1.5 text-xs text-left">
                  {tcoBreakdownData.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500 dark:text-slate-450 text-[11px]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                        ₦{d.value.toLocaleString()} ({((d.value / Math.max(1, tcoBreakdownData.reduce((sum, e) => sum + e.value, 0))) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dividend return forecast (Stacked Bar Histogram) */}
              <div className="lg:col-span-12 xl:col-span-7 glass-panel p-5 rounded-3xl shadow-sm space-y-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-805 dark:text-white flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-cyan-650" />
                    Compounded Dividends & Cash-out Projections
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Annual passive distributions versus historical cash returned back to transportation stakeholders.
                  </p>
                </div>

                <div className="h-72 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dividendYearlyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} className="dark:stroke-slate-800/20" />
                      <XAxis dataKey="year" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => `₦${Number(value).toLocaleString()}`} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                      <Bar name="Annual Payout" dataKey="Annual Dividend" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar name="Cumulative Reserves" dataKey="Cumulative Dividends" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 4. EXPANDABLE EQUATIONS DIRECTORY */}
            <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
              <button
                onClick={() => setIsCalculationsExpanded(!isCalculationsExpanded)}
                className="w-full p-5 flex items-center justify-between text-slate-705 dark:text-slate-300 hover:bg-[#05070a]/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Cpu className="w-4 h-4 text-cyan-500 animate-pulse" />
                  Inspect Mathematical Formulas & Solver Dictionary
                </span>
                <span className="text-xs flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                  {isCalculationsExpanded ? (
                    <>
                      <span>Collapse Equations</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Inspect Formula Solver (Collapsed)</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>

              {isCalculationsExpanded && (
                <div className="p-5 bg-slate-50/10 dark:bg-black/25 border-t border-slate-100/50 dark:border-white/5 animate-fade-in text-left">
                  <CalculationDetails />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
