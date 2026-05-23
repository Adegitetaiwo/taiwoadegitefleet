/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Vehicle, DetailedFinancialYear, PortfolioSummary } from '../types';

/**
 * Generates a professional PDF Investor Prospectus & Financial Report of the fleet in Naira (₦) and IRR.
 */
export function generateInvestorPDF(
  vehicles: Vehicle[],
  portfolioSummary: PortfolioSummary,
  projections: DetailedFinancialYear[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper color variables
  const PRIMARY_COLOR = [22, 78, 99]; // deep slate/teal
  const SECONDARY_COLOR = [8, 145, 178]; // cyan
  const DARK_TEXT = [15, 23, 42]; // deep slate text
  const LIGHT_TEXT = [100, 116, 139]; // lighter gray text
  const SEPARATOR_GREY = [226, 232, 240];

  // ================= PAGE 1: COVER PAGE =================
  // Top decorative block
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Secondary accent line
  doc.setFillColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
  doc.rect(0, 90, pageWidth, 4, 'F');

  // Title in White on top block
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('NIGERIAN TRANSIT FLEET', 20, 45);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Investor Prospectus & Compounding Yield Report (NGN ₦)', 20, 58);

  // Subtitle/Meta
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TRANSPORTATION FLEET & MODELING PROJECTIONS', 20, 115);

  doc.setDrawColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
  doc.setLineWidth(1);
  doc.line(20, 120, 100, 120);

  // Executive Summary Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);

  const summaryText = 
    `This prospectus provides a comprehensive, inflation-adjusted financial prognosis for a targeted rolling stock acquisitions portfolio. Utilizing advanced compounding interest modeling, depreciation curves, and escalating operational expenses (including drivers' wages, union levies, ticket registrations, expected maintenance logs, and fuel price indexes), we provide a 10-year outlook of Returns on Investment (ROI), Internal Rates of Return (IRR), and projected dividend distributions in Naira (₦).`;
  
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
  doc.text(splitSummary, 20, 132);

  // Portfolio KPIs as highlighted card elements
  doc.setFillColor(248, 250, 252); // soft slate bg
  doc.rect(20, 165, pageWidth - 40, 52, 'F');
  
  // Outer frame
  doc.setDrawColor(SEPARATOR_GREY[0], SEPARATOR_GREY[1], SEPARATOR_GREY[2]);
  doc.setLineWidth(0.5);
  doc.rect(20, 165, pageWidth - 40, 52, 'S');

  // Core KPI displays
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  doc.text('PORTFOLIO COMMITTEED CAPITAL', 25, 175);
  doc.text('ESTIMATED YEARLY REVENUE', 110, 175);

  doc.text('AVERAGE ROI (10-YR)', 25, 198);
  doc.text('AVERAGE PORTFOLIO IRR', 110, 198);

  // Big numbers
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setFontSize(15);
  doc.text(`NGN ₦${portfolioSummary.totalPurchaseValue.toLocaleString()}`, 25, 183);
  doc.text(`NGN ₦${portfolioSummary.annualRevenue.toLocaleString()}/yr`, 110, 183);
  doc.text(`${portfolioSummary.averageRoi.toFixed(0)}%`, 25, 206);
  doc.text(`${portfolioSummary.averageIrr.toFixed(1)}%`, 110, 206);

  // Footer date
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}  |  Secure Investor Portal`, 20, 275);
  
  // Page number
  doc.setFont('helvetica', 'normal');
  doc.text('Page 1 of 2', pageWidth - 35, 275);

  // ================= PAGE 2: VEHICLE LOGS & DETAILED PLAN =================
  doc.addPage();

  // Draw header block on Page 2
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INVESTOR PORTFOLIO INDEX & MULTI-YEAR MODELING', 15, 12);

  // Title for Fleet Index
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFontSize(12);
  doc.text('Portfolio Vehicles & Rolling Stock Assets', 15, 28);
  
  // Table header for lists
  let startY = 34;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, startY, pageWidth - 30, 8, 'F');
  doc.setLineWidth(0.3);
  doc.line(15, startY + 8, pageWidth - 15, startY + 8);
  
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Asset Name', 18, startY + 5.5);
  doc.text('Preset Category', 55, startY + 5.5);
  doc.text('Purchase Price', 95, startY + 5.5);
  doc.text('Deprec. Rate', 125, startY + 5.5);
  doc.text('Wages / Levies', 152, startY + 5.5);
  doc.text('Div. Rate', 182, startY + 5.5);

  doc.setFont('helvetica', 'normal');
  let currentY = startY + 8;
  
  vehicles.forEach((vehicle, vIdx) => {
    // Alternate backgrounds
    if (vIdx % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, currentY, pageWidth - 30, 7.5, 'F');
    }
    doc.line(15, currentY + 7.5, pageWidth - 15, currentY + 7.5);

    doc.text(vehicle.name, 18, currentY + 5);
    doc.text(vehicle.type.split(' ')[0], 55, currentY + 5);
    doc.text(`₦${vehicle.purchasePrice.toLocaleString()}`, 95, currentY + 5);
    doc.text(`${vehicle.annualDepreciationRate}%/yr`, 125, currentY + 5);
    doc.text(`₦${((vehicle.driverMonthlySalary || 0) + (vehicle.leviesAndTaxesMonthly || 0)).toLocaleString()}/mo`, 152, currentY + 5);
    doc.text(`${vehicle.dividendPayoutRate}%`, 182, currentY + 5);

    currentY += 7.5;
  });

  // Section: Year Projections Table (Naira formatted)
  const projStartY = currentY + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('10-Year Portfolio-Level Projections (Consolidated)', 15, projStartY);

  // Table header for projections
  const colY = projStartY + 6;
  doc.setFillColor(15, 23, 42); // very dark slate header
  doc.rect(15, colY, pageWidth - 30, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Yr', 17, colY + 5.5);
  doc.text('Revenue', 24, colY + 5.5);
  doc.text('OpEx Pool', 55, colY + 5.5);
  doc.text('Resale Value', 90, colY + 5.5);
  doc.text('Div. Payout', 125, colY + 5.5);
  doc.text('ROI', 155, colY + 5.5);
  doc.text('IRR', 172, colY + 5.5);
  doc.text('MOIC', 186, colY + 5.5);

  let py = colY + 8;
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.setFont('helvetica', 'normal');

  projections.forEach((proj, idx) => {
    // Alternating backgrounds
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, py, pageWidth - 30, 7, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(15, py + 7, pageWidth - 15, py + 7);

    // Summing fuel, maint, levies, wages and insurance
    const opexPool = Math.round(
      proj.maintenanceCost + 
      proj.fuelCost + 
      proj.insuranceCost + 
      (proj.driverWagesCost || 0) + 
      (proj.leviesCost || 0)
    );

    doc.text(`Y${proj.year}`, 17, py + 4.8);
    doc.text(`₦${Math.round(proj.revenue).toLocaleString()}`, 24, py + 4.8);
    doc.text(`₦${opexPool.toLocaleString()}`, 55, py + 4.8);
    doc.text(`₦${Math.round(proj.depreciatedValue).toLocaleString()}`, 90, py + 4.8);
    doc.text(`₦${Math.round(proj.dividendPayout).toLocaleString()}`, 125, py + 4.8);
    doc.text(`${proj.roi.toFixed(0)}%`, 155, py + 4.8);
    doc.text(`${proj.irr.toFixed(1)}%`, 172, py + 4.8);
    doc.text(`${proj.moic.toFixed(2)}x`, 186, py + 4.8);

    py += 7;
  });

  // Quick explanations block
  doc.setFillColor(254, 254, 254);
  const explY = py + 8;
  doc.rect(15, explY, pageWidth - 30, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(15, explY, pageWidth - 30, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('CALCULATION DIRECTIVES:', 18, explY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  doc.text('• ROI (Return on Investment): Cumulative operating cash flow (Revenue - OpEx Pool) / Capital Purchase Price.', 18, explY + 10);
  doc.text('• IRR (Internal Rate of Return): Compounding annual discount rate yielding the cumulative cash distributions NPV equal to zero.', 18, explY + 14);
  doc.text('• MOIC (Multiple on Invested Capital): (Cumulative Dividends + Resale Salvage Value) / Initial Purchase Price.', 18, explY + 18);

  // Footer
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Transportation Fleet Management Portfolio  |  Class-A Investor Report`, 15, 275);
  doc.setFont('helvetica', 'normal');
  doc.text('Page 2 of 2', pageWidth - 35, 275);

  // Save the PDF
  doc.save('Transport_Fleet_Investment_Prospectus.pdf');
}
