/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Trash2, 
  Settings, 
  Save, 
  CheckCircle, 
  Database, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Truck,
  Layers,
  Sparkles
} from 'lucide-react';
import { Vehicle } from '../types';

interface LeftAssetSidebarProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicleId: (id: string) => void;
  onUpdateVehicle: (updated: Vehicle) => void;
  onlySelector?: boolean;
  onlyForm?: boolean;
}

export default function LeftAssetSidebar({
  vehicles,
  selectedVehicleId,
  onSelectVehicleId,
  onUpdateVehicle,
  onlySelector = false,
  onlyForm = false,
}: LeftAssetSidebarProps) {
  // Local state for the editable fields of the currently selected vehicle
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find the selected vehicle object when selectedVehicleId changes
  useEffect(() => {
    const matched = vehicles.find((v) => v.id === selectedVehicleId);
    if (matched) {
      setEditingVehicle({ ...matched });
    } else {
      setEditingVehicle(null);
    }
    setSaveSuccess(false);
  }, [selectedVehicleId, vehicles]);

  // Handle local form input updates
  const handleInputChange = (field: keyof Vehicle, value: string | number | boolean) => {
    if (!editingVehicle) return;
    setEditingVehicle({
      ...editingVehicle,
      [field]: value,
    });
    setSaveSuccess(false);
  };

  // Submit edits to parent state
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    onUpdateVehicle(editingVehicle);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  // Fast preset-picker help for local transport metrics
  const applyModelDefaults = (type: string) => {
    if (!editingVehicle) return;
    let updates: Partial<Vehicle> = {};
    
    if (type === 'Danfo (16-Seater Bus)') {
      updates = {
        purchasePrice: 9500000,
        monthlyRevenue: 480000,
        expectedMaintenanceMonthly: 65000,
        fuelPriceRate: 85,
        insurancePremiumMonthly: 18000,
        annualDistanceMiles: 48005,
        annualDepreciationRate: 12,
        salvageValuePercent: 15,
        driverMonthlySalary: 120000,
        leviesAndTaxesMonthly: 35000,
        investorSharePercent: 30,
        rentalTenorYears: 5,
        fixedDailyRent: 18000,
        passOpexToRenter: true,
        fuelConsumptionDaily: 35,
        fuelPricePerLiter: 1100,
        activeDaysPerYear: 312,
      };
    } else if (type === 'Korope (6-Seater Bus)') {
      updates = {
        purchasePrice: 4800000,
        monthlyRevenue: 280000,
        expectedMaintenanceMonthly: 38000,
        fuelPriceRate: 60,
        insurancePremiumMonthly: 10000,
        annualDistanceMiles: 42000,
        annualDepreciationRate: 14,
        salvageValuePercent: 12,
        driverMonthlySalary: 85000,
        leviesAndTaxesMonthly: 22000,
        investorSharePercent: 40,
        rentalTenorYears: 3,
        fixedDailyRent: 10000,
        passOpexToRenter: true,
        fuelConsumptionDaily: 20,
        fuelPricePerLiter: 1100,
        activeDaysPerYear: 312,
      };
    } else if (type === 'Maruwa (3-Wheeler Tricycle)') {
      updates = {
        purchasePrice: 2100000,
        monthlyRevenue: 210000,
        expectedMaintenanceMonthly: 22000,
        fuelPriceRate: 45,
        insurancePremiumMonthly: 7500,
        annualDistanceMiles: 36000,
        annualDepreciationRate: 15,
        salvageValuePercent: 10,
        driverMonthlySalary: 65000,
        leviesAndTaxesMonthly: 20000,
        investorSharePercent: 20,
        rentalTenorYears: 2,
        fixedDailyRent: 7500,
        passOpexToRenter: true,
        fuelConsumptionDaily: 12,
        fuelPricePerLiter: 1100,
        activeDaysPerYear: 312,
      };
    } else if (type === 'Okada (Commercial Bike)') {
      updates = {
        purchasePrice: 950000,
        monthlyRevenue: 110000,
        expectedMaintenanceMonthly: 12000,
        fuelPriceRate: 35,
        insurancePremiumMonthly: 4000,
        annualDistanceMiles: 30000,
        annualDepreciationRate: 18,
        salvageValuePercent: 8,
        driverMonthlySalary: 45000,
        leviesAndTaxesMonthly: 15000,
        investorSharePercent: 10,
        rentalTenorYears: 1,
        fixedDailyRent: 4000,
        passOpexToRenter: true,
        fuelConsumptionDaily: 6,
        fuelPricePerLiter: 1100,
        activeDaysPerYear: 312,
      };
    }

    setEditingVehicle({
      ...editingVehicle,
      ...updates,
      type,
    });
    setSaveSuccess(false);
  };

  return (
    <div id="left-asset-sidebar" className="flex flex-col space-y-6">
      
      {/* SECTION 1: ASSET CONTEXT SWITCHER */}
      {!onlyForm && (
        <div className="glass-panel rounded-3xl p-5 space-y-4 shadow-sm border border-slate-200/50 dark:border-white/5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-500" />
              Active Modeling Filter
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-505 mt-0.5">
              Isolate an acquired asset to drill down on its cash flows.
            </p>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {/* Aggregate Option */}
            <button
              id="sidebar-select-all"
              type="button"
              onClick={() => onSelectVehicleId('all')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                selectedVehicleId === 'all'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-white/45 dark:bg-[#080c14]/45 border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedVehicleId === 'all' ? 'bg-white' : 'bg-cyan-500'}`} />
                Full Fleet Portfolio (Aggregate)
              </span>
              <span className="text-[10px] opacity-75">{vehicles.length} assets</span>
            </button>

            {/* Individual Assets */}
            {vehicles.map((v) => (
              <button
                id={`sidebar-select-${v.id}`}
                key={v.id}
                type="button"
                onClick={() => onSelectVehicleId(v.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between border cursor-pointer ${
                  selectedVehicleId === v.id
                    ? 'bg-cyan-600/10 dark:bg-cyan-500/15 border-cyan-500 text-cyan-800 dark:text-cyan-300 shadow-sm'
                    : 'bg-white/40 dark:bg-[#080c14]/30 border-slate-200/40 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-bold truncate text-[11px] leading-snug">{v.name}</span>
                  <span className="text-[9px] opacity-75 truncate uppercase tracking-wider">{v.type}</span>
                </div>
                <span className="font-mono text-[10px] font-bold shrink-0">
                  ₦{(v.purchasePrice || 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: EDIT ASSUMPTIONS FORM */}
      {!onlySelector && (
        editingVehicle ? (
          <form onSubmit={handleSave} className="glass-panel text-left rounded-3xl p-5 md:p-6 space-y-5 shadow-sm border border-slate-200/55 dark:border-white/5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-cyan-500 animate-spin-slow" />
                Modify Assumptions
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Inputs apply directly to this asset.
              </p>
            </div>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> Saved
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Asset Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Asset Label Name</label>
              <input
                type="text"
                value={editingVehicle.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg glass-input font-bold"
                required
              />
            </div>

            {/* Asset Category Preset Select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Preset Category Model</label>
              <select
                value={editingVehicle.type}
                onChange={(e) => applyModelDefaults(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none font-bold"
              >
                <option value="Danfo (16-Seater Bus)">Danfo (16-Seater Bus)</option>
                <option value="Korope (6-Seater Bus)">Korope (6-Seater Bus)</option>
                <option value="Maruwa (3-Wheeler Tricycle)">Maruwa (3-Wheeler Tricycle)</option>
                <option value="Okada (Commercial Bike)">Okada (Commercial Bike)</option>
                <option value="Heavy Semi-Truck">Heavy Semi-Truck</option>
                <option value="Delivery Box Van">Delivery Box Van</option>
                <option value="Custom">Custom Presets</option>
              </select>
            </div>

            {/* Business Operations Model Options */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Business Operations Model</label>
              <select
                value={editingVehicle.runAsCompany ? 'company' : 'rent'}
                onChange={(e) => handleInputChange('runAsCompany', e.target.value === 'company')}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none font-bold"
              >
                <option value="rent">Rent Out (Tenant Lease - Default)</option>
                <option value="company">Run as Company (Direct Commercial)</option>
              </select>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block leading-tight">
                {editingVehicle.runAsCompany 
                  ? 'Company pays driver wages, fuel, and daily union tickets.' 
                  : 'Rening model: company pays NO driver wages.'}
              </span>
            </div>

            {/* Funding Split Section */}
            <div className="bg-slate-500/5 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                <span>Investor Funding Share</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">{editingVehicle.investorSharePercent || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={editingVehicle.investorSharePercent !== undefined ? editingVehicle.investorSharePercent : 0}
                onChange={(e) => handleInputChange('investorSharePercent', Number(e.target.value))}
                className="w-full h-1 accent-cyan-500 bg-slate-250 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="grid grid-cols-2 text-[9px] font-mono leading-tight pt-1">
                <div>
                  <span className="text-slate-405 dark:text-slate-500 block">Own Equity:</span>
                  <span className="font-bold text-slate-750 dark:text-white">₦{(editingVehicle.purchasePrice * (1 - (editingVehicle.investorSharePercent || 0) / 100)).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-405 dark:text-slate-500 block">Investor:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">₦{(editingVehicle.purchasePrice * ((editingVehicle.investorSharePercent || 0) / 100)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Two-Column Inputs: Financial Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Capital Price (₦)</label>
                <input
                  type="number"
                  value={editingVehicle.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Salvage rate (%)</label>
                <input
                  type="number"
                  max="50"
                  min="0"
                  value={editingVehicle.salvageValuePercent || 15}
                  onChange={(e) => handleInputChange('salvageValuePercent', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input font-mono font-semibold"
                />
              </div>
            </div>

            {/* Two-Column Inputs: Driver Wages & Revenue */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Monthly Revenue (₦)</label>
                <input
                  type="number"
                  value={editingVehicle.monthlyRevenue}
                  onChange={(e) => handleInputChange('monthlyRevenue', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Driver Salary (₦/mo)</label>
                <input
                  type="number"
                  value={editingVehicle.runAsCompany ? (editingVehicle.driverMonthlySalary || 0) : 0}
                  onChange={(e) => handleInputChange('driverMonthlySalary', Number(e.target.value))}
                  disabled={!editingVehicle.runAsCompany}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg font-mono font-semibold ${
                    editingVehicle.runAsCompany 
                      ? 'glass-input text-slate-800 dark:text-white' 
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 cursor-not-allowed'
                  }`}
                  placeholder="Disabled for Rent Out"
                />
              </div>
            </div>

            {/* Union Levies / Dues & Maintenance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Union Dues (₦/mo)</label>
                <input
                  type="number"
                  value={editingVehicle.leviesAndTaxesMonthly || 0}
                  onChange={(e) => handleInputChange('leviesAndTaxesMonthly', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Maintenance (₦/mo)</label>
                <input
                  type="number"
                  value={editingVehicle.expectedMaintenanceMonthly}
                  onChange={(e) => handleInputChange('expectedMaintenanceMonthly', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input font-mono font-semibold"
                />
              </div>
            </div>

            {/* Fuel Rates & Distance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Fuel per km (₦)</label>
                <input
                  type="number"
                  value={editingVehicle.fuelPriceRate}
                  onChange={(e) => handleInputChange('fuelPriceRate', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Annual Distance (km)</label>
                <input
                  type="number"
                  value={editingVehicle.annualDistanceMiles}
                  onChange={(e) => handleInputChange('annualDistanceMiles', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input font-mono font-semibold"
                />
              </div>
            </div>

            {/* Insurance Monthly */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Monthly Insurance Premium (₦)</label>
              <input
                type="number"
                value={editingVehicle.insurancePremiumMonthly}
                onChange={(e) => handleInputChange('insurancePremiumMonthly', Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg glass-input font-mono font-semibold"
              />
            </div>

            {/* Rental Lease Settings */}
            <div className="bg-slate-500/5 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Rental Lease Contract</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Lease Term (Yrs)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingVehicle.rentalTenorYears !== undefined ? editingVehicle.rentalTenorYears : 5}
                    onChange={(e) => handleInputChange('rentalTenorYears', Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-lg glass-input font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Daily Rent (₦)</label>
                  <input
                    type="number"
                    value={editingVehicle.fixedDailyRent !== undefined ? editingVehicle.fixedDailyRent : 18000}
                    onChange={(e) => handleInputChange('fixedDailyRent', Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-lg glass-input font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Pass Opex Toggle */}
              <div className="flex items-center justify-between gap-2 p-2 bg-[#080c14]/45 rounded-lg border border-slate-200/5">
                <span className="text-[9px] text-slate-400 font-bold">Pass Daily Opex to Lessee?</span>
                <input
                  type="checkbox"
                  checked={editingVehicle.passOpexToRenter !== undefined ? editingVehicle.passOpexToRenter : false}
                  onChange={(e) => handleInputChange('passOpexToRenter', e.target.checked)}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Fuel consumption override */}
            <div className="bg-slate-500/5 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Litres Fuel Model</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Litres/Day</label>
                  <input
                    type="number"
                    value={editingVehicle.fuelConsumptionDaily !== undefined ? editingVehicle.fuelConsumptionDaily : 0}
                    onChange={(e) => handleInputChange('fuelConsumptionDaily', Number(e.target.value))}
                    className="w-full px-1.5 py-1 text-xs rounded-lg glass-input font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">₦ / Litre</label>
                  <input
                    type="number"
                    value={editingVehicle.fuelPricePerLiter !== undefined ? editingVehicle.fuelPricePerLiter : 0}
                    onChange={(e) => handleInputChange('fuelPricePerLiter', Number(e.target.value))}
                    className="w-full px-1.5 py-1 text-xs rounded-lg glass-input font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">Days/Yr</label>
                  <input
                    type="number"
                    value={editingVehicle.activeDaysPerYear !== undefined ? editingVehicle.activeDaysPerYear : 312}
                    onChange={(e) => handleInputChange('activeDaysPerYear', Number(e.target.value))}
                    className="w-full px-1.5 py-1 text-xs rounded-lg glass-input font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Sliding Ratios (Depreciation, Inflation, Dividends) */}
            <div className="bg-slate-50/40 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2.5 text-[11px]">
              <div>
                <div className="flex justify-between font-semibold mb-0.5">
                  <span className="text-slate-500">Annual Depreciation</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-mono">{editingVehicle.annualDepreciationRate}%</span>
                </div>
                <input
                  type="range"
                  max="35"
                  min="5"
                  value={editingVehicle.annualDepreciationRate}
                  onChange={(e) => handleInputChange('annualDepreciationRate', Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-0.5"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-0.5">
                  <span className="text-slate-500">Regional Inflation</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-mono">{editingVehicle.inflationRate}%</span>
                </div>
                <input
                  type="range"
                  max="25"
                  min="1"
                  step="0.5"
                  value={editingVehicle.inflationRate}
                  onChange={(e) => handleInputChange('inflationRate', Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-0.5"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-0.5">
                  <span className="text-slate-500">Dividend Payout Rate</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-mono">{editingVehicle.dividendPayoutRate}%</span>
                </div>
                <input
                  type="range"
                  max="90"
                  min="10"
                  value={editingVehicle.dividendPayoutRate}
                  onChange={(e) => handleInputChange('dividendPayoutRate', Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-0.5"
                />
              </div>
            </div>

            {/* Save Assumptions Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-505 bg-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all shadow hover:shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2 scale-100 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" /> Save Asset Assumptions
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-panel rounded-3xl p-6 text-center shadow-sm border border-slate-200/50 dark:border-white/5 space-y-2">
          <Sparkles className="w-8 h-8 text-cyan-500/50 mx-auto" />
          <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white">Aggregate View Mode</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-550 max-w-xs mx-auto">
            Currently displaying aggregate modeling for the entire fleet portfolio. To edit parameters, select an individual asset listed above.
          </p>
        </div>
      ))}
    </div>
  );
}
