export type PartyRole = 'SUPPLIER_A' | 'CONVERTER_B' | 'BUYER_C';

export interface TriPartyOrganization {
  id: string;
  name: string;
  role: PartyRole;
  code: string; // e.g. "A-MOMENTIVE", "B-SPECIALTY", "C-TATA-MOTORS"
  location: string;
  gstin?: string;
  reliabilityScore: number; // 0 - 100
  historicalScrapAvgPercent: number; // typical scrap rate
  paymentTermsDays: number; // e.g. 15 for A, 30 for B, 60 for C
}

export type DealStatus = 
  | 'DEMAND_CONTRACTED'     // Step 1: C's demand locked
  | 'RAW_PROCURED_A'        // Step 2: Sourcing from A at P_A
  | 'RAW_DELIVERED_TO_B'    // Step 3: Sold to B at P_B_in (weighbridge verified)
  | 'IN_CONVERSION_B'       // Step 4: B manufacturing tapes (mass-balance tracked)
  | 'QC_INSPECTION_PENDING' // Step 5: Finished tape ready at B, undergoing caliper/adhesion tests
  | 'PURCHASED_FROM_B'      // Step 6: Bought back from B at P_B_out
  | 'DELIVERED_TO_C'        // Step 7: Dispatched and accepted by Buyer C at P_C
  | 'PAYMENTS_RECONCILED'   // Step 8: Full cash loop settled
  | 'FLAGGED_AUDIT';        // AI Sentinel quarantined deal

export interface RawMaterialBOM {
  materialName: string; // e.g. "Silicone Pressure Sensitive Adhesive Resin" or "Polyimide Base Film"
  supplierAId: string;
  procurementPricePerUnit: number; // e.g. ₹100 / kg (our buy price from A)
  transferPriceToBPerUnit: number;  // e.g. ₹110 / kg (our sell price to B)
  quantitySuppliedKg: number;      // e.g. 5,000 kg
  unit: string;
  batchNumber: string;
  dispatchWeighbridgeKg: number;
  receivingWeighbridgeKg?: number;
}

export interface FinishedProductSpec {
  productName: string; // e.g. "High-Temp Polyimide SMT Tape 50µm x 33m"
  converterBId: string;
  buyerCId: string;
  contractedYieldRatio: number; // expected units produced per kg of raw material
  expectedScrapRatePercent: number; // standard baseline scrap (e.g. 4.5%)
  reportedScrapRatePercent?: number; // what B claims
  targetAdhesiveGsm: number; // e.g. 45 GSM adhesive coating
  actualAdhesiveGsm?: number; // measured QC GSM
  targetThicknessMicrons: number; // e.g. 65 microns total
  actualThicknessMicrons?: number; // measured QC thickness
  purchasePriceFromBPerUnit: number; // e.g. ₹140 / roll (our buy price from B)
  salesPriceToCPerUnit: number;      // e.g. ₹155 / roll (our sell price to C)
  orderedQuantityUnits: number;     // e.g. 20,000 rolls
  deliveredQuantityUnits?: number;
  unit: string;
}

export interface CashFlowMilestone {
  id: string;
  description: string;
  fromParty: 'TARASAI' | 'SUPPLIER_A' | 'CONVERTER_B' | 'BUYER_C';
  toParty: 'TARASAI' | 'SUPPLIER_A' | 'CONVERTER_B' | 'BUYER_C';
  amountInr: number;
  dueDate: string;
  status: 'PENDING' | 'ESCROW_LOCKED' | 'RELEASED' | 'RECEIVED' | 'OVERDUE' | 'HOLD_BY_SENTINEL';
  escrowCondition?: string;
}

export interface MassBalanceAudit {
  rawMaterialSuppliedKg: number;
  expectedFinishedKg: number;
  reportedFinishedKg: number;
  theoreticalScrapKg: number;
  reportedScrapKg: number;
  unaccountedMassKg: number; // Delta indicative of material diversion
  massBalanceEfficiencyPercent: number; // 100% is perfect, <92% triggers high alert
  specDeviationPercent: number; // caliper or GSM deviation
}

export type SentinelSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SentinelThreatCategory =
  | 'MASS_BALANCE_DIVERSION'       // B diverting raw materials to private customers
  | 'SPECIFICATION_SUBSTITUTION'   // B downgrading thickness or resin coating (GSM)
  | 'WEIGHBRIDGE_DISCREPANCY'     // In-transit loss between A and B
  | 'DISINTERMEDIATION_LEAKAGE'    // B attempting direct contact with C or vice versa
  | 'WORKING_CAPITAL_FLOAT_RISK'   // Cash gap between paying A/B and collecting from C
  | 'PRICE_ARBITRAGE_ANOMALY';     // Sudden surge in raw chemical spot prices

export interface SentinelAlert {
  id: string;
  dealId: string;
  category: SentinelThreatCategory;
  severity: SentinelSeverity;
  title: string;
  details: string;
  evidence: {
    expectedValue: string | number;
    observedValue: string | number;
    variance: string;
  };
  recommendedAction: string;
  autoEscrowHoldTriggered: boolean;
  createdAt: string;
  resolved: boolean;
}

export interface TriFlowDeal {
  id: string;
  dealReference: string; // e.g. "TF-2026-TAPE-001"
  status: DealStatus;
  createdAt: string;
  targetCompletionDate: string;
  
  // Parties
  supplierA: TriPartyOrganization;
  converterB: TriPartyOrganization;
  buyerC: TriPartyOrganization;

  // Material & Product Flow
  rawMaterial: RawMaterialBOM;
  finishedProduct: FinishedProductSpec;

  // Mass Balance Telemetry
  massBalance?: MassBalanceAudit;

  // Cash Flow Accounting
  cashFlows: CashFlowMilestone[];
  spreadMetrics: {
    rawSpreadInrPerUnit: number;       // P_A->B - P_A (e.g. ₹10)
    rawSpreadTotalInr: number;
    finishedSpreadInrPerUnit: number;  // P_C - P_B (e.g. ₹15)
    finishedSpreadTotalInr: number;
    totalGrossSpreadInr: number;       // Total gross revenue margin
    grossMarginPercent: number;        // (Gross Spread / Total Buyer C Revenue) * 100
    peakCapitalFloatAtRiskInr: number; // Max cash out before Buyer C pays
    floatDurationDays: number;
  };

  // AI Sentinel Status
  sentinelRiskScore: number; // 0 (pristine) to 100 (critical breach)
  activeAlerts: SentinelAlert[];
}
