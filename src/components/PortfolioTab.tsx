/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlusCircle, Trash2, Truck, Plus, Coins, Settings, TrendingUp, ShieldAlert, Zap } from 'lucide-react';
import { Vehicle, ImageProcessingOption } from '../types';
import VehicleProcessor, { VEHICLE_PRESETS } from './VehicleProcessor';

interface PortfolioTabProps {
  vehicles: Vehicle[];
  onAddVehicle: (newVehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
}

export default function PortfolioTab({
  vehicles,
  onAddVehicle,
  onDeleteVehicle,
}: PortfolioTabProps) {
  // Input states in Naira (₦) & Nigerian contexts
  const [name, setName] = useState('');
  const [type, setType] = useState('Danfo (16-Seater Bus)');
  const [purchasePrice, setPurchasePrice] = useState(9500000);
  const [depreciationRate, setDepreciationRate] = useState(12);
  const [maintenanceMonthly, setMaintenanceMonthly] = useState(65000);
  const [fuelPriceRate, setFuelPriceRate] = useState(85); // per km/mile cost
  const [insuranceMonthly, setInsuranceMonthly] = useState(18000);
  const [annualDistance, setAnnualDistance] = useState(48000); // dist / yr
  const [monthlyRevenue, setMonthlyRevenue] = useState(480000);
  const [inflationRate, setInflationRate] = useState(12); // Nigeria inflation scale
  const [dividendRate, setDividendRate] = useState(40);
  const [salvageValuePercent, setSalvageValuePercent] = useState(15);
  const [driverMonthlySalary, setDriverMonthlySalary] = useState(120000);
  const [leviesAndTaxesMonthly, setLeviesAndTaxesMonthly] = useState(35000);

  // New parameters for investor equity splits and tenant-shifted daily rental modeling
  const [investorSharePercent, setInvestorSharePercent] = useState<number>(30); // 0-100%
  const [rentalTenorYears, setRentalTenorYears] = useState<number>(5); // 1-10 years
  const [fixedDailyRent, setFixedDailyRent] = useState<number>(18000); // ₦/day
  const [passOpexToRenter, setPassOpexToRenter] = useState<boolean>(true); // default true: fuel, wages, union levies shifted
  const [fuelConsumptionDaily, setFuelConsumptionDaily] = useState<number>(35); // liters/day
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(1100); // ₦/liter
  const [activeDaysPerYear, setActiveDaysPerYear] = useState<number>(312); // e.g., 26 operating days * 12 months
  const [runAsCompany, setRunAsCompany] = useState<boolean>(false); // company pays driver salary and and operates directly

  // Vehicle image states
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageOption, setImageOption] = useState<ImageProcessingOption>('asis');

  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // Preset quick fill
  const handleQuickPreset = (presetType: string) => {
    setType(presetType);
    if (presetType === 'Danfo (16-Seater Bus)') {
      setPurchasePrice(9500000);
      setDepreciationRate(12);
      setMaintenanceMonthly(65000);
      setFuelPriceRate(85);
      setInsuranceMonthly(18000);
      setAnnualDistance(48005);
      setMonthlyRevenue(480000);
      setDriverMonthlySalary(120000);
      setLeviesAndTaxesMonthly(35000);
      setSalvageValuePercent(15);
      
      setInvestorSharePercent(30);
      setRentalTenorYears(5);
      setFixedDailyRent(18000);
      setPassOpexToRenter(true);
      setFuelConsumptionDaily(35);
      setFuelPricePerLiter(1100);
      setActiveDaysPerYear(312);
      setRunAsCompany(false);
    } else if (presetType === 'Korope (6-Seater Bus)') {
      setPurchasePrice(4800000);
      setDepreciationRate(14);
      setMaintenanceMonthly(38000);
      setFuelPriceRate(60);
      setInsuranceMonthly(10000);
      setAnnualDistance(42000);
      setMonthlyRevenue(280000);
      setDriverMonthlySalary(85000);
      setLeviesAndTaxesMonthly(22000);
      setSalvageValuePercent(12);

      setInvestorSharePercent(40);
      setRentalTenorYears(3);
      setFixedDailyRent(10000);
      setPassOpexToRenter(true);
      setFuelConsumptionDaily(20);
      setFuelPricePerLiter(1100);
      setActiveDaysPerYear(312);
      setRunAsCompany(false);
    } else if (presetType === 'Okada (Commercial Bike)') {
      setPurchasePrice(950000);
      setDepreciationRate(18);
      setMaintenanceMonthly(12000);
      setFuelPriceRate(35);
      setInsuranceMonthly(4000);
      setAnnualDistance(30000);
      setMonthlyRevenue(110000);
      setDriverMonthlySalary(45000);
      setLeviesAndTaxesMonthly(15000);
      setSalvageValuePercent(8);

      setInvestorSharePercent(10);
      setRentalTenorYears(1);
      setFixedDailyRent(4000);
      setPassOpexToRenter(true);
      setFuelConsumptionDaily(6);
      setFuelPricePerLiter(1100);
      setActiveDaysPerYear(312);
      setRunAsCompany(false);
    } else if (presetType === 'Keke Marwa (3-Wheeler Tricycle)') {
      setPurchasePrice(2100000);
      setDepreciationRate(15);
      setMaintenanceMonthly(22000);
      setFuelPriceRate(45);
      setInsuranceMonthly(7500);
      setAnnualDistance(36000);
      setMonthlyRevenue(210000);
      setDriverMonthlySalary(65000);
      setLeviesAndTaxesMonthly(20000);
      setSalvageValuePercent(10);

      setInvestorSharePercent(20);
      setRentalTenorYears(2);
      setFixedDailyRent(7500);
      setPassOpexToRenter(true);
      setFuelConsumptionDaily(12);
      setFuelPricePerLiter(1100);
      setActiveDaysPerYear(312);
      setRunAsCompany(false);
    } else {
      // Custom setting
      setPurchasePrice(3500000);
      setType('Custom');
      setDepreciationRate(15);
      setMaintenanceMonthly(30000);
      setFuelPriceRate(50);
      setInsuranceMonthly(12000);
      setAnnualDistance(40000);
      setMonthlyRevenue(260000);
      setDriverMonthlySalary(75000);
      setLeviesAndTaxesMonthly(18000);
      setSalvageValuePercent(15);

      setInvestorSharePercent(0);
      setRentalTenorYears(5);
      setFixedDailyRent(12000);
      setPassOpexToRenter(true);
      setFuelConsumptionDaily(25);
      setFuelPricePerLiter(1105);
      setActiveDaysPerYear(312);
      setRunAsCompany(false);
    }
  };

  const handleImageProcessorChange = (data: {
    originalImage: string | null;
    processedImage: string | null;
    imageOption: ImageProcessingOption;
  }) => {
    setOriginalImage(data.originalImage);
    setProcessedImage(data.processedImage);
    setImageOption(data.imageOption);
  };

  const handleAssetSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMsg(null);

    if (!name.trim()) {
      setValidationMsg('Please declare a descriptive Asset Identifier (e.g. "Danfo Lagos-01")');
      return;
    }

    if (purchasePrice <= 0 || (fixedDailyRent <= 0 && monthlyRevenue <= 0)) {
      setValidationMsg('Financial dimensions must exceed zero values.');
      return;
    }

    const newVehicle: Vehicle = {
      id: `vh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      type,
      purchasePrice,
      annualDepreciationRate: depreciationRate,
      expectedMaintenanceMonthly: maintenanceMonthly,
      fuelPriceRate,
      insurancePremiumMonthly: insuranceMonthly,
      annualDistanceMiles: annualDistance,
      monthlyRevenue,
      inflationRate,
      dividendPayoutRate: dividendRate,
      imageOption,
      originalImage,
      processedImage,
      createdAt: new Date().toISOString(),
      salvageValuePercent,
      driverMonthlySalary: runAsCompany ? driverMonthlySalary : 0,
      leviesAndTaxesMonthly,
      
      // Extended fields
      investorSharePercent,
      rentalTenorYears,
      fixedDailyRent,
      passOpexToRenter,
      fuelConsumptionDaily,
      fuelPricePerLiter,
      activeDaysPerYear,
      runAsCompany,
    };

    onAddVehicle(newVehicle);

    // Reset Form
    setName('');
    setOriginalImage(null);
    setProcessedImage(null);
    setImageOption('asis');
  };

  // Helper inside loop for ROI display inside active draft panel
  const computeEstRoi = (v: Vehicle) => {
    const is = v.investorSharePercent !== undefined ? v.investorSharePercent : 0;
    const rt = v.rentalTenorYears !== undefined ? v.rentalTenorYears : 10;
    const dr = v.fixedDailyRent !== undefined ? v.fixedDailyRent : 0;
    const po = v.passOpexToRenter !== undefined ? v.passOpexToRenter : false;
    const fc = v.fuelConsumptionDaily !== undefined ? v.fuelConsumptionDaily : 0;
    const fp = v.fuelPricePerLiter !== undefined ? v.fuelPricePerLiter : 0;
    const ad = v.activeDaysPerYear !== undefined ? v.activeDaysPerYear : 312;

    const useNewFuel = fc > 0 && fp > 0;
    const estFuelPrice = useNewFuel ? (fc * fp * ad) : (v.annualDistanceMiles * v.fuelPriceRate);

    // Yield
    const annualRev = dr > 0 ? (dr * ad) : (v.monthlyRevenue * 12);

    const maint = v.expectedMaintenanceMonthly * 12;
    const ins = v.insurancePremiumMonthly * 12;

    let opex = maint + ins;
    if (!po) {
      opex += estFuelPrice + ((v.driverMonthlySalary || 0) * 12) + ((v.leviesAndTaxesMonthly || 0) * 12);
    }

    const netAnnualCash = annualRev - opex;
    return v.purchasePrice > 0 ? (netAnnualCash / v.purchasePrice) * 100 : 0;
  };

  return (
    <div id="portfolio-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* CREATION FORM GRID: 7 columns */}
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={handleAssetSubmission} className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
              Acquire Transport Vehicle (Naira Asset)
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Configure baseline purchase capital, driver allowances, daily local ticketing/union dues, and model targeted returns.
            </p>
          </div>

          {/* Validation Banner */}
          {validationMsg && (
            <div className="p-3 rounded-xl bg-orange-500/10 dark:bg-orange-950/25 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-xs font-semibold">
              {validationMsg}
            </div>
          )}

          {/* Asset Classification presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-505 mb-2">
              Select Transport Preset Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                'Danfo (16-Seater Bus)',
                'Korope (6-Seater Bus)',
                'Okada (Commercial Bike)',
                'Keke Marwa (3-Wheeler Tricycle)',
                'Custom'
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickPreset(preset)}
                  className={`px-2.5 py-2.5 rounded-lg border text-[10px] text-center transition-all cursor-pointer font-bold leading-tight ${
                    type === preset
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-405'
                      : 'border-slate-200/50 dark:border-white/10 text-slate-650 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {preset.split(' ')[0]}
                  <span className="block text-[8px] font-medium opacity-75 mt-0.5">
                    {preset.includes('(') ? preset.substring(preset.indexOf('(')) : 'Customizable'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Asset Identifier Name */}
            <div>
              <label htmlFor="asset-name" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
                Asset Identifier Name
              </label>
              <input
                id="asset-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ikeja Danfo #10"
                className="w-full px-3.5 py-2 text-xs rounded-lg glass-input font-medium"
              />
            </div>

            {/* Business Operations Model */}
            <div>
              <label htmlFor="biz-model-selection" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
                Business Operations Model
              </label>
              <select
                id="biz-model-selection"
                value={runAsCompany ? 'company' : 'rent'}
                onChange={(e) => setRunAsCompany(e.target.value === 'company')}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white font-bold h-[38px] focus:outline-none"
              >
                <option value="rent">Rent Out (Tenant Lease)</option>
                <option value="company">Run as Company (Direct)</option>
              </select>
            </div>

            {/* Capital Purchase Cost */}
            <div>
              <label htmlFor="purchase-price" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
                Capital Purchase Price (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-404 text-slate-400 text-xs font-bold leading-none">₦</span>
                <input
                  id="purchase-price"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-lg glass-input font-mono"
                />
              </div>
            </div>
          </div>

          {/* Funding Split Section */}
          <div className="bg-slate-500/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 uppercase tracking-wider font-sans">
              <Coins className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-404" />
              Capital Funding Structure ({investorSharePercent === 0 ? '100% Equity' : `${100 - investorSharePercent}% Equity / ${investorSharePercent}% Debt/Investors`})
            </h4>
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-450 dark:text-slate-400 mb-1">
                <span>Own Company Equity: {100 - investorSharePercent}%</span>
                <span>Investor Funding Share: {investorSharePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={investorSharePercent}
                onChange={(e) => setInvestorSharePercent(Number(e.target.value))}
                className="w-full h-1 accent-cyan-500 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[8px] text-slate-400 dark:text-slate-500 block mt-1">
                Leverage: 1-{Math.max(1, Math.round(100 / (100 - investorSharePercent)))}x flexible investor matching
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono leading-relaxed bg-[#080c14]/40 p-2.5 rounded-lg border border-slate-200/5">
              <div>
                <span className="text-slate-400 block font-normal">Equity Capital Needed:</span>
                <span className="font-bold text-slate-800 dark:text-white">₦{(purchasePrice * (1 - investorSharePercent / 100)).toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-normal">Investor Target Capital:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">₦{(purchasePrice * (investorSharePercent / 100)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Visual Processor Embed */}
          <div className="border border-slate-200/40 dark:border-white/5 bg-slate-50/10 dark:bg-white/5 p-4 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5 font-sans">
              <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Dynamic Photo Processing Suite (Convert to Cartoon, Unchanged options)
            </h3>
            <VehicleProcessor
              vehicleType={type}
              vehicleName={name || 'Selected Transport'}
              originalImage={originalImage}
              processedImage={processedImage}
              imageOption={imageOption}
              onChange={handleImageProcessorChange}
            />
          </div>

          {/* Operational Numbers */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-100/50 dark:border-white/5 pb-1.5 font-sans">
              Variable Transit Parameters (Naira)
            </h4>

            {/* Rent & Tenor Settings */}
            <div className="bg-slate-500/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 space-y-4">
              <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-sans flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-404" />
                Rent & Contenured Tenor Split
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tenor slider */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-455 dark:text-slate-400 mb-1">
                    Lease Term: <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{rentalTenorYears} Years</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rentalTenorYears}
                    onChange={(e) => setRentalTenorYears(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 block mt-1">
                    Vehicle reverts to direct commercial operations post-tenor
                  </span>
                </div>

                {/* Daily Fixed Rent */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-455 dark:text-slate-400 mb-1">
                    Contracted Daily Rent (₦/Day)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400 text-[10px] font-bold">₦</span>
                    <input
                      type="number"
                      value={fixedDailyRent}
                      onChange={(e) => setFixedDailyRent(Number(e.target.value))}
                      className="w-full pl-6 pr-2 py-1 flex text-xs rounded-lg glass-input font-mono"
                    />
                  </div>
                  <span className="text-[8px] text-slate-400 dark:text-slate-550 block mt-1">
                    Monthly Lease Yield: ~₦{(fixedDailyRent * 26).toLocaleString()} (est. 26 operating days)
                  </span>
                </div>
              </div>

              {/* Expense Passing Toggle */}
              <div className="flex items-start justify-between gap-3 p-3 bg-slate-500/5 dark:bg-black/25 rounded-lg border border-slate-200/40 dark:border-white/5 shadow-inner">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-750 dark:text-slate-250 block">Pass Daily Operational Expenses to Lessee (Renter)?</span>
                  <p className="text-[8px] leading-relaxed text-slate-400 dark:text-slate-500">
                    If active, the driver salary, Union levies, and daily fuel are paid by the renter. Servicing (quarterly physical maintenance) and annual insurance are paid by the landlord/company.
                  </p>
                </div>
                <div className="relative inline-flex items-center h-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passOpexToRenter}
                    onChange={(e) => setPassOpexToRenter(e.target.checked)}
                    className="sr-only peer"
                    id="pass-opex-toggle"
                  />
                  <div className="w-9 h-5 bg-slate-350 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:bg-slate-100 peer-checked:bg-cyan-500"></div>
                </div>
              </div>
            </div>

            {/* Core Revenue and Work Distance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gross Revenue */}
              <div>
                <label htmlFor="monthly-rev" className="block text-[10px] font-semibold text-slate-400 dark:text-slate-550 mb-1">
                  Est. Post-Tenor Gross Revenue (₦/Month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₦</span>
                  <input
                    id="monthly-rev"
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-lg glass-input font-mono"
                  />
                </div>
                <span className="text-[8px] text-slate-450 dark:text-slate-500 mt-1 block">Yield target if lease tenure expires draft</span>
              </div>

              {/* Annual Distance driven */}
              <div>
                <label id="annual-dist-lbl" htmlFor="annual-dist" className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  Expect. Distance (KM/YR: {annualDistance.toLocaleString()} km)
                </label>
                <input
                  id="annual-dist"
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={annualDistance}
                  onChange={(e) => setAnnualDistance(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Maintenance, Fuel rate, and Insurance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Maintenance */}
              <div>
                <label htmlFor="maint-monthly" className="block text-xs font-semibold text-slate-400 dark:text-slate-550 mb-1">
                  Maintenance (₦/Month)
                </label>
                <input
                  id="maint-monthly"
                  type="number"
                  value={maintenanceMonthly}
                  onChange={(e) => setMaintenanceMonthly(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-lg glass-input font-mono"
                />
              </div>

              {/* Fuel Price Cost per KM */}
              <div>
                <label htmlFor="fuel-rate" className="block text-xs font-semibold text-slate-400 dark:text-slate-550 mb-1">
                  Fallback Fuel Level (₦/KM)
                </label>
                <input
                  id="fuel-rate"
                  type="number"
                  step="0.5"
                  value={fuelPriceRate}
                  onChange={(e) => setFuelPriceRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-lg glass-input font-mono"
                />
              </div>

              {/* Insurance Premium */}
              <div>
                <label htmlFor="insurance-monthly" className="block text-xs font-semibold text-slate-400 dark:text-slate-550 mb-1">
                  Insurance (₦/Month)
                </label>
                <input
                  id="insurance-monthly"
                  type="number"
                  value={insuranceMonthly}
                  onChange={(e) => setInsuranceMonthly(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-lg glass-input font-mono"
                />
              </div>
            </div>

            {/* Litres-Based Fuel Analytics (Override) */}
            <div className="bg-slate-500/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200/40 dark:border-white/5 space-y-3">
              <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-sans">
                Litres-Based Fuel Analytics (Primary Model)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Liters Daily */}
                <div>
                  <label className="block text-[10px] text-slate-450 dark:text-slate-400 mb-1 font-medium">
                    Fuel Consumption (Ltres/Day)
                  </label>
                  <input
                    type="number"
                    value={fuelConsumptionDaily}
                    onChange={(e) => setFuelConsumptionDaily(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded-lg glass-input font-mono"
                    placeholder="e.g. 30"
                  />
                </div>

                {/* Liter price */}
                <div>
                  <label className="block text-[10px] text-slate-455 dark:text-slate-400 mb-1 font-medium">
                    Fuel Rate (₦/Litre)
                  </label>
                  <input
                    type="number"
                    value={fuelPricePerLiter}
                    onChange={(e) => setFuelPricePerLiter(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded-lg glass-input font-mono"
                    placeholder="e.g. 1100"
                  />
                </div>

                {/* Days Active */}
                <div>
                  <label className="block text-[10px] text-slate-455 dark:text-slate-400 mb-1 font-medium">
                    Operating Days/Yr
                  </label>
                  <input
                    type="number"
                    value={activeDaysPerYear}
                    onChange={(e) => setActiveDaysPerYear(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded-lg glass-input font-mono"
                    placeholder="e.g. 312"
                  />
                </div>
              </div>
              <p className="text-[8.5px] text-slate-400 dark:text-slate-500 italic">
                Annual full fuel pool allocation: <span className="text-cyan-600 dark:text-cyan-400 font-bold font-mono">₦{((fuelConsumptionDaily * fuelPricePerLiter * activeDaysPerYear) || 0).toLocaleString()}</span> (takes precedence over KM mileage method when consumption and rate are positive).
              </p>
            </div>

            {/* Nigeria customized labor wages and daily union levies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-500/5 dark:bg-white/5 p-4 rounded-xl border border-slate-200/40 dark:border-white/5">
              {/* Driver Monthly Salary */}
              <div>
                <label htmlFor="driver-salary" className="block text-xs font-semibold text-slate-400 dark:text-slate-550 mb-1">
                  Monthly Driver Wages (₦/Month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₦</span>
                  <input
                    id="driver-salary"
                    type="number"
                    value={runAsCompany ? driverMonthlySalary : 0}
                    onChange={(e) => setDriverMonthlySalary(Number(e.target.value))}
                    disabled={!runAsCompany}
                    className={`w-full pl-7 pr-3 py-2 text-xs rounded-lg font-mono ${
                      runAsCompany 
                        ? 'glass-input text-slate-800 dark:text-white' 
                        : 'bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 text-slate-400 cursor-not-allowed font-medium'
                    }`}
                    placeholder="Disabled for Rent Out"
                  />
                </div>
                {!runAsCompany && (
                  <span className="text-[8.5px] text-slate-400 dark:text-slate-500 mt-1 block leading-tight">
                    Tenant rents and operates the vehicle. Company pays NO driver wages.
                  </span>
                )}
              </div>

              {/* Levies and Taxes (monthly sum of daily union tickets) */}
              <div>
                <label htmlFor="levies" className="block text-xs font-semibold text-slate-400 dark:text-slate-550 mb-1">
                  Union Levies & Tickets (₦/Month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₦</span>
                  <input
                    id="levies"
                    type="number"
                    value={leviesAndTaxesMonthly}
                    onChange={(e) => setLeviesAndTaxesMonthly(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-lg glass-input font-mono"
                    placeholder="Welfare & Union tickers"
                  />
                </div>
              </div>
            </div>

            {/* Advanced slider parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/20 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/55 dark:border-white/5">
              {/* Depreciation curve */}
              <div>
                <label id="dep-lbl" htmlFor="dep-rate" className="block text-[10px] font-semibold text-slate-550 dark:text-slate-400 mb-1">
                  Depreciation ({depreciationRate}%/yr)
                </label>
                <input
                  id="dep-rate"
                  type="range"
                  min="5"
                  max="35"
                  value={depreciationRate}
                  onChange={(e) => setDepreciationRate(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-250 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Salvage rate curve */}
              <div>
                <label id="salvage-lbl" htmlFor="salvage-rate" className="block text-[10px] font-semibold text-slate-550 dark:text-slate-400 mb-1">
                  Salvage Value ({salvageValuePercent}%)
                </label>
                <input
                  id="salvage-rate"
                  type="range"
                  min="5"
                  max="40"
                  value={salvageValuePercent}
                  onChange={(e) => setSalvageValuePercent(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-250 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Inflation index */}
              <div>
                <label id="inf-lbl" htmlFor="inf-rate" className="block text-[10px] font-semibold text-slate-550 dark:text-slate-400 mb-1">
                  Inflation Rate ({inflationRate}%)
                </label>
                <input
                  id="inf-rate"
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-250 dark:bg-slate-800 rounded-lg"
                />
              </div>

              {/* Dividend distribution payout */}
              <div>
                <label id="div-lbl" htmlFor="div-rate-rng" className="block text-[10px] font-semibold text-slate-550 dark:text-slate-400 mb-1">
                  Investor Dividend ({dividendRate}%)
                </label>
                <input
                  id="div-rate-rng"
                  type="range"
                  min="10"
                  max="90"
                  value={dividendRate}
                  onChange={(e) => setDividendRate(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-250 dark:bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2 scale-100 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" /> Add Asset to Fleet Portfolio
          </button>
        </form>
      </div>

      {/* DRAFTED FLEET SUMMARY: 5 columns */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Active Assets Draft ({vehicles.length})
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Currently evaluated rolling stock in your transportation portfolio models.
            </p>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200/40 dark:border-white/10 rounded-2xl bg-white/5 space-y-3">
              <PlusCircle className="w-8 h-8 text-slate-300 dark:text-slate-650 mx-auto" />
              <p className="text-xs text-slate-400">
                Portfolio draft is empty. Fill the form to add your first commercial vehicle asset.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100/50 dark:divide-white/5 max-h-[580px] overflow-y-auto pr-1">
              {vehicles.map((v) => {
                const estRoi = computeEstRoi(v);
                return (
                  <div
                    id={`draft-item-${v.id}`}
                    key={v.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      {/* Tiny visual badge */}
                      <div className="w-12 h-12 rounded-xl bg-white/70 dark:bg-[#080c14]/75 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-inner">
                        {v.imageOption === 'cartoon' && v.processedImage === 'FALLBACK_PRESET_SVG' ? (
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-605 fill-none stroke-current stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={VEHICLE_PRESETS[v.type] || VEHICLE_PRESETS['Heavy Semi-Truck']} />
                          </svg>
                        ) : v.processedImage ? (
                          <img src={v.processedImage} alt={v.name} referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400 dark:text-slate-650 fill-none stroke-current stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={VEHICLE_PRESETS[v.type] || VEHICLE_PRESETS['Heavy Semi-Truck']} />
                          </svg>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors uppercase truncate max-w-[140px]">
                          {v.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          <span className="font-semibold uppercase px-1.5 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-250/25 dark:border-white/5 text-[8px] truncate max-w-[90px]">
                            {v.type.split(' ')[0]}
                          </span>
                          <span>• Evaluated</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-850 dark:text-white font-mono">
                          ₦{v.purchasePrice.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold">
                          ROI: {estRoi.toFixed(0)}%/yr
                        </p>
                      </div>

                      <button
                        id={`delete-btn-${v.id}`}
                        type="button"
                        onClick={() => onDeleteVehicle(v.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-500 border-none bg-transparent cursor-pointer transition-colors"
                        title="Erase asset from projection models"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
