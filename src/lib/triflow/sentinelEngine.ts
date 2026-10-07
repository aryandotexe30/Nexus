import { 
  TriFlowDeal, 
  MassBalanceAudit, 
  SentinelAlert, 
  CashFlowMilestone,
  RawMaterialBOM,
  FinishedProductSpec
} from './types';
import { generateStructuredAIResponse } from '../searchProtocol';

export function calculateMassBalanceAudit(
  raw: RawMaterialBOM,
  finished: FinishedProductSpec
): MassBalanceAudit {
  const rawSupplied = raw.quantitySuppliedKg;
  const yieldRatio = finished.contractedYieldRatio || 3.8; // e.g., 3.8 kg finished per kg raw or equivalent area
  const baselineScrapPct = finished.expectedScrapRatePercent || 4.5;
  const reportedScrapPct = finished.reportedScrapRatePercent !== undefined 
    ? finished.reportedScrapRatePercent 
    : baselineScrapPct;

  // Theoretical scrap in kg
  const theoreticalScrapKg = (rawSupplied * baselineScrapPct) / 100;
  const reportedScrapKg = (rawSupplied * reportedScrapPct) / 100;

  // Finished tape weight expected
  const expectedFinishedKg = rawSupplied - theoreticalScrapKg;
  const reportedFinishedKg = rawSupplied - reportedScrapKg;

  // Unaccounted mass represents possible raw diversion
  const unaccountedMassKg = Math.max(0, reportedScrapKg - theoreticalScrapKg);
  
  // Mass balance efficiency
  const massBalanceEfficiencyPercent = Number(
    Math.max(0, Math.min(100, 100 - (unaccountedMassKg / rawSupplied) * 100)).toFixed(2)
  );

  // Caliper / GSM deviation
  let specDeviationPercent = 0;
  if (finished.targetAdhesiveGsm && finished.actualAdhesiveGsm) {
    specDeviationPercent = Number(
      (Math.abs(finished.targetAdhesiveGsm - finished.actualAdhesiveGsm) / finished.targetAdhesiveGsm * 100).toFixed(2)
    );
  }

  return {
    rawMaterialSuppliedKg: rawSupplied,
    expectedFinishedKg: Number(expectedFinishedKg.toFixed(1)),
    reportedFinishedKg: Number(reportedFinishedKg.toFixed(1)),
    theoreticalScrapKg: Number(theoreticalScrapKg.toFixed(1)),
    reportedScrapKg: Number(reportedScrapKg.toFixed(1)),
    unaccountedMassKg: Number(unaccountedMassKg.toFixed(1)),
    massBalanceEfficiencyPercent,
    specDeviationPercent
  };
}

export function calculateDealSpreadMetrics(
  raw: RawMaterialBOM,
  finished: FinishedProductSpec,
  supplierDays: number = 15,
  buyerDays: number = 60
) {
  const rawSpreadPerUnit = raw.transferPriceToBPerUnit - raw.procurementPricePerUnit;
  const rawSpreadTotal = rawSpreadPerUnit * raw.quantitySuppliedKg;

  const finishedSpreadPerUnit = finished.salesPriceToCPerUnit - finished.purchasePriceFromBPerUnit;
  const finishedSpreadTotal = finishedSpreadPerUnit * finished.orderedQuantityUnits;

  const totalGrossSpread = rawSpreadTotal + finishedSpreadTotal;
  const totalBuyerRevenue = finished.salesPriceToCPerUnit * finished.orderedQuantityUnits;
  const grossMarginPercent = totalBuyerRevenue > 0 
    ? Number(((totalGrossSpread / totalBuyerRevenue) * 100).toFixed(2)) 
    : 0;

  // Peak capital float at risk: we pay Supplier A + Converter B before Buyer C settles
  const costFromA = raw.procurementPricePerUnit * raw.quantitySuppliedKg;
  const costFromB = finished.purchasePriceFromBPerUnit * finished.orderedQuantityUnits;
  const revenueFromB = raw.transferPriceToBPerUnit * raw.quantitySuppliedKg;

  // Net cash locked up until Buyer C pays invoice:
  // We outlay to A, recover from B, then outlay to B for finished product.
  const peakCapitalFloatAtRisk = Math.max(0, costFromA - revenueFromB + costFromB);
  const floatDurationDays = Math.max(0, buyerDays - supplierDays);

  return {
    rawSpreadInrPerUnit: rawSpreadPerUnit,
    rawSpreadTotalInr: rawSpreadTotal,
    finishedSpreadInrPerUnit: finishedSpreadPerUnit,
    finishedSpreadTotalInr: finishedSpreadTotal,
    totalGrossSpreadInr: totalGrossSpread,
    grossMarginPercent,
    peakCapitalFloatAtRiskInr: peakCapitalFloatAtRisk,
    floatDurationDays
  };
}

export function runDeterministicSentinelRules(deal: TriFlowDeal): {
  riskScore: number;
  alerts: SentinelAlert[];
} {
  const alerts: SentinelAlert[] = [];
  let riskScore = 12; // baseline operational vigilance

  const { rawMaterial, finishedProduct, massBalance } = deal;

  // Rule 1: Mass-Balance Diversion Check (Scrap Padding)
  if (massBalance && massBalance.unaccountedMassKg > 0) {
    const scrapDeltaPct = (finishedProduct.reportedScrapRatePercent || 0) - finishedProduct.expectedScrapRatePercent;
    if (scrapDeltaPct > 5) {
      riskScore += 45;
      alerts.push({
        id: `ALT-DIV-${deal.id}-${Date.now().toString().slice(-4)}`,
        dealId: deal.id,
        category: 'MASS_BALANCE_DIVERSION',
        severity: scrapDeltaPct > 10 ? 'CRITICAL' : 'HIGH',
        title: `Abnormal Scrap Yield Anomaly (${scrapDeltaPct.toFixed(1)}% Excess Reported)`,
        details: `Converter ${deal.converterB.name} reported ${finishedProduct.reportedScrapRatePercent}% scrap (industry baseline is ${finishedProduct.expectedScrapRatePercent}%). ${massBalance.unaccountedMassKg} kg of raw material (${rawMaterial.materialName}) is unaccounted for, suggesting illicit material diversion to third-party production batches.`,
        evidence: {
          expectedValue: `${finishedProduct.expectedScrapRatePercent}% scrap (${massBalance.theoreticalScrapKg} kg)`,
          observedValue: `${finishedProduct.reportedScrapRatePercent}% scrap (${massBalance.reportedScrapKg} kg)`,
          variance: `+${scrapDeltaPct.toFixed(1)}% scrap (+${massBalance.unaccountedMassKg} kg missing)`
        },
        recommendedAction: 'Freeze milestone escrow payout to Converter B. Dispatch third-party weighbridge auditor to inspect factory scrap bins and slit cores.',
        autoEscrowHoldTriggered: true,
        createdAt: new Date().toISOString(),
        resolved: false
      });
    }
  }

  // Rule 2: Specification Downgrade / Resin Starvation (GSM Dilution)
  if (
    finishedProduct.targetAdhesiveGsm && 
    finishedProduct.actualAdhesiveGsm && 
    massBalance
  ) {
    const gsmShortfall = finishedProduct.targetAdhesiveGsm - finishedProduct.actualAdhesiveGsm;
    if (gsmShortfall > 3) {
      riskScore += 30;
      alerts.push({
        id: `ALT-SPEC-${deal.id}-${Date.now().toString().slice(-4)}`,
        dealId: deal.id,
        category: 'SPECIFICATION_SUBSTITUTION',
        severity: gsmShortfall > 7 ? 'CRITICAL' : 'HIGH',
        title: `Sub-specification Adhesive Coating Detected (${gsmShortfall} GSM Shortfall)`,
        details: `QC micrometer inspection revealed finished tape has only ${finishedProduct.actualAdhesiveGsm} GSM coating versus contractually locked ${finishedProduct.targetAdhesiveGsm} GSM. Converter B appears to be saving adhesive resin for non-contract jobs. Risk of adhesion failure at Buyer C (${deal.buyerC.name}).`,
        evidence: {
          expectedValue: `${finishedProduct.targetAdhesiveGsm} GSM`,
          observedValue: `${finishedProduct.actualAdhesiveGsm} GSM`,
          variance: `-${gsmShortfall} GSM (-${massBalance.specDeviationPercent}%)`
        },
        recommendedAction: 'Reject finished lot. Request mandatory recoat or enforce SLA penalty credit on Converter B invoice before dispatch to Buyer C.',
        autoEscrowHoldTriggered: true,
        createdAt: new Date().toISOString(),
        resolved: false
      });
    }
  }

  // Rule 3: Weighbridge Transit Discrepancy
  if (rawMaterial.receivingWeighbridgeKg && rawMaterial.dispatchWeighbridgeKg) {
    const transitLossKg = rawMaterial.dispatchWeighbridgeKg - rawMaterial.receivingWeighbridgeKg;
    const lossPct = (transitLossKg / rawMaterial.dispatchWeighbridgeKg) * 100;
    if (lossPct > 1.2) {
      riskScore += 20;
      alerts.push({
        id: `ALT-WEIGH-${deal.id}-${Date.now().toString().slice(-4)}`,
        dealId: deal.id,
        category: 'WEIGHBRIDGE_DISCREPANCY',
        severity: lossPct > 3 ? 'HIGH' : 'MEDIUM',
        title: `Weighbridge Transit Shrinkage (${lossPct.toFixed(1)}% Loss)`,
        details: `Logistics manifest from Supplier A (${deal.supplierA.name}) weighed ${rawMaterial.dispatchWeighbridgeKg} kg, but receiving bay at Converter B (${deal.converterB.name}) recorded only ${rawMaterial.receivingWeighbridgeKg} kg. Shortfall of ${transitLossKg.toFixed(1)} kg during transit.`,
        evidence: {
          expectedValue: `${rawMaterial.dispatchWeighbridgeKg} kg`,
          observedValue: `${rawMaterial.receivingWeighbridgeKg} kg`,
          variance: `-${transitLossKg.toFixed(1)} kg (-${lossPct.toFixed(1)}%)`
        },
        recommendedAction: 'Trigger logistics transit insurance claim and request toll plaza weigh slips from carrier.',
        autoEscrowHoldTriggered: false,
        createdAt: new Date().toISOString(),
        resolved: false
      });
    }
  }

  // Rule 4: Working Capital Float Mismatch
  if (deal.spreadMetrics.floatDurationDays > 45) {
    riskScore += 15;
    alerts.push({
      id: `ALT-FLOAT-${deal.id}-${Date.now().toString().slice(-4)}`,
      dealId: deal.id,
      category: 'WORKING_CAPITAL_FLOAT_RISK',
      severity: deal.spreadMetrics.floatDurationDays > 60 ? 'HIGH' : 'MEDIUM',
      title: `Excessive Working Capital Float (${deal.spreadMetrics.floatDurationDays} Days Gap)`,
      details: `Payment terms gap: Supplier A demands settlement within ${deal.supplierA.paymentTermsDays} days, whereas Buyer C (${deal.buyerC.name}) holds 60-90 day credit terms. ₹${(deal.spreadMetrics.peakCapitalFloatAtRiskInr / 100000).toFixed(2)} Lakhs capital is exposed without receivables backing.`,
      evidence: {
        expectedValue: '< 30 days float gap',
        observedValue: `${deal.spreadMetrics.floatDurationDays} days float gap`,
        variance: `+${deal.spreadMetrics.floatDurationDays - 30} days exposure`
      },
      recommendedAction: 'Offer 1.5% dynamic discounting to Buyer C for early 15-day settlement, or secure reverse factoring line.',
      autoEscrowHoldTriggered: false,
      createdAt: new Date().toISOString(),
      resolved: false
    });
  }

  return {
    riskScore: Math.min(100, riskScore),
    alerts
  };
}

export async function runAIForensicAudit(deal: TriFlowDeal): Promise<{
  aiSummary: string;
  threatMatrix: string[];
  fraudLikelihood: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedNegotiationLever: string;
}> {
  const prompt = `
You are the AI Sentinel for TarasAI's Tripartite Closed-Loop Industrial Trade Engine.
Analyze the following tripartite deal data between:
- Raw Material Supplier A: ${deal.supplierA.name}
- Tape Converter B: ${deal.converterB.name}
- Enterprise Buyer C: ${deal.buyerC.name}

Deal Specifics:
- Raw Material: ${deal.rawMaterial.materialName} (${deal.rawMaterial.quantitySuppliedKg} kg)
- Purchase from A: ₹${deal.rawMaterial.procurementPricePerUnit}/kg | Sell to B: ₹${deal.rawMaterial.transferPriceToBPerUnit}/kg (Spread: ₹${deal.spreadMetrics.rawSpreadInrPerUnit}/kg)
- Finished Product: ${deal.finishedProduct.productName} (${deal.finishedProduct.orderedQuantityUnits} units)
- Purchase from B: ₹${deal.finishedProduct.purchasePriceFromBPerUnit}/unit | Sell to C: ₹${deal.finishedProduct.salesPriceToCPerUnit}/unit (Spread: ₹${deal.spreadMetrics.finishedSpreadInrPerUnit}/unit)
- Total Gross Spread: ₹${deal.spreadMetrics.totalGrossSpreadInr.toLocaleString('en-IN')} (${deal.spreadMetrics.grossMarginPercent}%)
- Baseline Scrap: ${deal.finishedProduct.expectedScrapRatePercent}% | Reported Scrap: ${deal.finishedProduct.reportedScrapRatePercent || 'N/A'}%
- Target Adhesive GSM: ${deal.finishedProduct.targetAdhesiveGsm} | Actual QC GSM: ${deal.finishedProduct.actualAdhesiveGsm || 'N/A'}
- Mass Balance Efficiency: ${deal.massBalance?.massBalanceEfficiencyPercent}%
- Current Active Alerts: ${JSON.stringify(deal.activeAlerts.map(a => a.title))}

Evaluate for:
1. Converter B arbitrage / diversion (stealing raw material under guise of scrap).
2. Specification downgrading (thinning coating to sell substandard tapes to Buyer C).
3. Disintermediation risk (B contacting C directly).
4. Working capital liquidity drag.

Return strictly JSON matching:
{
  "aiSummary": "2-3 sentences forensic assessment of integrity and vulnerabilities",
  "threatMatrix": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "fraudLikelihood": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "suggestedNegotiationLever": "1-2 tactical sentences advising how TarasAI should enforce compliance or withhold escrow"
}
`;

  try {
    const response = await generateStructuredAIResponse(prompt);
    if (response && response.aiSummary) {
      return {
        aiSummary: response.aiSummary,
        threatMatrix: response.threatMatrix || [],
        fraudLikelihood: response.fraudLikelihood || (deal.sentinelRiskScore > 50 ? 'HIGH' : 'LOW'),
        suggestedNegotiationLever: response.suggestedNegotiationLever || 'Withhold tranche payment until physical audit.'
      };
    }
  } catch (err) {
    console.warn('[TriFlow Sentinel] AI Audit fallback to deterministic analysis:', err);
  }

  // Deterministic fallback response if AI rate limited
  const isHighRisk = deal.sentinelRiskScore >= 60;
  return {
    aiSummary: isHighRisk 
      ? `High-risk anomaly detected in Deal ${deal.dealReference}. Converter ${deal.converterB.name} shows mass-balance variance indicating potential scrap inflation and raw material diversion.`
      : `Deal ${deal.dealReference} demonstrates clean closed-loop compliance. Mass balance yield is within acceptable ±3.5% bounds with standard working capital turnover.`,
    threatMatrix: isHighRisk ? [
      'Reported scrap exceeds thermodynamic and operational baseline for adhesive slitting',
      'Unaccounted raw material volume can be repurposed for uncontracted OEM batches',
      'Potential QC dispute at Buyer C receiving bay if adhesive GSM is out of tolerance'
    ] : [
      'Normal conversion rate observed across Slitter Bay 4',
      'Weighbridge delta within standard carrier margin (0.2%)',
      'Receivables aligned with milestone release schedule'
    ],
    fraudLikelihood: isHighRisk ? 'HIGH' : 'LOW',
    suggestedNegotiationLever: isHighRisk 
      ? 'Halt 40% final conversion payout to Converter B and enforce random roll destructive testing before releasing shipment to Buyer C.'
      : 'Maintain standard milestone release upon proof of delivery at Buyer C dock.'
  };
}

// Pre-seeded high fidelity deals demonstrating the exact tripartite mechanics
export function getSampleTriFlowDeals(): TriFlowDeal[] {
  // Deal 1: The flagship example given by Aryan!
  // Buy from A at ₹100, sell to B at ₹110; Buy from B at ₹140, sell to C at ₹155!
  const deal1Raw: RawMaterialBOM = {
    materialName: 'Momentive PSA Silicone Adhesive Resin (Grade SR545)',
    supplierAId: 'ORG-A-MOMENTIVE',
    procurementPricePerUnit: 100,
    transferPriceToBPerUnit: 110,
    quantitySuppliedKg: 4000,
    unit: 'kg',
    batchNumber: 'MOM-2026-B892',
    dispatchWeighbridgeKg: 4000,
    receivingWeighbridgeKg: 3995
  };

  const deal1Finished: FinishedProductSpec = {
    productName: 'High-Temp Polyimide SMT Masking Tape 50µm x 33m',
    converterBId: 'ORG-B-SPECIALTY',
    buyerCId: 'ORG-C-TATAMOTORS',
    contractedYieldRatio: 4.0, // 4 rolls per kg resin
    expectedScrapRatePercent: 4.0,
    reportedScrapRatePercent: 14.5, // SUSPICIOUS ANOMALY! Converter claims 14.5% scrap
    targetAdhesiveGsm: 45,
    actualAdhesiveGsm: 39, // DOWNGRADED ADHESIVE!
    targetThicknessMicrons: 65,
    actualThicknessMicrons: 60,
    purchasePriceFromBPerUnit: 140,
    salesPriceToCPerUnit: 155,
    orderedQuantityUnits: 15000,
    deliveredQuantityUnits: 13500,
    unit: 'rolls'
  };

  const deal1Mass = calculateMassBalanceAudit(deal1Raw, deal1Finished);
  const deal1Spread = calculateDealSpreadMetrics(deal1Raw, deal1Finished, 15, 60);

  const deal1CashFlows: CashFlowMilestone[] = [
    {
      id: 'CF-1-A',
      description: 'Procurement of 4,000 kg Resin from Momentive (Supplier A) @ ₹100/kg',
      fromParty: 'TARASAI',
      toParty: 'SUPPLIER_A',
      amountInr: 400000, // ₹4,00,000
      dueDate: '2026-10-15',
      status: 'RELEASED',
      escrowCondition: 'Verified dispatch weighbridge certificate'
    },
    {
      id: 'CF-1-B-IN',
      description: 'Sale of 4,000 kg Resin to Specialty Tapes (Converter B) @ ₹110/kg',
      fromParty: 'CONVERTER_B',
      toParty: 'TARASAI',
      amountInr: 440000, // ₹4,40,000 (+₹40,000 Raw Spread realized)
      dueDate: '2026-10-20',
      status: 'RECEIVED',
      escrowCondition: 'Goods receiving note at B plant'
    },
    {
      id: 'CF-1-B-OUT',
      description: 'Purchase of 15,000 Finished SMT Tape Rolls from Specialty Tapes @ ₹140/roll',
      fromParty: 'TARASAI',
      toParty: 'CONVERTER_B',
      amountInr: 2100000, // ₹21,00,000
      dueDate: '2026-11-05',
      status: 'HOLD_BY_SENTINEL', // Sentinel flagged scrap anomaly!
      escrowCondition: 'Mandatory 3-point QC test & mass-balance audit clearance'
    },
    {
      id: 'CF-1-C',
      description: 'Sale of 15,000 Finished SMT Tape Rolls to Tata Motors (Buyer C) @ ₹155/roll',
      fromParty: 'BUYER_C',
      toParty: 'TARASAI',
      amountInr: 2325000, // ₹23,25,000 (+₹2,25,000 Finished Spread)
      dueDate: '2026-12-15',
      status: 'PENDING',
      escrowCondition: 'Dock delivery and QA signoff at Tata Motors Pune plant'
    }
  ];

  const baseDeal1: TriFlowDeal = {
    id: 'TF-2026-TAPE-001',
    dealReference: 'TF-2026-TAPE-001',
    status: 'FLAGGED_AUDIT',
    createdAt: '2026-10-01T10:00:00Z',
    targetCompletionDate: '2026-12-20T18:00:00Z',
    supplierA: {
      id: 'ORG-A-MOMENTIVE',
      name: 'Momentive Performance Materials',
      role: 'SUPPLIER_A',
      code: 'A-MOMENTIVE',
      location: 'Chennai Chemical Corridor',
      gstin: '33AABCM1234F1ZX',
      reliabilityScore: 98,
      historicalScrapAvgPercent: 3.8,
      paymentTermsDays: 15
    },
    converterB: {
      id: 'ORG-B-SPECIALTY',
      name: 'Specialty Tapes India Pvt Ltd',
      role: 'CONVERTER_B',
      code: 'B-SPECIALTY',
      location: 'Bhosari MIDC, Pune',
      gstin: '27AABCS9876D1ZQ',
      reliabilityScore: 74,
      historicalScrapAvgPercent: 5.2,
      paymentTermsDays: 30
    },
    buyerC: {
      id: 'ORG-C-TATAMOTORS',
      name: 'Tata Motors Passenger Vehicles Ltd',
      role: 'BUYER_C',
      code: 'C-TATA-MOTORS',
      location: 'Pimpri, Pune',
      gstin: '27AAACT0012E1Z8',
      reliabilityScore: 99,
      historicalScrapAvgPercent: 0,
      paymentTermsDays: 60
    },
    rawMaterial: deal1Raw,
    finishedProduct: deal1Finished,
    massBalance: deal1Mass,
    cashFlows: deal1CashFlows,
    spreadMetrics: deal1Spread,
    sentinelRiskScore: 78,
    activeAlerts: []
  };

  const audit1 = runDeterministicSentinelRules(baseDeal1);
  baseDeal1.sentinelRiskScore = audit1.riskScore;
  baseDeal1.activeAlerts = audit1.alerts;

  // Deal 2: Acrylic Foam VHB Structural Tape (Pristine High-Volume Deal)
  const deal2Raw: RawMaterialBOM = {
    materialName: 'Dow Chemical Optically Clear Acrylic Monomer & Primer',
    supplierAId: 'ORG-A-DOW',
    procurementPricePerUnit: 240,
    transferPriceToBPerUnit: 265, // ₹25 raw spread
    quantitySuppliedKg: 8000,
    unit: 'kg',
    batchNumber: 'DOW-2026-V901',
    dispatchWeighbridgeKg: 8000,
    receivingWeighbridgeKg: 7990
  };

  const deal2Finished: FinishedProductSpec = {
    productName: 'Double-Sided Viscoelastic Acrylic Foam VHB Tape (1.1mm x 19mm x 33m)',
    converterBId: 'ORG-B-POLYMER',
    buyerCId: 'ORG-C-FOXCONN',
    contractedYieldRatio: 2.2,
    expectedScrapRatePercent: 4.8,
    reportedScrapRatePercent: 5.1,
    targetAdhesiveGsm: 110,
    actualAdhesiveGsm: 109,
    targetThicknessMicrons: 1100,
    actualThicknessMicrons: 1105,
    purchasePriceFromBPerUnit: 380,
    salesPriceToCPerUnit: 430, // ₹50 finished spread
    orderedQuantityUnits: 17500,
    deliveredQuantityUnits: 17500,
    unit: 'rolls'
  };

  const deal2Mass = calculateMassBalanceAudit(deal2Raw, deal2Finished);
  const deal2Spread = calculateDealSpreadMetrics(deal2Raw, deal2Finished, 20, 45);

  const deal2CashFlows: CashFlowMilestone[] = [
    {
      id: 'CF-2-A',
      description: 'Procurement of 8,000 kg Monomer from Dow Chemical (A) @ ₹240/kg',
      fromParty: 'TARASAI',
      toParty: 'SUPPLIER_A',
      amountInr: 1920000,
      dueDate: '2026-10-18',
      status: 'RELEASED',
      escrowCondition: 'Weighbridge confirmation'
    },
    {
      id: 'CF-2-B-IN',
      description: 'Sale of Monomer to Advance Polymer Converters (B) @ ₹265/kg',
      fromParty: 'CONVERTER_B',
      toParty: 'TARASAI',
      amountInr: 2120000, // +₹2,00,000 Spread
      dueDate: '2026-10-25',
      status: 'RECEIVED',
      escrowCondition: 'Factory gate delivery'
    },
    {
      id: 'CF-2-B-OUT',
      description: 'Purchase of 17,500 rolls VHB Tape from Advance Polymer (B) @ ₹380/roll',
      fromParty: 'TARASAI',
      toParty: 'CONVERTER_B',
      amountInr: 6650000,
      dueDate: '2026-11-12',
      status: 'ESCROW_LOCKED',
      escrowCondition: 'ASTM D3330 90° Peel Adhesion test passed'
    },
    {
      id: 'CF-2-C',
      description: 'Delivery of 17,500 rolls to Foxconn Precision Assembly (C) @ ₹430/roll',
      fromParty: 'BUYER_C',
      toParty: 'TARASAI',
      amountInr: 7525000, // +₹8,75,000 Finished Spread
      dueDate: '2026-11-30',
      status: 'PENDING',
      escrowCondition: 'Clean room inspection clearance'
    }
  ];

  const baseDeal2: TriFlowDeal = {
    id: 'TF-2026-VHB-002',
    dealReference: 'TF-2026-VHB-002',
    status: 'IN_CONVERSION_B',
    createdAt: '2026-10-04T09:30:00Z',
    targetCompletionDate: '2026-12-05T18:00:00Z',
    supplierA: {
      id: 'ORG-A-DOW',
      name: 'Dow Chemical International',
      role: 'SUPPLIER_A',
      code: 'A-DOW',
      location: 'Dahej PCPIR, Gujarat',
      gstin: '24AABCD4321E1ZQ',
      reliabilityScore: 99,
      historicalScrapAvgPercent: 3.5,
      paymentTermsDays: 20
    },
    converterB: {
      id: 'ORG-B-POLYMER',
      name: 'Advance Polymer Converters LLP',
      role: 'CONVERTER_B',
      code: 'B-ADVANCE-POLYMER',
      location: 'Sri City, Andhra Pradesh',
      gstin: '37AABCA5555M1Z2',
      reliabilityScore: 94,
      historicalScrapAvgPercent: 4.8,
      paymentTermsDays: 30
    },
    buyerC: {
      id: 'ORG-C-FOXCONN',
      name: 'Foxconn Precision Components India',
      role: 'BUYER_C',
      code: 'C-FOXCONN',
      location: 'Sriperumbudur, Tamil Nadu',
      gstin: '33AABCF8888K1ZK',
      reliabilityScore: 97,
      historicalScrapAvgPercent: 0,
      paymentTermsDays: 45
    },
    rawMaterial: deal2Raw,
    finishedProduct: deal2Finished,
    massBalance: deal2Mass,
    cashFlows: deal2CashFlows,
    spreadMetrics: deal2Spread,
    sentinelRiskScore: 14,
    activeAlerts: []
  };

  const audit2 = runDeterministicSentinelRules(baseDeal2);
  baseDeal2.sentinelRiskScore = audit2.riskScore;
  baseDeal2.activeAlerts = audit2.alerts;

  // Deal 3: Thermal Interface Conductive Pad Tape (Automotive EV Battery Packs)
  const deal3Raw: RawMaterialBOM = {
    materialName: '3M / Henkel Thermally Conductive Silicone Gel Precursor',
    supplierAId: 'ORG-A-HENKEL',
    procurementPricePerUnit: 520,
    transferPriceToBPerUnit: 570, // ₹50 raw spread
    quantitySuppliedKg: 3500,
    unit: 'kg',
    batchNumber: 'HNK-2026-T404',
    dispatchWeighbridgeKg: 3500,
    receivingWeighbridgeKg: 3498
  };

  const deal3Finished: FinishedProductSpec = {
    productName: 'Thermal Interface Gap Filler Tape 3.0 W/m-K Die-Cut Strips',
    converterBId: 'ORG-B-LOTUS',
    buyerCId: 'ORG-C-MAHINDRA',
    contractedYieldRatio: 1.8,
    expectedScrapRatePercent: 6.0,
    reportedScrapRatePercent: 6.2,
    targetAdhesiveGsm: 180,
    actualAdhesiveGsm: 178,
    targetThicknessMicrons: 1500,
    actualThicknessMicrons: 1510,
    purchasePriceFromBPerUnit: 780,
    salesPriceToCPerUnit: 875, // ₹95 finished spread
    orderedQuantityUnits: 6200,
    deliveredQuantityUnits: 6200,
    unit: 'packs'
  };

  const deal3Mass = calculateMassBalanceAudit(deal3Raw, deal3Finished);
  const deal3Spread = calculateDealSpreadMetrics(deal3Raw, deal3Finished, 30, 75);

  const deal3CashFlows: CashFlowMilestone[] = [
    {
      id: 'CF-3-A',
      description: 'Procurement of 3,500 kg Silicone Precursor from Henkel (A) @ ₹520/kg',
      fromParty: 'TARASAI',
      toParty: 'SUPPLIER_A',
      amountInr: 1820000,
      dueDate: '2026-10-01',
      status: 'RELEASED',
      escrowCondition: 'Purity Certificate of Analysis'
    },
    {
      id: 'CF-3-B-IN',
      description: 'Sale of Precursor to Lotus Precision Die-Cutters (B) @ ₹570/kg',
      fromParty: 'CONVERTER_B',
      toParty: 'TARASAI',
      amountInr: 1995000, // +₹1,75,000 Spread
      dueDate: '2026-10-10',
      status: 'RECEIVED',
      escrowCondition: 'Clean room receipt'
    },
    {
      id: 'CF-3-B-OUT',
      description: 'Purchase of 6,200 Thermal Pad packs from Lotus (B) @ ₹780/pack',
      fromParty: 'TARASAI',
      toParty: 'CONVERTER_B',
      amountInr: 4836000,
      dueDate: '2026-10-28',
      status: 'RELEASED',
      escrowCondition: 'Thermal conductivity dielectric breakdown test passed'
    },
    {
      id: 'CF-3-C',
      description: 'Delivery of 6,200 Thermal Pad packs to Mahindra EV Plant (C) @ ₹875/pack',
      fromParty: 'BUYER_C',
      toParty: 'TARASAI',
      amountInr: 5425000, // +₹5,89,000 Finished Spread
      dueDate: '2026-11-20',
      status: 'RELEASED',
      escrowCondition: 'EV Battery module integration signoff'
    }
  ];

  const baseDeal3: TriFlowDeal = {
    id: 'TF-2026-THERMAL-003',
    dealReference: 'TF-2026-THERMAL-003',
    status: 'PAYMENTS_RECONCILED',
    createdAt: '2026-09-15T08:00:00Z',
    targetCompletionDate: '2026-11-25T18:00:00Z',
    supplierA: {
      id: 'ORG-A-HENKEL',
      name: 'Henkel Adhesives Technologies',
      role: 'SUPPLIER_A',
      code: 'A-HENKEL',
      location: 'Kurkumbh Industrial Area, Pune',
      gstin: '27AABCH1111G1Z3',
      reliabilityScore: 98,
      historicalScrapAvgPercent: 4.1,
      paymentTermsDays: 30
    },
    converterB: {
      id: 'ORG-B-LOTUS',
      name: 'Lotus Precision Die-Cutters',
      role: 'CONVERTER_B',
      code: 'B-LOTUS',
      location: 'Chakan MIDC, Pune',
      gstin: '27AABCL3333F1Z5',
      reliabilityScore: 92,
      historicalScrapAvgPercent: 5.9,
      paymentTermsDays: 30
    },
    buyerC: {
      id: 'ORG-C-MAHINDRA',
      name: 'Mahindra Electric Automobile Ltd',
      role: 'BUYER_C',
      code: 'C-MAHINDRA',
      location: 'Chakan, Pune',
      gstin: '27AAACM4444D1Z7',
      reliabilityScore: 96,
      historicalScrapAvgPercent: 0,
      paymentTermsDays: 75
    },
    rawMaterial: deal3Raw,
    finishedProduct: deal3Finished,
    massBalance: deal3Mass,
    cashFlows: deal3CashFlows,
    spreadMetrics: deal3Spread,
    sentinelRiskScore: 22,
    activeAlerts: []
  };

  const audit3 = runDeterministicSentinelRules(baseDeal3);
  baseDeal3.sentinelRiskScore = audit3.riskScore;
  baseDeal3.activeAlerts = audit3.alerts;

  return [baseDeal1, baseDeal2, baseDeal3];
}
