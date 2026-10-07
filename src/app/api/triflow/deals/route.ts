import { NextResponse } from 'next/server';
import { 
  getSampleTriFlowDeals, 
  calculateMassBalanceAudit, 
  calculateDealSpreadMetrics, 
  runDeterministicSentinelRules 
} from '@/lib/triflow/sentinelEngine';
import { TriFlowDeal } from '@/lib/triflow/types';

// In-memory persistent store during server lifetime
let dealsStore: TriFlowDeal[] = getSampleTriFlowDeals();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('id');

    if (dealId) {
      const deal = dealsStore.find(d => d.id === dealId);
      if (!deal) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, deal });
    }

    // Calculate aggregated portfolio metrics
    const totalGrossSpread = dealsStore.reduce((acc, d) => acc + d.spreadMetrics.totalGrossSpreadInr, 0);
    const totalPeakFloatAtRisk = dealsStore.reduce((acc, d) => acc + d.spreadMetrics.peakCapitalFloatAtRiskInr, 0);
    const totalDeliveredGmv = dealsStore.reduce((acc, d) => acc + (d.finishedProduct.salesPriceToCPerUnit * d.finishedProduct.orderedQuantityUnits), 0);
    
    const validEfficiencies = dealsStore
      .filter(d => d.massBalance)
      .map(d => d.massBalance!.massBalanceEfficiencyPercent);
    const avgEfficiency = validEfficiencies.length > 0 
      ? Number((validEfficiencies.reduce((a, b) => a + b, 0) / validEfficiencies.length).toFixed(1))
      : 100;

    const allAlerts = dealsStore.flatMap(d => d.activeAlerts);
    const criticalAlertsCount = allAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

    const avgRiskScore = Math.round(dealsStore.reduce((acc, d) => acc + d.sentinelRiskScore, 0) / dealsStore.length);

    return NextResponse.json({
      success: true,
      deals: dealsStore,
      summary: {
        totalGrossSpreadInr: totalGrossSpread,
        totalPeakFloatAtRiskInr: totalPeakFloatAtRisk,
        totalDeliveredGmvInr: totalDeliveredGmv,
        averageMassEfficiencyPercent: avgEfficiency,
        criticalAlertsCount,
        sentinelGlobalRiskScore: avgRiskScore,
        activeDealsCount: dealsStore.length
      }
    });
  } catch (error: any) {
    console.error('[TriFlow Deals API] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve deals', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, dealId, payload } = body;

    if (action === 'RESET_DEFAULTS') {
      dealsStore = getSampleTriFlowDeals();
      return NextResponse.json({ success: true, message: 'Deals reset to standard calibration', deals: dealsStore });
    }

    if (action === 'UPDATE_MASS_TELEMETRY' && dealId) {
      const dealIndex = dealsStore.findIndex(d => d.id === dealId);
      if (dealIndex === -1) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }

      const deal = dealsStore[dealIndex];
      if (payload.reportedScrapRatePercent !== undefined) {
        deal.finishedProduct.reportedScrapRatePercent = Number(payload.reportedScrapRatePercent);
      }
      if (payload.actualAdhesiveGsm !== undefined) {
        deal.finishedProduct.actualAdhesiveGsm = Number(payload.actualAdhesiveGsm);
      }
      if (payload.receivingWeighbridgeKg !== undefined) {
        deal.rawMaterial.receivingWeighbridgeKg = Number(payload.receivingWeighbridgeKg);
      }

      // Re-run mass balance & audit
      deal.massBalance = calculateMassBalanceAudit(deal.rawMaterial, deal.finishedProduct);
      deal.spreadMetrics = calculateDealSpreadMetrics(
        deal.rawMaterial, 
        deal.finishedProduct, 
        deal.supplierA.paymentTermsDays, 
        deal.buyerC.paymentTermsDays
      );
      const audit = runDeterministicSentinelRules(deal);
      deal.sentinelRiskScore = audit.riskScore;
      deal.activeAlerts = audit.alerts;

      dealsStore[dealIndex] = deal;

      return NextResponse.json({
        success: true,
        message: 'Telemetry updated and Sentinel audit recalculated',
        deal
      });
    }

    if (action === 'TOGGLE_ESCROW_HOLD' && dealId) {
      const dealIndex = dealsStore.findIndex(d => d.id === dealId);
      if (dealIndex === -1) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }

      const { milestoneId, holdStatus } = payload;
      const milestone = dealsStore[dealIndex].cashFlows.find(cf => cf.id === milestoneId);
      if (milestone) {
        milestone.status = holdStatus ? 'HOLD_BY_SENTINEL' : 'ESCROW_LOCKED';
      }

      return NextResponse.json({
        success: true,
        message: `Milestone status toggled to ${milestone?.status}`,
        deal: dealsStore[dealIndex]
      });
    }

    if (action === 'CREATE_DEAL') {
      const raw = payload.rawMaterial;
      const finished = payload.finishedProduct;

      const massBalance = calculateMassBalanceAudit(raw, finished);
      const spreadMetrics = calculateDealSpreadMetrics(
        raw, 
        finished, 
        payload.supplierA?.paymentTermsDays || 15, 
        payload.buyerC?.paymentTermsDays || 60
      );

      const newDeal: TriFlowDeal = {
        id: `TF-${Date.now().toString().slice(-6)}`,
        dealReference: payload.dealReference || `TF-2026-CUSTOM-${Math.floor(Math.random() * 900 + 100)}`,
        status: 'DEMAND_CONTRACTED',
        createdAt: new Date().toISOString(),
        targetCompletionDate: payload.targetCompletionDate || new Date(Date.now() + 45 * 86400000).toISOString(),
        supplierA: payload.supplierA,
        converterB: payload.converterB,
        buyerC: payload.buyerC,
        rawMaterial: raw,
        finishedProduct: finished,
        massBalance,
        cashFlows: payload.cashFlows || [],
        spreadMetrics,
        sentinelRiskScore: 10,
        activeAlerts: []
      };

      const audit = runDeterministicSentinelRules(newDeal);
      newDeal.sentinelRiskScore = audit.riskScore;
      newDeal.activeAlerts = audit.alerts;

      dealsStore.unshift(newDeal);

      return NextResponse.json({
        success: true,
        message: 'TriFlow Closed-Loop Deal created and loaded into Sentinel monitor',
        deal: newDeal
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[TriFlow Deals API] Error:', error);
    return NextResponse.json({ error: 'Failed to process request', details: error.message }, { status: 500 });
  }
}
