"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  motion, 
  useScroll, 
  useTransform 
} from "framer-motion";
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Database, 
  Cpu, 
  Layers, 
  ChevronRight, 
  Zap, 
  Bot, 
  CheckCircle2, 
  Activity, 
  Play, 
  Pause, 
  ArrowRight,
  Factory
} from "lucide-react";

// Preset instant search queries for the live demo widget
const DEMO_PRESETS = [
  { label: "🔥 Kapton 260°C", query: "Kapton polyimide silicone 260°c" },
  { label: "📦 VHB Double Sided Foam", query: "Double sided acrylic foam VHB" },
  { label: "⚡ AIPL PVC Electrical", query: "AIPL PVC electrical insulation tape" },
  { label: "🇨🇳 Naikos NKS-101", query: "Naikos polyimide tape NKS-101" },
  { label: "🛡️ 3M 468MP Transfer", query: "3M 468MP adhesive transfer tape" },
  { label: "🏭 Vasavi Double Sided", query: "Sri Vasavi double sided tape" },
  { label: "🚗 Yongguan Automotive", query: "Yongguan cloth wiring harness tape" }
];

const SAMPLE_MATCHES: Record<string, any[]> = {
  default: [
    {
      name: "3M VHB Tape 4910",
      company: "3M India",
      location: "India",
      badge: "🇮🇳 India",
      type: "Tape",
      side: "Double-Sided",
      backing: "Foam (Acrylic / PE / PU)",
      adhesion: "Acrylic (Solvent / Pure)",
      thickness: "1.0 mm (Thick)",
      temp: "Medium Temp (93°C - 149°C)",
      app: "Structural bonding of clear plastics, glass, and metals without rivets."
    },
    {
      name: "Naikos NKS-101 High Temp Polyimide Tape",
      company: "Naikos",
      location: "China",
      badge: "🇨🇳 China",
      type: "Tape",
      side: "Single-Sided",
      backing: "Polyimide / Kapton",
      adhesion: "Silicone / Polysiloxane",
      thickness: "0.06 mm (Ultra-Thin)",
      temp: "Ultra-High Temp (≥ 260°C)",
      app: "SMT PCB wave soldering masking, transformer winding insulation."
    },
    {
      name: "AIPL ABRO 5010 PVC Electrical Tape",
      company: "Ajit Industries (AIPL)",
      location: "India",
      badge: "🇮🇳 India",
      type: "Tape",
      side: "Single-Sided",
      backing: "PVC / Vinyl",
      adhesion: "Rubber / Synthetic Resin",
      thickness: "0.125 mm (Standard)",
      temp: "Standard (80°C / 600V)",
      app: "Primary electrical wire harness wrapping and industrial phase marking."
    }
  ],
  kapton: [
    {
      name: "3M Polyimide Film Tape 5413",
      company: "3M India",
      location: "India",
      badge: "🇮🇳 India",
      type: "Tape",
      side: "Single-Sided",
      backing: "Polyimide / Kapton (Dupont)",
      adhesion: "Silicone / Polysiloxane",
      thickness: "0.07 mm (Ultra-Thin)",
      temp: "Ultra-High Temp (260°C peak)",
      app: "High-temperature masking in wave solder and PCB gold finger protection."
    },
    {
      name: "Naikos NKS-101 High Temp Polyimide Tape",
      company: "Naikos",
      location: "China",
      badge: "🇨🇳 China",
      type: "Tape",
      side: "Single-Sided",
      backing: "Polyimide / Kapton",
      adhesion: "Silicone / Polysiloxane",
      thickness: "0.06 mm (Ultra-Thin)",
      temp: "Ultra-High Temp (≥ 260°C)",
      app: "SMT PCB wave soldering masking, transformer winding insulation."
    },
    {
      name: "YouSan YS-PI260 Polyimide Tape",
      company: "YouSan",
      location: "China",
      badge: "🇨🇳 China",
      type: "Tape",
      side: "Single-Sided",
      backing: "Polyimide / Kapton",
      adhesion: "Silicone / Polysiloxane",
      thickness: "0.05 mm (Ultra-Thin)",
      temp: "Ultra-High Temp (260°C)",
      app: "Lithium battery insulation, BGA masking, automotive sensor wrapping."
    }
  ],
  vhb: [
    {
      name: "3M VHB Tape 4910",
      company: "3M India",
      location: "India",
      badge: "🇮🇳 India",
      type: "Tape",
      side: "Double-Sided",
      backing: "Foam (Acrylic / PE / PU)",
      adhesion: "Acrylic (Solvent / Pure)",
      thickness: "1.0 mm (Thick)",
      temp: "Medium Temp (93°C - 149°C)",
      app: "Structural bonding of clear plastics, glass, and metals without rivets."
    },
    {
      name: "tesa ACXplus 7055",
      company: "tesa Tapes",
      location: "India",
      badge: "🇮🇳 India",
      type: "Tape",
      side: "Double-Sided",
      backing: "Foam (Acrylic / PE / PU)",
      adhesion: "Acrylic (Solvent / Pure)",
      thickness: "1.0 mm (Thick)",
      temp: "High Temp (150°C)",
      app: "High-transparency acrylic core tape for architectural glass facades and elevator panels."
    },
    {
      name: "Naikos NKS-VHB High Bond Acrylic Foam Tape",
      company: "Naikos",
      location: "China",
      badge: "🇨🇳 China",
      type: "Tape",
      side: "Double-Sided",
      backing: "Foam (Acrylic / PE / PU)",
      adhesion: "Acrylic (Solvent / Pure)",
      thickness: "1.1 mm (Thick)",
      temp: "High Temp (160°C)",
      app: "Solar panel mounting, automotive body exterior trim, electronics casing."
    }
  ],
  pvc: [
    {
      name: "AIPL ABRO 5010 PVC Electrical Tape",
      company: "Ajit Industries (AIPL)",
      location: "India",
      badge: "🇮🇳 India",
      type: "Tape",
      side: "Single-Sided",
      backing: "PVC / Vinyl",
      adhesion: "Rubber / Synthetic Resin",
      thickness: "0.125 mm (Standard)",
      temp: "Standard (80°C / 600V)",
      app: "Primary electrical wire harness wrapping and industrial phase marking."
    },
    {
      name: "Havells Reo FR PVC Electrical Tape",
      company: "Havells India",
      location: "India",
      badge: "🇮🇳 India",
      type: "Tape",
      side: "Single-Sided",
      backing: "PVC / Vinyl",
      adhesion: "Rubber / Synthetic Resin",
      thickness: "0.13 mm (Standard)",
      temp: "Standard (90°C Flame Retardant)",
      app: "Flame retardant wire splicing, household and industrial power cabling."
    },
    {
      name: "Yongguan YG-PVC Industrial Grade Electrical Tape",
      company: "Yongguan",
      location: "China",
      badge: "🇨🇳 China",
      type: "Tape",
      side: "Single-Sided",
      backing: "PVC / Vinyl",
      adhesion: "Rubber / Synthetic Resin",
      thickness: "0.15 mm (Standard)",
      temp: "Medium Temp (105°C)",
      app: "Automotive high-voltage battery harness bundling and electrical insulation."
    }
  ]
};

export default function LandingPage() {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [activeResults, setActiveResults] = useState(SAMPLE_MATCHES.default);
  const [isSearching, setIsSearching] = useState(false);
  
  // Video & Background Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [dimLevel, setDimLevel] = useState<"light" | "medium" | "deep">("medium");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parallax Scroll Hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.2]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.96]);

  // Handle Search Input Change
  const handleSearch = (term: string) => {
    setSearchPrompt(term);
    setIsSearching(true);
    setTimeout(() => {
      const lower = term.toLowerCase();
      if (lower.includes("kapton") || lower.includes("polyimide") || lower.includes("260")) {
        setActiveResults(SAMPLE_MATCHES.kapton);
      } else if (lower.includes("vhb") || lower.includes("foam") || lower.includes("acrylic") || lower.includes("double")) {
        setActiveResults(SAMPLE_MATCHES.vhb);
      } else if (lower.includes("pvc") || lower.includes("electrical") || lower.includes("wire") || lower.includes("cable")) {
        setActiveResults(SAMPLE_MATCHES.pvc);
      } else {
        setActiveResults(SAMPLE_MATCHES.default);
      }
      setIsSearching(false);
    }, 250);
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Subtle Interactive Particle Canvas Overlay
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

  // Dim overlay styling based on selector
  const dimClasses = {
    light: "bg-slate-950/60",
    medium: "bg-slate-950/80",
    deep: "bg-slate-950/92"
  }[dimLevel];

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden"
    >
      {/* ============================================================ */}
      {/* 1. CINEMATIC BACKGROUND VIDEO WITH DIMMED ATMOSPHERIC OVERLAY */}
      {/* ============================================================ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Background Video Element */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-1000"
          poster="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80"
        >
          {/* High quality industrial robotics and precision manufacturing video loop */}
          <source 
            src="https://upload.wikimedia.org/wikipedia/commons/8/85/Chainsaw_robot_carves_the_7Xstool_by_tom_pawlofsky_-_tibor_weissmahr.webm" 
            type="video/webm" 
          />
        </video>

        {/* Primary Dynamic Dimming Layer */}
        <div className={`absolute inset-0 transition-colors duration-500 ${dimClasses}`} />

        {/* Gradient Vignette & Radial Atmospheric Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-slate-950/90" />
        
        {/* Subtle Cyber Grid Texture */}
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

      {/* Floating Dimmer & Video Control Widget */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-full px-3 py-1.5 shadow-2xl text-xs text-slate-300">
        <button
          onClick={toggleVideoPlay}
          title={isPlaying ? "Pause background video" : "Play background video"}
          className="p-1 hover:text-blue-400 transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
        <span className="w-px h-3 bg-slate-700" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Dim:</span>
          {(["light", "medium", "deep"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setDimLevel(lvl)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize transition-all ${
                dimLevel === lvl
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
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
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
                  NEXUS
                </span>
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link href="/products" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              1,800+ SKUs Catalog
            </Link>
            <Link href="/agent" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              AI Copilot
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Intelligence Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/agent"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Copilot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ============================================================ */}
      {/* 3. HERO SECTION WITH INTERACTIVE AI SEARCH WIDGET           */}
      {/* ============================================================ */}
      <main className="relative z-10 pt-32 md:pt-40 pb-24">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8"
        >
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-300 text-xs font-bold backdrop-blur-md shadow-lg shadow-blue-950/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous Industrial Tape & Sourcing Intelligence</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono">1,800+ Physical SKUs</span>
          </div>

          {/* Master Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Procure Any Industrial Tape & Adhesive with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Zero Friction.
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Instant AI cross-referencing across <strong className="text-white">1,200+ Indian domestic manufacturing plant models</strong> and <strong className="text-white">585+ Tier-1 Chinese factory-direct SKUs</strong>. Automated spec extraction, alternative discovery, and anonymous RFQ dispatch.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all"
            >
              <Database className="w-4 h-4" />
              <span>Explore 1,800+ Products Catalog</span>
            </Link>
            <Link
              href="/agent"
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-extrabold text-sm rounded-xl border border-slate-700/80 backdrop-blur-md hover:scale-[1.02] transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Try Live AI Technical Copilot</span>
            </Link>
          </div>

          {/* ============================================================ */}
          {/* 4. LIVE INTERACTIVE FINDER DEMO ON HERO                      */}
          {/* ============================================================ */}
          <div className="pt-8 max-w-4xl mx-auto text-left">
            <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 md:p-7 shadow-2xl shadow-black/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs font-mono font-bold text-slate-400 ml-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Live Copilot Search Engine Demo
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  value={searchPrompt}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Type any model, substrate, temp rating, or spec (e.g. Kapton 260°C, VHB Acrylic Foam, AIPL PVC)..."
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-sm font-medium text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleSearch(searchPrompt)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {isSearching ? "Matching..." : "Search"}
                </button>
              </div>

              {/* Preset Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Query Prompts:
                </div>
                <div className="flex flex-wrap gap-2">
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSearch(preset.query)}
                      className="text-xs px-3 py-1.5 bg-slate-800/80 hover:bg-blue-900/40 hover:text-blue-300 text-slate-300 rounded-xl border border-slate-700/60 hover:border-blue-500/40 transition-all font-medium"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched Product Cards Preview */}
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>Matched Enterprise SKUs ({activeResults.length})</span>
                  <Link href="/products" className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]">
                    View all 1,800+ in Master Catalog <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeResults.map((item, idx) => (
                    <motion.div
                      key={item.name + idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 rounded-2xl space-y-2 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                            {item.badge}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 ml-1.5 truncate">
                            {item.company}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800/50">
                          {item.side}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {item.name}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.app}
                      </p>

                      <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1 text-[10px] text-slate-300 font-medium">
                        <span className="px-1.5 py-0.5 bg-slate-900 rounded text-purple-300 border border-purple-900/30">
                          {item.backing}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-900 rounded text-rose-300 border border-rose-900/30">
                          {item.temp}
                        </span>
                      </div>
                    </motion.div>
                  ))}
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
              { label: "Verified Physical Models", value: "1,800+", detail: "Zero dummy data or blogs", icon: Database, color: "text-blue-400" },
              { label: "Domestic Indian Plants", value: "1,200+", detail: "AIPL, Vasavi, 3M, Havells, CGAPL", icon: Factory, color: "text-emerald-400" },
              { label: "Chinese Factory Direct SKUs", value: "585", detail: "Yongguan, Naikos, YouSan, Camat", icon: Globe, color: "text-cyan-400" },
              { label: "Spec Extraction & Match", value: "< 3.2s", detail: "5-point chemical & thermal matrix", icon: Cpu, color: "text-indigo-400" }
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
        <section className="mt-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
              Engine Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Designed for Industrial Procurement & Plant Engineering
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Transform unstructured technical specification sheets, distributor PDFs, and fragmented catalogs into queryable intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Autonomous Harvester */}
            <div className="md:col-span-2 p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl space-y-5 relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Autonomous Catalog Harvester</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  Provide any manufacturer website URL or company name. The deep crawler crawls subdomains, catalogs, tables, and product matrices, automatically normalizing technical specifications and filtering out corporate fluff.
                </p>
              </div>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                <div className="text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> [HARVESTER] 585 Chinese Models + 1,200 Indian SKUs Ingested
                </div>
                <div className="text-slate-400">→ Carrier: Polyimide, Fiberglass, Aluminum, EPDM, PVC, Foam</div>
                <div className="text-slate-400">→ Adhesive: Pure Acrylic, Silicone Polysiloxane, Synthetic Resin</div>
              </div>
            </div>

            {/* Bento Card 2: 5D Spec Classifier */}
            <div className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl space-y-5 hover:border-cyan-500/40 transition-all shadow-xl">
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
            <div className="p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl space-y-5 hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Anonymous RFQ Broker</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Broadcast bulk requirements and custom slit roll specs to authorized regional distributors without revealing your identity or pricing leverage.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  Zero Buyer Price Compromise
                </span>
              </div>
            </div>

            {/* Bento Card 4: Cross-Manufacturer Equivalency */}
            <div className="md:col-span-2 p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl space-y-5 hover:border-indigo-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Cross-Manufacturer Equivalent Engine</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                  Ask the Copilot to find direct alternatives between premium Western brands (3M, tesa, Saint-Gobain), domestic Indian market leaders (Vasavi, AIPL, Havells, CGAPL), and high-volume Chinese manufacturing plants (Naikos, Yongguan, YouSan).
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-slate-950 text-blue-300 rounded-lg border border-slate-800">3M 4910 VHB</span>
                <span className="text-slate-500 self-center">⇄</span>
                <span className="px-2.5 py-1 bg-slate-950 text-emerald-300 rounded-lg border border-slate-800">tesa 7055 ACXplus</span>
                <span className="text-slate-500 self-center">⇄</span>
                <span className="px-2.5 py-1 bg-slate-950 text-cyan-300 rounded-lg border border-slate-800">Naikos NKS-VHB</span>
                <span className="text-slate-500 self-center">⇄</span>
                <span className="px-2.5 py-1 bg-slate-950 text-indigo-300 rounded-lg border border-slate-800">Vasavi SV-202</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. CROSS-ORIGIN COMPARISON MATRIX (INDIA vs CHINA SOURCING)  */}
        {/* ============================================================ */}
        <section className="mt-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
              Sourcing Optimization
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Compare Sourcing from India & China Manufacturing Plants
            </h2>
            <p className="text-sm text-slate-400">
              Filter by plant location to balance domestic JIT delivery with factory-direct volume pricing.
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Product Category</th>
                    <th className="py-4 px-6">🇮🇳 Domestic Indian Plant Models</th>
                    <th className="py-4 px-6">🇨🇳 Chinese Factory-Direct Models</th>
                    <th className="py-4 px-6">Primary Industrial Use Cases</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">Polyimide / Kapton (260°C)</td>
                    <td className="py-4 px-6 text-blue-300">CG-PPI 7011 / 3M 5413 / Vasavi PI</td>
                    <td className="py-4 px-6 text-cyan-300">Naikos NKS-101 / YouSan YS-PI260 / Camat PI</td>
                    <td className="py-4 px-6 text-slate-400">SMT Soldering, EV Battery Insulation, Aerospace</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">Structural Acrylic VHB Foam</td>
                    <td className="py-4 px-6 text-blue-300">3M VHB 4910, 4950 / tesa ACXplus / Vasavi SV-201</td>
                    <td className="py-4 px-6 text-cyan-300">Naikos NKS-VHB / YouSan YS-VHB / Crown Foam</td>
                    <td className="py-4 px-6 text-slate-400">Architectural Cladding, Solar Frames, Automobile Emblems</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">Fiberglass Cloth & Mica Tape</td>
                    <td className="py-4 px-6 text-blue-300">CG-PPI 8415 / 3M 69 / Saint-Gobain 2975</td>
                    <td className="py-4 px-6 text-cyan-300">Naikos NKS-GC / CYG Changtong Mica / Huate Glass</td>
                    <td className="py-4 px-6 text-slate-400">Class H Motor Rewinding, Generator Coils, Heavy Power Cables</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">PVC & Wire Harness Bundling</td>
                    <td className="py-4 px-6 text-blue-300">AIPL 5010 / Havells Reo FR / Polycab PVC</td>
                    <td className="py-4 px-6 text-cyan-300">Yongguan YG-PVC / Haotian PVC / Broadya Tape</td>
                    <td className="py-4 px-6 text-slate-400">Automotive Engine Compartment, Switchgears, Wire Splicing</td>
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
              <Sparkles className="w-3.5 h-3.5" /> Start Exploring Instantly
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your Industrial Sourcing?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Query the 1,800+ products database, analyze competitor equivalents, or publish an anonymous RFQ in under 60 seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/products"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/40 hover:scale-[1.02] transition-all"
              >
                Browse Master Catalog
              </Link>
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-black text-sm rounded-xl border border-slate-700 hover:scale-[1.02] transition-all"
              >
                Create Enterprise Account
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
            <span className="font-extrabold text-white text-sm">TarasAI Nexus</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/products" className="hover:text-white transition-colors">Catalog</Link>
            <Link href="/agent" className="hover:text-white transition-colors">AI Copilot</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>1,800+ SKUs • India & China Manufacturing Plants</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
