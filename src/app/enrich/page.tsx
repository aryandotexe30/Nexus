"use client";

import { useState } from 'react';
import UploadDropzone from '@/components/UploadDropzone';
import Dashboard from '@/components/Dashboard';
import { ParsedCompany } from '@/utils/excel';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [singleCompanyName, setSingleCompanyName] = useState('');

  const handleDataParsed = async (companies: ParsedCompany[]) => {
    setIsProcessing(true);
    setStatus(`Initializing enrichment for ${companies.length} companies...`);
    
    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        if (result.processedCount < companies.length) {
          alert(`Free Tier Limit: We processed ${result.processedCount} out of ${companies.length} companies based on your available credits.`);
        }
      } else {
        alert("Error during enrichment: " + result.error);
      }
    } catch (error: any) {
      alert("Failed to process data: " + error.message);
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleSingleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleCompanyName.trim()) return;
    handleDataParsed([{ 
      name: singleCompanyName, 
      address: 'Unknown', 
      pincode: 'Unknown' 
    }]);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/30 overflow-hidden relative font-sans">
      {/* 3D Immersive Animated Gradients - Light Mode */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-multiply pointer-events-none z-10"></div>
      
      <motion.div 
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"
      />
      <motion.div 
        animate={{ 
          rotate: [0, -5, 5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-200/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"
      />
      
      <div className="relative z-20 container mx-auto px-4 py-16">
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 drop-shadow-sm pb-2">
            Nexus Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Upload your company lists and instantly gather deep insights on financials, personnel, and news using autonomous AI.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {!isProcessing && data.length === 0 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
            >
              <UploadDropzone onDataParsed={handleDataParsed} />
              
              <div className="mt-12 max-w-xl mx-auto text-center">
                <div className="flex items-center gap-4 my-8">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-slate-400 font-medium text-sm">OR SEARCH SINGLE COMPANY</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                
                <form onSubmit={handleSingleSearch} className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={singleCompanyName}
                    onChange={(e) => setSingleCompanyName(e.target.value)}
                    placeholder="e.g. Reliance Industries, Infosys..." 
                    className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={!singleCompanyName.trim()}
                    className="px-8 py-4 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] active:scale-95"
                  >
                    Enrich
                  </button>
                </form>
              </div>
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
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-8 bg-blue-400/30 blur-2xl rounded-full"
                />
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin relative z-10" />
              </div>
              <h2 className="text-3xl font-bold mt-12 mb-3 text-slate-800 tracking-tight">Crunching the Web</h2>
              <p className="text-slate-500 font-medium text-lg animate-pulse">{status}</p>
            </motion.div>
          )}

          {!isProcessing && data.length > 0 && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-12"
            >
              <Dashboard data={data} />
              
              <div className="text-center pt-8">
                <button 
                  onClick={() => setData([])}
                  className="px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all font-semibold shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.1)] active:scale-95 flex items-center gap-2 mx-auto"
                >
                  Analyze Another File
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
