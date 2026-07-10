"use client";

import { useState } from 'react';
import { Loader2, TrendingUp, Sparkles, Building2, Briefcase, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function BusinessPlanPage() {
  const { data: session } = useSession();
  const [companyName, setCompanyName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string | null>(null);

  const userPlan = (session?.user as any)?.plan || "FREE";
  const hasAccess = userPlan === "ENTERPRISE" || (session?.user as any)?.role === "ADMIN";

  if (!hasAccess) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-200">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Strategic Advisor Locked</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto mb-8 text-lg">
          This military-grade intelligence module is restricted to the Enterprise tier. Upgrade to generate complete 5-year business roadmaps.
        </p>
        <Link href="/pricing">
          <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-colors uppercase tracking-widest text-sm border-2 border-slate-900">
            Deploy Enterprise
          </button>
        </Link>
      </div>
    );
  }

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsProcessing(true);
    setPlan(null);
    setIndustry(null);

    try {
      const response = await fetch('/api/business-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPlan(result.businessPlan);
        setIndustry(result.industry);
      } else {
        alert("Error generating plan: " + result.error);
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Strategic Advisor</h1>
            </div>
            <p className="text-slate-600 text-lg font-medium max-w-xl">
              Generate a comprehensive 5-year strategic business plan. Our AI researches live macro-economic trends and synthesizes a premium roadmap.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isProcessing && !plan && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto mt-12"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Who are we researching?</h2>
            <p className="text-slate-500 mb-8">Enter a company name to begin the deep-dive analysis.</p>
            
            <form onSubmit={generatePlan} className="flex flex-col gap-4">
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Tata Motors, Stripe, Airbnb..." 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium text-lg text-center"
              />
              <button 
                type="submit"
                disabled={!companyName.trim()}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2 text-lg"
              >
                <Sparkles className="w-5 h-5" /> Generate 5-Year Plan
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
                className="absolute -inset-8 bg-blue-400/30 blur-2xl rounded-full"
              />
              <div className="bg-white p-6 rounded-3xl shadow-xl relative z-10 border border-slate-100 flex gap-4 items-center">
                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                 <div className="text-left">
                   <p className="font-bold text-slate-900">Synthesizing Strategy</p>
                   <p className="text-sm text-slate-500">This takes ~15 seconds</p>
                 </div>
              </div>
            </div>
            
            <div className="space-y-3 text-center max-w-sm w-full">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }} className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Identifying Industry</motion.div>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Scanning 2026-2030 Trends</motion.div>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 8 }} className="flex items-center gap-3 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Drafting Business Plan</motion.div>
            </div>
          </motion.div>
        )}

        {!isProcessing && plan && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 flex items-center justify-center rounded-xl">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Analysis Complete</h2>
                    <p className="text-sm font-medium text-slate-500">Industry Identified: <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{industry}</span></p>
                  </div>
               </div>
               <button 
                 onClick={() => { setPlan(null); setCompanyName(''); }}
                 className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
               >
                 Analyze Another
               </button>
            </div>

            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
              <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:text-slate-900 prose-h2:text-2xl prose-h2:text-blue-900 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4 prose-h2:mt-12 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-li:marker:text-blue-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {plan}
                </ReactMarkdown>
              </div>
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500 font-medium">
                  <strong>Disclaimer:</strong> This AI-generated strategic plan is for informational purposes only and does not constitute licensed legal, accounting, or financial advice.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
