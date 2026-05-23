/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Cpu, Landmark, Info } from 'lucide-react';

export default function CalculationDetails() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'roi',
      title: 'ROI: Return on Investment (Leveraged Portfolio Cash Flow)',
      description: 'ROI measures the percentage cash profit generated relative to the original asset value, adjusted for the lease tenor and operator expense shift terms.',
      formula: 'Annual Yield (%) = [ Lease Rent OR Post-Lease Commercial Revenue - Landlord Opex ] / Original Purchase Price × 100',
      derivation: [
        '1. During Lease Tenor: Monthly revenue is calculated as Rent per Day × 26 business days.',
        '2. Lessee Opex Shift: If active, daily operational costs (Fuel, driver wages, local ticket levies) are shifted to the lessee, lowering Landlord Opex to only servicing and insurance.',
        '3. Post-Lease Term: Revenue defaults back to the gross commercial standard, and opex reverts to full landlord responsibility.',
        '4. Compounding: Returns are aggregated and inflation-adjusted over the projected tenor years.'
      ],
      example: 'A Korope bought at ₦4.8M rented for ₦10k daily. Dynamic Lease Revenue = ₦10,000 × 26 × 12 = ₦3.12M/yr. If Opex is shifted, net returns exceed 55% ROI.'
    },
    {
      id: 'irr',
      title: 'IRR: Internal Rate of Return (Equity Leveraged IRR)',
      description: 'IRR tracks the compound annualized rate of return earned on the company\'s equity capital contribution, excluding the matched investor funding share.',
      formula: '0 = ∑ [ Net Owner Cash Flow_t / (1 + IRR)^t ] - Company Equity Contribution',
      derivation: [
        '1. Target Equity: Company Equity = Purchase Price × (100% - Investor Matching Support %).',
        '2. Net Owner Cash Flow: Represents the net cash flow left after subtracting the investor matched payout share and annual operational expenditures.',
        '3. Numerical solving iterates to determine the exact discount rate where Net Present Value (NPV) equates to exactly zero.'
      ],
      example: 'For ₦10M bus with 40% matched investor funding: Your Initial Outflow is ₦6.0M. Projected returns yield an annualized equity IRR of ~32%.'
    },
    {
      id: 'moic',
      title: 'MOIC: Multiple on Invested Capital (Total Return Multiple)',
      description: 'MOIC measures the total return multiplier value. It integrates total cumulative disbursed cash distributions to date with the remaining depreciated book residual salvage value.',
      formula: 'MOIC = ( Cumulative Cash Payouts to Owner + Declining Balance Book Value ) / Original Company Equity',
      derivation: [
        '1. Cumulative Payouts: Combined monthly dividend allocations and net retained earnings returned over time.',
        '2. Residual Book Value: Vehicle value degraded annually using the standard declining balance depreciation rate.',
        '3. Divided by Original Company Net Equity Contribution.'
      ],
      example: 'With ₦3M own equity, ₦4M returned over 3 years, and ₦1M vehicle residual salvage book value: MOIC = (₦4M + ₦1M) / ₦3M = 1.67x.'
    },
    {
      id: 'fuel',
      title: 'Fuel Costs: Litres-Based Volumetric Calculations vs Fallback',
      description: 'Models fuel budget based on active days operated and expected fuel consumption per day, which is the standard Nigerian transport model.',
      formula: 'Annual Fuel Cost = Litres/Day × Price/Litre × Operating Days/Yr',
      derivation: [
        '1. Check Override inputs first. If Litres/Day > 0 and Price/Litre > 0, the system overrides mileage-based approximations.',
        '2. Falls back to Mileage Fuel Calculation: (Annual KM Driven × Fallback Fuel Rate ₦/KM) if overrides are zero.',
        '3. Over long horizons, these daily fuel costs compound directly with the local inflation vector.'
      ],
      example: 'Danfo using 35 Litres/Day at ₦1,100/Litre for 312 operating days = 35 × ₦1,100 × 312 = ₦12,012,000 annually.'
    }
  ];

  return (
    <div id="calculation-details" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Calculations & Mathematical Inspector
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Click any equation to inspect the financial formulas and compounding logic.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((sec) => (
          <div
            id={`calc-sec-${sec.id}`}
            key={sec.id}
            className="border border-slate-100 dark:border-slate-800/80 rounded-lg overflow-hidden transition-all text-xs"
          >
            <button
              onClick={() => toggleSection(sec.id)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer text-left font-medium text-slate-705 dark:text-slate-200"
            >
              <span className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-500" />
                {sec.title}
              </span>
              {openSection === sec.id ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSection === sec.id && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <p className="text-slate-500 dark:text-slate-400">
                  {sec.description}
                </p>

                {/* Equation Card */}
                <div className="p-3 bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-100/80 dark:border-cyan-900/40 rounded-lg font-mono text-cyan-900 dark:text-cyan-300 text-center select-all">
                  {sec.formula}
                </div>

                {/* Derivation list */}
                <div className="space-y-2">
                  <h5 className="font-semibold text-slate-700 dark:text-slate-300">
                    Chronological Derivation Steps:
                  </h5>
                  <ul className="space-y-1 my-1">
                    {sec.derivation.map((step, idx) => (
                      <li key={idx} className="list-disc list-inside text-slate-500 dark:text-slate-400 leading-relaxed pl-2">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practical Example */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded text-slate-400 dark:text-slate-500 text-[11px] leading-relaxed italic">
                  <strong>Practical Example:</strong> {sec.example}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
