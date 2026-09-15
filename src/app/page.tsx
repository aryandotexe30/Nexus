"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { 
  motion, 
  useScroll, 
  useTransform 
} from "framer-motion";
import { 
  ShieldCheck, 
  Globe, 
  Database, 
  Cpu, 
  Layers, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Factory,
  Lock,
  Sparkles,
  Server,
  FileCheck
} from "lucide-react";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parallax Scroll Hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.2]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.96]);

  // Interactive Particle Canvas Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const count = Math.min(Math.floor(width / 35), 45);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden"
    >
      {/* ============================================================ */}
      {/* 1. CINEMATIC BACKGROUND VIDEO WITH DIMMED ATMOSPHERIC OVERLAY */}
      {/* ============================================================ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
          poster="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80"
        >
          <source 
            src="https://upload.wikimedia.org/wikipedia/commons/8/85/Chainsaw_robot_carves_the_7Xstool_by_tom_pawlofsky_-_tibor_weissmahr.webm" 
            type="video/webm" 
          />
        </video>

        {/* High-Contrast Dark Dimming Layer */}
        <div className="absolute inset-0 bg-slate-950/85" />

        {/* Gradient Vignette & Radial Atmospheric Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-slate-950/90" />
        
        {/* Cyber Grid Texture */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
            backgroundSize: "48px 48px"
          }}
        />

        {/* Particle Canvas Layer */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* 2. FLOATING GLASSMORPHIC NAVIGATION BAR                      */}
      {/* ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 bg-slate-950/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                TarasAI
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Features
            </a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Engine Architecture
            </a>
            <a href="#standards" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Standardized Specs
            </a>
            <a href="#security" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Anonymous RFQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sign Up</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ============================================================ */}
      {/* 3. HERO SECTION                                              */}
      {/* ============================================================ */}
      <main className="relative z-10 pt-32 md:pt-40 pb-24">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8"
        >
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-300 text-xs font-bold backdrop-blur-md shadow-lg shadow-blue-950/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous Industrial Materials Intelligence & Procurement</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono">1,800+ Standardized Specifications</span>
          </div>

          {/* Master Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Procure High-Performance Industrial Materials with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Zero Spec Ambiguity.
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Unified cross-referencing across <strong className="text-white">1,800+ physical engineering standards</strong>. Automated parametric extraction, specification clustering, and confidential multi-plant RFQ dispatch.
            </p>
          </div>

          {/* Clean Auth CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all"
            >
              <span>Sign Up for Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-extrabold text-sm rounded-xl border border-slate-700/80 backdrop-blur-md hover:scale-[1.02] transition-all"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Sign In to Platform</span>
            </Link>
          </div>

          {/* ============================================================ */}
          {/* 4. PLATFORM ARCHITECTURE & PIPELINE VISUALIZATION (NO DEMO)  */}
          {/* ============================================================ */}
          <div id="architecture" className="pt-8 max-w-4xl mx-auto text-left">
            <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500/80" />
                  <div className="w-3 h-3 rounded-full bg-indigo-500/80" />
                  <div className="w-3 h-3 rounded-full bg-cyan-500/80" />
                  <span className="text-xs font-mono font-bold text-slate-300 ml-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    TarasAI Autonomous Procurement Architecture
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SYSTEM ACTIVE
                </span>
              </div>

              {/* 4-Stage Autonomous Dataflow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Stage 1 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">1. Spec Ingestion</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Input raw engineering requirements: thermal, caliper, carrier & adhesive chemistry.
                  </p>
                </div>

                {/* Stage 2 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">2. 5D Classification</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Parametric clustering cross-references against 1,800+ physical standard specifications.
                  </p>
                </div>

                {/* Stage 3 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">3. Standard Unified Code</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Generates unified TarasAI Standard ID (e.g. <span className="font-mono text-cyan-300">TAR-KAP-SIL-0050</span>) with pricing benchmarks.
                  </p>
                </div>

                {/* Stage 4 */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">4. Anonymous RFQ</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Direct automated multi-plant dispatch without leaking buyer identity or volume leverage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* 5. LIVE METRICS & SUPPLY CHAIN COVERAGE RIBBON               */}
        {/* ============================================================ */}
        <section className="mt-24 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Verified Physical Models", value: "1,800+", detail: "Zero dummy data or synthetic placeholders", icon: Database, color: "text-blue-400" },
              { label: "Domestic Plant Network", value: "1,200+", detail: "Unified standard taxonomy & classification", icon: Factory, color: "text-emerald-400" },
              { label: "Global Factory Formulations", value: "585+", detail: "Calibrated thickness & adhesive systems", icon: Globe, color: "text-cyan-400" },
              { label: "Spec Extraction & Match", value: "< 3.2s", detail: "5-point chemical & thermal classification", icon: Cpu, color: "text-indigo-400" }
            ].map((stat, i) => (
              <div 
                key={i}
                className="p-6 bg-slate-900/75 backdrop-blur-xl border border-slate-800/80 rounded-2xl space-y-2 hover:border-slate-700 transition-all shadow-lg"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mb-1`} />
                <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-slate-200">{stat.label}</div>
                <div className="text-[11px] text-slate-400">{stat.detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. BENTO GRID: ENTERPRISE CORE CAPABILITIES                 */}
        {/* ============================================================ */}
        <section id="features" className="mt-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Engineered for Industrial Procurement & Plant Operations
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Transform unstructured technical specification sheets, distributor PDFs, and fragmented catalogs into queryable intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Autonomous Catalog Harvester */}
            <div className="md:col-span-2 p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl space-y-5 relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Autonomous Catalog Normalization</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  Deep specification extraction automatically processes catalogs, technical datasheets, tables, and product matrices, standardizing adhesive chemistry, dielectric strength, and thermal thresholds.
                </p>
              </div>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                <div className="text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> [HARVESTER] 1,800+ Physical Specifications Ingested & Classified
                </div>
                <div className="text-slate-400">→ Carrier: Polyimide, Fiberglass, Aluminum, EPDM, PVC, Foam</div>
                <div className="text-slate-400">→ Adhesive: Pure Acrylic, Silicone Polysiloxane, Synthetic Resin</div>
              </div>
            </div>

            {/* Bento Card 2: 5D Spec Classifier */}
            <div id="engine" className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl space-y-5 hover:border-cyan-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">5-Point Spec Matrix</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every product is mathematically classified across:
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-semibold">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Substrate / Carrier Backing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Adhesive Chemistry</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Caliper & Total Thickness Range</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Thermal Resistance Class (≥ 260°C)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Side Format (Single/Double/Transfer)</li>
              </ul>
            </div>

            {/* Bento Card 3: Anonymous RFQ Broker */}
            <div id="security" className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl space-y-5 hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Anonymous RFQ Broker</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Broadcast bulk requirements and custom slit roll specs to authorized regional plants and converters without revealing your identity or pricing leverage.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  Zero Buyer Identity Compromise
                </span>
              </div>
            </div>

            {/* Bento Card 4: Unified Parametric Equivalency */}
            <div className="md:col-span-2 p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl space-y-5 hover:border-indigo-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Server className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Unified Parametric Equivalency Engine</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  Automatically match equivalent physical specifications across domestic and global manufacturing hubs based purely on chemical formulation, dielectric resistance, and shear performance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-slate-950 text-blue-300 rounded-lg border border-slate-800">TAR-AFM-110</span>
                <span className="text-slate-500 self-center">⇄</span>
                <span className="px-2.5 py-1 bg-slate-950 text-emerald-300 rounded-lg border border-slate-800">TAR-AFM-080</span>
                <span className="text-slate-500 self-center">⇄</span>
                <span className="px-2.5 py-1 bg-slate-950 text-cyan-300 rounded-lg border border-slate-800">TAR-AFM-150</span>
                <span className="text-slate-500 self-center">⇄</span>
                <span className="px-2.5 py-1 bg-slate-950 text-indigo-300 rounded-lg border border-slate-800">TAR-AFM-200</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. SPECIFICATION STANDARDS MATRIX                            */}
        {/* ============================================================ */}
        <section id="standards" className="mt-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
              Standardized Specifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Industrial Tape & Material Specification Standards
            </h2>
            <p className="text-sm text-slate-400">
              Browse standard engineering categories standardized under the TarasAI physical classification taxonomy.
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Specification Category</th>
                    <th className="py-4 px-6">TarasAI Standard Code Series</th>
                    <th className="py-4 px-6">Key Engineering Parameters</th>
                    <th className="py-4 px-6">Primary Industrial Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">High-Temperature Polyimide Film</td>
                    <td className="py-4 px-6 font-mono text-cyan-300">TAR-KAP-SERIES</td>
                    <td className="py-4 px-6 text-slate-300">260°C continuous, silicone adhesive, 25µm - 100µm</td>
                    <td className="py-4 px-6 text-slate-400">SMT Soldering, EV Battery Insulation, Aerospace</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">Structural Acrylic Foam Bonding</td>
                    <td className="py-4 px-6 font-mono text-cyan-300">TAR-AFM-SERIES</td>
                    <td className="py-4 px-6 text-slate-300">Viscoelastic acrylic core, 0.5mm - 2.0mm, UV/solvent resistant</td>
                    <td className="py-4 px-6 text-slate-400">Architectural Cladding, Solar Frames, Transportation</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">High-Dielectric Fiberglass & Mica</td>
                    <td className="py-4 px-6 font-mono text-cyan-300">TAR-GLS-SERIES</td>
                    <td className="py-4 px-6 text-slate-300">Class H (180°C - 200°C), flame-retardant, high tensile</td>
                    <td className="py-4 px-6 text-slate-400">Class H Motors, Generator Coils, High-Voltage Cables</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">Industrial Heavy-Duty PVC</td>
                    <td className="py-4 px-6 font-mono text-cyan-300">TAR-PVC-SERIES</td>
                    <td className="py-4 px-6 text-slate-300">600V dielectric, flame retardant, cold-weather stretch</td>
                    <td className="py-4 px-6 text-slate-400">Automotive Engine Harness, Switchgears, Wire Splicing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 8. BOTTOM CTA CALLOUT                                        */}
        {/* ============================================================ */}
        <section className="mt-28 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-cyan-900/40 border border-blue-500/30 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Enterprise Onboarding
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your Industrial Sourcing?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Access 1,800+ standardized physical specifications, verify parametric equivalencies, and publish encrypted RFQs with zero friction.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/40 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <span>Create Enterprise Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-black text-sm rounded-xl border border-slate-700 hover:scale-[1.02] transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* 9. FOOTER                                                   */}
      {/* ============================================================ */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-sm">TarasAI</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#standards" className="hover:text-white transition-colors">Standards</a>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>1,800+ Standardized Specifications Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
