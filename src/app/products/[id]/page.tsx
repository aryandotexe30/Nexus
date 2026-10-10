"use client";

import { useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  Truck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Download, 
  ShieldCheck, 
  DollarSign, 
  Scale, 
  QrCode, 
  MessageSquare, 
  X,
  Send,
  Building2,
  ExternalLink,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  // Interactive Specification Matrix State
  const [selectedThickness, setSelectedThickness] = useState("50µm (2 mil)");
  const [selectedAdhesive, setSelectedAdhesive] = useState("Silicone PSA (High-Temp)");
  const [selectedCarrier, setSelectedCarrier] = useState("Amber Polyimide (Kapton)");
  const [selectedFormat, setSelectedFormat] = useState("Precision Slit Rolls (12-50mm)");
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteQuantity, setQuoteQuantity] = useState("5,000");
  const [quotePincode, setQuotePincode] = useState("411018 (Pune MIDC)");
  const [userRole, setUserRole] = useState<"BUYER" | "CONVERTER">("BUYER");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic pricing based on selections
  const basePriceMin = selectedThickness.includes("125µm") ? 210 : selectedThickness.includes("75µm") ? 175 : 145;
  const basePriceMax = basePriceMin + 20;

  const faqs = [
    {
      q: "What should I share to get a firm quote?",
      a: "Share the target caliper thickness (e.g., 50µm), required roll width (e.g., 19mm or 25mm), total length per roll (typically 33m or 66m), target temperature endurance (e.g., 260°C for wave soldering), and estimated monthly roll volume."
    },
    {
      q: "Can MSME converters request jumbo rolls with raw silicone resin supplied?",
      a: "Yes. Under the TriFlow closed-loop model, TarasAI can supply GE Momentive PSA silicone adhesive resin directly to your coating facility under a GST Job-Work agreement, and contract the entire finished tape lot back from you with zero working capital lockup."
    },
    {
      q: "What documents and test certifications accompany every shipment?",
      a: "Every dispatch batch includes an ASTM D3330 180° Peel Adhesion Test Certificate, ASTM D3654 Shear Adhesion Report, Dielectric Breakdown Voltage Certificate (kV), and a GST Tax Invoice with verified e-way bill."
    },
    {
      q: "What complementary substrates and conversion materials can be bundled?",
      a: "You can simultaneously order fluorosilicone differential release liners, corona-treated polyester backing film, solventless primers, and high-impact plastic slitting core tubes."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Category Sub-Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 text-xs">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            <span className="font-semibold text-blue-400 border-b-2 border-blue-500 py-3.5 px-1 whitespace-nowrap">
              Technical Tapes & Adhesives
            </span>
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer py-3.5 px-1 whitespace-nowrap">
              Thermal Interface Materials
            </span>
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer py-3.5 px-1 whitespace-nowrap">
              Surface Protection Films
            </span>
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer py-3.5 px-1 whitespace-nowrap">
              Specialty Release Liners
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TarasAI TriFlow Verified Catalog</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/products" className="hover:text-slate-200">Catalog</Link>
          <span className="text-slate-600">/</span>
          <span>Technical Tapes</span>
          <span className="text-slate-600">/</span>
          <span>High-Temp Films</span>
          <span className="text-slate-600">/</span>
          <span className="text-blue-400 font-medium">Polyimide SMT Tape</span>
        </div>

        {/* HERO PRODUCT CARD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Product Image & Badges (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group shadow-inner">
                {/* Visual Representation of Technical Tape */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/40 via-slate-900 to-blue-950/40" />
                <div className="relative z-10 text-center p-6 space-y-3">
                  <div className="w-32 h-32 mx-auto rounded-full border-8 border-amber-600/60 bg-gradient-to-tr from-amber-700 to-amber-500 shadow-2xl shadow-amber-500/20 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-900 bg-slate-950 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-amber-300 font-bold">33M CORE</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 inline-block font-semibold">
                    Class H (260°C) Insulation
                  </span>
                </div>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 border border-white/10">
                  SKU: TF-KAPTON-50
                </div>
              </div>

              {/* Verified Specification Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Quality Standard</span>
                    <span className="font-semibold text-slate-200">ASTM D3330 & UL 510</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dielectric Strength</span>
                    <span className="font-semibold text-slate-200">6,500 Volts (6.5 kV)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs & Interactive Matrix (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  High-Temp Polyimide SMT Masking Tape
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-sans">
                  Amber polyimide (Kapton equivalent) film tape coated with cross-linked silicone pressure-sensitive adhesive. Engineered for wave soldering, powder coating, and EV battery terminal insulation with zero residue upon peel-off.
                  {showFullDesc && (
                    <span className="text-slate-400 block mt-1.5">
                      Resistant to chemical solvent wash, fluorinated flux, and continuous heat exposure up to 260°C (peak 300°C for 90 seconds). Available in jumbo rolls (500mm x 1000m) or precision slit widths.
                    </span>
                  )}
                  <button 
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="ml-1 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline text-xs"
                  >
                    {showFullDesc ? "View less" : "View more"}
                  </button>
                </p>
              </div>

              {/* 3 Trust / Fulfillment Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>ASTM Test Certificate + GST Invoice</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pan-India Temperature Freight</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Firm Quote within 24 Hours</span>
                </div>
              </div>

              {/* AI Assistant Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">Get live yield calculations, GSM coating data & market updates on</span>
                  <strong className="text-blue-400">Taras Copilot</strong>
                </div>
                <span className="text-blue-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                  Ask AI →
                </span>
              </div>

              {/* INTERACTIVE SPECIFICATION MATRIX */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Configure Specifications
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Key specs update quote parameters live
                  </span>
                </div>

                {/* Row 1: Caliper Thickness */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Total Caliper Thickness:</label>
                  <div className="flex flex-wrap gap-2">
                    {["25µm (1 mil)", "50µm (2 mil)", "75µm (3 mil)", "125µm (5 mil)"].map((thick) => (
                      <button
                        key={thick}
                        onClick={() => setSelectedThickness(thick)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          selectedThickness === thick
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        {thick}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 2: Adhesive Chemistry */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Adhesive Chemistry:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Silicone PSA (High-Temp)",
                      "Acrylic Thermosetting",
                      "Crosslinked Rubber"
                    ].map((adh) => (
                      <button
                        key={adh}
                        onClick={() => setSelectedAdhesive(adh)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          selectedAdhesive === adh
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        {adh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 3: Carrier Substrate */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Carrier Substrate Film:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Amber Polyimide (Kapton)",
                      "PET Film (Clear/Green)",
                      "PTFE Coated Glass Cloth"
                    ].map((car) => (
                      <button
                        key={car}
                        onClick={() => setSelectedCarrier(car)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          selectedCarrier === car
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        {car}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 4: Delivery Format */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Delivery Format:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Precision Slit Rolls (12-50mm)",
                      "Master Jumbo Rolls (500mm x 1000m)",
                      "Custom Die-Cut Shapes"
                    ].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          selectedFormat === fmt
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div>
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full py-4 rounded-xl font-bold text-white text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Quote / Offtake Contract</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-center text-[11px] text-slate-500 mt-2">
                  Serving Enterprise OEMs (Demand Offtake) and MSME Converters (Capacity Tolling).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FREQUENTLY CONVERTED & PAIRED SUBSTRATES */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Frequently Paired Conversion Materials
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Fluorosilicone Release Liners", spec: "75µm PET Differential", price: "₹28/sq.m" },
              { name: "Corona Treated PET Film", spec: "Optical Clear 25µm", price: "₹18/sq.m" },
              { name: "Adhesive Primer Emulsions", spec: "Silicone Adhesion Promoter", price: "₹450/Ltr" },
              { name: "Precision ABS Plastic Cores", spec: "76mm (3-inch) Slit Core", price: "₹8.50/pc" }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group cursor-pointer"
              >
                <div className="w-full h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-102 transition-transform">
                  <Layers className="w-8 h-8 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.spec}</p>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 pt-1 border-t border-slate-800/60">
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LATEST PRICE & DUAL-SPREAD BENCHMARKS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>Check Live Pricing & Conversion Spreads</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                ● Live Benchmarks
              </span>
            </h3>
            <span className="text-xs text-slate-400">Updated Daily from Verified Contracts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Enterprise OEM Rate */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Enterprise OEM Finished Tape</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Contract Rate (P_C)
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ₹{basePriceMin} - ₹{basePriceMax} <span className="text-sm font-normal text-slate-400">/ Roll</span>
              </div>
              <p className="text-xs text-slate-400">
                Delivered to OEM receiving bay (Tata Motors / Foxconn) with ASTM certificate on standard 60-day Net terms.
              </p>
              <button 
                onClick={() => { setUserRole("BUYER"); setIsQuoteModalOpen(true); }}
                className="w-full py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold cursor-pointer transition-colors"
              >
                View OEM Contract Terms →
              </button>
            </div>

            {/* Card 2: MSME Converter Tolling Spread */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300">MSME Converter Tolling Margin</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                  Cashless Tolling
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                +₹25 - ₹35 <span className="text-sm font-normal text-slate-400">/ Roll Net Profit</span>
              </div>
              <p className="text-xs text-slate-300">
                We supply GE Momentive resin at ₹110/kg and buy back your finished rolls at ₹140/roll. Zero working capital locked.
              </p>
              <button 
                onClick={() => { setUserRole("CONVERTER"); setIsQuoteModalOpen(true); }}
                className="w-full py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold cursor-pointer transition-colors"
              >
                Claim Slitting Machine Quota →
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            *Final landed price depends on adhesive coating GSM, slit width, order batch volume, and ASTM testing parameters. Share exact requirements for an irrevocable contract.
          </p>
        </div>

        {/* WHAT BUYERS SHOULD CONFIRM BEFORE ORDERING */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            What Should Buyers & Converters Confirm Before Ordering?
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Confirm your maximum operating temperature threshold (260°C for SMT lead-free solder reflow vs 180°C for transformer winding), target roll width in millimetres (12mm, 19mm, 25mm, or 50mm), and whether you require single-sided adhesive coating or double-sided with release liner backing.
          </p>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-blue-400 text-[11px]">0{idx + 1}</span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180 text-blue-400" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 font-sans pl-10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PLATFORM APP PROMO CARD */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-950/70 to-slate-900 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-3 max-w-xl z-10">
            <h3 className="text-xl font-extrabold text-white">
              TarasAI: Autonomous Industrial Trade & Liquidity
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-sans">
              <li><strong>Discover:</strong> Verified Tier-1 OEM demands and wholesale polymer resins.</li>
              <li><strong>Convert:</strong> Guaranteed offtake with zero working capital lockup.</li>
              <li><strong>Finance:</strong> 24-hour TReDS invoice discounting at 8% annual rate.</li>
              <li><strong>Protect:</strong> AI Sentinel thermodynamic mass-balance audit & scrap fraud immunity.</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/10 z-10">
            <div className="w-16 h-16 rounded-lg bg-white p-1 flex items-center justify-center">
              <QrCode className="w-14 h-14 text-slate-950" />
            </div>
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px]">Instant Mobile Access</span>
              <span className="font-bold text-white">Scan for Live Spreads</span>
              <span className="text-blue-400 block text-[10px] mt-0.5">iOS & Android WebApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING "ASK TARAS COPILOT" BUTTON (Bottom-Right) */}
      <Link
        href="/agent"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-2xl shadow-blue-500/40 hover:from-blue-500 hover:to-indigo-500 transition-transform hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Sparkles className="w-4 h-4 text-white" />
        <span>Ask Taras Copilot</span>
      </Link>

      {/* INTERACTIVE QUOTE & CONTRACT MODAL */}
      <AnimatePresence>
        {isQuoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => { setIsQuoteModalOpen(false); setQuoteSubmitted(false); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                  {userRole === "BUYER" ? "OEM Procurement RFQ" : "Converter Capacity Quota"}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Request Contract: Polyimide SMT Tape
                </h3>
              </div>

              {quoteSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Quote Request Submitted Successfully</h4>
                  <p className="text-xs text-slate-300">
                    Your parameters have been logged in the TriFlow engine. A formal binding quote and laboratory Certificate of Analysis (CoA) will be generated within 24 hours.
                  </p>
                  <button
                    onClick={() => { setIsQuoteModalOpen(false); setQuoteSubmitted(false); }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Selected Spec Summary Box */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Configured Parameters:</span>
                    <div className="text-slate-300 font-mono text-[11px]">
                      {selectedThickness} • {selectedAdhesive} • {selectedCarrier} • {selectedFormat}
                    </div>
                  </div>

                  {/* Persona Switcher */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserRole("BUYER")}
                      className={`p-2 rounded-lg border font-semibold text-center cursor-pointer transition-colors ${
                        userRole === "BUYER" 
                          ? "bg-blue-600/20 border-blue-500 text-blue-300" 
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      I am an Enterprise Buyer (OEM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRole("CONVERTER")}
                      className={`p-2 rounded-lg border font-semibold text-center cursor-pointer transition-colors ${
                        userRole === "CONVERTER" 
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300" 
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      I am an MSME Converter (Tolling)
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Order Quantity ({selectedFormat.includes("Jumbo") ? "Square Metres" : "Rolls"}):</label>
                    <input
                      type="text"
                      value={quoteQuantity}
                      onChange={(e) => setQuoteQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Delivery Cluster / Pincode:</label>
                    <input
                      type="text"
                      value={quotePincode}
                      onChange={(e) => setQuotePincode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuoteSubmitted(true)}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Request to TriFlow Desk
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
