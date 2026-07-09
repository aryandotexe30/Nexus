"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Zap, Globe, ShieldCheck, Network, TrendingUp, Store } from "lucide-react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  const rotateX = useTransform(smoothProgress, [0, 0.2], [20, 0]);
  const rotateY = useTransform(smoothProgress, [0, 0.2], [-10, 0]);
  const scale = useTransform(smoothProgress, [0, 0.2], [0.8, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.1], [0.5, 1]);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 40; 
    const y = (clientY / innerHeight - 0.5) * -40;
    setMousePosition({ x, y });
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-[200vh] bg-[#f8fafc] text-slate-900 font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white"
      onMouseMove={handleMouseMove}
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:px-12 backdrop-blur-xl bg-white/40 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Globe className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800">
            Nexus
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-slate-600 font-bold hover:text-blue-600 transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold shadow-xl shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center pt-20 perspective-[2000px] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-blue-400/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-400/20 rounded-full blur-[60px] md:blur-[100px] pointer-events-none"></div>

        <motion.div 
          className="relative z-10 text-center max-w-5xl px-6"
          style={{
            rotateX: mousePosition.y,
            rotateY: mousePosition.x,
            transformStyle: "preserve-3d",
          }}
          transition={{ type: "spring", stiffness: 75, damping: 15 }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 50, translateZ: -100 }}
            animate={{ opacity: 1, y: 0, translateZ: 50 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4" /> Built strictly for Indian MSMEs
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 drop-shadow-sm">
              Stop Paying Lakhs for <br/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Dead B2B Leads.</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, translateZ: -50 }}
            animate={{ opacity: 1, translateZ: 20 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Nexus is the ultimate B2B operating system. Automate your GST extraction, find verified buyers instantly, and generate 5-year McKinsey-grade business plans—for a fraction of the cost.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30, translateZ: 0 }}
            animate={{ opacity: 1, y: 0, translateZ: 80 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/signup">
              <button className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-extrabold text-lg flex items-center gap-3 overflow-hidden shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                Enter The Hub <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <span className="text-slate-400 font-semibold uppercase tracking-widest text-sm">No credit card required</span>
          </motion.div>
        </motion.div>
      </div>

      {/* 3D Dashboard Preview (Scroll triggered) */}
      <div className="relative h-[800px] hidden lg:flex items-center justify-center perspective-[2000px] -mt-32 z-20">
        <motion.div 
          style={{ rotateX, rotateY, scale, opacity, transformStyle: "preserve-3d" }}
          className="w-[90%] max-w-6xl h-[600px] relative"
        >
          <div className="absolute inset-0 bg-slate-900 rounded-[40px] border-4 border-slate-800 shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col">
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-sm bg-slate-800 px-4 py-1.5 rounded-full">
                <Search className="w-4 h-4" /> nexus.ai/matchmaker
              </div>
            </div>
            
            <div className="flex-1 p-8 grid grid-cols-3 gap-8 relative overflow-hidden">
              <div className="col-span-1 space-y-4">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Zap className="text-yellow-400 w-5 h-5"/> Live Enrichment</h3>
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-slate-800 p-4 rounded-2xl border border-slate-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 font-medium text-sm">TechCorp India {i+1}</span>
                      <span className="text-green-400 text-xs font-bold px-2 py-1 bg-green-400/10 rounded">Done</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full w-full"></div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="col-span-2 flex flex-col gap-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 relative overflow-hidden text-white">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <h2 className="text-2xl font-bold mb-2">Global Match Found!</h2>
                  <p className="text-blue-100 mb-6 max-w-md">We found a perfect B2B buyer for your software based on recent SEC filings and market analysis.</p>
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-md font-mono text-sm border border-white/20">
                    Contact: <span className="font-bold text-white">vp.sales@targetcompany.in</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 flex-1">
                   <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 flex flex-col justify-center items-center text-center">
                      <div className="text-4xl font-black text-blue-400 mb-2">94%</div>
                      <div className="text-slate-400 font-medium">Intent Score</div>
                   </div>
                   <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 flex flex-col justify-center items-center text-center">
                      <div className="text-4xl font-black text-indigo-400 mb-2">₹1.2Cr</div>
                      <div className="text-slate-400 font-medium">Est. Budget</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div 
            style={{ transform: 'translateZ(80px)' }}
            className="absolute top-1/4 -right-8 md:-right-12 bg-white p-6 rounded-2xl shadow-2xl shadow-blue-900/50 border border-slate-100 flex items-center gap-4 z-30"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><ShieldCheck className="w-6 h-6"/></div>
            <div>
              <p className="font-bold text-slate-900">Verified GSTIN</p>
              <p className="text-sm text-slate-500">Zero API Costs</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 5 Core Features Grid */}
      <div className="relative py-32 px-6 bg-white z-30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">The Ultimate Growth Stack.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">We built everything an Indian MSME needs to scale, replacing 5 different expensive tools with one powerful AI engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              className="bg-[#f8fafc] p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
            >
              <Search className="w-10 h-10 text-blue-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Global Matchmaker</h3>
              <p className="text-slate-600 font-medium">Stop buying dead lead lists. Our AI scours the live internet to find active B2B buyers currently looking for your exact product.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              className="bg-[#f8fafc] p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
            >
              <Zap className="w-10 h-10 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Free Data Enrichment</h3>
              <p className="text-slate-600 font-medium">Upload an Excel sheet and instantly extract SEC filings, financials, and verified GSTIN numbers using our free web-crawler.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              className="bg-[#f8fafc] p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
            >
              <TrendingUp className="w-10 h-10 text-emerald-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Strategic Advisor</h3>
              <p className="text-slate-600 font-medium">Why pay a consultant ₹50,000? Enter a company name and generate a highly accurate, data-backed 5-Year Strategic Business Plan in 15 seconds.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              className="bg-[#f8fafc] p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
            >
              <Store className="w-10 h-10 text-purple-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">B2B Marketplace</h3>
              <p className="text-slate-600 font-medium">Post your raw material requirements or service needs, receive direct bids, and negotiate securely through encrypted chat threads.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              className="bg-[#f8fafc] p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
            >
              <Network className="w-10 h-10 text-rose-600 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Network Mapper</h3>
              <p className="text-slate-600 font-medium">Visualize corporate relationships. Discover exactly who your competitors are working with and map out new vendor supply chains.</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Footer CTA & Main Footer */}
      <footer className="bg-slate-950 text-slate-300 pt-32 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] md:w-[800px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-32">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight">Scale your MSME today.</h2>
            <Link href="/signup">
              <button className="px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-bold text-xl shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all hover:-translate-y-1">
                Start your 14-day free trial
              </button>
            </Link>
            <p className="mt-6 text-slate-400 font-medium">No credit card required. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 border-t border-slate-800 pt-16 mb-16">
            <div className="col-span-1 md:col-span-2 pr-0 md:pr-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">Nexus</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The operating system for Indian MSMEs. We find the buyers, automate the research, and generate the strategy so you can focus on closing deals.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><Link href="/matchmaker" className="hover:text-blue-400 transition-colors">Global Matchmaker</Link></li>
                <li><Link href="/enrich" className="hover:text-blue-400 transition-colors">Data Enrichment</Link></li>
                <li><Link href="/dashboard/business-plan" className="hover:text-blue-400 transition-colors">AI Advisor</Link></li>
                <li><Link href="/dashboard/marketplace" className="hover:text-blue-400 transition-colors">Marketplace</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div> hello@nexus.in</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div> +91 98765 43210</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div> Bengaluru, Karnataka</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-slate-500">
            <p>© {new Date().getFullYear()} Nexus AI, Inc. Built in India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
