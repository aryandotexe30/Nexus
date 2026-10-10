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
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 pb-20">
      {/* Category Sub-Navigation Bar */}
      <div className="border-b border-slate-200 bg-white/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 text-xs">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            <span className="font-bold text-[#0B4FDF] border-b-2 border-[#0B4FDF] py-3.5 px-1 whitespace-nowrap cursor-pointer">
              Technical Tapes & Adhesives
            </span>
            <span className="text-slate-600 hover:text-slate-900 cursor-pointer py-3.5 px-1 whitespace-nowrap font-medium">
              Thermal Interface Materials
            </span>
            <span className="text-slate-600 hover:text-slate-900 cursor-pointer py-3.5 px-1 whitespace-nowrap font-medium">
              Surface Protection Films
            </span>
            <span className="text-slate-600 hover:text-slate-900 cursor-pointer py-3.5 px-1 whitespace-nowrap font-medium">
              Specialty Release Liners
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-600 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>TarasAI TriFlow Verified Catalog</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link 
            href="/catalog" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/catalog" className="hover:text-slate-900">Catalog</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Technical Tapes</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">High-Temp Films</span>
          <span className="text-slate-400">/</span>
          <span className="text-[#0B4FDF] font-bold">Polyimide SMT Tape</span>
        </div>

        {/* HERO PRODUCT CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Product Image & Badges (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group shadow-inner">
                {/* Visual Representation of Technical Tape */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/50 via-slate-50 to-blue-50/50" />
                <div className="relative z-10 text-center p-6 space-y-3">
                  <div className="w-32 h-32 mx-auto rounded-full border-8 border-amber-500/30 bg-gradient-to-tr from-amber-600 to-amber-400 shadow-xl shadow-amber-500/20 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-inner">
                      <span className="text-[10px] font-mono text-amber-800 font-bold">33M CORE</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300/60 inline-block font-semibold">
                    Class H (260°C) Insulation
                  </span>
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-700 border border-slate-200 shadow-2xs">
                  SKU: TF-KAPTON-50
                </div>
              </div>

              {/* Verified Specification Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] font-medium">Quality Standard</span>
                    <span className="font-bold text-slate-900">ASTM D3330 & UL 510</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-[#0B4FDF] flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] font-medium">Dielectric Strength</span>
                    <span className="font-bold text-slate-900">6,500 Volts (6.5 kV)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs & Interactive Matrix (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  High-Temp Polyimide SMT Masking Tape
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-sans">
                  Amber polyimide (Kapton equivalent) film tape coated with cross-linked silicone pressure-sensitive adhesive. Engineered for wave soldering, powder coating, and EV battery terminal insulation with zero residue upon peel-off.
                  {showFullDesc && (
                    <span className="text-slate-500 block mt-1.5">
                      Resistant to chemical solvent wash, fluorinated flux, and continuous heat exposure up to 260°C (peak 300°C for 90 seconds). Available in jumbo rolls (500mm x 1000m) or precision slit widths.
                    </span>
                  )}
                  <button 
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="ml-1 text-[#0B4FDF] hover:text-blue-700 font-bold cursor-pointer underline text-xs"
                  >
                    {showFullDesc ? "View less" : "View more"}
                  </button>
                </p>
              </div>

              {/* 3 Trust / Fulfillment Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <FileText className="w-3.5 h-3.5 text-[#0B4FDF]" />
                  <span>ASTM Test Certificate + GST Invoice</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pan-India Temperature Freight</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Firm Quote within 24 Hours</span>
                </div>
              </div>

              {/* AI Assistant Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0B4FDF]" />
                  <span className="text-slate-700">Get live yield calculations, GSM coating data & market updates on</span>
                  <strong className="text-[#0B4FDF] font-bold">Taras Copilot</strong>
                </div>
                <span className="text-[#0B4FDF] font-bold cursor-pointer hover:underline flex items-center gap-1">
                  Ask AI →
                </span>
              </div>

              {/* INTERACTIVE SPECIFICATION MATRIX */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Configure Specifications
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Key specs update quote parameters live
                  </span>
                </div>

                {/* Row 1: Caliper Thickness */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-semibold">Total Caliper Thickness:</label>
                  <div className="flex flex-wrap gap-2">
                    {["25µm (1 mil)", "50µm (2 mil)", "75µm (3 mil)", "125µm (5 mil)"].map((thick) => (
                      <button
                        key={thick}
                        onClick={() => setSelectedThickness(thick)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          selectedThickness === thick
                            ? "bg-[#0B4FDF] text-white shadow-xs border border-[#0B4FDF]"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {thick}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 2: Adhesive Chemistry */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-semibold">Adhesive Chemistry:</label>
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
                            ? "bg-[#0B4FDF] text-white shadow-xs border border-[#0B4FDF]"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {adh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 3: Carrier Substrate */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-semibold">Carrier Substrate Film:</label>
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
                            ? "bg-[#0B4FDF] text-white shadow-xs border border-[#0B4FDF]"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {car}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 4: Delivery Format */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-semibold">Delivery Format:</label>
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
                            ? "bg-[#0B4FDF] text-white shadow-xs border border-[#0B4FDF]"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
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
                  className="w-full py-4 rounded-xl font-bold text-white text-base bg-[#FF5500] hover:bg-[#E04800] transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
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
                className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-[#0B4FDF]/40 hover:bg-white transition-all space-y-2 group cursor-pointer shadow-2xs"
              >
                <div className="w-full h-24 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:scale-102 transition-transform">
                  <Layers className="w-8 h-8 text-slate-400 group-hover:text-[#0B4FDF] transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0B4FDF] transition-colors">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.spec}</p>
                </div>
                <div className="text-xs font-mono font-bold text-[#0B4FDF] pt-1 border-t border-slate-200">
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LATEST PRICE & DUAL-SPREAD BENCHMARKS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>Check Live Pricing & Conversion Spreads</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                ● Live Benchmarks
              </span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Updated Daily from Verified Contracts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Enterprise OEM Rate */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Enterprise OEM Finished Tape</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#0B4FDF] border border-blue-200 font-mono font-bold">
                  Contract Rate (P_C)
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{basePriceMin} - ₹{basePriceMax} <span className="text-sm font-normal text-slate-500">/ Roll</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Delivered to OEM receiving bay (Tata Motors / Foxconn) with ASTM certificate on standard 60-day Net terms.
              </p>
              <button 
                onClick={() => { setUserRole("BUYER"); setIsQuoteModalOpen(true); }}
                className="w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B4FDF] border border-blue-200 text-xs font-bold cursor-pointer transition-colors"
              >
                View OEM Contract Terms →
              </button>
            </div>

            {/* Card 2: MSME Converter Tolling Spread */}
            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">MSME Converter Tolling Margin</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
                  Cashless Tolling
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 tracking-tight">
                +₹25 - ₹35 <span className="text-sm font-normal text-emerald-800">/ Roll Net Profit</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                We supply GE Momentive resin at ₹110/kg and buy back your finished rolls at ₹140/roll. Zero working capital locked.
              </p>
              <button 
                onClick={() => { setUserRole("CONVERTER"); setIsQuoteModalOpen(true); }}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 text-xs font-bold cursor-pointer transition-colors shadow-xs"
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
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0B4FDF]" />
            What Should Buyers & Converters Confirm Before Ordering?
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Confirm your maximum operating temperature threshold (260°C for SMT lead-free solder reflow vs 180°C for transformer winding), target roll width in millimetres (12mm, 19mm, 25mm, or 50mm), and whether you require single-sided adhesive coating or double-sided with release liner backing.
          </p>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl bg-slate-50/70 border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:text-[#0B4FDF] cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[#0B4FDF] text-[11px]">0{idx + 1}</span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180 text-[#0B4FDF]" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200 font-sans pl-10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PLATFORM APP PROMO CARD */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-slate-50 border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
          <div className="space-y-3 max-w-xl z-10">
            <h3 className="text-xl font-black text-slate-900">
              TarasAI: Autonomous Industrial Trade & Liquidity
            </h3>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4 font-sans">
              <li><strong>Discover:</strong> Verified Tier-1 OEM demands and wholesale polymer resins.</li>
              <li><strong>Convert:</strong> Guaranteed offtake with zero working capital lockup.</li>
              <li><strong>Finance:</strong> 24-hour TReDS invoice discounting at 8% annual rate.</li>
              <li><strong>Protect:</strong> AI Sentinel thermodynamic mass-balance audit & scrap fraud immunity.</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs z-10">
            <div className="w-16 h-16 rounded-lg bg-slate-50 p-1 flex items-center justify-center border border-slate-200">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div className="text-xs">
              <span className="text-slate-500 block text-[10px] font-medium">Instant Mobile Access</span>
              <span className="font-bold text-slate-900">Scan for Live Spreads</span>
              <span className="text-[#0B4FDF] font-bold block text-[10px] mt-0.5">iOS & Android WebApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING "ASK TARAS COPILOT" BUTTON (Bottom-Right) */}
      <Link
        href="/agent"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B4FDF] hover:bg-blue-700 text-white font-semibold text-xs shadow-xl transition-transform hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Sparkles className="w-4 h-4 text-white" />
        <span>Ask Taras Copilot</span>
      </Link>

      {/* INTERACTIVE QUOTE & CONTRACT MODAL */}
      <AnimatePresence>
        {isQuoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-2xl relative text-slate-900"
            >
              <button
                onClick={() => { setIsQuoteModalOpen(false); setQuoteSubmitted(false); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-mono font-bold text-[#0B4FDF] uppercase">
                  {userRole === "BUYER" ? "OEM Procurement RFQ" : "Converter Capacity Quota"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Request Contract: Polyimide SMT Tape
                </h3>
              </div>

              {quoteSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Quote Request Submitted Successfully</h4>
                  <p className="text-xs text-slate-600">
                    Your parameters have been logged in the TriFlow engine. A formal binding quote and laboratory Certificate of Analysis (CoA) will be generated within 24 hours.
                  </p>
                  <button
                    onClick={() => { setIsQuoteModalOpen(false); setQuoteSubmitted(false); }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-lg text-white"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Selected Spec Summary Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Configured Parameters:</span>
                    <div className="text-slate-700 font-mono text-[11px]">
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
                          ? "bg-blue-50 border-[#0B4FDF] text-[#0B4FDF]" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      I am an Enterprise Buyer (OEM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRole("CONVERTER")}
                      className={`p-2 rounded-lg border font-semibold text-center cursor-pointer transition-colors ${
                        userRole === "CONVERTER" 
                          ? "bg-emerald-50 border-emerald-600 text-emerald-700" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      I am an MSME Converter (Tolling)
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium">Order Quantity ({selectedFormat.includes("Jumbo") ? "Square Metres" : "Rolls"}):</label>
                    <input
                      type="text"
                      value={quoteQuantity}
                      onChange={(e) => setQuoteQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono focus:border-[#0B4FDF] focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium">Delivery Cluster / Pincode:</label>
                    <input
                      type="text"
                      value={quotePincode}
                      onChange={(e) => setQuotePincode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono focus:border-[#0B4FDF] focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuoteSubmitted(true)}
                    className="w-full py-3 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
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
