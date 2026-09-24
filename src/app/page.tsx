"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  FileCheck,
  Car,
  Plane,
  Sun,
  Tv,
  Building,
  HeartPulse,
  Wrench,
  ChevronRight,
  Search,
  ShoppingCart,
  Award,
  TrendingDown,
  Clock,
  Sliders,
  Maximize2,
  FileSpreadsheet,
  Check,
  Flame,
  Activity,
  Layers3,
  Menu,
  X,
  Play,
  Pause,
  ChevronLeft,
  Download,
  FileText,
  ExternalLink,
  Phone
} from "lucide-react";

// ============================================================================
// BROCHURE HERO CAROUSEL SLIDES (MOVING GALLERY)
// ============================================================================
const HERO_BROCHURE_SLIDES = [
  {
    id: "electronics",
    industry: "Electronics & Microelectronics",
    headline: "We enable the most innovative electronic devices",
    description: "High-temperature polyimide masking, cleanroom ESD shielding, optical clear adhesives (OCA), and ultra-thin thermal gap fillers engineered for next-gen semiconductor assemblies.",
    brochureTitle: "Technical Brochure: Precision Electronic Tapes & Dielectrics (PDF)",
    brochurePages: "16 Pages • 2026 Edition",
    bgImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=85",
    cardBg: "bg-[#0082c8]", // tesa iconic cyan-blue
    btnText: "EXPLORE ELECTRONICS SPECS",
    link: "/signup?role=buyer&search=Electronics"
  },
  {
    id: "automotive",
    industry: "Automotive & E-Mobility",
    headline: "Let's steer E-Mobility and EV battery innovation together",
    description: "Specialized thermal interface materials (TIM), high-shear viscoelastic acrylic foam for structural panel bonding, and flame-retardant wire harness tapes for automotive OEMs.",
    brochureTitle: "Technical Brochure: EV Battery & Automotive Solutions (PDF)",
    brochurePages: "24 Pages • IATF 16949 Aligned",
    bgImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1920&q=85",
    cardBg: "bg-[#0082c8]",
    btnText: "EXPLORE E-MOBILITY SPECS",
    link: "/signup?role=buyer&search=Automotive"
  },
  {
    id: "power",
    industry: "Power & Electrical Transmission",
    headline: "High-voltage transformer & electrical equipment insulation",
    description: "Direct manufacturing catalog covering CRGO core laminations, enamelled copper winding wires, high-dielectric Nomex and Mica tapes, and epoxy resin casting systems.",
    brochureTitle: "Technical Brochure: Power & Electrical Machinery Solutions (PDF)",
    brochurePages: "32 Pages • CPRI & IS/IEC Standards",
    bgImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1920&q=85",
    cardBg: "bg-[#0082c8]",
    btnText: "EXPLORE POWER & TRANSFORMERS",
    link: "/signup?role=buyer&search=Transformer"
  },
  {
    id: "appliances",
    industry: "Appliances & White Goods",
    headline: "Energy-efficient bonding & vibration reduction for appliances",
    description: "Vacuum insulation panels (VIP), aluminum evaporator foil tapes, glass door bonding acrylics, and precision die-cut EPDM gaskets engineered for automated robotic dispensing.",
    brochureTitle: "Technical Brochure: Appliance Bonding & Thermal Sealing (PDF)",
    brochurePages: "18 Pages • BEE Star Compliant",
    bgImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=85",
    cardBg: "bg-[#0082c8]",
    btnText: "EXPLORE APPLIANCE SPECS",
    link: "/signup?role=buyer&search=Appliances"
  }
];

// ============================================================================
// INDUSTRIAL SOLUTIONS GRID (MATCHING TESA'S 3x2 GRID FROM IMAGE 2)
// ============================================================================
const INDUSTRIAL_SOLUTIONS_GRID = [
  {
    id: "automotive",
    title: "Automotive",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    link: "/signup?role=buyer&search=Automotive"
  },
  {
    id: "electronics",
    title: "Electronics",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    link: "/signup?role=buyer&search=Electronics"
  },
  {
    id: "print_converting",
    title: "Print & Converting",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    link: "/signup?role=buyer&search=Converting"
  },
  {
    id: "building",
    title: "Building & Construction",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    link: "/signup?role=buyer&search=Building"
  },
  {
    id: "appliances",
    title: "Appliances",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    link: "/signup?role=buyer&search=Appliances"
  },
  {
    id: "power_energy",
    title: "Power & Electrical",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    link: "/signup?role=buyer&search=Electrical"
  }
];

// ============================================================================
// INDUSTRIAL ASSORTMENT BY PURPOSE (MATCHING TESA ASSORTMENT TABS)
// ============================================================================
const ASSORTMENT_CATEGORIES = [
  {
    name: "Bonding & Mounting",
    headline: "Permanent & High-Strength Fastening",
    description: "Replace mechanical fasteners, screws, rivets, and welding with viscoelastic acrylic foam and double-sided structural adhesives. Dampens dynamic vibrations while ensuring airtight sealing.",
    items: [
      { name: "Structural Acrylic Foam Tapes (0.4 mm to 1.5 mm)", use: "Body panels, glass facades & metals" },
      { name: "Ultra-Thin Double-Coated Film Tapes", use: "Touchscreens, flex circuits & nameplates" },
      { name: "Adhesive Transfer Films (Unsupported)", use: "Gasket lamination & foam bonding" },
      { name: "Removable & Clean-Peel Mounting Strips", use: "Temporary displays & component staging" }
    ]
  },
  {
    name: "Insulation & Thermal Management",
    headline: "High-Heat Dielectric & Gap-Filling Materials",
    description: "Engineered to withstand temperatures from -40°C up to 260°C with controlled dielectric breakdown strength and high thermal conductivity for EV packs and microelectronics.",
    items: [
      { name: "Polyimide (Kapton Equivalent) Films & Tapes", use: "Wave soldering, SMT masking & motors" },
      { name: "Thermally Conductive Silicone Gap Pads (TIM)", use: "EV battery modules, power inverters" },
      { name: "High-Voltage Mica & Nomex Insulation Tapes", use: "Transformers, generators & coils" },
      { name: "Dielectric Polyester & Glass Cloth Tapes", use: "Capacitor wrapping & busbar insulation" }
    ]
  },
  {
    name: "Masking & Protection",
    headline: "Zero-Residue Clean Removal During Processing",
    description: "Protect sensitive surfaces from scratches, acid etching, high-temperature solder baths, and powder coating with residue-free clean peel adhesives.",
    items: [
      { name: "High-Temperature Powder Coating Masking", use: "Withstands up to 220°C cure ovens" },
      { name: "Class-A Surface Protection Films", use: "Automotive hoods, polished metals & glass" },
      { name: "Anti-Static (ESD) Cleanroom Protection", use: "PCB handling, semiconductor wafer carriers" },
      { name: "Sandblast & Chemical Etching Resistant Tapes", use: "Metal fabrication & anodizing baths" }
    ]
  },
  {
    name: "Converting & Die-Cutting",
    headline: "Custom Precision Engineering to ±0.1 mm",
    description: "Access a national network of high-speed rotary die-cutters, laser converters, and custom slitting machines delivering custom kiss-cut parts for robotics.",
    items: [
      { name: "Custom Rotary Die-Cut Gaskets & Spacers", use: "Watertight IP67/IP68 device seals" },
      { name: "Multi-Layer Laminates with Extended Liners", use: "Automated pick-and-place robotic assembly" },
      { name: "Custom Slitted Log Rolls (2 mm to 1200 mm)", use: "Exact production width tolerances" },
      { name: "CAD-Matched Prototype to Million Batch Runs", use: "Direct plant delivery within 48 hours" }
    ]
  }
];

export default function LandingPage() {
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Mega Menu State (Hamburger Drawer matching Image 4)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<"industry" | "applications">("industry");

  // Assortment Tab State
  const [activeAssortmentIdx, setActiveAssortmentIdx] = useState(0);

  // Search Input State
  const [searchQuery, setSearchQuery] = useState("");

  // Autoplay Hero Carousel
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BROCHURE_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const slide = HERO_BROCHURE_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0082c8] selection:text-white overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 1. TOP BRAND ACCENT BAR (RED & CYAN STRIPE - IMAGE 1)        */}
      {/* ============================================================ */}
      <div className="w-full h-1.5 flex">
        <div className="w-2/3 bg-[#e30613]" /> {/* Red Brand Accent */}
        <div className="w-1/3 bg-[#0082c8]" /> {/* Cyan Brand Accent */}
      </div>

      {/* ============================================================ */}
      {/* 2. PRIMARY NAVIGATION HEADER (TESA STYLE - IMAGE 1)          */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-6">
            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="p-2 -ml-2 text-slate-800 hover:text-[#0082c8] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              aria-label="Open Navigation Menu"
            >
              {isMegaMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>

            {/* TarasAI Brand Emblem */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="px-3.5 py-1.5 bg-[#e30613] rounded-md text-white font-black italic tracking-tighter text-2xl shadow-sm flex items-center">
                Taras<span className="text-cyan-300 font-bold ml-0.5">AI</span>
              </div>
              <span className="hidden xl:inline text-[10px] uppercase font-bold tracking-widest text-slate-500 border-l border-slate-300 pl-3">
                Materials Intelligence
              </span>
            </Link>

            {/* Direct Header Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-800">
              <button 
                type="button" 
                onClick={() => { setIsMegaMenuOpen(true); setActiveMenuTab("industry"); }}
                className="hover:text-[#0082c8] transition-colors py-2"
              >
                Industry
              </button>
              <button 
                type="button" 
                onClick={() => { setIsMegaMenuOpen(true); setActiveMenuTab("applications"); }}
                className="hover:text-[#0082c8] transition-colors py-2"
              >
                Applications
              </button>
              <Link href="/products" className="hover:text-[#0082c8] transition-colors py-2">
                Products Master
              </Link>
              <a href="#solutions" className="hover:text-[#0082c8] transition-colors py-2">
                Engineering Assortment
              </a>
              <Link href="/pricing" className="hover:text-[#0082c8] transition-colors py-2">
                Pricing & Consortia
              </Link>
            </nav>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-3">
            {/* Quick Sourcing Search Trigger */}
            <div className="relative hidden sm:block w-44 md:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    window.location.href = `/signup?role=buyer&search=${encodeURIComponent(searchQuery || 'Industrial')}`;
                  }
                }}
                placeholder="Search specs..."
                className="w-full bg-slate-100 hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-full py-2 pl-9 pr-3 focus:outline-none focus:border-[#0082c8] transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <Link
              href="/signup?role=seller"
              className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors hidden md:flex items-center gap-1.5"
            >
              <Factory className="w-3.5 h-3.5" />
              Sign in as a Seller
            </Link>

            <Link
              href="/signup?role=buyer"
              className="px-4 py-2 text-xs font-extrabold text-white bg-[#e30613] hover:bg-red-700 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Sign up as a Buyer
            </Link>

            <Link
              href="/login"
              className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. SLIDE-OUT MEGA MENU DRAWER (MATCHING IMAGE 4)             */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMegaMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Slide-out Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col"
            >
              {/* Drawer Top Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#e30613] rounded-md text-white font-black italic text-xl">
                    TarasAI
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Industrial Directory</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Two-Column Navigation (Image 4 Style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 flex-1 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* Left Column: Primary Sections */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Industry Navigation</h3>
                  
                  <Link 
                    href="/products" 
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-[#0082c8] font-bold text-sm transition-colors group"
                  >
                    <span>Overview (All Catalogs)</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {INDUSTRIAL_SOLUTIONS_GRID.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-[#0082c8] font-bold text-sm transition-colors group"
                    >
                      <span>{item.title}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>

                {/* Right Column: Applications Submenu (Image 4 Style) */}
                <div className="p-6 space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Applications & Chemistries</h3>
                  
                  {[
                    "Bonding & Mounting",
                    "Thermal Gap Filling (TIM)",
                    "Insulation & Dielectric",
                    "Marking & Safety",
                    "High-Heat Masking",
                    "Packaging & Strapping",
                    "Surface Protection",
                    "Precision Die-Cutting",
                    "Watertight Sealing"
                  ].map((app, i) => (
                    <Link
                      key={i}
                      href={`/signup?role=buyer&search=${encodeURIComponent(app)}`}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-[#0082c8] text-sm font-medium transition-colors group"
                    >
                      <span>{app}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0082c8] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Drawer Bottom CTA */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Direct Factory Procurement & RFQ Portal
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href="/signup?role=seller"
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 rounded-lg text-center"
                  >
                    Seller Portal
                  </Link>
                  <Link
                    href="/signup?role=buyer"
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-[#0082c8] rounded-lg text-center shadow-sm"
                  >
                    Buyer Sign Up
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 4. HERO SECTION WITH MOVING GALLERY BROCHURE CAROUSEL        */}
      {/*    (EXACT TESA LAYOUT FROM IMAGE 1)                          */}
      {/* ============================================================ */}
      <section className="relative w-full h-[540px] sm:h-[580px] lg:h-[640px] bg-slate-900 overflow-hidden select-none">
        {/* Background Image Carousel with smooth crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slide.bgImage}')` }}
          >
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 relative z-10 flex flex-col justify-between py-10 sm:py-14">
          
          {/* Top Industry Label */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded text-[11px] font-black uppercase tracking-wider text-slate-900 shadow-sm">
              {slide.industry}
            </span>
          </div>

          {/* Floating Hero Card Overlay (Image 1 Style: Bold Blue Card on Left) */}
          <motion.div
            key={`card-${slide.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl p-8 sm:p-10 bg-[#0082c8] text-white rounded-none shadow-2xl space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              {slide.headline}
            </h1>

            <p className="text-sm sm:text-base text-blue-50 leading-relaxed font-normal">
              {slide.description}
            </p>

            {/* Brochure Badge */}
            <div className="flex items-center gap-2 p-2.5 bg-white/10 rounded border border-white/20 text-xs">
              <FileText className="w-4 h-4 text-cyan-200 shrink-0" />
              <div className="truncate">
                <span className="font-bold">{slide.brochureTitle}</span>
                <span className="text-blue-100 text-[11px] block">{slide.brochurePages}</span>
              </div>
            </div>

            {/* Read More / Action Button (Image 1 Red Button Style) */}
            <div>
              <Link
                href={slide.link}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e30613] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>{slide.btnText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Bottom Controls Bar (Image 1 Dash Indicators + Prev/Play/Next) */}
          <div className="self-end bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-lg shadow-xl flex items-center gap-4 text-slate-800">
            {/* Dash Indicators */}
            <div className="flex items-center gap-2">
              {HERO_BROCHURE_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    currentSlide === idx ? "w-8 bg-slate-900" : "w-4 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="h-4 w-px bg-slate-300" />

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_BROCHURE_SLIDES.length) % HERO_BROCHURE_SLIDES.length)}
                className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                aria-label={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_BROCHURE_SLIDES.length)}
                className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. "INDUSTRIAL SOLUTIONS" 3x2 GRID (MATCHING IMAGE 2)        */}
      {/* ============================================================ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-8">
          Industrial solutions
        </h2>

        {/* 3x2 Grid (Exact Image 2 Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIAL_SOLUTIONS_GRID.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="group block bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
            >
              {/* Card Image */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Title Strip with Blue Chevron (Exact Image 2 Style) */}
              <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
                <span className="font-bold text-slate-900 text-base group-hover:text-[#0082c8] transition-colors">
                  {item.title}
                </span>
                <ChevronRight className="w-5 h-5 text-[#0082c8] group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. "GAME CHANGING APPLICATIONS" (MATCHING IMAGE 3)           */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Game changing applications
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white border border-slate-200 p-8 sm:p-12 shadow-xs">
            {/* Left Column: Copy & Read More Button (Image 3 Style) */}
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Let's steer E-Mobility together
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Are you creating the next-generation electric vehicle and do you need reliable, verified manufacturing partners who understand your challenges? Let's work together on how to design your component with our adhesive tape solutions and how to integrate them into your process for smooth production.
              </p>

              <div>
                <Link
                  href="/signup?role=buyer&search=EV+Battery"
                  className="inline-block px-7 py-3 border-2 border-[#0082c8] text-[#0082c8] hover:bg-[#0082c8] hover:text-white text-xs font-black uppercase tracking-wider transition-all"
                >
                  READ MORE
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual (EV Charging Port / Engineering - Image 3 Style) */}
            <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-lg bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&w=1000&q=80"
                alt="E-Mobility EV Adhesive Application"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. "OUR LARGE INDUSTRIAL ASSORTMENT" (IMAGE 3 & SOLUTIONS)   */}
      {/* ============================================================ */}
      <section id="solutions" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Our large industrial assortment for any purpose
          </h2>
          <p className="text-sm text-slate-600">
            Browse high-performance functional categories manufactured across verified domestic and global partner plants.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {ASSORTMENT_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveAssortmentIdx(idx)}
              className={`px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-2 ${
                activeAssortmentIdx === idx
                  ? "border-[#0082c8] text-[#0082c8] bg-blue-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active Assortment Detail Panel */}
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xl font-bold text-slate-900">
              {ASSORTMENT_CATEGORIES[activeAssortmentIdx].headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {ASSORTMENT_CATEGORIES[activeAssortmentIdx].description}
            </p>
            <div className="pt-2">
              <Link
                href={`/signup?role=buyer&search=${encodeURIComponent(ASSORTMENT_CATEGORIES[activeAssortmentIdx].name)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0082c8] hover:underline"
              >
                Request Product Samples & RFQ <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ASSORTMENT_CATEGORIES[activeAssortmentIdx].items.map((item, i) => (
              <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs hover:border-[#0082c8] transition-colors">
                <div className="text-sm font-bold text-slate-900 flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#0082c8] shrink-0 mt-0.5" />
                  <span>{item.name}</span>
                </div>
                <div className="text-xs text-slate-500 pl-6">
                  Application: {item.use}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. DIRECT SOURCING & RFQ BROKER CALLOUT                      */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded text-xs font-bold text-cyan-300">
              <Factory className="w-3.5 h-3.5" /> Direct Factory Consortium
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              1,084+ Verified Manufacturing Plants at Your Fingertips
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Eliminate middleman margins. Compare dielectric strength, temperature thresholds, and adhesive chemistries directly from certified manufacturers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <Link
              href="/signup?role=buyer"
              className="px-6 py-3.5 bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md"
            >
              Sign up as a Buyer — Launch RFQs
            </Link>
            <Link
              href="/signup?role=seller"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-bold text-xs uppercase tracking-wider text-center transition-all"
            >
              Sign in as a Seller — Ingest Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. ENTERPRISE FOOTER                                         */}
      {/* ============================================================ */}
      <footer className="border-t border-slate-200 bg-white py-14 px-4 sm:px-6 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="px-3.5 py-1.5 bg-[#e30613] rounded-md text-white font-black italic text-xl inline-block">
              TarasAI
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              TarasAI is the autonomous industrial materials intelligence and direct procurement platform connecting OEMs, converters, and certified manufacturers.
            </p>
            <div className="text-slate-600">
              Corporate Contact: <strong className="text-slate-900">TarasAIB2BAI@outlook.com</strong>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Industrial Markets</h4>
            <ul className="space-y-2">
              <li><Link href="/signup?role=buyer" className="hover:text-[#0082c8] transition-colors">Automotive & E-Mobility</Link></li>
              <li><Link href="/signup?role=buyer" className="hover:text-[#0082c8] transition-colors">Electronics & Semiconductors</Link></li>
              <li><Link href="/signup?role=buyer" className="hover:text-[#0082c8] transition-colors">Power & Electrical Machinery</Link></li>
              <li><Link href="/signup?role=buyer" className="hover:text-[#0082c8] transition-colors">Appliances & White Goods</Link></li>
              <li><Link href="/signup?role=buyer" className="hover:text-[#0082c8] transition-colors">Building & Construction</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/signup?role=buyer" className="hover:text-[#0082c8] transition-colors">Sign up as a Buyer</Link></li>
              <li><Link href="/signup?role=seller" className="hover:text-[#0082c8] transition-colors">Sign in as a Seller</Link></li>
              <li><Link href="/login" className="hover:text-[#0082c8] transition-colors">Portal Sign In</Link></li>
              <li><Link href="/pricing" className="hover:text-[#0082c8] transition-colors">Enterprise Pricing</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Compliance & Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:text-[#0082c8] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-[#0082c8] transition-colors">Terms of Service</Link></li>
              <li><span className="text-slate-400">DPDP Act Compliant</span></li>
              <li><span className="text-slate-400">ISO 9001 / IATF Sourcing</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>© 2026 TarasAI Materials Intelligence. All Rights Reserved.</div>
          <div>Industrial Adhesive & Materials Sourcing Architecture</div>
        </div>
      </footer>

    </div>
  );
}
