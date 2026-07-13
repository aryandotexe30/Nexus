"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, Users, Target, ArrowRight } from "lucide-react";

export default function SupplyChainAnalyzer() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analyze-company")
      .then(res => res.json())
      .then(res => {
        if (res.error) {
          setError(res.error);
        } else if (res.profile) {
          setData(res.profile);
        }
      })
      .catch(err => {
        setError("Failed to analyze supply chain.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden relative min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="flex flex-col items-center z-10 text-indigo-200">
          <BrainCircuit className="w-10 h-10 mb-4 animate-pulse text-indigo-400" />
          <h3 className="font-bold text-lg mb-2">Analyzing Your Company...</h3>
          <p className="text-sm opacity-70">AI is mapping your supply chain network.</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Don't show if there's no data or an error (e.g., no company name)
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">AI Supply Chain Insights</h2>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-3xl relative z-10">
        {data.summary}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Suppliers Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-bold">Raw Materials to Source</h3>
          </div>
          <ul className="space-y-4">
            {data.potentialSuppliers?.map((supplier: any, idx: number) => (
              <li key={idx} className="text-sm group">
                <div className="font-semibold text-white mb-1">{supplier.material}</div>
                <div className="text-slate-400 flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" /> Target: {supplier.sourceType}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Customers Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Target className="w-5 h-5" />
            <h3 className="font-bold">Target B2B Customers</h3>
          </div>
          <ul className="space-y-4">
            {data.targetCustomers?.map((customer: any, idx: number) => (
              <li key={idx} className="text-sm group">
                <div className="font-semibold text-white mb-1">{customer.type}</div>
                <div className="text-slate-400 flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" /> {customer.reason}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
