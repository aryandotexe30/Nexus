"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Scale, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Truck, 
  Factory, 
  Building, 
  Sliders, 
  ChevronRight, 
  AlertOctagon,
  ArrowUpRight,
  Info,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { 
  TriFlowDeal, 
  SentinelAlert, 
  CashFlowMilestone,
  RawMaterialBOM,
  FinishedProductSpec
} from '@/lib/triflow/types';
import { 
  calculateMassBalanceAudit, 
  calculateDealSpreadMetrics, 
  runDeterministicSentinelRules 
} from '@/lib/triflow/sentinelEngine';

export default function TriFlowMasterDashboard() {
  const [deals, setDeals] = useState<TriFlowDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<TriFlowDeal | null>(null);
  const [aiAuditing, setAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'PORTFOLIO' | 'SIMULATOR' | 'ALERTS' | 'ARCHITECTURE'>('PORTFOLIO');

  // Simulator State (Preloaded with user's specific business model: 100 -> 110, 140 -> 155)
  const [simRawPriceA, setSimRawPriceA] = useState(100);
  const [simRawPriceB, setSimRawPriceB] = useState(110);
  const [simFinishedPriceB, setSimFinishedPriceB] = useState(140);
  const [simFinishedPriceC, setSimFinishedPriceC] = useState(155);
  const [simRawQtyKg, setSimRawQtyKg] = useState(5000);
  const [simYieldRatio, setSimYieldRatio] = useState(3.5); // 3.5 rolls per kg
  const [simBaselineScrap, setSimBaselineScrap] = useState(4.5);
  const [simReportedScrap, setSimReportedScrap] = useState(15.0); // Test diversion scenario
  const [simTargetGsm, setSimTargetGsm] = useState(45);
  const [simActualGsm, setSimActualGsm] = useState(40);
  const [simSupplierDays, setSimSupplierDays] = useState(15);
  const [simBuyerDays, setSimBuyerDays] = useState(60);

  // Fetch Deals from API
  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/triflow/deals');
      const data = await res.json();
      if (data.success && data.deals) {
        setDeals(data.deals);
        if (!selectedDeal && data.deals.length > 0) {
          setSelectedDeal(data.deals[0]);
        } else if (selectedDeal) {
          const updated = data.deals.find((d: TriFlowDeal) => d.id === selectedDeal.id);
          if (updated) setSelectedDeal(updated);
        }
      }
    } catch (err) {
      console.error('[TriFlow UI] Failed to load deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Aggregated KPI Stats
  const stats = useMemo(() => {
    const totalGrossSpread = deals.reduce((acc, d) => acc + d.spreadMetrics.totalGrossSpreadInr, 0);
    const totalPeakFloat = deals.reduce((acc, d) => acc + d.spreadMetrics.peakCapitalFloatAtRiskInr, 0);
    const totalGmv = deals.reduce((acc, d) => acc + (d.finishedProduct.salesPriceToCPerUnit * d.finishedProduct.orderedQuantityUnits), 0);
    const avgYield = deals.length > 0
      ? (deals.reduce((acc, d) => acc + (d.massBalance?.massBalanceEfficiencyPercent || 100), 0) / deals.length).toFixed(1)
      : '100';
    const allAlerts = deals.flatMap(d => d.activeAlerts);
    const criticalCount = allAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;
    const avgRisk = deals.length > 0
      ? Math.round(deals.reduce((acc, d) => acc + d.sentinelRiskScore, 0) / deals.length)
      : 0;

    return {
      totalGrossSpread,
      totalPeakFloat,
      totalGmv,
      avgYield,
      criticalCount,
      avgRisk,
      activeAlerts: allAlerts
    };
  }, [deals]);

  // Simulator Computed Results
  const simResults = useMemo(() => {
    const rawBOM: RawMaterialBOM = {
      materialName: 'Simulated Technical Resin / Web',
      supplierAId: 'A-SIM',
      procurementPricePerUnit: simRawPriceA,
      transferPriceToBPerUnit: simRawPriceB,
      quantitySuppliedKg: simRawQtyKg,
      unit: 'kg',
      batchNumber: 'SIM-BATCH-01',
      dispatchWeighbridgeKg: simRawQtyKg,
      receivingWeighbridgeKg: simRawQtyKg
    };

    const orderedUnits = Math.round(simRawQtyKg * simYieldRatio);

    const finishedSpec: FinishedProductSpec = {
      productName: 'Simulated Specialty Tape',
      converterBId: 'B-SIM',
      buyerCId: 'C-SIM',
      contractedYieldRatio: simYieldRatio,
      expectedScrapRatePercent: simBaselineScrap,
      reportedScrapRatePercent: simReportedScrap,
      targetAdhesiveGsm: simTargetGsm,
      actualAdhesiveGsm: simActualGsm,
      targetThicknessMicrons: 60,
      actualThicknessMicrons: 58,
      purchasePriceFromBPerUnit: simFinishedPriceB,
      salesPriceToCPerUnit: simFinishedPriceC,
      orderedQuantityUnits: orderedUnits,
      deliveredQuantityUnits: Math.round(orderedUnits * (1 - simReportedScrap / 100)),
      unit: 'units'
    };

    const mass = calculateMassBalanceAudit(rawBOM, finishedSpec);
    const spread = calculateDealSpreadMetrics(rawBOM, finishedSpec, simSupplierDays, simBuyerDays);

    const dummyDeal: TriFlowDeal = {
      id: 'SIMULATED-DEAL',
      dealReference: 'TF-SIMULATED-LIVE',
      status: 'IN_CONVERSION_B',
      createdAt: new Date().toISOString(),
      targetCompletionDate: new Date().toISOString(),
      supplierA: {
        id: 'A-SIM',
        name: 'Supplier A (e.g. GE Momentive)',
        role: 'SUPPLIER_A',
        code: 'A-MOMENTIVE',
        location: 'Chemical Terminal',
        reliabilityScore: 98,
        historicalScrapAvgPercent: 3.5,
        paymentTermsDays: simSupplierDays
      },
      converterB: {
        id: 'B-SIM',
        name: 'Converter B (Specialty Tapes)',
        role: 'CONVERTER_B',
        code: 'B-SPECIALTY',
        location: 'Manufacturing MIDC',
        reliabilityScore: 75,
        historicalScrapAvgPercent: 5.0,
        paymentTermsDays: 30
      },
      buyerC: {
        id: 'C-SIM',
        name: 'Buyer C (Automotive OEM)',
        role: 'BUYER_C',
        code: 'C-AUTO',
        location: 'Assembly Hub',
        reliabilityScore: 99,
        historicalScrapAvgPercent: 0,
        paymentTermsDays: simBuyerDays
      },
      rawMaterial: rawBOM,
      finishedProduct: finishedSpec,
      massBalance: mass,
      cashFlows: [],
      spreadMetrics: spread,
      sentinelRiskScore: 0,
      activeAlerts: []
    };

    const audit = runDeterministicSentinelRules(dummyDeal);
    dummyDeal.sentinelRiskScore = audit.riskScore;
    dummyDeal.activeAlerts = audit.alerts;

    return {
      rawBOM,
      finishedSpec,
      mass,
      spread,
      audit,
      orderedUnits
    };
  }, [
    simRawPriceA,
    simRawPriceB,
    simFinishedPriceB,
    simFinishedPriceC,
    simRawQtyKg,
    simYieldRatio,
    simBaselineScrap,
    simReportedScrap,
    simTargetGsm,
    simActualGsm,
    simSupplierDays,
    simBuyerDays
  ]);

  // Trigger Gemini AI Forensic Audit
  const handleRunAiAudit = async (deal: TriFlowDeal) => {
    setAiAuditing(true);
    setAiAuditResult(null);
    try {
      const res = await fetch('/api/triflow/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal })
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setAiAuditResult(data.audit);
      }
    } catch (e) {
      console.error('[TriFlow AI Audit] Failed:', e);
    } finally {
      setAiAuditing(false);
    }
  };

  // Toggle Escrow Hold on a Milestone
  const handleToggleEscrow = async (dealId: string, milestoneId: string, currentStatus: string) => {
    try {
      const willHold = currentStatus !== 'HOLD_BY_SENTINEL';
      await fetch('/api/triflow/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_ESCROW_HOLD',
          dealId,
          payload: { milestoneId, holdStatus: willHold }
        })
      });
      fetchDeals();
    } catch (e) {
      console.error(e);
    }
  };

  // Reset to default sample deals
  const handleResetDefaults = async () => {
    try {
      await fetch('/api/triflow/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_DEFAULTS' })
      });
      fetchDeals();
      setAiAuditResult(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-blue-500/20 text-white">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  TriFlow <span className="text-blue-400 font-light">& Sentinel</span>
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Closed-Loop Active
                </span>
                {stats.criticalCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    {stats.criticalCount} Sentinel Alerts
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Tripartite Intermediation (Supplier A → Converter B → Buyer C) • Real-Time Yield & Anti-Diversion Sentinel
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Calibrations
          </button>
          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            Open Deal Simulator (₹100→₹110 / ₹140→₹155)
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Gross Spread */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Spread Captured</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₹{(stats.totalGrossSpread / 100000).toFixed(2)} <span className="text-sm font-normal text-slate-400">Lakhs</span>
          </div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            Dual-Leg Net Margin Spread
          </div>
        </div>

        {/* GMV In-Transit */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Turnover Volume (GMV)</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₹{(stats.totalGmv / 100000).toFixed(2)} <span className="text-sm font-normal text-slate-400">Lakhs</span>
          </div>
          <div className="text-xs text-blue-400 mt-2 flex items-center gap-1 font-medium">
            <Activity className="w-3.5 h-3.5" />
            {deals.length} Active Closed-Loop Contracts
          </div>
        </div>

        {/* Mass Balance Yield Efficiency */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Mass-Balance Yield</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats.avgYield}%
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className={Number(stats.avgYield) < 95 ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
              {Number(stats.avgYield) < 95 ? "Yield Anomaly Present" : "Optimal Chemical Conversion"}
            </span>
          </div>
        </div>

        {/* Peak Capital Float At Risk */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Float Capital Exposure</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₹{(stats.totalPeakFloat / 100000).toFixed(2)} <span className="text-sm font-normal text-slate-400">Lakhs</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
            Receivables Float Gap: ~45 Days
          </div>
        </div>

        {/* Sentinel AI Threat Level */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className={`absolute top-0 left-0 w-full h-1 ${stats.criticalCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sentinel Threat Index</span>
            <div className={`p-1.5 rounded-lg ${stats.criticalCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {stats.criticalCount > 0 ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className={`text-2xl font-bold tracking-tight ${stats.criticalCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {stats.avgRisk}/100
            </div>
            <span className="text-xs text-slate-400 uppercase font-semibold">
              {stats.criticalCount > 0 ? 'High Risk' : 'Protected'}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            {stats.criticalCount > 0 ? (
              <span className="text-red-400 font-semibold">{stats.criticalCount} Escrow Holds Active</span>
            ) : (
              <span className="text-emerald-400">All Nodes Verified</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('PORTFOLIO')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'PORTFOLIO'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Live Closed-Loop Deals ({deals.length})
        </button>
        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'SIMULATOR'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Deal Simulator & Margin Lab
        </button>
        <button
          onClick={() => setActiveTab('ARCHITECTURE')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ARCHITECTURE'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Tripartite Flow Architecture (A → B → C)
        </button>
        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ALERTS'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Sentinel Threat Console
          {stats.activeAlerts.length > 0 && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">
              {stats.activeAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PORTFOLIO & LIVE DEALS */}
      {activeTab === 'PORTFOLIO' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deals Table (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Active Tripartite Pipelines</h3>
                  <p className="text-xs text-slate-400">Select any deal to inspect live weighbridge manifests, mass audits & escrow tranches.</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">Live Telemetry</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {deals.map((deal) => {
                  const isSelected = selectedDeal?.id === deal.id;
                  const hasCritical = deal.activeAlerts.some(a => a.severity === 'CRITICAL');
                  return (
                    <div
                      key={deal.id}
                      onClick={() => {
                        setSelectedDeal(deal);
                        setAiAuditResult(null);
                      }}
                      className={`p-5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-950/30 border-l-4 border-blue-500' 
                          : 'hover:bg-slate-800/40 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${
                            hasCritical 
                              ? 'bg-red-500/10 text-red-400' 
                              : deal.sentinelRiskScore > 30 
                                ? 'bg-amber-500/10 text-amber-400' 
                                : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {hasCritical ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-sm">{deal.dealReference}</span>
                              <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                                {deal.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="text-blue-300 font-medium">{deal.supplierA.name}</span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="text-indigo-300 font-medium">{deal.converterB.name}</span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="text-emerald-300 font-medium">{deal.buyerC.name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Financial Spread Badge */}
                        <div className="flex sm:flex-col items-end justify-between sm:justify-center">
                          <div className="text-sm font-bold text-emerald-400">
                            +₹{(deal.spreadMetrics.totalGrossSpreadInr).toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-slate-400">
                            {deal.spreadMetrics.grossMarginPercent}% Gross Spread
                          </div>
                        </div>
                      </div>

                      {/* Sub-bar: Material & Mass Efficiency */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/60 text-xs">
                        <div>
                          <span className="text-slate-500 block">Raw Spread (A→B)</span>
                          <span className="font-mono text-slate-200">
                            ₹{deal.rawMaterial.procurementPricePerUnit} → ₹{deal.rawMaterial.transferPriceToBPerUnit} (+₹{deal.spreadMetrics.rawSpreadInrPerUnit}/kg)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Finished Spread (B→C)</span>
                          <span className="font-mono text-slate-200">
                            ₹{deal.finishedProduct.purchasePriceFromBPerUnit} → ₹{deal.finishedProduct.salesPriceToCPerUnit} (+₹{deal.spreadMetrics.finishedSpreadInrPerUnit}/unit)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Mass Efficiency</span>
                          <span className={`font-mono font-semibold ${
                            (deal.massBalance?.massBalanceEfficiencyPercent || 100) < 90
                              ? 'text-red-400'
                              : (deal.massBalance?.massBalanceEfficiencyPercent || 100) < 96
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                          }`}>
                            {deal.massBalance?.massBalanceEfficiencyPercent || 100}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Sentinel Risk</span>
                          <span className={`font-mono font-semibold ${
                            deal.sentinelRiskScore > 50 ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {deal.sentinelRiskScore}/100 ({deal.activeAlerts.length} Alerts)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Inspector Drawer (Right 1 col) */}
          <div className="space-y-4">
            {selectedDeal ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
                      Audit Inspector
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{selectedDeal.dealReference}</h3>
                    <p className="text-xs text-slate-400">{selectedDeal.finishedProduct.productName}</p>
                  </div>
                  <button
                    onClick={() => handleRunAiAudit(selectedDeal)}
                    disabled={aiAuditing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    {aiAuditing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Auditing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Run AI Audit
                      </>
                    )}
                  </button>
                </div>

                {/* AI Audit Result Box if triggered */}
                {aiAuditResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-b from-blue-950/60 to-slate-900 border border-blue-500/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        Gemini Sentinel Intelligence
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        aiAuditResult.fraudLikelihood === 'HIGH' || aiAuditResult.fraudLikelihood === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {aiAuditResult.fraudLikelihood} Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {aiAuditResult.aiSummary}
                    </p>
                    {aiAuditResult.threatMatrix && aiAuditResult.threatMatrix.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Vulnerability Matrix:</span>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                          {aiAuditResult.threatMatrix.map((item: string, idx: number) => (
                            <li key={idx} className="leading-tight">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-blue-300 font-semibold">Recommended Lever: </span>
                      <span className="text-slate-300">{aiAuditResult.suggestedNegotiationLever}</span>
                    </div>
                  </motion.div>
                )}

                {/* Physical Mass Balance Audit Card */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-cyan-400" />
                      Mass-Balance Yield Telemetry
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {selectedDeal.massBalance?.massBalanceEfficiencyPercent}% Efficiency
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">Raw Supplied</span>
                      <span className="font-mono text-slate-200 font-semibold">{selectedDeal.rawMaterial.quantitySuppliedKg} kg</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">Unaccounted Mass</span>
                      <span className={`font-mono font-semibold ${
                        (selectedDeal.massBalance?.unaccountedMassKg || 0) > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {selectedDeal.massBalance?.unaccountedMassKg || 0} kg missing
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">Scrap (Expected vs B)</span>
                      <span className="font-mono text-slate-200">
                        {selectedDeal.finishedProduct.expectedScrapRatePercent}% vs <strong className={selectedDeal.finishedProduct.reportedScrapRatePercent && selectedDeal.finishedProduct.reportedScrapRatePercent > 8 ? 'text-red-400' : 'text-slate-200'}>{selectedDeal.finishedProduct.reportedScrapRatePercent}%</strong>
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">Adhesive GSM QC</span>
                      <span className="font-mono text-slate-200">
                        {selectedDeal.finishedProduct.targetAdhesiveGsm} vs <strong className={selectedDeal.finishedProduct.actualAdhesiveGsm && selectedDeal.finishedProduct.actualAdhesiveGsm < selectedDeal.finishedProduct.targetAdhesiveGsm ? 'text-amber-400' : 'text-slate-200'}>{selectedDeal.finishedProduct.actualAdhesiveGsm} GSM</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cash Flow Escrow & Milestones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Closed-Loop Escrow Tranches
                    </span>
                    <span className="text-xs text-slate-500">Click to Freeze/Release</span>
                  </div>

                  <div className="space-y-2">
                    {selectedDeal.cashFlows.map((cf) => {
                      const isHeld = cf.status === 'HOLD_BY_SENTINEL';
                      const isReleased = cf.status === 'RELEASED';
                      return (
                        <div
                          key={cf.id}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                            isHeld
                              ? 'bg-red-950/20 border-red-500/40 text-red-300'
                              : isReleased
                                ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                                : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                          }`}
                        >
                          <div className="space-y-0.5 max-w-[70%]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">₹{(cf.amountInr).toLocaleString('en-IN')}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                                {cf.fromParty} → {cf.toParty}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{cf.description}</p>
                            {cf.escrowCondition && (
                              <p className="text-[10px] text-amber-400/90 italic">Condition: {cf.escrowCondition}</p>
                            )}
                          </div>

                          <div>
                            {cf.status === 'RECEIVED' ? (
                              <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                RECEIVED
                              </span>
                            ) : cf.status === 'RELEASED' ? (
                              <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                                SETTLED
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleEscrow(selectedDeal.id, cf.id, cf.status)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                  isHeld
                                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                                    : 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {isHeld ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                {isHeld ? 'HELD' : 'ACTIVE'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Alerts for this Deal */}
                {selectedDeal.activeAlerts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-red-400 uppercase flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Sentinel Quarantine Triggers ({selectedDeal.activeAlerts.length})
                    </span>
                    <div className="space-y-2">
                      {selectedDeal.activeAlerts.map((alt) => (
                        <div key={alt.id} className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-red-300">{alt.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-red-500/20 text-red-400 font-bold">
                              {alt.severity}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{alt.details}</p>
                          <div className="p-2 rounded bg-black/40 text-[11px] text-amber-300 font-mono">
                            Action: {alt.recommendedAction}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-900/50 border border-slate-800 rounded-2xl">
                Select a deal to view forensic audit details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEAL SIMULATOR & MARGIN LAB */}
      {activeTab === 'SIMULATOR' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  Tripartite Margin & Anti-Scam Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Model arbitrary buy/sell pricing spreads, mass-balance conversion yields, and stress-test Sentinel fraud detection in real-time.
                </p>
              </div>
              <div className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                Model: A(₹100) → B(₹110) | B(₹140) → C(₹155)
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
              {/* Sliders and Controls (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Leg 1: Raw Material Spread (A -> B) */}
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-400 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Leg 1: Raw Material Sourcing (Supplier A → TarasAI → Converter B)
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                      Raw Spread: +₹{simRawPriceB - simRawPriceA}/kg
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Procurement Price from A (₹/kg): <strong className="text-white">₹{simRawPriceA}</strong>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        step="5"
                        value={simRawPriceA}
                        onChange={(e) => setSimRawPriceA(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Sales Price to Converter B (₹/kg): <strong className="text-white">₹{simRawPriceB}</strong>
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="350"
                        step="5"
                        value={simRawPriceB}
                        onChange={(e) => setSimRawPriceB(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Total Raw Material Volume: <strong className="text-white">{simRawQtyKg.toLocaleString('en-IN')} kg</strong>
                      </label>
                      <input
                        type="range"
                        min="1000"
                        max="25000"
                        step="500"
                        value={simRawQtyKg}
                        onChange={(e) => setSimRawQtyKg(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Supplier A Payment Credit: <strong className="text-white">{simSupplierDays} Days</strong>
                      </label>
                      <input
                        type="range"
                        min="7"
                        max="60"
                        step="1"
                        value={simSupplierDays}
                        onChange={(e) => setSimSupplierDays(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Leg 2: Finished Goods Spread (B -> C) */}
                <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                      <Factory className="w-4 h-4" />
                      Leg 2: Finished Goods Offtake (Converter B → TarasAI → Buyer C)
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                      Finished Spread: +₹{simFinishedPriceC - simFinishedPriceB}/unit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Purchase Price from B (₹/unit): <strong className="text-white">₹{simFinishedPriceB}</strong>
                      </label>
                      <input
                        type="range"
                        min="80"
                        max="500"
                        step="5"
                        value={simFinishedPriceB}
                        onChange={(e) => setSimFinishedPriceB(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Sales Price to Buyer C (₹/unit): <strong className="text-white">₹{simFinishedPriceC}</strong>
                      </label>
                      <input
                        type="range"
                        min="90"
                        max="600"
                        step="5"
                        value={simFinishedPriceC}
                        onChange={(e) => setSimFinishedPriceC(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Conversion Yield Ratio: <strong className="text-white">{simYieldRatio} units/kg</strong>
                      </label>
                      <input
                        type="range"
                        min="1.0"
                        max="8.0"
                        step="0.1"
                        value={simYieldRatio}
                        onChange={(e) => setSimYieldRatio(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Buyer C Payment Terms: <strong className="text-white">{simBuyerDays} Days</strong>
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        step="5"
                        value={simBuyerDays}
                        onChange={(e) => setSimBuyerDays(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Fraud Injection & Mass-Balance Stress Controls */}
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      Sentinel Stress Tests: Scrap Padding & Quality Substitution
                    </span>
                    <span className="text-xs text-amber-400 font-medium">Drag to simulate converter scam</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">
                        Converter B Reported Scrap %: <strong className={simReportedScrap > 7 ? 'text-red-400' : 'text-emerald-400'}>{simReportedScrap}%</strong> (Baseline: {simBaselineScrap}%)
                      </label>
                      <input
                        type="range"
                        min="3.0"
                        max="25.0"
                        step="0.5"
                        value={simReportedScrap}
                        onChange={(e) => setSimReportedScrap(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {simReportedScrap > 7 ? '⚠️ Excessive scrap: Triggers raw material diversion alert!' : '✓ Within normal mechanical tolerance'}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1">
                        Adhesive Coating QC GSM: <strong className={simActualGsm < simTargetGsm - 2 ? 'text-red-400' : 'text-emerald-400'}>{simActualGsm} GSM</strong> (Target: {simTargetGsm} GSM)
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="50"
                        step="1"
                        value={simActualGsm}
                        onChange={(e) => setSimActualGsm(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {simActualGsm < simTargetGsm - 2 ? '⚠️ Starved coating: Downgrade substitution alert!' : '✓ Meets ASTM adhesive spec'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-Time Mathematical Yield & Sentinel Verdict (Right 1 col) */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                    Projected Unit Economics
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Raw Spread Total</span>
                      <span className="font-mono font-bold text-emerald-400">
                        +₹{(simResults.spread.rawSpreadTotalInr).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Finished Spread Total</span>
                      <span className="font-mono font-bold text-emerald-400">
                        +₹{(simResults.spread.finishedSpreadTotalInr).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm">
                      <span className="font-bold text-white">Total Gross Profit</span>
                      <span className="font-mono font-extrabold text-emerald-400 text-base">
                        ₹{(simResults.spread.totalGrossSpreadInr).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Gross Margin %</span>
                      <span className="font-mono font-semibold text-blue-400">
                        {simResults.spread.grossMarginPercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Peak Capital Locked</span>
                      <span className="font-mono text-amber-400 font-semibold">
                        ₹{(simResults.spread.peakCapitalFloatAtRiskInr / 100000).toFixed(2)} Lakhs
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Working Capital Float Gap</span>
                      <span className="font-mono text-slate-300">
                        {simResults.spread.floatDurationDays} Days
                      </span>
                    </div>
                  </div>

                  {/* Mass Balance Gauge */}
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Mass-Balance Efficiency</span>
                      <span className={`font-mono font-bold ${
                        simResults.mass.massBalanceEfficiencyPercent < 90 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {simResults.mass.massBalanceEfficiencyPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          simResults.mass.massBalanceEfficiencyPercent < 90
                            ? 'bg-red-500'
                            : simResults.mass.massBalanceEfficiencyPercent < 95
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${simResults.mass.massBalanceEfficiencyPercent}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Diverted / Lost Mass:</span>
                      <span className={`font-mono font-bold ${simResults.mass.unaccountedMassKg > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {simResults.mass.unaccountedMassKg} kg
                      </span>
                    </div>
                  </div>

                  {/* Sentinel Simulated Verdict */}
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    simResults.audit.riskScore > 50
                      ? 'bg-red-950/30 border-red-500/40 text-red-300'
                      : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                        {simResults.audit.riskScore > 50 ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                        Sentinel Assessment
                      </span>
                      <span className="text-xs font-mono font-bold">
                        {simResults.audit.riskScore}/100 Risk
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {simResults.audit.riskScore > 50
                        ? `CRITICAL DIVERSION DETECTED: ${simResults.audit.alerts.length} fraud triggers triggered. Converter B reported ${(simReportedScrap - simBaselineScrap).toFixed(1)}% excess scrap, potentially siphoning ${simResults.mass.unaccountedMassKg} kg of raw chemical for private resale.`
                        : 'CLEAN PIPELINE: Thermodynamic mass conservation satisfied. Scrap rate and coating GSM comply with ASTM baseline specifications.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRIPARTITE ARCHITECTURE (A -> B -> C) */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Closed-Loop Tripartite Architecture: Material & Cash Mechanics
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              How TarasAI acts as the central principal counterparty, locking dual-spread margins while using Sentinel AI to prevent disintermediation, theft, and float failure.
            </p>
          </div>

          {/* Interactive Flow Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Step 1: Supplier A */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase">Party A</span>
                <Truck className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Raw Material Supplier</h4>
              <p className="text-xs text-slate-400">e.g. GE Momentive, Dow, Reliance</p>
              <div className="pt-2 border-t border-slate-700/60 text-xs font-mono text-slate-300 space-y-1">
                <div>Price: <strong className="text-white">P_A (₹100)</strong></div>
                <div>Terms: 15-20 Days</div>
                <div className="text-[11px] text-emerald-400">Weighbridge Gate 1</div>
              </div>
            </div>

            {/* Transition 1 */}
            <div className="flex flex-col items-center justify-center text-center p-2 text-slate-400">
              <span className="text-[11px] font-bold text-emerald-400 mb-1">+₹10 Spread</span>
              <ArrowRight className="w-6 h-6 text-blue-500 animate-pulse hidden md:block" />
              <span className="text-[10px] text-slate-500">TarasAI Buys at 100, Sells at 110</span>
            </div>

            {/* Step 2: Converter B */}
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase">Party B</span>
                <Factory className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Tape Converter / Mfr</h4>
              <p className="text-xs text-slate-400">e.g. Specialty Tapes India</p>
              <div className="pt-2 border-t border-indigo-800/60 text-xs font-mono text-slate-300 space-y-1">
                <div>Raw Buy: <strong className="text-indigo-300">₹110/kg</strong></div>
                <div>Finished Sell: <strong className="text-white">P_B (₹140)</strong></div>
                <div className="text-[11px] text-amber-400">Sentinel Mass-Balance Audit</div>
              </div>
            </div>

            {/* Transition 2 */}
            <div className="flex flex-col items-center justify-center text-center p-2 text-slate-400">
              <span className="text-[11px] font-bold text-emerald-400 mb-1">+₹15 Spread</span>
              <ArrowRight className="w-6 h-6 text-indigo-500 animate-pulse hidden md:block" />
              <span className="text-[10px] text-slate-500">TarasAI Buys at 140, Sells at 155</span>
            </div>

            {/* Step 3: Enterprise Buyer C */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Party C</span>
                <Building className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Enterprise End Buyer</h4>
              <p className="text-xs text-slate-400">e.g. Tata Motors, Foxconn</p>
              <div className="pt-2 border-t border-slate-700/60 text-xs font-mono text-slate-300 space-y-1">
                <div>Contract: <strong className="text-emerald-300">P_C (₹155)</strong></div>
                <div>Terms: 60-90 Days Credit</div>
                <div className="text-[11px] text-cyan-400">Blind B/L Delivery Check</div>
              </div>
            </div>
          </div>

          {/* Sentinel 4-Shield Protection Matrix */}
          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              How Sentinel AI Protects You Against Fraud & Operational Risks
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  1. Mass-Balance Yield Audit
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Stops Converter B from stealing your subsidized resin. Calculates theoretical chemical output vs reported scrap rate (e.g. 4% baseline vs 15% claimed).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  2. Spec Downgrade Prevention
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Checks QC micrometer caliper and adhesive coating GSM (e.g. 45 GSM target vs 38 GSM starved). Ensures Buyer C receives strictly contracted tier-1 tapes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  3. Blind B/L Disintermediation Lock
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Maintains principal billing privacy. Supplier A never bills B directly, and Converter B never sees Buyer C&apos;s direct procurement contracts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  4. Float Escrow Governance
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Tranches payout releases. Final conversion profit to Converter B is locked until Buyer C signs off on receiving dock inspection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SENTINEL THREAT CONSOLE */}
      {activeTab === 'ALERTS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                Autonomous Sentinel Threat Feed
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time anomaly quarantine log with automated escrow freezes and recommended enforcement levers.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-slate-800 text-slate-300">
              {stats.activeAlerts.length} Total Alerts Detected
            </span>
          </div>

          {stats.activeAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">All Tripartite Nodes Operating Within Normal Tolerances</p>
              <p className="text-xs">No scrap anomalies, spec substitutions, or disintermediation signals detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.activeAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 hover:border-slate-600 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : alt.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{alt.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                            alt.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {alt.severity}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">Deal: {alt.dealId} • Category: {alt.category}</span>
                      </div>
                    </div>

                    {alt.autoEscrowHoldTriggered && (
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-red-600 text-white flex items-center gap-1.5 self-start sm:self-center shadow-md shadow-red-600/20">
                        <Lock className="w-3.5 h-3.5" />
                        Escrow Automatically Quarantined
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{alt.details}</p>

                  {/* Quantitative Evidence */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Expected Standard:</span>
                      <span className="text-slate-300">{alt.evidence.expectedValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Observed Telemetry:</span>
                      <span className="text-white font-bold">{alt.evidence.observedValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Statistical Variance:</span>
                      <span className="text-red-400 font-bold">{alt.evidence.variance}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-amber-300">
                      <strong>Recommended Remediation: </strong>
                      {alt.recommendedAction}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
