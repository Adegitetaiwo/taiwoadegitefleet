/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  Scale,
  Truck,
  Clock,
  ArrowUpRight,
  Database,
  BarChart2,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Vehicle } from '../types';
import { calculatePortfolioProjections, calculatePortfolioSummary, calculateVehicleProjections } from '../utils/finance';
import MetricCard from './MetricCard';
import LeftAssetSidebar from './LeftAssetSidebar';

interface DashboardTabProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicleId: (id: string) => void;
  onUpdateVehicle: (updated: Vehicle) => void;
  onNavigateToInputs: () => void;
}

export default function DashboardTab({ 
  vehicles, 
  selectedVehicleId,
  onSelectVehicleId,
  onUpdateVehicle,
  onNavigateToInputs 
}: DashboardTabProps) {
  
  // Find currently selected vehicle (if not 'all')
  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  // Dynamically compute stats depending on sidebar selection
  const summary = useMemo(() => {
    if (selectedVehicleId === 'all') {
      return calculatePortfolioSummary(vehicles);
    } else if (selectedVehicle) {
      return calculatePortfolioSummary([selectedVehicle]);
    }
    return calculatePortfolioSummary([]);
  }, [vehicles, selectedVehicleId, selectedVehicle]);

  // Dynamically compute projections depending on sidebar selection
  const projections = useMemo(() => {
    if (selectedVehicleId === 'all') {
      return calculatePortfolioProjections(vehicles, 10);
    } else if (selectedVehicle) {
      return calculateVehicleProjections(selectedVehicle, 10);
    }
    return [];
  }, [vehicles, selectedVehicleId, selectedVehicle]);

  // Transform Recharts details to flat clean object
  const chartData = useMemo(() => {
    return projections.map((p) => ({
      name: `Yr ${p.year}`,
      Dividends: Math.round(p.cumulativeDividends),
      TCO: Math.round(p.totalCostOfOwnership),
      ResaleValue: Math.round(p.depreciatedValue),
      ROI: Number(p.roi.toFixed(1)),
      IRR: Number(p.irr.toFixed(1)),
      MOIC: Number(p.moic.toFixed(2)),
    }));
  }, [projections]);

  // Format currency helpers in Naira (₦)
  const fmtCurr = (val: number) => {
    if (val >= 1e6) return `₦${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `₦${(val / 1e3).toFixed(1)}k`;
    return `₦${val}`;
  };

  // Custom tooltips to present numbers beautifully
  const CustomPerformanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div id="chart-tooltip-perf" className="p-3 bg-slate-900 border border-slate-750 text-white rounded-lg shadow-xl text-xs space-y-1.5 font-sans">
          <p className="font-bold text-slate-350">{label}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-6 text-cyan-400">
              <span className="font-medium">Cumulative Dividends:</span>
              <span className="font-mono font-bold">₦{payload[0]?.value?.toLocaleString()}</span>
            </p>
            <p className="flex justify-between gap-6 text-slate-300">
              <span className="font-medium">Total Cost (TCO):</span>
              <span className="font-mono font-bold">₦{payload[1]?.value?.toLocaleString()}</span>
            </p>
            <p className="flex justify-between gap-6 text-amber-400">
              <span className="font-medium">Resale Book Value:</span>
              <span className="font-mono font-bold">₦{payload[2]?.value?.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomRatiosTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div id="chart-tooltip-ratios" className="p-3 bg-slate-900 border border-slate-750 text-white rounded-lg shadow-xl text-xs space-y-1.5 font-sans">
          <p className="font-bold text-slate-350">{label}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-6 text-emerald-400">
              <span className="font-medium">Operational ROI:</span>
              <span className="font-mono font-bold">{payload[0]?.value}%</span>
            </p>
            <p className="flex justify-between gap-6 text-cyan-400">
              <span className="font-medium">Hold-Period IRR:</span>
              <span className="font-mono font-bold">{payload[1]?.value}%</span>
            </p>
            <p className="flex justify-between gap-6 text-purple-400">
              <span className="font-medium">Compounded MOIC:</span>
              <span className="font-mono font-bold">{payload[2]?.value}x</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-tab-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: ACTIVE MODEL SELECTOR & REAL-TIME ASSUMPTIONS MODIFIER */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 h-fit z-20">
        <LeftAssetSidebar
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicleId={onSelectVehicleId}
          onUpdateVehicle={onUpdateVehicle}
        />
      </div>

      {/* RIGHT COLUMN: CORE DASHBOARD VISUALIZERS */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* 1. KEY KPI HERO BAR */}
        {(() => {
          const year1AccountingProfit = projections[0]?.netProfit || 0;
          const year1CashProfit = summary.annualRevenue - summary.annualOperatingCost;
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
              <MetricCard
                id="cap-alloc"
                title="Committed Capital"
                value={fmtCurr(summary.totalPurchaseValue)}
                subtext="Fleet capital pool allocation"
                icon={<Database className="w-5 h-5 text-cyan-500" />}
              />
              <MetricCard
                id="ann-gross"
                title="Baseline Revenue"
                value={fmtCurr(summary.annualRevenue)}
                subtext="Current gross annual forecast"
                trend="Escalating"
                trendType="neutral"
                icon={<Coins className="w-5 h-5 text-emerald-500" />}
              />
              <MetricCard
                id="yr1-acct-profit"
                title="Accounting Profit (Y1)"
                value={fmtCurr(year1AccountingProfit)}
                subtext="After operating & deprec."
                trend={year1AccountingProfit >= 0 ? 'Net Surplus' : 'Net Deficit'}
                trendType={year1AccountingProfit >= 0 ? 'positive' : 'negative'}
                icon={<Scale className="w-5 h-5 text-cyan-600" />}
              />
              <MetricCard
                id="yr1-cash-profit"
                title="Cash Profit (Y1)"
                value={fmtCurr(year1CashProfit)}
                subtext="Operating liquid cash flow"
                trend={year1CashProfit >= 0 ? 'Positive Cash' : 'Burn Rate'}
                trendType={year1CashProfit >= 0 ? 'positive' : 'negative'}
                icon={<Coins className="w-5 h-5 text-teal-500" />}
              />
              <MetricCard
                id="avg-roi"
                title="Operational ROI"
                value={`${summary.averageRoi.toFixed(0)}%`}
                subtext="Cumulative cash-flow ROI"
                trend="+Compounding"
                trendType="positive"
                icon={<TrendingUp className="w-5 h-5 text-cyan-500" />}
              />
              <MetricCard
                id="avg-irr"
                title="Internal Rate (IRR)"
                value={`${summary.averageIrr.toFixed(1)}%`}
                subtext="Avg holding-period IRR"
                trend="Solver Live"
                trendType="positive"
                icon={<Scale className="w-5 h-5 text-emerald-500" />}
              />
              <MetricCard
                id="fleet-moic"
                title="Aggregate MOIC"
                value={`${summary.averageMoic.toFixed(2)}x`}
                subtext="Multiple on invested cap"
                trend={summary.averageMoic > 1 ? 'Profitable' : 'Recouping'}
                trendType={summary.averageMoic > 1 ? 'positive' : 'neutral'}
                icon={<ShieldCheck className="w-5 h-5 text-violet-500" />}
              />
            </div>
          );
        })()}

        {vehicles.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-4">
            <Truck className="w-12 h-12 text-cyan-500 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Transportation Portfolio is Unconfigured
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto text-balance">
              To visualize long-term investment indices, cash-flow yields, and track ROI, IRR and MOIC multiples, create at least one vehicle asset first.
            </p>
            <button
              onClick={onNavigateToInputs}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow cursor-pointer uppercase tracking-wider"
            >
              Create Assets Now
            </button>
          </div>
        ) : (
          <div className="space-y-8 text-slate-800 dark:text-slate-100 animate-fade-in duration-300">
            {/* 2. CHARTS OVERVIEW GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Long-term compounding capital projection */}
              <div className="glass-panel rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 font-sans">
                    <BarChart2 className="w-4 h-4 text-cyan-600" />
                    Long-Term Performance & TCO Analytics
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Visualizes cumulative investor yields (Dividends) relative to physical assets resale curves and total compounded cost curves over 10 years.
                  </p>
                </div>

                <div className="h-72 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="divGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0891b2" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} className="dark:stroke-slate-800/20" />
                      <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomPerformanceTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                      <Area type="monotone" name="Cumulative Dividends" dataKey="Dividends" stroke="#0891b2" strokeWidth={2} fillOpacity={1} fill="url(#divGradient)" />
                      <Line type="monotone" name="Total Cost of Ownership" dataKey="TCO" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                      <Line type="monotone" name="Residual Salvage Value" dataKey="ResaleValue" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Profitability ratios (ROI, IRR, MOIC) over time */}
              <div className="glass-panel rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 font-sans">
                    <Percent className="w-4 h-4 text-cyan-600 animate-pulse" />
                    Yield Ratios: ROI vs Compounding IRR vs MOIC
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Contrast operational cash yield index (ROI), Internal Rate of Return (IRR), and total compounded investment return multiple (MOIC) over time.
                  </p>
                </div>

                <div className="h-72 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} className="dark:stroke-slate-800/20" />
                      <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      {/* Primary Y Axis for ROI & RII Percentages */}
                      <YAxis yAxisId="percent" stroke="#10b981" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                      {/* Secondary Y Axis for MOIC multiple */}
                      <YAxis yAxisId="multiple" orientation="right" stroke="#8b5cf6" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} />
                      <Tooltip content={<CustomRatiosTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                      
                      <Line yAxisId="percent" type="monotone" name="Operational ROI (%)" dataKey="ROI" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                      <Line yAxisId="percent" type="monotone" name="Compounding IRR (%)" dataKey="IRR" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      <Line yAxisId="multiple" type="monotone" name="Investment MOIC (x)" dataKey="MOIC" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 3. CORE FLEET INVENTORY REVIEW LIST */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    Fleet Inventory Return Projections
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Individual yield diagnostics based on vehicle attributes, depreciation brackets, operational driver labor, and daily union dues.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded text-[11px] font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-cyan-500 animate-spin-slow" />
                  <span>Base Currency: Naira (₦)</span>
                </div>
              </div>

              {/* Grid of fleet cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {vehicles.map((v) => {
                  // Calculate simple Year 1 Net cash flow: Revenue - Opex (Maintenance, Fuel, Insurance, Driver Salary, Union Levies)
                  const inflatedRev = v.monthlyRevenue * 12;
                  const maint = v.expectedMaintenanceMonthly * 12;
                  const fuel = v.annualDistanceMiles * v.fuelPriceRate;
                  const ins = v.insurancePremiumMonthly * 12;
                  const wages = (v.driverMonthlySalary || 0) * 12;
                  const levies = (v.leviesAndTaxesMonthly || 0) * 12;

                  const opex = maint + fuel + ins + wages + levies;
                  const netAnnualCash = inflatedRev - opex;
                  const initialRoi = v.purchasePrice > 0 ? (netAnnualCash / v.purchasePrice) * 100 : 0;

                  return (
                    <div
                      id={`inv-card-${v.id}`}
                      key={v.id}
                      onClick={() => onSelectVehicleId(v.id)}
                      className={`p-5 rounded-2xl border transition-all duration-300 text-left cursor-pointer ${
                        selectedVehicleId === v.id
                          ? 'bg-cyan-600/10 dark:bg-cyan-500/15 border-cyan-500 shadow-sm'
                          : 'bg-white/30 dark:bg-white/5 border-slate-200/40 dark:border-white/5 hover:border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/70 dark:bg-[#05070a]/70 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-inner">
                          {v.imageOption === 'cartoon' && v.processedImage === 'FALLBACK_PRESET_SVG' ? (
                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-600 fill-none stroke-current stroke-2 animate-bounce">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h10v6H4V8zm12 2h4v4h-4v-4zM2 14v1h18v-3H2v2z" />
                            </svg>
                          ) : v.processedImage ? (
                            <img src={v.processedImage} alt={v.name} referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-400 dark:text-slate-650 fill-none stroke-current stroke-2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h10v6H4V8zm12 2h4v4h-4v-4zM2 14v1h18v-3H2v2z" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase truncate">
                              {v.name}
                            </h4>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 truncate max-w-[80px]">
                              {v.type}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                            <span>Price: <span className="font-bold text-slate-600 dark:text-slate-300 font-mono">₦{v.purchasePrice.toLocaleString()}</span></span>
                            <span className="flex items-center gap-0.5 text-emerald-500 dark:text-emerald-400 font-semibold text-xs font-bold">
                              <ArrowUpRight className="w-3 h-3 animate-pulse" />
                              {initialRoi.toFixed(0)}% ROI
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-4 pt-3 border-t border-slate-100/50 dark:border-white/5 text-[10px]">
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 text-[8px] uppercase tracking-wider font-sans">Driver Wage</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">₦{(v.driverMonthlySalary || 0).toLocaleString()}/mo</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 text-[8px] uppercase tracking-wider font-sans">Daily Tickets</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">₦{(v.leviesAndTaxesMonthly || 0).toLocaleString()}/mo</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 text-[8px] uppercase tracking-wider font-sans">Maintenance</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">₦{Math.round(v.expectedMaintenanceMonthly * 12).toLocaleString()}/yr</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 text-[8px] uppercase tracking-wider font-sans">Fuel & Energy</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">₦{Math.round(v.annualDistanceMiles * v.fuelPriceRate).toLocaleString()}/yr</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
