"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useVelocity, 
  useAnimationFrame,
  useMotionTemplate
} from "framer-motion";
import { ArrowRight, Search, Zap, Globe, ShieldCheck, Network, TrendingUp, Store, Activity, ChevronRight, Lock } from "lucide-react";
// Advanced wrap function for velocity marquee
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// --- Advanced Physics Components ---

// 1. Magnetic Button
function MagneticButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2);
    y.set(middleY * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

// 2. 3D Tilt Card with Spotlight
function TiltCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), { damping: 20, stiffness: 150 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), { damping: 20, stiffness: 150 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-50"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(37, 99, 235, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </motion.div>
  );
}

// 3. Velocity Marquee
interface ParallaxProps {
  children: string;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef<number>(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="parallax flex whitespace-nowrap flex-nowrap overflow-hidden py-4 border-y border-slate-200 bg-slate-50">
      <motion.div className="flex whitespace-nowrap flex-nowrap gap-12 text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-200" style={{ x }}>
        <span>{children}</span>
        <span>{children}</span>
        <span>{children}</span>
        <span>{children}</span>
      </motion.div>
    </div>
  );
}


export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  // Background Rotations
  const bgRotateX = useTransform(smoothProgress, [0, 1], [0, 60]);
  const bgRotateZ = useTransform(smoothProgress, [0, 1], [0, -30]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.5]);
  const bgOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 0.3, 0.1]);

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white"
    >
      {/* Industrial Blueprint Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0" 
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
          <div className="absolute w-[80%] h-[80%] border border-indigo-500/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute w-[60%] h-[60%] border-2 border-dashed border-blue-600/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
          <div className="absolute w-[40%] h-[40%] bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 md:px-12 backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-white rounded-none shadow-[4px_4px_0px_0px_rgba(37,99,235,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Globe className="w-6 h-6 relative z-10" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            Nexus
          </span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/login" className="text-slate-600 font-bold hover:text-blue-600 transition-colors text-sm tracking-wider hidden sm:block">
            Sign In
          </Link>
          <Link href="/signup">
            <MagneticButton>
              <button className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm tracking-wider hover:bg-blue-700 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px]">
                Get Started
              </button>
            </MagneticButton>
          </Link>
        </div>
      </nav>

      {/* Parallax Content Layers */}
      <div className="relative z-10 w-full">
        
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-blue-400 font-mono text-xs font-bold uppercase tracking-widest mb-8 border border-slate-800 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.3)]"
            >
              <Activity className="w-4 h-4" /> System Status: Online & Searching
            </motion.div>
            
            {/* Staggered Hero Text */}
            <motion.h1 
              className="text-5xl md:text-[5.5rem] font-black tracking-tighter leading-[0.95] text-slate-900 mb-8 uppercase"
              initial="hidden" animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="block">Your Competitors</motion.span>
              <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="block">Are <span className="text-blue-600 relative inline-block">Stealing<motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ delay: 1, duration: 0.5 }} className="absolute bottom-1 left-0 h-2 bg-blue-200 -z-10"></motion.div></span></motion.span>
              <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="block">Your Leads.</motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mb-12 leading-relaxed border-l-4 border-blue-600 pl-6"
            >
              Stop burning margin on dead databases. Nexus actively extracts, verifies, and secures real-world buyers for Indian MSMEs so you can scale faster. <strong>Automate or stagnate.</strong>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <Link href="/signup">
                <MagneticButton>
                  <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black tracking-widest text-lg flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all group border-2 border-slate-900 overflow-hidden relative">
                    {/* Sweeping Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    Get Started For Free <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                </MagneticButton>
              </Link>
              <div className="flex items-center gap-2 text-slate-500 font-mono text-sm uppercase font-bold">
                <ShieldCheck className="w-5 h-5 text-green-600" /> 100% Verified Live Data
              </div>
            </motion.div>
          </div>
        </section>

        {/* VELOCITY MARQUEE */}
        <section className="py-12 bg-white relative z-20">
          <ParallaxText baseVelocity={-2}>Verified Intel Only • Zero Dummy Data • 100% Live Extraction •</ParallaxText>
        </section>

        {/* BENTO BOX FEATURE GRID */}
        <section className="min-h-screen py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-slate-600 font-medium max-w-3xl border-l-4 border-slate-900 pl-4">
              We replaced expensive consultants and broken software with a single, highly engineered platform. Here is exactly how Nexus benefits your business:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px]">
            
            {/* Bento Item 1: Large - Global Matchmaker */}
            <TiltCard className="md:col-span-2 md:row-span-2 bg-white border-2 border-slate-900 p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
              {/* Micro-visual background: Pulsing Radar */}
              <div className="absolute right-0 bottom-0 w-[60%] h-[60%] opacity-[0.03] pointer-events-none flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-slate-900 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="w-[50%] h-[50%] border-4 border-slate-900 rounded-full"></div>
                <div className="w-[1px] h-full bg-slate-900 absolute animate-spin" style={{ animationDuration: '4s' }}></div>
              </div>

              <div className="relative z-10 pointer-events-none">
                <Search className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-3xl font-black uppercase tracking-tight mb-4">Find Buyers Who Are Ready to Purchase</h3>
                <p className="text-slate-600 text-lg font-medium max-w-md">
                  Stop cold calling dead leads. We instantly connect you with verified businesses currently looking for your exact products, reducing your sales cycle by months and increasing your win rate.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 font-mono text-sm text-blue-600 font-bold uppercase tracking-wider pointer-events-none">
                <ChevronRight className="w-5 h-5" /> Module Active
              </div>
            </TiltCard>

            {/* Bento Item 2: Square - Data Enrichment */}
            <TiltCard className="bg-slate-900 text-white border-2 border-slate-900 p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent_50%)] pointer-events-none"></div>
              <div className="relative z-10 pointer-events-none">
                <Zap className="w-10 h-10 text-yellow-400 mb-6" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">Automate Your Market Research</h3>
                <p className="text-slate-300 font-medium">
                  Upload your spreadsheets and we instantly fill in the gaps—verified GSTINs, revenues, and contacts—so your team focuses on closing deals, not Googling.
                </p>
              </div>
            </TiltCard>

            {/* Bento Item 3: Square - Strategic Advisor */}
            <TiltCard className="bg-white border-2 border-slate-900 p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <div className="pointer-events-none">
                <TrendingUp className="w-10 h-10 text-emerald-600 mb-6" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">Unlock Growth Strategies for Funding</h3>
                <p className="text-slate-600 font-medium">
                  Generate investor-ready business plans based on real market data. Know what new markets to enter without paying expensive consultants.
                </p>
              </div>
            </TiltCard>

            {/* Bento Item 4: Wide - Marketplace */}
            <TiltCard className="md:col-span-2 bg-blue-600 text-white border-2 border-slate-900 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[bg-pan_3s_linear_infinite] pointer-events-none"></div>
              <div className="relative z-10 max-w-lg mb-6 sm:mb-0 pointer-events-none">
                <Store className="w-10 h-10 text-blue-200 mb-4" />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Buy & Sell Directly</h3>
                <p className="text-blue-100 font-medium">
                  Post your raw material needs and receive competitive bids directly from verified Indian manufacturers, bypassing middlemen to protect your profit margins.
                </p>
              </div>
              <div className="relative z-10 shrink-0 pointer-events-none">
                <div className="w-16 h-16 bg-slate-900 rounded-none flex items-center justify-center border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
            </TiltCard>

            {/* Bento Item 5: Square - Network Mapper */}
            <TiltCard className="bg-white border-2 border-slate-900 p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <div className="pointer-events-none relative h-full flex flex-col">
                <Network className="w-10 h-10 text-indigo-600 mb-6" />
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">Discover Competitors' Suppliers</h3>
                <p className="text-slate-600 font-medium">
                  Visualize exactly who your competitors are working with, allowing you to intercept their supply chain and find cheaper vendors.
                </p>
                {/* Micro-visual: Constellation */}
                <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10">
                   <div className="absolute top-2 left-2 w-2 h-2 bg-slate-900 rounded-full animate-ping"></div>
                   <div className="absolute bottom-4 right-4 w-3 h-3 bg-slate-900 rounded-full"></div>
                   <div className="absolute top-1/2 left-1/2 w-20 h-[1px] bg-slate-900 origin-left -rotate-45"></div>
                </div>
              </div>
            </TiltCard>

          </div>
        </section>

        {/* CTA FOOTER */}
        <footer className="pt-32 pb-12 px-6 bg-slate-900 text-white border-t-[16px] border-blue-600 relative z-20">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
              Deploy Your Final <br/> Competitive Advantage.
            </h2>
            <p className="text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
              You are losing money every day you rely on manual research. Initialize your Nexus instance today and start closing verified leads.
            </p>
            
            <Link href="/signup">
              <MagneticButton>
                <button className="px-12 py-6 bg-blue-600 text-white font-black tracking-widest text-xl shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all border-2 border-white inline-flex items-center gap-4 group">
                  Start Your Free Trial <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </MagneticButton>
            </Link>
            
            {/* Standard Footer with 4 Sections */}
            <div className="mt-32 border-t border-slate-800 pt-16 mb-8 text-left grid grid-cols-1 md:grid-cols-5 gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-white uppercase">Nexus</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md font-medium">
                  The military-grade operating system for Indian MSMEs. We verify the buyers, extract the data, and generate the strategies so you can focus entirely on scaling.
                </p>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Product</h4>
                <ul className="space-y-4 text-sm font-medium text-slate-400">
                  <li><Link href="/matchmaker" className="hover:text-blue-400 transition-colors">Global Matchmaker</Link></li>
                  <li><Link href="/enrich" className="hover:text-blue-400 transition-colors">Data Enrichment</Link></li>
                  <li><Link href="/dashboard/business-plan" className="hover:text-blue-400 transition-colors">Strategic Advisor</Link></li>
                  <li><Link href="/dashboard/marketplace" className="hover:text-blue-400 transition-colors">Marketplace</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
                <ul className="space-y-4 text-sm font-medium text-slate-400">
                  <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                  <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
                <ul className="space-y-4 text-sm font-medium text-slate-400">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div> NexusB2BAI@outlook.com</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div> +91 7892401512</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div> Bengaluru, India</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-500 uppercase tracking-widest">
              <p>© {new Date().getFullYear()} Nexus AI System. Built in India.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
