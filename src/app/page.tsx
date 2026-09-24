"use client";

import { useState } from "react";
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
  Layers3
} from "lucide-react";

// ============================================================================
// INDUSTRIAL MARKETS DATA (CLEAN & SOURCE-AGNOSTIC)
// ============================================================================
const INDUSTRIAL_MARKETS = [
  {
    id: "automotive",
    title: "Automotive & E-Mobility",
    tagline: "High-performance bonding, thermal gap filling & EV battery pack insulation",
    icon: Car,
    badge: "IATF 16949 Aligned",
    description: "Engineered solutions for electric vehicle battery modules, exterior body panel attachment, wire harness bundling, and NVH acoustic damping.",
    applications: [
      "EV Battery Cell & Module Thermal Pads (TIM)",
      "High-Shear Structural Acrylic Foam Tapes",
      "Engine Bay High-Temp Wire Harness Tapes",
      "Class-A Surface Protection & Transit Films",
      "Body Panel Attachment & Mirror Mounting"
    ],
    accentColor: "from-blue-600 to-cyan-500",
    borderHover: "hover:border-blue-400 hover:shadow-blue-500/10"
  },
  {
    id: "electronics",
    title: "Electronics & Semiconductors",
    tagline: "Cleanroom masking, ESD shielding, micro die-cuts & thermal dissipation",
    icon: Cpu,
    badge: "RoHS / REACH Compliant",
    description: "Ultra-thin precision adhesive tapes, optical clear bonding for touchscreens, EMI/RFI shielding foils, and high-heat polyimide masking.",
    applications: [
      "Polyimide / High-Temperature Wave Solder Tapes",
      "Copper & Aluminum EMI / RFI Shielding Foils",
      "Optically Clear Adhesives (OCA) for Displays",
      "Anti-Static (ESD) Cleanroom Packaging Films",
      "Precision Micro Die-Cut Thermal Gaskets"
    ],
    accentColor: "from-indigo-600 to-blue-500",
    borderHover: "hover:border-indigo-400 hover:shadow-indigo-500/10"
  },
  {
    id: "power",
    title: "Power & Electrical Systems",
    tagline: "Transformer core insulation, winding wires, switchgear & high-voltage resin",
    icon: Zap,
    badge: "CPRI & IS/IEC Verified",
    description: "Direct access to certified manufacturing plants supplying power transmission, distribution transformers, and industrial switchgear.",
    applications: [
      "CRGO / CRNGO Electrical Steel Core Laminations",
      "Enamelled Copper & Aluminum Winding Wires",
      "High-Voltage Mica & Nomex Insulating Tapes",
      "Epoxy Resin Bushings & Polymer Insulators",
      "Copper Busbars & Medium-Voltage Contacts"
    ],
    accentColor: "from-amber-600 to-yellow-500",
    borderHover: "hover:border-amber-400 hover:shadow-amber-500/10"
  },
  {
    id: "appliances",
    title: "Appliances & White Goods",
    tagline: "Energy-efficiency insulation, evaporator bonding & vibration reduction",
    icon: Tv,
    badge: "BEE Star Rating",
    description: "Bonding and sealing solutions for refrigerators, washing machines, HVAC systems, and consumer appliances designed for automated dispensing.",
    applications: [
      "Refrigerator Vacuum Insulation Panels (VIP)",
      "Aluminum Foil Evaporator & Condenser Tapes",
      "Glass Door Structural Bonding Foams",
      "Vibration Damping EPDM & PU Gaskets",
      "Scratch-Resistant Appliance Surface Films"
    ],
    accentColor: "from-teal-600 to-emerald-500",
    borderHover: "hover:border-teal-400 hover:shadow-teal-500/10"
  },
  {
    id: "aerospace",
    title: "Aerospace & Defense",
    tagline: "Flame retardant, low-outgassing & mil-spec certified composite solutions",
    icon: Plane,
    badge: "AS9100 / Mil-Spec",
    description: "High-modulus carbon prepregs, FAR 25.853 flame-retardant tapes, aircraft fuel tank sealants, and radar-absorbent materials.",
    applications: [
      "FAR 25.853 Flame Retardant Interior Tapes",
      "Aircraft Structural Polysulfide Sealants",
      "High-Modulus Carbon Fiber Prepreg Resins",
      "Cryogenic & Thermal Barrier Blankets",
      "Titanium & Inconel Fastener Assemblies"
    ],
    accentColor: "from-sky-600 to-blue-500",
    borderHover: "hover:border-sky-400 hover:shadow-sky-500/10"
  },
  {
    id: "building",
    title: "Building Facades & Structural Glazing",
    tagline: "Curtain wall structural bonding, weather-seals & ACP cladding",
    icon: Building,
    badge: "ASTM C1184 Compliant",
    description: "High-load structural glazing tapes, architectural ACP cladding solutions, weatherproof flashing, and intumescent firestop barriers.",
    applications: [
      "Structural Glazing Neutral Silicone Sealants",
      "High-Strength ACP Curtain Wall VHB Tapes",
      "Weatherproof Waterproofing Flashing Tapes",
      "Acoustic Insulation & Firestop Foams",
      "Mirror Mounting & Glass Protection Films"
    ],
    accentColor: "from-purple-600 to-pink-500",
    borderHover: "hover:border-purple-400 hover:shadow-purple-500/10"
  }
];

// ============================================================================
// CORE ENGINEERING APPLICATION FUNCTIONS
// ============================================================================
const CORE_SOLUTIONS = [
  {
    title: "Structural Bonding & Fastener Replacement",
    description: "Replace mechanical fasteners, rivets, spot welds, and liquid glues with viscoelastic acrylic foam tapes. Distribute dynamic stress evenly across the entire bond line while dampening vibration.",
    features: ["Up to 1.1 mm (45 mil) caliper", "High shear strength > 900 kPa", "-40°C to 150°C continuous resistance", "Eliminates metal corrosion & drilling"],
    icon: Layers
  },
  {
    title: "Thermal Management & Dielectric Insulation",
    description: "Manage critical heat dissipation in EV battery packs, power electronics, and LED substrates with thermally conductive gap fillers and high dielectric breakdown insulation.",
    features: ["Thermal conductivity up to 6.0 W/m·K", "Dielectric breakdown > 6.5 kV", "UL 94 V-0 flame retardancy", "Polyimide, Ceramic & Silicone bases"],
    icon: Flame
  },
  {
    title: "Surface Protection & Clean Masking",
    description: "Protect Class-A automotive finishes, optical glass, polished metals, and plastic substrates during harsh stamping, high-heat wave soldering, and global transit.",
    features: ["Zero adhesive residue on removal", "UV-resistant acrylic & polyolefin films", "Withstands 260°C solder baths", "Custom slitted roll widths"],
    icon: ShieldCheck
  },
  {
    title: "Custom Precision Die-Cutting & Converting",
    description: "Engineered converting network delivering tight-tolerance kiss-cut parts, rotary die-cut gaskets, and pre-applied adhesive liners matched to automated assembly robotics.",
    features: ["Tight ±0.1 mm dimensional tolerance", "Multi-layer laminate construction", "Tabbed liners for robotic pick-and-place", "Prototype to million-unit batches"],
    icon: Sliders
  }
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 1. TOP ANNOUNCEMENT TICKER (CLEAN & SOURCE-AGNOSTIC)          */}
      {/* ============================================================ */}
      <div className="bg-slate-900 text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">New</span>
            <span className="font-semibold hidden sm:inline">Direct Manufacturing Network:</span>
            <span className="text-slate-300">1,084+ Verified Indian Manufacturers & 4,950+ Technical Specifications Live</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <Link href="/signup?role=seller" className="hover:text-emerald-400 flex items-center gap-1 font-bold transition-colors">
              <Factory className="w-3.5 h-3.5 text-emerald-400" />
              Sign in as a Seller
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/login" className="hover:text-white font-bold transition-colors">
              Portal Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PRIMARY ENTERPRISE NAVIGATION HEADER (LIGHT THEME)         */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Layers3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Taras<span className="text-blue-600">AI</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold -mt-1">
                Materials Intelligence
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#markets" className="hover:text-blue-600 transition-colors">Markets & Industries</a>
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Adhesive & Material Solutions</a>
            <a href="#network" className="hover:text-blue-600 transition-colors">Manufacturer Network</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
            
            <Link 
              href="/signup?role=seller" 
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-xs transition-all hidden md:flex items-center gap-1.5"
            >
              <Factory className="w-3.5 h-3.5" />
              Sign in as a Seller
            </Link>

            <Link 
              href="/signup?role=buyer" 
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Sign up as a Buyer
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. HERO SECTION (TESA / NITTO STYLE ON CRISP WHITE)           */}
      {/* ============================================================ */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Engineering Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-9 text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            ENGINEERED ADHESIVE & INDUSTRIAL MATERIALS INTELLIGENCE
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Advanced Adhesive Solutions & Direct Sourcing Network
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
              Connecting OEMs, Tier-1 converters, and plant procurement teams with 1,084+ direct verified manufacturers. Replace mechanical fasteners, optimize thermal management, and discover parametric alternatives with autonomous AI.
            </p>
          </div>

          {/* Dual Primary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link 
              href="/signup?role=buyer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
            >
              <ShoppingCart className="w-4 h-4" />
              Sign up as a Buyer — Launch RFQs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/signup?role=seller"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-emerald-700 border-2 border-emerald-500 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Factory className="w-4 h-4 text-emerald-600" />
              Sign in as a Seller — Ingest Catalog
            </Link>
          </div>

          {/* Quick Specification Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="p-2 bg-white border-2 border-slate-200 focus-within:border-blue-500 rounded-2xl flex items-center gap-3 shadow-xl transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by material (e.g. Polyimide, Acrylic Foam, CRGO, TIM Pads, Thermal Silicone)..."
                className="w-full bg-transparent text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none font-medium"
              />
              <Link 
                href={`/signup?role=buyer&search=${encodeURIComponent(searchQuery || 'Industrial Materials')}`}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-sm"
              >
                Search Specs
              </Link>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">Popular:</span>
              <Link href="/signup?role=buyer" className="hover:text-blue-600 transition-colors">EV Battery TIM</Link>
              <span>•</span>
              <Link href="/signup?role=buyer" className="hover:text-blue-600 transition-colors">High-Temp Kapton</Link>
              <span>•</span>
              <Link href="/signup?role=buyer" className="hover:text-blue-600 transition-colors">Acrylic Foam VHB</Link>
              <span>•</span>
              <Link href="/signup?role=buyer" className="hover:text-blue-600 transition-colors">CRGO Transformer Cores</Link>
              <span>•</span>
              <Link href="/signup?role=buyer" className="hover:text-blue-600 transition-colors">EMI Copper Foil</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. KEY PERFORMANCE METRICS TICKER (LIGHT THEME)              */}
      {/* ============================================================ */}
      <section id="network" className="border-y border-slate-200 bg-slate-50 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">1,084+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Direct Manufacturers</div>
            <div className="text-[11px] text-slate-500">Across 4 industrial regions in India</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">4,950+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Technical Specifications</div>
            <div className="text-[11px] text-slate-500">Tapes, foams, resins, polymers & metals</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">15–25%</div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Average Sourcing Savings</div>
            <div className="text-[11px] text-slate-500">Direct factory pricing & group consortia</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">&lt; 24 hrs</div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-600">RFQ Turnaround</div>
            <div className="text-[11px] text-slate-500">Direct plant dispatch & sample matching</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. INDUSTRIAL MARKETS & SECTORS (TESA-STYLE WHITE CARDS)     */}
      {/* ============================================================ */}
      <section id="markets" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
            Industrial Markets
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Specialized Adhesive & Material Solutions for Every Sector
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From demanding electric vehicle battery packs to microelectronics and utility power systems, discover application-tested formulations.
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIAL_MARKETS.map(market => {
            const IconComp = market.icon;
            return (
              <div
                key={market.id}
                className={`p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl space-y-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-xs flex flex-col justify-between group ${market.borderHover}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${market.accentColor} flex items-center justify-center text-white shadow-md`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                      {market.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {market.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {market.description}
                    </p>
                  </div>

                  {/* Application Bullets */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Key Formulations:</div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {market.applications.slice(0, 3).map((app, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{app}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href="/signup?role=buyer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 group/btn"
                >
                  Procure {market.title} Materials
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CORE APPLICATION FUNCTIONS (LIGHT THEME SHOWCASE)         */}
      {/* ============================================================ */}
      <section id="solutions" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              Engineering Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Four Critical Industrial Material Functions
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              How our adhesive and material intelligence platform replaces outdated mechanical joints and accelerates factory throughput.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CORE_SOLUTIONS.map((sol, idx) => {
              const IconComp = sol.icon;
              return (
                <div 
                  key={idx}
                  className="p-8 bg-white border border-slate-200 rounded-3xl space-y-5 hover:border-blue-400 hover:shadow-xl transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {sol.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {sol.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {sol.features.map((feat, fidx) => (
                        <div key={fidx} className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/signup?role=buyer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                    >
                      Explore Technical Equivalencies <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. HOW IT WORKS (STREAMLINED 3-STEP JOURNEY)                 */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
            Streamlined Sourcing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            From Specification to Factory Floor in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Eliminate weeks of broker emails, unverified distributor markups, and obsolete paper catalogs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900">Input Specs or Upload Drawing</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Specify your substrate, temperature threshold, dielectric breakdown, or simply upload your existing component datasheet.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900">Instant AI Parametric Matching</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our materials reasoning engine scans 4,950+ verified industrial specifications to discover direct and domestic alternate manufacturers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900">Direct Factory RFQ & Dispatch</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Receive verified factory quotes, sample dispatch tracking, and volume consortium discounts with guaranteed lead times.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. DUAL CALL TO ACTION BANNER                                */}
      {/* ============================================================ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800 p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center space-y-8 text-white">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Ready to Upgrade Your Industrial Supply Chain?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium">
              Join enterprise procurement heads, plant managers, and certified converters across India and global manufacturing hubs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup?role=buyer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Sign up as a Buyer
            </Link>

            <Link 
              href="/signup?role=seller"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/50 hover:border-emerald-500 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Factory className="w-4 h-4" />
              Sign in as a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. ENTERPRISE FOOTER                                         */}
      {/* ============================================================ */}
      <footer className="border-t border-slate-900 bg-slate-950 py-16 px-4 sm:px-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Layers3 className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">Taras<span className="text-blue-500">AI</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              TarasAI is the autonomous industrial materials intelligence and direct procurement platform connecting OEMs, converters, and 1,084+ certified manufacturers.
            </p>
            <div className="text-slate-400">
              Direct Contact: <strong className="text-slate-200">TarasAIB2BAI@outlook.com</strong>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Industrial Markets</h4>
            <ul className="space-y-2">
              <li><Link href="/signup?role=buyer" className="hover:text-white transition-colors">Automotive & EV Mobility</Link></li>
              <li><Link href="/signup?role=buyer" className="hover:text-white transition-colors">Electronics & Semiconductors</Link></li>
              <li><Link href="/signup?role=buyer" className="hover:text-white transition-colors">Power & Electrical Systems</Link></li>
              <li><Link href="/signup?role=buyer" className="hover:text-white transition-colors">Appliances & White Goods</Link></li>
              <li><Link href="/signup?role=buyer" className="hover:text-white transition-colors">Building Facades & Glazing</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/signup?role=buyer" className="hover:text-white transition-colors">Sign up as a Buyer</Link></li>
              <li><Link href="/signup?role=seller" className="hover:text-white transition-colors">Sign in as a Seller</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Portal Sign In</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Enterprise Pricing</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Compliance & Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><span className="text-slate-500">DPDP Act Compliant</span></li>
              <li><span className="text-slate-500">ISO 9001 / IATF Sourcing</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>© 2026 TarasAI Materials Intelligence. All Rights Reserved.</div>
          <div>Industrial Adhesive & Materials Sourcing Architecture</div>
        </div>
      </footer>

    </div>
  );
}
