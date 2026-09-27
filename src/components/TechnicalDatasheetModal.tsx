"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  Award, 
  FileText, 
  CheckCircle2, 
  Share2, 
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import { TarasTDSData } from "@/lib/tdsGenerator";

interface TechnicalDatasheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tdsData: TarasTDSData | null;
  onLaunchRfq?: (sku: string) => void;
}

export default function TechnicalDatasheetModal({
  isOpen,
  onClose,
  tdsData,
  onLaunchRfq
}: TechnicalDatasheetModalProps) {
  if (!isOpen || !tdsData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm">
        
        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Control Action Bar (Sticky) */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-[#0B4FDF] text-white rounded text-[11px] font-black italic">
                TarasAI
              </div>
              <span className="text-xs font-bold text-slate-300">
                Official Technical Data Sheet (TDS) & Certification
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print / Save PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="p-6 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:overflow-visible">
            
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#0B4FDF] text-white rounded-md text-xs font-black tracking-tight">
                    {tdsData.sku}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {tdsData.documentId}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {tdsData.productName}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {tdsData.category} • {tdsData.revision} • Published: {tdsData.issueDate}
                </p>
              </div>

              {/* Verified Quality Seal */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl shrink-0">
                <ShieldCheck className="w-7 h-7 text-[#0B4FDF]" />
                <div className="text-[10px] leading-tight text-[#0B4FDF] font-bold">
                  <div>TARASAI VERIFIED</div>
                  <div>100% SPEC CONFORMANCE</div>
                </div>
              </div>
            </div>

            {/* Product Overview Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                1. Product Overview & Engineering Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {tdsData.productDescription}
              </p>
            </div>

            {/* Physical & Technical Property Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                2. Typical Physical & Electrical Properties (Standard Conditions)
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold">
                      <th className="p-3">Physical / Mechanical Property</th>
                      <th className="p-3">Test Standard</th>
                      <th className="p-3">Typical Value</th>
                      <th className="p-3">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {tdsData.properties.map((prop, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="p-3 font-semibold text-slate-900">{prop.testProperty}</td>
                        <td className="p-3 text-slate-500 font-mono">{prop.testMethod}</td>
                        <td className="p-3 font-extrabold text-[#0B4FDF] font-mono">{prop.typicalValue}</td>
                        <td className="p-3 text-slate-600 font-mono">{prop.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                * Note: Values listed are typical test results obtained in laboratory conditions and should not be used for specification limits without prior engineering verification.
              </p>
            </div>

            {/* Storage, Shelf Life & Surface Preparation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Storage & Shelf Life</h4>
                <p className="text-xs text-slate-600">{tdsData.storageAndHandling.shelfLife}</p>
                <p className="text-xs text-slate-600">{tdsData.storageAndHandling.storageTemp}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Surface Preparation & Bonding</h4>
                <p className="text-xs text-slate-600">{tdsData.storageAndHandling.surfacePrep}</p>
                <p className="text-xs text-slate-600">{tdsData.storageAndHandling.applicationPressure}</p>
              </div>
            </div>

            {/* Regulatory & Compliance Statements */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                3. Regulatory & Quality Declarations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tdsData.complianceStatements.map((stmt, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{stmt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate Seal & Authorized Signatory Block */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="space-y-0.5">
                <div className="font-extrabold text-slate-900">{tdsData.authorizedSignatory.name}</div>
                <div className="text-slate-600">{tdsData.authorizedSignatory.title}</div>
                <div className="text-slate-400 text-[11px]">{tdsData.authorizedSignatory.company}</div>
              </div>

              <div className="p-3 border-2 border-dashed border-slate-300 rounded-xl text-center">
                <div className="text-[10px] font-black tracking-widest uppercase text-slate-700">
                  {tdsData.authorizedSignatory.sealText}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Digital Quality Certificate Issued by TarasAI</div>
              </div>
            </div>

          </div>

          {/* Bottom Footer CTA Modal Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="text-xs text-slate-600">
              Need custom width slitting, rotary die-cut parts, or physical test rolls?
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.href = `/signup?role=buyer&search=${encodeURIComponent(tdsData.sku)}`;
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Request 48-Hr Physical Sample / RFQ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
