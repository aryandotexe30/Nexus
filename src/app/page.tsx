"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Truck, 
  Clock, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Scale, 
  TrendingUp, 
  Building2, 
  Send, 
  X,
  Factory,
  BarChart3,
  PhoneCall,
  Download,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 5 CORE INDUSTRIAL SOURCING CATEGORIES
// ============================================================================
const CORE_CATEGORIES = [
  {
    id: "tapes",
    title: "Technical Tapes & Bonding",
    subtitle: "High-Temp Polyimide, Acrylic Foam VHB & SMT Masking",
    tag: "36+ Line Items",
    image: "/images/products/polyimide-tape.jpg",
    link: "/products?category=tapes",
    specs: ["Class H (260°C)", "1000µm Solid Acrylic", "ASTM D3330 Tested"],
    featuredItems: [
      { name: "Polyimide SMT Tape", price: "₹145 / roll", spec: "260°C • Silicone PSA" },
      { name: "Acrylic Foam VHB", price: "₹380 / roll", spec: "1000µm Solid Core" },
      { name: "Green Masking Tape", price: "₹190 / roll", spec: "220°C Oven Bake" }
    ]
  },
  {
    id: "resins",
    title: "Raw Resins & Chemical Precursors",
    subtitle: "Silicone PSA Resins, Monomers, Liners & Primers",
    tag: "Bulk Chemical Hub",
    image: "/images/products/industrial-resin.jpg",
    link: "/products?category=resins",
    specs: ["GE Momentive SR545", "Pure Acrylic Monomers", "Differential Liners"],
    featuredItems: [
      { name: "Silicone PSA Resin", price: "₹110 / kg", spec: "Wholesale Precursor" },
      { name: "Fluorosilicone Release", price: "₹240 / kg", spec: "Clean Peel Coating" },
      { name: "Differential MOPP Liner", price: "₹35 / sq.m", spec: "Red / Clear Film" }
    ]
  },
  {
    id: "electrical",
    title: "Electrical Machinery & Dielectrics",
    subtitle: "Transformer Mica, Nomex Aramid & IS 7809 Vinyl",
    tag: "CPRI & BIS Aligned",
    image: "/images/products/electrical-equipment.jpg",
    link: "/products?category=electrical",
    specs: ["18 kV/mm Breakdown", "CPRI Tested IS 13357", "UL 510 Flame Rated"],
    featuredItems: [
      { name: "Mica Glass Cloth Tape", price: "₹540 / roll", spec: "18 kV/mm High Voltage" },
      { name: "Nomex Aramid Sheets", price: "₹320 / roll", spec: "Class H 180°C Barrier" },
      { name: "FR PVC Electrical (Blue)", price: "₹38 / roll", spec: "BIS IS 7809 Certified" }
    ]
  },
  {
    id: "diecut",
    title: "Precision Die-Cuts & Converted Parts",
    subtitle: "Custom IP68 EPDM Gaskets, Shims & Spacers",
    tag: "±0.1mm Tolerances",
    image: "/images/products/diecut-gaskets.jpg",
    link: "/products?category=diecut",
    specs: ["Rotary & Laser Cut", "Watertight IP67/IP68", "Kiss-Cut Rolls"],
    featuredItems: [
      { name: "Custom EPDM Gaskets", price: "Custom RFQ", spec: "Watertight Device Seal" },
      { name: "Poron Foam Spacers", price: "Custom RFQ", spec: "Microcellular Shock Absorb" },
      { name: "Multi-Layer Foil Shims", price: "Custom RFQ", spec: "Pick-and-Place Format" }
    ]
  },
  {
    id: "thermal",
    title: "Thermal Interface (TIM) & EMI",
    subtitle: "Silicone Gap Pads, Synthetic Graphite & Copper Foil",
    tag: "EV Battery Grade",
    image: "/images/products/thermal-pad.jpg",
    link: "/products?category=thermal",
    specs: ["3.2 - 6.0 W/m-K TIM", "85 dB EMI Attenuation", "UL 94 V-0 Certified"],
    featuredItems: [
      { name: "Silicone Gap Pad (6.0 W/m-K)", price: "₹1,450 / sheet", spec: "UL 94 V-0 • High K" },
      { name: "Copper Foil EMI Shield", price: "₹280 / roll", spec: "Conductive Acrylic PSA" },
      { name: "Synthetic Graphite Spreader", price: "₹590 / sheet", spec: "1500 W/m-K In-Plane" }
    ]
  }
];

// ============================================================================
// LIVE COMMODITY SPREAD & BENCHMARK INDEX
// ============================================================================
const COMMODITY_INDEX = [
  { item: "Silicone PSA Resin SR545", rate: "₹110 / kg", change: "+0.8%", benchmark: "Momentive Grade" },
  { item: "Polyimide Film 50µm", rate: "₹155 / roll", change: "Stable", benchmark: "Class H (260°C)" },
  { item: "Acrylic Foam Solid Core", rate: "₹380 / roll", change: "-1.2%", benchmark: "VHB 1.0mm Equivalent" },
  { item: "Mica Glass Cloth 18 kV", rate: "₹540 / roll", change: "+1.5%", benchmark: "CPRI Tested" },
  { item: "Copper Foil 35µm Conductive", rate: "₹280 / roll", change: "+0.4%", benchmark: "MIL-STD-285" },
  { item: "FR PVC Vinyl Electrical", rate: "₹38 / roll", change: "Stable", benchmark: "BIS IS 7809" }
];

export default function HomePage() {
  const [heroSearch, setHeroSearch] = useState("");
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqMaterial, setRfqMaterial] = useState("");
  const [rfqQuantity, setRfqQuantity] = useState("5,000 Units / Rolls");
  const [rfqPincode, setRfqPincode] = useState("411018 (Pune MIDC)");
  const [rfqCompany, setRfqCompany] = useState("");
  const [rfqContact, setRfqContact] = useState("");
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(heroSearch.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      
      {/* 1. TOP B2B NAVIGATION BAR */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#0B4FDF] flex items-center justify-center text-white font-black text-lg shadow-sm">
                T
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  Taras<span className="text-[#0B4FDF]">AI</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  Industrial Commerce & Sourcing
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
              <Link href="/products" className="hover:text-[#0B4FDF] transition-colors">
                Explore Master Catalog
              </Link>
              <a href="#categories" className="hover:text-[#0B4FDF] transition-colors">
                Categories We Serve
              </a>
              <Link href="/tri-flow" className="hover:text-[#0B4FDF] transition-colors flex items-center gap-1">
                <span>TriFlow Financing</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800">
                  90-Day Credit
                </span>
              </Link>
              <a href="#how-it-works" className="hover:text-[#0B4FDF] transition-colors">
                How It Works
              </a>
              <a href="#quality" className="hover:text-[#0B4FDF] transition-colors">
                ASTM / CPRI Labs
              </a>
            </nav>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setRfqMaterial("General Technical Sourcing");
                setIsRfqModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white font-extrabold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Instant RFQ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
            >
              Sign In
            </Link>
          </div>

        </div>
      </header>

      {/* 2. HERO SOURCING SECTION */}
      <section className="bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC] border-b border-slate-200 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B4FDF]/10 text-[#0B4FDF] border border-[#0B4FDF]/20">
              <Sparkles className="w-3.5 h-3.5" /> Direct Plant Offtake Network
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> ASTM D3330 & CPRI Verified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <Building2 className="w-3.5 h-3.5" /> 1,084+ Verified Manufacturing Plants
            </span>
          </div>

          {/* Hero Headlines */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              India&apos;s Industrial B2B Commerce & Sourcing Platform
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
              Direct factory procurement across <strong>Technical Tapes</strong>, <strong>Converted Die-Cuts</strong>, <strong>Electrical Insulation</strong>, and <strong>Raw Chemical Resins</strong>. Powered by ASTM laboratory verification, institutional trade financing, and binding quotes delivered within 2 hours.
            </p>
          </div>

          {/* Interactive Master Search Bar */}
          <div className="max-w-3xl bg-white border border-slate-300 rounded-2xl p-2.5 shadow-lg shadow-blue-900/5">
            <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search materials, specs or part numbers (e.g. Kapton, VHB 4910, Silicone Resin, EPDM Gasket)..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0B4FDF] transition-all"
                />
              </div>
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
              >
                <span>Search Master Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Keyword Links */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 px-1 text-[11px] font-bold text-slate-500">
              <span className="text-slate-400 font-mono">Popular:</span>
              {[
                { label: "Polyimide Kapton", q: "kapton" },
                { label: "Acrylic Foam VHB", q: "vhb" },
                { label: "Silicone PSA Resin", q: "resin" },
                { label: "Mica Glass Cloth", q: "mica" },
                { label: "Die-Cut Gaskets", q: "die-cut" },
                { label: "Copper Foil EMI", q: "copper" },
                { label: "Wire Harness Fleece", q: "harness" }
              ].map((k) => (
                <Link
                  key={k.q}
                  href={`/products?search=${k.q}`}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {k.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Live Industrial Commodity Spread & Price Ticker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <BarChart3 className="w-4 h-4 text-[#0B4FDF]" />
                <span>Live Factory Sourcing Indices & Benchmark Rates</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-bold">
                Updated Daily • Indicative Rates
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {COMMODITY_INDEX.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-1 block">
                    {item.item}
                  </span>
                  <div className="text-xs font-mono font-black text-slate-900">
                    {item.rate}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{item.benchmark}</span>
                    <span className="text-emerald-600 font-bold">{item.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3. MULTI-CATEGORY INDUSTRIAL SHOWCASE */}
      <section id="categories" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B4FDF]">
              Manufacturing Verticals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Industrial Categories We Serve
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Procure directly from vetted converters, raw resin synthesis plants, and precision die-cutting hubs across India.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4FDF] hover:text-blue-700 uppercase tracking-wider self-start sm:self-auto"
          >
            <span>Explore All 1,084+ Plants</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-[#0B4FDF]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Visual Header */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-800 border border-slate-200">
                    {cat.tag}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B4FDF] transition-colors leading-tight">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Specification Pills */}
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-600">
                    {cat.specs.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Sample Items with Rates */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                    {cat.featuredItems.map((fi, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 font-medium truncate max-w-[170px]">{fi.name}</span>
                        <span className="font-mono font-bold text-emerald-700">{fi.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="p-5 pt-0">
                <Link
                  href={cat.link}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#0B4FDF] text-slate-800 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <span>Explore Sourcing Lines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* Quick Custom RFQ Callout Card */}
          <div className="bg-gradient-to-br from-[#0B4FDF] to-blue-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg space-y-6">
            <div className="space-y-3">
              <span className="px-2.5 py-1 rounded bg-white/20 text-white text-[10px] font-mono font-bold inline-block">
                Custom Converters & Tolling
              </span>
              <h3 className="text-xl font-black tracking-tight leading-tight">
                Need Custom Log Slitting or Die-Cut Kiss Cutting?
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Connect your engineering drawing or bill of materials. Our tolling desk allocates capacity to certified plants in Pune, Sanand, and Chennai with zero idle machine time.
              </p>
            </div>

            <button
              onClick={() => {
                setRfqMaterial("Custom Precision Converting");
                setIsRfqModalOpen(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Submit Custom BOM / Drawing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. TRIFLOW CLOSED-LOOP SOURCING ARCHITECTURE */}
      <section id="how-it-works" className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B4FDF]">
              The TriFlow Procurement Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Direct Plant Offtake with Zero Working Capital Friction
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              We connect Upstream Chemical Majors, Mid-Market Converters, and Enterprise OEMs into a verified, disintermediation-proof execution loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Requirement & TDS Lock",
                desc: "OEM submits exact technical parameters (peel adhesion, shear, dielectric strength, caliper microns). Our engineering desk verifies ASTM/CPRI criteria.",
                icon: FileText
              },
              {
                step: "02",
                title: "Plant Allocation & Raw Resin",
                desc: "We supply GE Momentive or Dow silicone/acrylic precursors directly to vetted MSME converters under GST Job-Work with zero upfront capital lockup.",
                icon: Factory
              },
              {
                step: "03",
                title: "Certified ASTM Quality Audit",
                desc: "Every converted master log and slit roll undergoes laboratory QA testing with micrometer calipers and 180° peel test certificates issued per lot.",
                icon: ShieldCheck
              },
              {
                step: "04",
                title: "Blind Factory Gate Delivery",
                desc: "Dispatched directly to OEM docks under TarasAI neutral packaging, digital weighbridge slips, and institutional Net 60–90 day credit financing.",
                icon: Truck
              }
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-[#0B4FDF]/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0B4FDF] shadow-2xs group-hover:bg-[#0B4FDF] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-mono font-black text-slate-300 group-hover:text-[#0B4FDF] transition-colors">
                      {s.step}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. QUALITY & LAB CERTIFICATION STRIP */}
      <section id="quality" className="py-12 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Quality & Traceability Guaranteed</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Rigorous Laboratory Testing Included on Every Single Dispatch
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              ASTM D3330 180° Peel Adhesion, ASTM D3654 High-Temperature Static Shear, CPRI Breakdown Voltage, and UL 94 V-0 flame ratings documented on your official tax invoice.
            </p>
          </div>

          <Link
            href="/products"
            className="px-6 py-3.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md whitespace-nowrap self-start md:self-auto"
          >
            Explore Tested Products →
          </Link>
        </div>
      </section>

      {/* 6. CALL TO ACTION & RFQ LEAD CAPTURE */}
      <section className="py-16 bg-[#F8FAFC] border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 text-center">
          <span className="px-3 py-1 rounded-full bg-orange-100 text-[#FF5500] font-mono text-xs font-bold inline-block">
            Fast Sourcing Desk Turnaround
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to Optimize Your Industrial Sourcing?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Submit your bill of materials, custom roll specs, or conversion requirements. Our materials engineering team will deliver a binding, factory-direct quotation within 2 hours.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setRfqMaterial("General Enterprise RFQ");
                setIsRfqModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#E04800] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
            >
              Request Binding Quotation
            </button>
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200"
            >
              Browse 4,800+ Specs
            </Link>
          </div>
        </div>
      </section>

      {/* 7. B2B ENTERPRISE FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#0B4FDF] flex items-center justify-center text-white font-black text-sm">
                T
              </span>
              <span className="text-base font-black text-slate-900 tracking-tight">
                Taras<span className="text-[#0B4FDF]">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              India&apos;s principal industrial B2B commerce and sourcing network for technical tapes, converted die-cuts, and polymer precursors.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Corridors: Pune MIDC • Sanand • Sriperumbudur • Manesar
            </div>
          </div>

          {/* Sourcing Categories */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px]">Sourcing Lines</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link href="/products?category=tapes" className="hover:text-[#0B4FDF]">Technical Tapes</Link></li>
              <li><Link href="/products?category=resins" className="hover:text-[#0B4FDF]">Silicone PSA Resins</Link></li>
              <li><Link href="/products?category=electrical" className="hover:text-[#0B4FDF]">Transformer Dielectrics</Link></li>
              <li><Link href="/products?category=diecut" className="hover:text-[#0B4FDF]">Die-Cut Gaskets</Link></li>
              <li><Link href="/products?category=thermal" className="hover:text-[#0B4FDF]">Thermal Gap Fillers</Link></li>
            </ul>
          </div>

          {/* Solutions & Financing */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px]">Solutions</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link href="/tri-flow" className="hover:text-[#0B4FDF]">TriFlow Trade Financing</Link></li>
              <li><Link href="/products" className="hover:text-[#0B4FDF]">Master Catalog Ingestion</Link></li>
              <li><a href="#quality" className="hover:text-[#0B4FDF]">ASTM D3330 Lab Reports</a></li>
              <li><Link href="/terms-of-service" className="hover:text-[#0B4FDF]">Job-Work Agreements</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px]">Compliance</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link href="/privacy-policy" className="hover:text-[#0B4FDF]">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-[#0B4FDF]">Terms of Service</Link></li>
              <li><span className="text-slate-400">GST E-Way Bill Aligned</span></li>
              <li><span className="text-slate-400">CPRI / BIS IS 7809</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} TarasAI Technologies Private Limited. All rights reserved.
          </div>
          <div className="font-mono">
            Principal Sourcing & Contract Converting Engine
          </div>
        </div>
      </footer>

      {/* 8. INSTANT RFQ POPUP MODAL */}
      <AnimatePresence>
        {isRfqModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setIsRfqModalOpen(false); setRfqSubmitted(false); }}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-mono font-bold text-[#0B4FDF] uppercase tracking-wider">
                  Direct Factory Procurement RFQ
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Request Binding Sourcing Quotation
                </h3>
              </div>

              {rfqSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">RFQ Successfully Logged</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Your request for <strong>{rfqMaterial}</strong> ({rfqQuantity}) has been transmitted to our materials desk. A binding quotation with verified test certificates will be sent within 2 hours.
                  </p>
                  <button
                    onClick={() => { setIsRfqModalOpen(false); setRfqSubmitted(false); }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-lg text-white"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRfqSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Material / Specification Required</label>
                    <input 
                      type="text" 
                      value={rfqMaterial}
                      onChange={(e) => setRfqMaterial(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                      placeholder="e.g. Polyimide SMT Tape 50µm, VHB Foam 1mm, Silicone Resin"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Estimated Quantity / Batch</label>
                      <input 
                        type="text" 
                        value={rfqQuantity}
                        onChange={(e) => setRfqQuantity(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Delivery Plant Pincode</label>
                      <input 
                        type="text" 
                        value={rfqPincode}
                        onChange={(e) => setRfqPincode(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Company / Buyer Entity</label>
                      <input 
                        type="text" 
                        value={rfqCompany}
                        onChange={(e) => setRfqCompany(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        placeholder="e.g. Tata Motors / Foxconn / MSME"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Contact Phone / Email</label>
                      <input 
                        type="text" 
                        value={rfqContact}
                        onChange={(e) => setRfqContact(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        placeholder="+91 98765 43210 or email"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Binding RFQ Inquiry</span>
                  </button>

                  <p className="text-[10px] text-slate-500 text-center">
                    Direct factory offtake. 100% Tax Compliant with GST e-Way bill and ASTM lab reports.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
