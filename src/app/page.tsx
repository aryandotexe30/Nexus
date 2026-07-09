"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Search, Zap, Globe, ShieldCheck, Network, TrendingUp, Store, Activity, ChevronRight, Lock } from "lucide-react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  // 3D Background Transformations based on scroll
  const bgRotateX = useTransform(smoothProgress, [0, 1], [0, 60]);
  const bgRotateZ = useTransform(smoothProgress, [0, 1], [0, -30]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.5]);
  const bgOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 0.3, 0.1]);

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-[300vh] bg-[#f8fafc] text-slate-900 font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white"
    >
      {/* Industrial Blueprint Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Sticky 3D Background Engine */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 perspective-[2000px] overflow-hidden">
        <motion.div 
          style={{ 
            rotateX: bgRotateX, 
            rotateZ: bgRotateZ,
            scale: bgScale,
            opacity: bgOpacity,
            transformStyle: "preserve-3d" 
          }}
          className="relative w-[150vw] h-[150vh] border border-blue-500/10 rounded-full flex items-center justify-center"
        >
          {/* Inner rings simulating a massive reactor or engine */}
          <div className="absolute w-[80%] h-[80%] border border-indigo-500/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute w-[60%] h-[60%] border-2 border-dashed border-blue-600/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
          <div className="absolute w-[40%] h-[40%] bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:px-12 backdrop-blur-md bg-white/70 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-white rounded-none shadow-[4px_4px_0px_0px_rgba(37,99,235,0.5)]">
            <Globe className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            Nexus <span className="text-blue-600">OS</span>
          </span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/login" className="text-slate-600 font-bold hover:text-slate-900 transition-colors uppercase text-sm tracking-wider hidden sm:block">
            Access Terminal
          </Link>
          <Link href="/signup">
            <button className="px-6 py-2.5 bg-blue-600 text-white font-bold uppercase text-sm tracking-wider hover:bg-blue-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px]">
              Initialize
            </button>
          </Link>
        </div>
      </nav>

      {/* Content Layers (Scrollable over fixed background) */}
      <div className="relative z-10 w-full">
        
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-blue-400 font-mono text-xs font-bold uppercase tracking-widest mb-8 border border-slate-800 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.3)]">
              <Activity className="w-4 h-4" /> System Status: Online & Searching
            </div>
            
            <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter leading-[0.95] text-slate-900 mb-8 uppercase">
              Your Competitors Are <span className="text-blue-600">Stealing</span> Your Leads.
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mb-12 leading-relaxed border-l-4 border-blue-600 pl-6">
              Stop burning margin on dead databases. Nexus is a military-grade B2B operating system that actively extracts, verifies, and secures real-world buyers for Indian MSMEs. <strong>Automate or stagnate.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link href="/signup">
                <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all group border-2 border-slate-900">
                  Deploy Nexus Now <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
              <div className="flex items-center gap-2 text-slate-500 font-mono text-sm uppercase font-bold">
                <ShieldCheck className="w-5 h-5 text-green-600" /> 100% Verified Live Data
              </div>
            </div>
          </motion.div>
        </section>

        {/* BENTO BOX FEATURE GRID */}
        <section className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">
              The Architecture of Dominance
            </h2>
            <p className="text-xl text-slate-600 font-medium max-w-3xl border-l-4 border-slate-900 pl-4">
              Why pay consultants ₹50,000 for a PDF when an AI engine can generate actionable execution plans in 15 seconds? Here is what you are deploying:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px]">
            
            {/* Bento Item 1: Large - Global Matchmaker */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 bg-white border-2 border-slate-900 p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden group"
            >
              {/* Micro-visual background */}
              <div className="absolute right-0 bottom-0 w-[80%] h-[80%] opacity-5 pointer-events-none border-l-[1px] border-t-[1px] border-slate-900 rounded-tl-full group-hover:scale-110 transition-transform duration-1000">
                <div className="w-full h-full border-l-[1px] border-t-[1px] border-slate-900 rounded-tl-full m-8"></div>
              </div>

              <div className="relative z-10">
                <Search className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-3xl font-black uppercase tracking-tight mb-4">Global Matchmaker Engine</h3>
                <p className="text-slate-600 text-lg font-medium max-w-md">
                  Stop hunting. Our AI actively sweeps the live internet, analyzing SEC filings and corporate signals to deliver verified buyers actively looking for your exact product profile right now.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 font-mono text-sm text-blue-600 font-bold uppercase tracking-wider">
                <ChevronRight className="w-5 h-5" /> Module Active
              </div>
            </motion.div>

            {/* Bento Item 2: Square - Data Enrichment */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-slate-900 text-white border-2 border-slate-900 p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent_50%)] pointer-events-none"></div>
              <div className="relative z-10">
                <Zap className="w-10 h-10 text-yellow-400 mb-6" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">Live Data Enrichment</h3>
                <p className="text-slate-300 font-medium">
                  Upload raw excel sheets. Instantly extract verified GSTINs, market caps, and revenue figures via live crawler.
                </p>
              </div>
            </motion.div>

            {/* Bento Item 3: Square - Strategic Advisor */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-white border-2 border-slate-900 p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
            >
              <div>
                <TrendingUp className="w-10 h-10 text-emerald-600 mb-6" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">McKinsey-Grade Strategy</h3>
                <p className="text-slate-600 font-medium">
                  Generate a 5-Year Business Plan backed by brutal, factual market data. No fluff. No hypotheticals.
                </p>
              </div>
            </motion.div>

            {/* Bento Item 4: Wide - Marketplace */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-blue-600 text-white border-2 border-slate-900 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[bg-pan_3s_linear_infinite] pointer-events-none"></div>
              <div className="relative z-10 max-w-lg mb-6 sm:mb-0">
                <Store className="w-10 h-10 text-blue-200 mb-4" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Encrypted B2B Marketplace</h3>
                <p className="text-blue-100 font-medium">
                  Post requirements, receive bids directly from verified manufacturers, and negotiate securely. Bypass the middlemen completely.
                </p>
              </div>
              <div className="relative z-10 shrink-0">
                <div className="w-16 h-16 bg-slate-900 rounded-none flex items-center justify-center border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Bento Item 5: Square - Network Mapper */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="bg-white border-2 border-slate-900 p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] group"
            >
              <div>
                <Network className="w-10 h-10 text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">Supply Chain Mapper</h3>
                <p className="text-slate-600 font-medium">
                  Visualize corporate relationships. Discover exactly who your competitors are working with instantly.
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* VERIFIED NETWORK SECTION (Replaces Dummy Logos) */}
        <section className="py-24 px-6 border-y-2 border-slate-900 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-4">Zero Dummy Data. <br/>100% Verified Intel.</h2>
              <p className="text-slate-600 font-medium">
                Our extraction engine relies solely on real-time SEC filings, verified GST databases, and corporate registry signals. We deal strictly in facts.
              </p>
            </div>
            
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {/* Placeholders for real client/partner logos. No dummy brands. */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-video border-2 border-slate-200 bg-slate-50 flex items-center justify-center grayscale opacity-50 hover:opacity-100 transition-opacity">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Verified<br/>Node {i}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <footer className="py-32 px-6 bg-slate-900 text-white border-t-[16px] border-blue-600">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
              Deploy Your Final <br/> Competitive Advantage.
            </h2>
            <p className="text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
              You are losing money every day you rely on manual research and outdated consultants. Initialize your Nexus instance today.
            </p>
            
            <Link href="/signup">
              <button className="px-12 py-6 bg-blue-600 text-white font-black uppercase tracking-widest text-xl shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all border-2 border-white inline-flex items-center gap-4 group">
                Execute Protocol <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
            
            <div className="mt-24 border-t-2 border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-sm text-slate-500 uppercase font-bold tracking-widest">
              <p>© {new Date().getFullYear()} Nexus AI System</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
                <Link href="#" className="hover:text-white transition-colors">System Status</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
