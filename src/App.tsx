/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  TrendingDown,
  Coins,
  ShieldCheck,
  Scale,
  Truck,
  Database,
  Calculator,
  HelpCircle
} from 'lucide-react';
import { Vehicle } from './types';
import ThemeToggle from './components/ThemeToggle';
import DashboardTab from './components/DashboardTab';
import PortfolioTab from './components/PortfolioTab';
import FinancialsTab from './components/FinancialsTab';

// Dynamic professional preset assets so the fleet starts populated with beautiful investment models in Naira (₦)
const DEFAULTS_FLEET: Vehicle[] = [
  {
    id: 'preset-danfo-01',
    name: 'Lagos Highway Danfo #12',
    type: 'Danfo (16-Seater Bus)',
    purchasePrice: 9500000,
    annualDepreciationRate: 18,
    expectedMaintenanceMonthly: 85000,
    fuelPriceRate: 120,
    insurancePremiumMonthly: 15000,
    annualDistanceMiles: 32000,
    monthlyRevenue: 1200000,
    inflationRate: 12,
    dividendPayoutRate: 50,
    imageOption: 'asis',
    originalImage: null,
    processedImage: null,
    createdAt: new Date().toISOString(),
    salvageValuePercent: 15,
    driverMonthlySalary: 150000,
    leviesAndTaxesMonthly: 180000,
    investorSharePercent: 30,
    rentalTenorYears: 5,
    fixedDailyRent: 18000,
    passOpexToRenter: true,
    fuelConsumptionDaily: 35,
    fuelPricePerLiter: 1100,
    activeDaysPerYear: 312,
  },
  {
    id: 'preset-korope-02',
    name: 'Ikorodu Korope Shuttler',
    type: 'Korope (6-Seater Bus)',
    purchasePrice: 4500000,
    annualDepreciationRate: 20,
    expectedMaintenanceMonthly: 40000,
    fuelPriceRate: 80,
    insurancePremiumMonthly: 8000,
    annualDistanceMiles: 28000,
    monthlyRevenue: 650000,
    inflationRate: 12,
    dividendPayoutRate: 50,
    imageOption: 'nobg',
    originalImage: null,
    processedImage: null,
    createdAt: new Date().toISOString(),
    salvageValuePercent: 12,
    driverMonthlySalary: 100005, // 100k roughly
    leviesAndTaxesMonthly: 90000, // Roughly 3k daily union dues
    investorSharePercent: 40,
    rentalTenorYears: 3,
    fixedDailyRent: 10000,
    passOpexToRenter: true,
    fuelConsumptionDaily: 20,
    fuelPricePerLiter: 1100,
    activeDaysPerYear: 312,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inputs' | 'financials'>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [isDark, setIsDark] = useState(false);

  // Initialize fleet assets from localStorage or populate defaults
  useEffect(() => {
    const rawSaved = localStorage.getItem('transport_fleet_portfolio');
    if (rawSaved) {
      try {
        setVehicles(JSON.parse(rawSaved));
      } catch (err) {
        console.warn('Unable to load localStorage assets, applying placeholders instead.', err);
        setVehicles(DEFAULTS_FLEET);
      }
    } else {
      setVehicles(DEFAULTS_FLEET);
    }

    // Read stored theme preference
    const savedTheme = localStorage.getItem('transport_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Sync state changes to storage
  const syncVehicles = (newFleet: Vehicle[]) => {
    setVehicles(newFleet);
    localStorage.setItem('transport_fleet_portfolio', JSON.stringify(newFleet));
  };

  const handleAddVehicle = (newVehicle: Vehicle) => {
    const updated = [newVehicle, ...vehicles];
    syncVehicles(updated);
    setActiveTab('dashboard'); // route back to dashboard automatically for positive feedback
  };

  const handleDeleteVehicle = (id: string) => {
    const updated = vehicles.filter((v) => v.id !== id);
    syncVehicles(updated);
    if (selectedVehicleId === id) {
      setSelectedVehicleId('all');
    }
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    const nextFleet = vehicles.map((v) => (v.id === updated.id ? updated : v));
    syncVehicles(nextFleet);
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('transport_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('transport_theme', 'light');
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#080c14] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 overflow-x-hidden">
      
      {/* Background lights/glow blurs for Frosted Glass theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] sm:w-[700px] h-[300px] sm:h-[700px] bg-cyan-500/8 dark:bg-blue-500/10 rounded-full blur-[100px] sm:blur-[140px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[300px] sm:w-[700px] h-[300px] sm:h-[700px] bg-emerald-500/8 dark:bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[140px]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER CONTROLS BAR */}
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#080c14]/70 backdrop-blur-2xl border-b border-slate-250/20 dark:border-white/5 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
                <Truck className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase text-slate-850 dark:text-white tracking-wider flex items-center gap-1.5 leading-none">
                  FleetVest
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Transportation Yield & Portfolio Modeling
                </p>
              </div>
            </div>

            {/* Nav Links for 3 pages */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                id="nav-dash"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-600/10 dark:bg-white/10 text-cyan-700 dark:text-white border border-cyan-500/25 dark:border-white/15 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Summary Dashboard
              </button>

              <button
                id="nav-financials"
                onClick={() => setActiveTab('financials')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === 'financials'
                    ? 'bg-cyan-600/10 dark:bg-white/10 text-cyan-700 dark:text-white border border-cyan-500/25 dark:border-white/15 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" />
                Detailed Financials
              </button>

              <button
                id="nav-inputs"
                onClick={() => setActiveTab('inputs')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === 'inputs'
                    ? 'bg-cyan-600/10 dark:bg-white/10 text-cyan-700 dark:text-white border border-cyan-500/25 dark:border-white/15 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Acquire Assets Form
              </button>
            </nav>

            <div className="flex items-center gap-4">
              {/* Dark/Light mode toggle */}
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            </div>
          </div>
        </header>

        {/* MOBILE NAV BAR */}
        <div className="md:hidden sticky top-[64px] z-40 bg-white/45 dark:bg-[#05070a]/45 backdrop-blur-xl border-b border-slate-250/50 dark:border-white/5 flex items-center justify-around py-2 shadow-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center p-1.5 text-[9px] font-bold border-none bg-transparent cursor-pointer ${
              activeTab === 'dashboard' ? 'text-cyan-600 dark:text-cyan-405 font-extrabold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5 text-cyan-500" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`flex flex-col items-center p-1.5 text-[9px] font-bold border-none bg-transparent cursor-pointer ${
              activeTab === 'financials' ? 'text-cyan-600 dark:text-cyan-405 font-extrabold' : 'text-slate-400'
            }`}
          >
            <Calculator className="w-4 h-4 mb-0.5 text-emerald-500" />
            Detailed Financials
          </button>
          <button
            onClick={() => setActiveTab('inputs')}
            className={`flex flex-col items-center p-1.5 text-[9px] font-bold border-none bg-transparent cursor-pointer ${
              activeTab === 'inputs' ? 'text-cyan-600 dark:text-cyan-405 font-extrabold' : 'text-slate-400'
            }`}
          >
            <PlusCircle className="w-4 h-4 mb-0.5 text-cyan-500" />
            Acquire Asset
          </button>
        </div>

        {/* CORE FRAME CONTAINER: Centered with max-width limits to avoid ultra-wide stretching */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full z-10">
          
          {/* TAB SWITCHBOARD VIEW WITH FADE INTRANSITIONS */}
          <div className="animate-fade-in duration-300">
            {activeTab === 'dashboard' && (
              <DashboardTab
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicleId={setSelectedVehicleId}
                onUpdateVehicle={handleUpdateVehicle}
                onNavigateToInputs={() => setActiveTab('inputs')}
              />
            )}

            {activeTab === 'inputs' && (
              <PortfolioTab
                vehicles={vehicles}
                onAddVehicle={handleAddVehicle}
                onDeleteVehicle={handleDeleteVehicle}
              />
            )}

            {activeTab === 'financials' && (
              <FinancialsTab
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicleId={setSelectedVehicleId}
                onUpdateVehicle={handleUpdateVehicle}
              />
            )}
          </div>
        </main>

        {/* FOOTER BAR */}
        <footer className="border-t border-slate-200/50 dark:border-white/5 bg-white/45 dark:bg-[#05070a]/45 backdrop-blur-xl mt-16 font-sans">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 space-y-3 md:space-y-0">
            <p>© 2026 FleetVest. All investment models are compounding forecast projections.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-cyan-500" />
                Inflation-Adjusted TCO Analysis
              </span>
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                Complies with GAAP and IAS Standards
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
