/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, DetailedFinancialYear, PortfolioSummary } from '../types';

/**
 * Calculates Internal Rate of Return (IRR) using the Bisection method for high stability.
 */
export function calculateIRR(cashFlows: number[]): number {
  if (cashFlows.length < 2) return 0;
  
  const hasNegative = cashFlows.some(cf => cf < 0);
  const hasPositive = cashFlows.some(cf => cf > 0);
  if (!hasNegative || !hasPositive) return 0;

  let low = -0.95; // -95%
  let high = 8.0;  // 800%
  let mid = 0.1;
  const tolerance = 0.0001;
  const maxIterations = 100;

  const getNPV = (rate: number) => {
    return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
  };

  let npvLow = getNPV(low);
  let npvHigh = getNPV(high);

  if (Math.abs(npvLow) < tolerance) return low * 100;
  if (Math.abs(npvHigh) < tolerance) return high * 100;

  // If signs of npvLow and npvHigh are same, we cannot perform bisection directly
  if (npvLow * npvHigh > 0) {
    // If NPV is positive even at negative extreme, IRR is extremely high
    if (npvLow > 0) return 300.0;
    // Otherwise, return 0 or negative
    return -50.0;
  }

  for (let i = 0; i < maxIterations; i++) {
    mid = (low + high) / 2;
    const npvMid = getNPV(mid);

    if (Math.abs(npvMid) < tolerance) {
      return mid * 100;
    }

    if (npvMid * npvLow < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return mid * 100;
}

/**
 * Calculates a 10-year financial projection for a single transportation vehicle.
 */
export function calculateVehicleProjections(vehicle: Vehicle, totalYears: number = 10): DetailedFinancialYear[] {
  const projections: DetailedFinancialYear[] = [];
  
  let cumulativeRevenue = 0;
  let cumulativeExpenses = 0;
  let cumulativeDividends = 0;
  let currentDepreciatedValue = vehicle.purchasePrice;

  // Yearly rates
  const infRate = (vehicle.inflationRate || 0) / 100;
  const depRate = (vehicle.annualDepreciationRate || 0) / 100;
  const divRate = (vehicle.dividendPayoutRate || 0) / 100;

  // New params with default values
  const investorShare = vehicle.investorSharePercent !== undefined ? vehicle.investorSharePercent : 0;
  const rentalTenor = vehicle.rentalTenorYears !== undefined ? vehicle.rentalTenorYears : 10;
  const fixedDailyRent = vehicle.fixedDailyRent !== undefined ? vehicle.fixedDailyRent : 0;
  const passOpex = vehicle.passOpexToRenter !== undefined ? vehicle.passOpexToRenter : false;
  const fuelConsumption = vehicle.fuelConsumptionDaily !== undefined ? vehicle.fuelConsumptionDaily : 0;
  const fuelPricePerLiter = vehicle.fuelPricePerLiter !== undefined ? vehicle.fuelPricePerLiter : 0;
  const activeDays = vehicle.activeDaysPerYear !== undefined ? vehicle.activeDaysPerYear : 312;

  const ownerCapitalInvested = vehicle.purchasePrice * (1 - investorShare / 100);
  const investorCapitalInvested = vehicle.purchasePrice * (investorShare / 100);

  // Get minimum salvage value
  const salvageRate = vehicle.salvageValuePercent !== undefined ? vehicle.salvageValuePercent : 15;
  const minSalvageValue = vehicle.purchasePrice * (salvageRate / 100);

  // We will build cash flow profiles to calculate IRR dynamically for each hold period (year 1 to t)
  const yearlyNetCashFlows: number[] = [];
  const ownerYearlyNetCashFlows: number[] = [];

  for (let year = 1; year <= totalYears; year++) {
    // Inflation compounding factor
    const inflationFactor = Math.pow(1 + infRate, year - 1);

    const runAsCompany = vehicle.runAsCompany === true;

    // Dynamic Revenue: Use flat contracted rent during tenor, revert of standard operations post-tenor
    let yearlyRevenue = 0;
    if (runAsCompany) {
      yearlyRevenue = (vehicle.monthlyRevenue || 0) * 12 * inflationFactor; // Standard commercial operation
    } else if (year <= rentalTenor && fixedDailyRent > 0) {
      yearlyRevenue = fixedDailyRent * activeDays; // Contractual flat daily rate
    } else {
      yearlyRevenue = (vehicle.monthlyRevenue || 0) * 12 * inflationFactor; // Standard commercial operation
    }

    // Maintenance cost (Always paid by company)
    const maintenanceCost = (vehicle.expectedMaintenanceMonthly || 0) * 12 * inflationFactor;
    // Insurance cost (Always paid by company)
    const insuranceCost = (vehicle.insurancePremiumMonthly || 0) * 12 * inflationFactor;

    // Fuel expense configuration
    const useNewFuelCalc = fuelConsumption > 0 && fuelPricePerLiter > 0;
    const baseFuelCost = useNewFuelCalc
      ? (fuelConsumption * fuelPricePerLiter * activeDays * inflationFactor)
      : ((vehicle.annualDistanceMiles || 0) * (vehicle.fuelPriceRate || 0) * inflationFactor);

    let fuelCost = 0;
    let driverWagesCost = 0;
    let leviesCost = 0;

    if (runAsCompany) {
      // Company pays all operational items including driver salary, fuel and taxes
      fuelCost = baseFuelCost;
      driverWagesCost = (vehicle.driverMonthlySalary || 0) * 12 * inflationFactor;
      leviesCost = (vehicle.leviesAndTaxesMonthly || 0) * 12 * inflationFactor;
    } else {
      // Rent out lease model: NO company driver wages are paid (0 wages)
      driverWagesCost = 0;

      if (year <= rentalTenor && passOpex) {
        // Lessee bears Fuel and Union levies
        fuelCost = 0;
        leviesCost = 0;
      } else {
        // Landlord/Company pays fuel and union dues
        fuelCost = baseFuelCost;
        leviesCost = (vehicle.leviesAndTaxesMonthly || 0) * 12 * inflationFactor;
      }
    }

    const yearlyOperationsCost = maintenanceCost + fuelCost + insuranceCost + driverWagesCost + leviesCost;

    // Depreciation (declining balance bottoming out at salvage minimum)
    const depreciationAmt = currentDepreciatedValue * depRate;
    currentDepreciatedValue = Math.max(minSalvageValue, currentDepreciatedValue - depreciationAmt);

    // Yearly TCO (cumulative purchase price plus operating costs up to year t)
    const totalCostOfOwnership = vehicle.purchasePrice + cumulativeExpenses + yearlyOperationsCost;

    // Net accounting Profit before dividend distribution: Revenue - Operations - Depreciation
    const netProfit = yearlyRevenue - yearlyOperationsCost - depreciationAmt;
    
    // Dividend payout based on cash profit bottomed at 0
    const dividendPayout = Math.max(0, netProfit * divRate);

    cumulativeRevenue += yearlyRevenue;
    cumulativeExpenses += yearlyOperationsCost;
    cumulativeDividends += dividendPayout;

    // Asset Financial Ratios
    const cashProfit = cumulativeRevenue - cumulativeExpenses;
    const roi = (cashProfit / vehicle.purchasePrice) * 100;

    // Keep track of history of net operational cash flows for overall Asset IRR
    const netCashFlowThisYear = yearlyRevenue - yearlyOperationsCost;
    yearlyNetCashFlows.push(netCashFlowThisYear);

    const holdPeriodCashFlows = [-vehicle.purchasePrice, ...yearlyNetCashFlows.slice(0, year - 1)];
    holdPeriodCashFlows.push(netCashFlowThisYear + currentDepreciatedValue);
    const irr = calculateIRR(holdPeriodCashFlows);

    const moic = (cumulativeDividends + currentDepreciatedValue) / vehicle.purchasePrice;

    // Owner Leverage & Splits calculations
    const ownerShareDividends = dividendPayout * (1 - investorShare / 100);
    const investorShareDividends = dividendPayout * (investorShare / 100);

    const ownerResaleVal = currentDepreciatedValue * (1 - investorShare / 100);
    const ownerCumulativeDividends = cumulativeDividends * (1 - investorShare / 100);

    const ownerRoi = ownerCapitalInvested > 0 
      ? ((cashProfit * (1 - investorShare / 100)) / ownerCapitalInvested) * 100 
      : 0;

    const ownerNetCashThisYear = netCashFlowThisYear * (1 - investorShare / 100);
    ownerYearlyNetCashFlows.push(ownerNetCashThisYear);

    const ownerHoldPeriodCashFlows = [-ownerCapitalInvested, ...ownerYearlyNetCashFlows.slice(0, year - 1)];
    ownerHoldPeriodCashFlows.push(ownerNetCashThisYear + ownerResaleVal);
    const ownerIrr = ownerCapitalInvested > 0 ? calculateIRR(ownerHoldPeriodCashFlows) : 0;

    const ownerMoic = ownerCapitalInvested > 0 
      ? (ownerCumulativeDividends + ownerResaleVal) / ownerCapitalInvested 
      : 0;

    projections.push({
      year,
      revenue: yearlyRevenue,
      maintenanceCost,
      fuelCost,
      insuranceCost,
      driverWagesCost,
      leviesCost,
      totalCostOfOwnership,
      depreciatedValue: currentDepreciatedValue,
      netProfit,
      dividendPayout,
      roi,
      irr,
      moic,
      cumulativeRevenue,
      cumulativeExpenses,
      cumulativeDividends,

      // Splits
      ownerCapitalInvested,
      investorCapitalInvested,
      ownerShareDividends,
      investorShareDividends,
      ownerRoi,
      ownerIrr,
      ownerMoic,
    });
  }

  return projections;
}

/**
 * Combines multiple vehicles' projections into a single aggregate portfolio projection.
 */
export function calculatePortfolioProjections(vehicles: Vehicle[], totalYears: number = 10): DetailedFinancialYear[] {
  if (vehicles.length === 0) {
    return Array.from({ length: totalYears }, (_, i) => ({
      year: i + 1,
      revenue: 0,
      maintenanceCost: 0,
      fuelCost: 0,
      insuranceCost: 0,
      driverWagesCost: 0,
      leviesCost: 0,
      totalCostOfOwnership: 0,
      depreciatedValue: 0,
      netProfit: 0,
      dividendPayout: 0,
      roi: 0,
      irr: 0,
      moic: 0,
      cumulativeRevenue: 0,
      cumulativeExpenses: 0,
      cumulativeDividends: 0,
      ownerCapitalInvested: 0,
      investorCapitalInvested: 0,
      ownerShareDividends: 0,
      investorShareDividends: 0,
      ownerRoi: 0,
      ownerIrr: 0,
      ownerMoic: 0,
    }));
  }

  const allVehicleProjections = vehicles.map(v => calculateVehicleProjections(v, totalYears));
  const aggregateProjections: DetailedFinancialYear[] = [];
  const totalPurchaseValue = vehicles.reduce((sum, v) => sum + v.purchasePrice, 0);

  const totalOwnerEquity = vehicles.reduce((sum, v) => {
    const share = v.investorSharePercent !== undefined ? v.investorSharePercent : 0;
    return sum + v.purchasePrice * (1 - share / 100);
  }, 0);

  const totalInvestorEquity = vehicles.reduce((sum, v) => {
    const share = v.investorSharePercent !== undefined ? v.investorSharePercent : 0;
    return sum + v.purchasePrice * (share / 100);
  }, 0);

  // We will build portfolio aggregate cash flows to compute Portfolio level hold-period IRR
  const portfolioNetCashFlows: number[] = [];
  const portfolioOwnerNetCashFlows: number[] = [];

  for (let yearIdx = 0; yearIdx < totalYears; yearIdx++) {
    let year = yearIdx + 1;
    let revenue = 0;
    let maintenanceCost = 0;
    let fuelCost = 0;
    let insuranceCost = 0;
    let driverWagesCost = 0;
    let leviesCost = 0;
    let totalCostOfOwnership = 0;
    let depreciatedValue = 0;
    let netProfit = 0;
    let dividendPayout = 0;
    let cumulativeRevenue = 0;
    let cumulativeExpenses = 0;
    let cumulativeDividends = 0;

    let ownerShareDividends = 0;
    let investorShareDividends = 0;
    let ownerResaleValue = 0;

    vehicles.forEach((v, vIdx) => {
      const yearData = allVehicleProjections[vIdx][yearIdx];
      revenue += yearData.revenue;
      maintenanceCost += yearData.maintenanceCost;
      fuelCost += yearData.fuelCost;
      insuranceCost += yearData.insuranceCost;
      driverWagesCost += yearData.driverWagesCost;
      leviesCost += yearData.leviesCost;
      totalCostOfOwnership += yearData.totalCostOfOwnership;
      depreciatedValue += yearData.depreciatedValue;
      netProfit += yearData.netProfit;
      dividendPayout += yearData.dividendPayout;
      cumulativeRevenue += yearData.cumulativeRevenue;
      cumulativeExpenses += yearData.cumulativeExpenses;
      cumulativeDividends += yearData.cumulativeDividends;

      // splits
      ownerShareDividends += yearData.ownerShareDividends;
      investorShareDividends += yearData.investorShareDividends;
      ownerResaleValue += yearData.depreciatedValue * (1 - (v.investorSharePercent || 0) / 100);
    });

    const cashProfit = cumulativeRevenue - cumulativeExpenses;
    const roi = (cashProfit / totalPurchaseValue) * 100;

    const yearlyTotalOpex = maintenanceCost + fuelCost + insuranceCost + driverWagesCost + leviesCost;
    const yearlyNetCashIO = revenue - yearlyTotalOpex;
    portfolioNetCashFlows.push(yearlyNetCashIO);

    // Overall Asset IRR
    const holdPeriodCashFlows = [-totalPurchaseValue, ...portfolioNetCashFlows.slice(0, yearIdx)];
    holdPeriodCashFlows.push(yearlyNetCashIO + depreciatedValue);
    const irr = calculateIRR(holdPeriodCashFlows);
    const moic = (cumulativeDividends + depreciatedValue) / totalPurchaseValue;

    // Portfolio Owner metrics
    const ownerCashProfit = cumulativeRevenue - cumulativeExpenses;
    const ownerRoi = totalOwnerEquity > 0
      ? ((vehicles.reduce((sum, v, vIdx) => {
          const share = v.investorSharePercent !== undefined ? v.investorSharePercent : 0;
          const vData = allVehicleProjections[vIdx][yearIdx];
          const vCashProfit = vData.cumulativeRevenue - vData.cumulativeExpenses;
          return sum + vCashProfit * (1 - share / 100);
        }, 0) / totalOwnerEquity) * 100)
      : 0;

    const yearlyOwnerPayoutThisYear = vehicles.reduce((sum, v, vIdx) => {
      const share = v.investorSharePercent !== undefined ? v.investorSharePercent : 0;
      const vOpex = allVehicleProjections[vIdx][yearIdx].maintenanceCost + 
                    allVehicleProjections[vIdx][yearIdx].fuelCost + 
                    allVehicleProjections[vIdx][yearIdx].insuranceCost + 
                    allVehicleProjections[vIdx][yearIdx].driverWagesCost + 
                    allVehicleProjections[vIdx][yearIdx].leviesCost;
      const vNet = allVehicleProjections[vIdx][yearIdx].revenue - vOpex;
      return sum + vNet * (1 - share / 100);
    }, 0);
    portfolioOwnerNetCashFlows.push(yearlyOwnerPayoutThisYear);

    const ownerHoldPeriodCashFlows = [-totalOwnerEquity, ...portfolioOwnerNetCashFlows.slice(0, yearIdx)];
    ownerHoldPeriodCashFlows.push(yearlyOwnerPayoutThisYear + ownerResaleValue);
    const ownerIrr = totalOwnerEquity > 0 ? calculateIRR(ownerHoldPeriodCashFlows) : 0;

    const cumulativeOwnerDividends = vehicles.reduce((sum, v, vIdx) => {
      const share = v.investorSharePercent !== undefined ? v.investorSharePercent : 0;
      return sum + allVehicleProjections[vIdx][yearIdx].cumulativeDividends * (1 - share / 100);
    }, 0);
    const ownerMoic = totalOwnerEquity > 0 ? (cumulativeOwnerDividends + ownerResaleValue) / totalOwnerEquity : 0;

    aggregateProjections.push({
      year,
      revenue,
      maintenanceCost,
      fuelCost,
      insuranceCost,
      driverWagesCost,
      leviesCost,
      totalCostOfOwnership,
      depreciatedValue,
      netProfit,
      dividendPayout,
      roi: isNaN(roi) ? 0 : roi,
      irr: isNaN(irr) ? 0 : irr,
      moic: isNaN(moic) ? 0 : moic,
      cumulativeRevenue,
      cumulativeExpenses,
      cumulativeDividends,

      // Splits
      ownerCapitalInvested: totalOwnerEquity,
      investorCapitalInvested: totalInvestorEquity,
      ownerShareDividends,
      investorShareDividends,
      ownerRoi: isNaN(ownerRoi) ? 0 : ownerRoi,
      ownerIrr: isNaN(ownerIrr) ? 0 : ownerIrr,
      ownerMoic: isNaN(ownerMoic) ? 0 : ownerMoic,
    });
  }

  return aggregateProjections;
}

/**
 * Creates a high-level statistics summary of the vehicle portfolio.
 */
export function calculatePortfolioSummary(vehicles: Vehicle[]): PortfolioSummary {
  const totalPurchaseValue = vehicles.reduce((sum, v) => sum + v.purchasePrice, 0);
  
  const annualRevenue = vehicles.reduce((sum, v) => {
    const rentalTenor = v.rentalTenorYears !== undefined ? v.rentalTenorYears : 10;
    const fixedDailyRent = v.fixedDailyRent !== undefined ? v.fixedDailyRent : 0;
    const activeDays = v.activeDaysPerYear !== undefined ? v.activeDaysPerYear : 312;
    
    // Year 1 Revenue
    if (v.runAsCompany === true) {
      return sum + ((v.monthlyRevenue || 0) * 12);
    } else if (fixedDailyRent > 0) {
      return sum + (fixedDailyRent * activeDays);
    } else {
      return sum + ((v.monthlyRevenue || 0) * 12);
    }
  }, 0);
  
  const annualOperatingCost = vehicles.reduce((sum, v) => {
    const runAsCompany = v.runAsCompany === true;
    const passOpex = v.passOpexToRenter !== undefined ? v.passOpexToRenter : false;
    const fuelConsumption = v.fuelConsumptionDaily !== undefined ? v.fuelConsumptionDaily : 0;
    const fuelPricePerLiter = v.fuelPricePerLiter !== undefined ? v.fuelPricePerLiter : 0;
    const activeDays = v.activeDaysPerYear !== undefined ? v.activeDaysPerYear : 312;

    const maintenance = (v.expectedMaintenanceMonthly || 0) * 12;
    const insurance = (v.insurancePremiumMonthly || 0) * 12;

    const useNewFuelCalc = fuelConsumption > 0 && fuelPricePerLiter > 0;
    const baseFuelCost = useNewFuelCalc 
      ? (fuelConsumption * fuelPricePerLiter * activeDays)
      : ((v.annualDistanceMiles || 0) * (v.fuelPriceRate || 0));

    let fuel = 0;
    let wages = 0;
    let levies = 0;

    if (runAsCompany) {
      fuel = baseFuelCost;
      wages = (v.driverMonthlySalary || 0) * 12;
      levies = (v.leviesAndTaxesMonthly || 0) * 12;
    } else {
      wages = 0; // Rent out lease model means 0 company wages
      if (!passOpex) {
        fuel = baseFuelCost;
        levies = (v.leviesAndTaxesMonthly || 0) * 12;
      }
    }

    return sum + maintenance + fuel + insurance + wages + levies;
  }, 0);

  const totalOwnerEquity = vehicles.reduce((sum, v) => {
    const share = v.investorSharePercent !== undefined ? v.investorSharePercent : 0;
    return sum + v.purchasePrice * (1 - share / 100);
  }, 0);

  const totalInvestorEquity = vehicles.reduce((sum, v) => {
    const share = v.investorSharePercent !== undefined ? v.investorSharePercent : 0;
    return sum + v.purchasePrice * (share / 100);
  }, 0);

  const tenYrProjections = calculatePortfolioProjections(vehicles, 10);
  const endYear = tenYrProjections[9]; // Year 10 numbers

  return {
    totalPurchaseValue,
    annualRevenue,
    annualOperatingCost,
    averageRoi: endYear ? endYear.roi : 0,
    averageIrr: endYear ? endYear.irr : 0,
    averageMoic: endYear ? endYear.moic : 1.0,
    projected10YrDividends: endYear ? endYear.cumulativeDividends : 0,

    // Splits
    totalOwnerEquity,
    totalInvestorEquity,
    averageOwnerRoi: endYear ? endYear.ownerRoi : 0,
    averageOwnerIrr: endYear ? endYear.ownerIrr : 0,
    averageOwnerMoic: endYear ? endYear.ownerMoic : 1.0,
  };
}
