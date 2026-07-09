"use client";

import { useState } from 'react';
import { Loader2, Landmark, Sparkles, Building2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function EquityFundingPage() {
  const [companyName, setCompanyName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [roadmap, setRoadmap] = useState<string | null>(null);

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsProcessing(true);
    setRoadmap(null);

    try {
      const response = await fetch('/api/equity-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRoadmap(result.roadmap);
      } else {
        alert("Error generating roadmap: " + result.error);
      }
    } catch (error: any) {
      alert("Failed to connect: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Landmark className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Equity & SME IPO Advisor</h1>
            </div>
            <p className="text-slate-600 text-lg font-medium max-w-xl">
              Research the process of raising Private Equity or launching an SME IPO, and generate a personalized readiness roadmap for your MSME.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isProcessing && !roadmap && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto mt-12"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Which company is seeking funding?</h2>
            <p className="text-slate-500 mb-8">Enter the MSME's name to assess their IPO and PE readiness.</p>
            
            <form onSubmit={generatePlan} className="flex flex-col gap-4">
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Tata Motors, Stripe, Airbnb..." 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium text-lg text-center"
              />
              <button 
                type="submit"
                disabled={!companyName.trim()}
                className="w-full py-4 bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2 text-lg"
              >
                <Sparkles className="w-5 h-5" /> Generate Funding Roadmap
              </button>
            </form>
          </motion.div>
        )}

        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <div className="relative mb-12">
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-8 bg-emerald-400/30 blur-2xl rounded-full"
              />
              <div className="bg-white p-6 rounded-3xl shadow-xl relative z-10 border border-slate-100 flex gap-4 items-center">
                 <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                 <div className="text-left">
                   <p className="font-bold text-slate-900">Evaluating Readiness</p>
                   <p className="text-sm text-slate-500">This takes ~15 seconds</p>
                 </div>
              </div>
            </div>
            
            <div className="space-y-3 text-center max-w-sm w-full">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }} className="flex items-center gap-3 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg font-medium"><div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> Scanning SME IPO Requirements</motion.div>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Assessing Financial Position</motion.div>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 8 }} className="flex items-center gap-3 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Drafting Equity Roadmap</motion.div>
            </div>
          </motion.div>
        )}

        {!isProcessing && roadmap && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Roadmap Complete</h2>
                    <p className="text-sm font-medium text-slate-500">Your personalized IPO & Private Equity Strategy</p>
                  </div>
               </div>
               <button 
                 onClick={() => { setRoadmap(null); setCompanyName(''); }}
                 className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
               >
                 Analyze Another
               </button>
            </div>

            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
              <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:text-slate-900 prose-h2:text-2xl prose-h2:text-emerald-900 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4 prose-h2:mt-12 prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-li:marker:text-emerald-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {roadmap}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
