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
  Sparkles, 
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
  Sliders, 
  Check, 
  Menu, 
  X, 
  Play, 
  Pause, 
  ChevronLeft, 
  Download, 
  FileText, 
  ExternalLink, 
  Phone,
  BarChart3,
  Flame,
  Scale,
  RefreshCw,
  Box,
  Truck,
  Users
} from "lucide-react";

// ============================================================================
// TECHNICAL BROCHURE & SPECIFICATION SHOWCASE DATA
// ============================================================================
const BROCHURE_SHOWCASE = [
  {
    id: "electronics",
    vertical: "Electronics & Semiconductors",
    badge: "SMT & Microelectronics",
    title: "Precision Dielectrics & Thermal Interface Materials",
    tagline: "High-Temperature Polyimide, Cleanroom ESD & Ultra-Thin TIM",
    description: "Engineered for high-density PCB assembly, semiconductor testing, wafer dicing, and display bonding. Withstands wave solder peak temperatures up to 260°C without residue.",
    specs: [
      { label: "Dielectric Strength", val: "6.5 kV / mil" },
      { label: "Temp Threshold", val: "-40°C to 260°C" },
      { label: "Peel Adhesion", val: "6.0 N / 25mm" },
      { label: "Compliance", val: "RoHS / REACH / UL 94" }
    ],
    pdfPages: "16-Page Technical Datasheet (PDF)",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    link: "/signup?role=buyer&search=Electronics"
  },
  {
    id: "automotive",
    vertical: "Automotive & EV Mobility",
    badge: "IATF 16949 Aligned",
    title: "EV Battery Pack Bonding & Thermal Management",
    tagline: "Viscoelastic Acrylic Foam & High-Shear Wire Harness Solutions",
    description: "Replaces mechanical rivets and liquid sealants. Delivers dynamic vibration damping, hermetic ingress sealing, and continuous flame-retardant battery module insulation.",
    specs: [
      { label: "Tensile Adhesion", val: "1.2 MPa" },
      { label: "Thermal Cond.", val: "3.5 to 6.0 W/m-K" },
      { label: "Flammability", val: "UL 94 V-0 Rated" },
      { label: "Shear Strength", val: "10,000+ min @ 80°C" }
    ],
    pdfPages: "24-Page Automotive Sourcing Guide (PDF)",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80",
    link: "/signup?role=buyer&search=Automotive"
  },
  {
    id: "power",
    vertical: "Power & Electrical Transmission",
    badge: "CPRI & IS/IEC Certified",
    title: "High-Voltage Transformer & Machinery Insulation",
    tagline: "CRGO Steel Cores, Enamelled Copper Wires & Mica Insulation",
    description: "Direct domestic consortium sourcing for utility transformers, high-speed induction motors, switchgear panels, and power substation busbars.",
    specs: [
      { label: "Breakdown Voltage", val: "11 kV to 765 kV" },
      { label: "Insulation Class", val: "Class H & Class C (180°C+)" },
      { label: "Core Loss", val: "0.27mm Low Core Loss" },
      { label: "Test Verified", val: "CPRI / ERDA Labs" }
    ],
    pdfPages: "32-Page Electrical Master Catalog (PDF)",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
    link: "/signup?role=buyer&search=Transformer"
  },
  {
    id: "converting",
    vertical: "Precision Converting & Die-Cutting",
    badge: "±0.1 mm Micro Tolerances",
    title: "Custom Rotary Die-Cut Gaskets & Laminated Parts",
    tagline: "Automated Pick-and-Place Liners & Laser Slitted Log Rolls",
    description: "Direct connection to precision converting plants equipped with multi-station rotary dies, laser cutters, and slitting rewinders for robotic manufacturing lines.",
    specs: [
      { label: "Slit Width Tolerance", val: "±0.05 mm" },
      { label: "Thickness Range", val: "0.03 mm to 15 mm" },
      { label: "Turnaround Time", val: "48-Hour Sample Dispatch" },
      { label: "Volume Runs", val: "Proto to Million Batches" }
    ],
    pdfPages: "20-Page Converter Spec Manual (PDF)",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    link: "/signup?role=buyer&search=Converting"
  }
];

// ============================================================================
// INDUSTRIAL VERTICALS ECOSYSTEM
// ============================================================================
const INDUSTRIAL_VERTICALS = [
  {
    id: "auto",
    title: "Automotive & EV Mobility",
    desc: "TIM gap fillers, structural acrylic foams, wire harness & NVH acoustic pads.",
    icon: Car,
    plants: "214 Certified Plants",
    specs: "980+ Live Specs",
    popularTags: ["EV Battery TIM", "Viscoelastic Foam", "Class T4 Harness", "Die-Cut Gaskets"],
    link: "/signup?role=buyer&search=Automotive"
  },
  {
    id: "elec",
    title: "Electronics & Semiconductor",
    desc: "Polyimide masking, cleanroom ESD shielding, wave solder tapes & OCA films.",
    icon: Cpu,
    plants: "186 Certified Plants",
    specs: "840+ Live Specs",
    popularTags: ["Kapton Alternate", "ESD Cleanroom", "Copper Foil EMI", "OCA Display Tape"],
    link: "/signup?role=buyer&search=Electronics"
  },
  {
    id: "power",
    title: "Power & Electrical Grid",
    desc: "CRGO core laminations, enamelled copper wire, Nomex/Mica tapes & epoxy bushings.",
    icon: Zap,
    plants: "312 Certified Plants",
    specs: "1,450+ Live Specs",
    popularTags: ["0.27mm CRGO", "Enamelled Wire", "Mica Tape", "Transformer Oil"],
    link: "/signup?role=buyer&search=Electrical"
  },
  {
    id: "solar",
    title: "Renewables & Solar PV",
    desc: "Solar backsheets, EVA/POE encapsulants, junction box silicone & edge seals.",
    icon: Sun,
    plants: "94 Certified Plants",
    specs: "360+ Live Specs",
    popularTags: ["PV Backsheet", "EVA Encapsulant", "Silicone RTV", "Busbar Tape"],
    link: "/signup?role=buyer&search=Solar"
  },
  {
    id: "aero",
    title: "Aerospace & Defense",
    desc: "FAR 25.853 flame-retardant tapes, carbon prepregs, Mil-Spec sealants & thermal barriers.",
    icon: Plane,
    plants: "72 Certified Plants",
    specs: "290+ Live Specs",
    popularTags: ["FAR Flameproof", "Mil-Spec Sealant", "Titanium Hardware", "Thermal Blanket"],
    link: "/signup?role=buyer&search=Aerospace"
  },
  {
    id: "appliances",
    title: "Appliances & White Goods",
    desc: "Vacuum insulation panels (VIP), aluminum evaporator foil & door bonding acrylics.",
    icon: Tv,
    plants: "135 Certified Plants",
    specs: "520+ Live Specs",
    popularTags: ["VIP Panels", "Evaporator Tape", "EPDM Gaskets", "Glass Acrylics"],
    link: "/signup?role=buyer&search=Appliances"
  },
  {
    id: "build",
    title: "Building & Structural Glazing",
    desc: "Structural glazing silicone, ACP cladding VHB tapes, firestop intumescent foams.",
    icon: Building,
    plants: "128 Certified Plants",
    specs: "410+ Live Specs",
    popularTags: ["Structural Silicone", "ACP Cladding Tape", "Flashing Membrane", "Firestop Foam"],
    link: "/signup?role=buyer&search=Building"
  },
  {
    id: "convert",
    title: "Converting & Die-Cutting",
    desc: "Precision rotary kiss-cutting, laser cutting, slitting & automated assembly parts.",
    icon: Wrench,
    plants: "245 Certified Plants",
    specs: "1,120+ Live Specs",
    popularTags: ["Rotary Die-Cut", "Custom Slitting", "Multi-Layer Laminate", "Laser Cutting"],
    link: "/signup?role=buyer&search=Converting"
  }
];

// ============================================================================
// DIRECT ALTERNATE SPECIFICATION COMPARATOR
// ============================================================================
const SPEC_COMPARISONS = [
  {
    category: "High-Strength Structural Bonding",
    legacyImport: "3M 4910 / VHB Series",
    tarasMatch: "TarasAI Verified High-Shear Viscoelastic Acrylic Foam (1.0 mm)",
    specs: "1.0 mm Thickness • 1.2 MPa Tensile • UV & Weather Resistant • -40°C to 150°C",
    saving: "32% Cost Reduction",
    status: "In Stock Domestic Plant"
  },
  {
    category: "High-Temperature Solder Masking",
    legacyImport: "Kapton 5413 / Polyimide",
    tarasMatch: "TarasAI High-Dielectric Polyimide Film with Silicone Adhesive",
    specs: "0.05 mm (2 mil) • 260°C Operating • 6.5 kV Breakdown • Clean Peel Zero Residue",
    saving: "38% Cost Reduction",
    status: "In Stock Domestic Plant"
  },
  {
    category: "EV Battery Thermal Management",
    legacyImport: "Bergquist / 3M 5590H TIM",
    tarasMatch: "TarasAI Thermally Conductive Silicone Gap Filler Pad",
    specs: "6.0 W/m-K • UL 94 V-0 • High Compressibility • Low Outgassing Formulation",
    saving: "42% Cost Reduction",
    status: "IATF 16949 Plant"
  },
  {
    category: "High-Voltage Transformer Insulation",
    legacyImport: "Nomex 410 / Mica Tape Class H",
    tarasMatch: "TarasAI High-Dielectric Mica Glass Cloth Epoxy Tape",
    specs: "Class H/C 180°C+ • 15 kV/mm Dielectric • CPRI Certified • Zero Voids",
    saving: "28% Cost Reduction",
    status: "CPRI Tested Plant"
  }
];

export default function LandingPage() {
  // Brochure Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Search & Navigation State
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Spec Comparator Active Index
  const [activeCompIdx, setActiveCompIdx] = useState(0);

  // Autoplay Brochure Showcase
  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BROCHURE_SHOWCASE.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoplay]);

  const currentBrochure = BROCHURE_SHOWCASE[activeSlide];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0B4FDF] selection:text-white antialiased overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 1. TOP BRAND ACCENT BAR                                      */}
      {/* ============================================================ */}
      <div className="w-full h-1 bg-gradient-to-r from-[#0B4FDF] via-indigo-600 to-[#FF5500]" />

      {/* ============================================================ */}
      {/* 2. RESPONSIVE NAVIGATION HEADER                             */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-18 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Subtitle */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-[#0B4FDF] rounded-md text-white font-black italic tracking-tighter text-xl sm:text-2xl shadow-sm flex items-center">
                Taras<span className="text-[#FF9E00] font-bold ml-0.5">AI</span>
              </div>
              <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900 leading-none">
                  Materials Intelligence
                </span>
                <span className="text-[9px] font-semibold text-slate-500 tracking-wider mt-0.5">
                  Direct Factory Consortium
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden xl:flex items-center gap-7 text-xs font-extrabold text-slate-700">
            <a href="#verticals" className="hover:text-[#0B4FDF] transition-colors py-2">
              Industries & Specs
            </a>
            <a href="#brochures" className="hover:text-[#0B4FDF] transition-colors py-2">
              Technical Datasheets
            </a>
            <a href="#comparator" className="hover:text-[#0B4FDF] transition-colors py-2">
              Import Alternate Finder
            </a>
            <Link href="/products" className="hover:text-[#0B4FDF] transition-colors py-2">
              Products Master
            </Link>
            <Link href="/pricing" className="hover:text-[#0B4FDF] transition-colors py-2">
              Consortium Sourcing
            </Link>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Header Search Input (Hidden on tiny phones, visible on tablets/desktop) */}
            <div className="relative hidden md:block w-44 lg:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    window.location.href = `/signup?role=buyer&search=${encodeURIComponent(searchQuery || 'Industrial')}`;
                  }
                }}
                placeholder="Search specs, TIM, Kapton..."
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 text-slate-800 text-xs rounded-full py-2 pl-9 pr-3 focus:outline-none focus:border-[#0B4FDF] transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Seller Button */}
            <Link
              href="/signup?role=seller"
              className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Seller Portal</span>
            </Link>

            {/* Buyer Button */}
            <Link
              href="/signup?role=buyer"
              className="px-3.5 sm:px-4 py-2 text-xs font-extrabold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Buyer RFQ</span>
            </Link>

            {/* Sign In Link */}
            <Link
              href="/login"
              className="px-2.5 py-2 text-xs font-bold text-slate-700 hover:text-[#0B4FDF] transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-800 hover:text-[#0B4FDF] hover:bg-slate-100 rounded-lg transition-colors xl:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE SLIDE-DOWN DRAWER MENU                                */}
        {/* ============================================================ */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="xl:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-5 overflow-hidden shadow-xl"
            >
              {/* Mobile Search Bar */}
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setMobileMenuOpen(false);
                      window.location.href = `/signup?role=buyer&search=${encodeURIComponent(searchQuery || 'Industrial')}`;
                    }
                  }}
                  placeholder="Search materials, Kapton, TIM, CRGO..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#0B4FDF]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Mobile Nav Links */}
              <div className="grid grid-cols-1 gap-2 text-sm font-bold text-slate-800">
                <a 
                  href="#verticals" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Industries & Specifications</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
                <a 
                  href="#brochures" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Technical Datasheets & Brochures</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
                <a 
                  href="#comparator" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Import Alternate Finder (Cost Saver)</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
                <Link 
                  href="/products" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Master Product Catalog (1,084+ Plants)</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link 
                  href="/pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Pricing & Consortia</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Mobile CTA Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-3 border-t border-slate-100">
                <Link
                  href="/signup?role=seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-3 text-xs font-bold text-center text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl"
                >
                  Seller Ingest Portal
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-3 text-xs font-bold text-center text-slate-800 bg-slate-100 rounded-xl"
                >
                  Portal Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================ */}
      {/* 3. HERO SECTION (ORIGINAL MODERN B2B INDUSTRIAL INTELLIGENCE) */}
      {/* ============================================================ */}
      <section className="relative w-full pt-10 sm:pt-16 pb-14 sm:pb-20 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 border-b border-slate-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          
          {/* Top Headline & Trust Badge */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-[#0B4FDF] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Direct Manufacturing Consortium • 1,084+ Verified Plants</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              The Autonomous Materials Intelligence & Direct Factory Sourcing Platform
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Source high-performance specialty tapes, EV thermal interface gap pads, dielectric insulation, CRGO electrical steel, and precision die-cuts directly from certified domestic plants. Zero middlemen. Guaranteed specifications.
            </p>
          </div>

          {/* Interactive AI Material Specification Search Box */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      window.location.href = `/signup?role=buyer&search=${encodeURIComponent(searchQuery || 'Industrial')}`;
                    }
                  }}
                  placeholder="Enter specification (e.g. 0.05mm Kapton 260°C, 6 W/m-K TIM pad, 0.27mm CRGO)..."
                  className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 pl-11 pr-3 py-2.5 text-xs sm:text-sm font-medium focus:outline-none"
                />
              </div>

              <Link
                href={`/signup?role=buyer&search=${encodeURIComponent(searchQuery || 'Industrial')}`}
                className="w-full sm:w-auto px-6 py-3 bg-[#0B4FDF] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-2 shrink-0"
              >
                <span>Find Factory Match</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Sourcing Query Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3 text-[11px] text-slate-600">
              <span className="font-bold text-slate-400">Trending Specs:</span>
              {[
                "EV Battery TIM 6 W/m-K",
                "Kapton 260°C Polyimide",
                "0.27mm Low Loss CRGO",
                "1.1mm Structural Acrylic Foam",
                "Class H Mica Tape"
              ].map((pill, i) => (
                <Link
                  key={i}
                  href={`/signup?role=buyer&search=${encodeURIComponent(pill)}`}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#0B4FDF] text-slate-700 rounded-full transition-colors font-medium shadow-2xs"
                >
                  {pill}
                </Link>
              ))}
            </div>
          </div>

          {/* ========================================================== */}
          {/* MOVING TECHNICAL BROCHURE & SPECIFICATION SHOWCASE         */}
          {/* ========================================================== */}
          <div id="brochures" className="pt-4">
            <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              
              {/* Card Main Grid (Responsive Layout: Stacks on mobile, splits on desktop) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                
                {/* Left Technical Data & Specs Panel (7 Columns on Desktop) */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-[#0B4FDF] text-white rounded-full text-[11px] font-black uppercase tracking-wider">
                        {currentBrochure.vertical}
                      </span>
                      <span className="px-3 py-1 bg-white/10 text-cyan-300 rounded-full text-[11px] font-bold border border-white/10">
                        {currentBrochure.badge}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                      {currentBrochure.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {currentBrochure.description}
                    </p>
                  </div>

                  {/* 2x2 Technical Parameters Spec Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-2">
                    {currentBrochure.specs.map((sp, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sp.label}</div>
                        <div className="text-xs sm:text-sm font-extrabold text-white font-mono">{sp.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions & Brochure Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <Link
                        href={currentBrochure.link}
                        className="px-6 py-3 bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-2"
                      >
                        <span>Request Factory Sample / RFQ</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        href={currentBrochure.link}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/15 text-center hidden sm:flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4 text-cyan-300" />
                        <span>PDF Datasheet</span>
                      </Link>
                    </div>

                    {/* Carousel Navigation Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        {BROCHURE_SHOWCASE.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveSlide(i)}
                            className={`h-2 transition-all duration-300 rounded-full ${
                              activeSlide === i ? "w-6 bg-[#0B4FDF]" : "w-2 bg-slate-700 hover:bg-slate-500"
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => setActiveSlide((prev) => (prev - 1 + BROCHURE_SHOWCASE.length) % BROCHURE_SHOWCASE.length)}
                          className="p-1.5 hover:text-white bg-white/5 hover:bg-white/15 rounded-lg transition-colors"
                          aria-label="Previous Brochure"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAutoplay(!isAutoplay)}
                          className="p-1.5 hover:text-white bg-white/5 hover:bg-white/15 rounded-lg transition-colors"
                          aria-label={isAutoplay ? "Pause Autoplay" : "Play Autoplay"}
                        >
                          {isAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlide((prev) => (prev + 1) % BROCHURE_SHOWCASE.length)}
                          className="p-1.5 hover:text-white bg-white/5 hover:bg-white/15 rounded-lg transition-colors"
                          aria-label="Next Brochure"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Hero Image / Physical Sample Preview (5 Columns on Desktop) */}
                <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[320px] bg-slate-800 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentBrochure.id}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${currentBrochure.image}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:via-transparent lg:to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FF9E00]" />
                      <span className="font-bold text-white text-[11px] truncate">{currentBrochure.pdfPages}</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0">Direct In Stock</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. VERIFIED MANUFACTURING CONSORTIUM STATS STRIP             */}
      {/* ============================================================ */}
      <section className="py-8 bg-slate-900 text-white border-y border-slate-800">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-white font-mono">1,084+</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verified Domestic Plants</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-[#FF9E00] font-mono">4,951+</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Material Specs Indexed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-cyan-400 font-mono">₹0</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Middleman Margin</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono">48-Hr</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sample Dispatch SLA</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. MULTI-VERTICAL INDUSTRIAL EXPLORER (BESPOKE DESIGN)       */}
      {/* ============================================================ */}
      <section id="verticals" className="py-16 sm:py-24 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-[#0B4FDF]">
                Comprehensive Materials Assortment
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Explore Direct Factory Catalogs by Industry
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                Browse verified manufacturing plants producing specialized bonding, dielectric, thermal, and conductive materials aligned with Indian and global standards.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-all self-start md:self-auto shrink-0"
            >
              <span>View All 1,084+ Plants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 8-Card Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INDUSTRIAL_VERTICALS.map((vert) => {
              const IconComp = vert.icon;
              return (
                <div
                  key={vert.id}
                  className="bg-white border border-slate-200 hover:border-[#0B4FDF]/60 p-6 rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B4FDF] group-hover:bg-[#0B4FDF] group-hover:text-white flex items-center justify-center transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0B4FDF] transition-colors">
                      {vert.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {vert.desc}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>{vert.plants}</span>
                      <span className="text-[#0B4FDF]">{vert.specs}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {vert.popularTags.slice(0, 3).map((tg, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                          {tg}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={vert.link}
                      className="w-full py-2.5 bg-slate-50 hover:bg-[#0B4FDF] text-slate-800 hover:text-white text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 group-hover:shadow-xs"
                    >
                      <span>Explore Specs & RFQ</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. DIRECT ALTERNATE FINDER & SPEC COMPARATOR (COST SAVER)    */}
      {/* ============================================================ */}
      <section id="comparator" className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>Direct Domestic Alternate Finder</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Replace Expensive Imported Materials with Certified Factory Equivalents
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Stop paying 30-40% brand premiums on imported tapes and materials. TarasAI indexes equivalent technical formulations verified by CPRI and third-party NABL accredited labs.
            </p>
          </div>

          {/* Interactive Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SPEC_COMPARISONS.map((comp, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-5 hover:border-[#0B4FDF]/50 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {comp.category}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-md border border-emerald-200">
                    {comp.saving}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Legacy Imported Part */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Legacy / Import Spec</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 line-through decoration-red-500">
                      {comp.legacyImport}
                    </div>
                    <div className="text-[11px] text-slate-500">High lead times & import duty</div>
                  </div>

                  {/* Right: TarasAI Factory Match */}
                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1">
                    <div className="text-[10px] font-bold text-[#0B4FDF] uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> TarasAI Direct Factory Match
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {comp.tarasMatch}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold">{comp.status}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg font-mono">
                  <span className="font-bold text-slate-800">Specs: </span>{comp.specs}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/signup?role=buyer&search=${encodeURIComponent(comp.tarasMatch)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4FDF] hover:underline"
                  >
                    <span>Request Material Test Certificate & Sample</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. DUAL-PORTAL RFQ & SELLER INGESTION HUB                    */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Buyer Side */}
            <div className="space-y-6 lg:border-r lg:border-white/10 lg:pr-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5500]/20 text-[#FF9E00] border border-[#FF5500]/30 rounded-full text-xs font-bold">
                <ShoppingCart className="w-3.5 h-3.5" /> For Enterprise Buyers & OEMs
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Launch a Multi-Plant RFQ in Under 60 Seconds
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Upload your bill of materials (BOM), dielectric parameters, or target part numbers. Our intelligence engine broadcasts your requirement directly to verified manufacturing plants matching your exact certifications.
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Receive factory-direct competitive quotes with zero broker markups.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Request physical sample swatches and test coupons with 48hr dispatch.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Consortium volume purchasing options for small-to-mid OEMs.</span>
                </li>
              </ul>

              <div>
                <Link
                  href="/signup?role=buyer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Sign Up as a Buyer — Free Access</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Seller Side */}
            <div className="space-y-6 lg:pl-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                <Factory className="w-3.5 h-3.5" /> For Certified Manufacturers & Converters
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Publish Your Catalog to 5,000+ OEM Sourcing Heads
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ingest your technical brochures, datasheets, or product inventory spreadsheets. AI automatically extracts and indexes your specifications for direct OEM RFQ matches.
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct RFQ leads from Automotive, Electronics, and Power OEMs.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic technical spec normalization from PDF brochures or Excel.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified GSTIN & CPRI/ISO credential display to build instant buyer trust.</span>
                </li>
              </ul>

              <div>
                <Link
                  href="/signup?role=seller"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Sign Up as a Seller — Ingest Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. ENTERPRISE FOOTER                                         */}
      {/* ============================================================ */}
      <footer className="border-t border-slate-200 bg-white py-14 px-4 sm:px-6 lg:px-8 text-slate-600 text-xs">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="px-3.5 py-1.5 bg-[#0B4FDF] rounded-md text-white font-black italic text-xl inline-block shadow-xs">
                Taras<span className="text-[#FF9E00]">AI</span>
              </div>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              TarasAI is the autonomous industrial materials intelligence and direct procurement platform connecting OEMs, converters, and certified manufacturers across India.
            </p>
            <div className="text-slate-600 text-xs">
              Corporate Desk: <strong className="text-slate-900">TarasAIB2BAI@outlook.com</strong>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Industrial Verticals</h4>
            <ul className="space-y-2">
              <li><Link href="/signup?role=buyer&search=Automotive" className="hover:text-[#0B4FDF] transition-colors">Automotive & EV Battery</Link></li>
              <li><Link href="/signup?role=buyer&search=Electronics" className="hover:text-[#0B4FDF] transition-colors">Electronics & PCB Masking</Link></li>
              <li><Link href="/signup?role=buyer&search=Transformer" className="hover:text-[#0B4FDF] transition-colors">Power & Transformers</Link></li>
              <li><Link href="/signup?role=buyer&search=Solar" className="hover:text-[#0B4FDF] transition-colors">Renewables & Solar PV</Link></li>
              <li><Link href="/signup?role=buyer&search=Converting" className="hover:text-[#0B4FDF] transition-colors">Precision Die-Cutting</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Platform Portals</h4>
            <ul className="space-y-2">
              <li><Link href="/signup?role=buyer" className="hover:text-[#0B4FDF] transition-colors font-bold text-[#0B4FDF]">Sign up as a Buyer</Link></li>
              <li><Link href="/signup?role=seller" className="hover:text-[#0B4FDF] transition-colors font-bold text-emerald-700">Sign in as a Seller</Link></li>
              <li><Link href="/login" className="hover:text-[#0B4FDF] transition-colors">Portal Sign In</Link></li>
              <li><Link href="/products" className="hover:text-[#0B4FDF] transition-colors">Products Master List</Link></li>
              <li><Link href="/pricing" className="hover:text-[#0B4FDF] transition-colors">Enterprise Consortia</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Compliance & Governance</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:text-[#0B4FDF] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-[#0B4FDF] transition-colors">Terms of Service</Link></li>
              <li><span className="text-slate-400">DPDP Act Compliant</span></li>
              <li><span className="text-slate-400">CPRI / BIS Quality Aligned</span></li>
            </ul>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>© 2026 TarasAI Materials Intelligence. All Rights Reserved.</div>
          <div>Autonomous Materials Procurement & Direct Factory Consortium Architecture</div>
        </div>
      </footer>

    </div>
  );
}
