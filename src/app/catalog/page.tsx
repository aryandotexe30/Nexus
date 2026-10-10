"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  Truck, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  X, 
  CheckCircle2, 
  Sliders,
  Filter,
  Layers,
  Building2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CatalogProduct {
  id: string;
  name: string;
  specs: string;
  priceEstimate: string;
  image: string;
  slug: string;
}

interface CatalogSubCategory {
  id: string;
  name: string;
  count: number;
  description: string;
  products: CatalogProduct[];
}

const CATALOG_DATA: CatalogSubCategory[] = [
  {
    id: "high-temp-smt",
    name: "High-Temp SMT Films",
    count: 6,
    description: "High-temp dielectric films covering SMT masking, wave solder protection, powder coating, and battery cell insulation specified by thickness, adhesive chemistry, section width, and length.",
    products: [
      {
        id: "p1",
        name: "Polyimide SMT Tape",
        specs: "260°C • 50µm • Silicone PSA",
        priceEstimate: "₹145 - ₹165 / Roll",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
        slug: "polyimide-smt-tape"
      },
      {
        id: "p2",
        name: "Amber Masking Tape",
        specs: "280°C • 65µm • Clean Peel",
        priceEstimate: "₹155 - ₹175 / Roll",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
        slug: "amber-masking-tape"
      },
      {
        id: "p3",
        name: "ESD Dissipative Tape",
        specs: "10^6 - 10^9 Ω • Static Shield",
        priceEstimate: "₹190 - ₹215 / Roll",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
        slug: "esd-dissipative-tape"
      },
      {
        id: "p4",
        name: "Glass Cloth Tape",
        specs: "200°C • High Tensile • Solventless",
        priceEstimate: "₹180 - ₹205 / Roll",
        image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80",
        slug: "glass-cloth-tape"
      },
      {
        id: "p5",
        name: "Low-Static Polyimide",
        specs: "Removes Below 50V Charge",
        priceEstimate: "₹220 - ₹250 / Roll",
        image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80",
        slug: "low-static-polyimide"
      },
      {
        id: "p6",
        name: "Silicone Splicing Tape",
        specs: "Ultra-Thin 25µm • High Shear",
        priceEstimate: "₹130 - ₹150 / Roll",
        image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=400&q=80",
        slug: "silicone-splicing-tape"
      }
    ]
  },
  {
    id: "structural-vhb",
    name: "Structural Foam & VHB",
    count: 6,
    description: "Viscoelastic acrylic foam bonding tapes replacing mechanical rivets, welds, and screws across automotive body panels, solar modules, and architectural facade cladding.",
    products: [
      {
        id: "p7",
        name: "Acrylic Foam VHB 1.1mm",
        specs: "Viscoelastic • High Dynamic Shear",
        priceEstimate: "₹380 - ₹430 / Roll",
        image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=400&q=80",
        slug: "acrylic-foam-vhb"
      },
      {
        id: "p8",
        name: "Clear Optical VHB",
        specs: "Optically Clear • Glass Bonding",
        priceEstimate: "₹420 - ₹480 / Roll",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
        slug: "clear-optical-vhb"
      },
      {
        id: "p9",
        name: "Black Automotive Foam",
        specs: "Weather Resistant • UV Sealed",
        priceEstimate: "₹360 - ₹410 / Roll",
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80",
        slug: "black-automotive-foam"
      },
      {
        id: "p10",
        name: "PE Foam Mounting Tape",
        specs: "Closed Cell • Cushion Damping",
        priceEstimate: "₹95 - ₹120 / Roll",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
        slug: "pe-foam-mounting-tape"
      },
      {
        id: "p11",
        name: "EVA Double-Sided Foam",
        specs: "High Initial Tack • Gap Filling",
        priceEstimate: "₹85 - ₹110 / Roll",
        image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
        slug: "eva-double-sided-foam"
      },
      {
        id: "p12",
        name: "Thermal Die-Cut Foam",
        specs: "Precision Gasket Shapes",
        priceEstimate: "₹450 - ₹520 / Pack",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
        slug: "thermal-die-cut-foam"
      }
    ]
  },
  {
    id: "thermal-emi",
    name: "Thermal & EMI Shielding",
    count: 4,
    description: "Conductive metal foils and thermal interface substrates providing high electromagnetic interference shielding and continuous heat dissipation for EV battery packs and electronics.",
    products: [
      {
        id: "p13",
        name: "Copper Foil EMI Tape",
        specs: "Conductive Adhesive • 85 dB Shield",
        priceEstimate: "₹280 - ₹340 / Roll",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
        slug: "copper-foil-emi-tape"
      },
      {
        id: "p14",
        name: "Aluminum Foil Tape",
        specs: "Flame Retardant UL 723 • Vapor Seal",
        priceEstimate: "₹140 - ₹175 / Roll",
        image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80",
        slug: "aluminum-foil-tape"
      },
      {
        id: "p15",
        name: "Graphite Heat Spreader",
        specs: "1500 W/m-K In-Plane • Ultra-Thin",
        priceEstimate: "₹650 - ₹750 / Sheet",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
        slug: "graphite-heat-spreader"
      },
      {
        id: "p16",
        name: "Thermal Gap Filler Pad",
        specs: "3.0 W/m-K • Dielectric Silicone",
        priceEstimate: "₹520 - ₹610 / Pack",
        image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80",
        slug: "thermal-gap-filler-pad"
      }
    ]
  }
];

export default function CatalogBrowsePage() {
  const [selectedSubCatId, setSelectedSubCatId] = useState<string>("ALL");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Modal State
  const [modalProduct, setModalProduct] = useState<CatalogProduct | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteQuantity, setQuoteQuantity] = useState("5,000");
  const [quotePincode, setQuotePincode] = useState("411018 (Pune MIDC)");
  const [userRole, setUserRole] = useState<"BUYER" | "CONVERTER">("BUYER");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const displayedSubCategories = selectedSubCatId === "ALL" 
    ? CATALOG_DATA 
    : CATALOG_DATA.filter(sc => sc.id === selectedSubCatId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* 1. TOP HORIZONTAL CATEGORY BAR */}
      <div className="border-b border-slate-800 bg-slate-900/60 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 text-xs">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            <span className="font-semibold text-blue-400 border-b-2 border-blue-500 py-3.5 px-1 whitespace-nowrap cursor-pointer">
              Technical Tapes
            </span>
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer py-3.5 px-1 whitespace-nowrap">
              Thermal Materials
            </span>
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer py-3.5 px-1 whitespace-nowrap">
              Polymers & Resins
            </span>
            <span className="text-slate-400 hover:text-slate-200 cursor-pointer py-3.5 px-1 whitespace-nowrap">
              Surface Protection
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pan-India Supply & Tolling Network</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 2. BREADCRUMBS */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/" className="hover:text-slate-200">Home</Link>
          <span className="text-slate-600">/</span>
          <span className="text-blue-400 font-medium">Technical Tapes</span>
        </div>

        {/* 3. CATEGORY TITLE, INTRO & TRUST BADGES */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Technical Tapes — Bulk High-Temp & Structural Sourcing in India
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-sans max-w-4xl">
              TarasAI supplies precision engineered industrial tapes across polyimide, acrylic foam, PET polyester, fiberglass, copper foil, and wire harness fleece. Buyers and MSME converters can move from the category to the exact specification needed for automotive, electronics, and appliance production.
              {showFullDesc && (
                <span className="text-slate-400 block mt-1.5">
                  All lots undergo ASTM D3330 180° peel adhesion, ASTM D3654 thermal shear, and dielectric voltage testing. Master jumbo rolls available for contract converting with raw silicone resin supplied under GST Job-Work.
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

          {/* 3 Trust Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>ASTM D3330 & UL 510 Lab Test Certificate + GST Invoice</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pan-India Temperature-Controlled Logistics</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firm Quote & Sample Lot within 24 Hours</span>
            </div>
          </div>
        </div>

        {/* 4. TWO-COLUMN BROWSE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: CATEGORY TREE (3 cols on lg) */}
          <aside className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 sticky top-16 shadow-sm">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Category Tree
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">All Subcategories</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                High-Temp SMT · Structural Foam · Thermal & EMI · Release Liners
              </p>
            </div>

            {/* Tree Navigation List */}
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setSelectedSubCatId("ALL")}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between font-medium transition-colors cursor-pointer ${
                  selectedSubCatId === "ALL"
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span>View All Products</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">16</span>
              </button>

              {CATALOG_DATA.map((subCat) => {
                const isActive = selectedSubCatId === subCat.id;
                return (
                  <div key={subCat.id} className="space-y-1">
                    <button
                      onClick={() => setSelectedSubCatId(subCat.id)}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate">{subCat.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono shrink-0">
                        {subCat.count}
                      </span>
                    </button>

                    {/* Sub-items list if active */}
                    {isActive && (
                      <div className="pl-3 py-1 space-y-1 border-l border-blue-500/40 ml-3">
                        {subCat.products.map((p) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            className="block text-[11px] text-slate-400 hover:text-blue-300 py-1 truncate transition-colors"
                          >
                            • {p.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Sourcing Help Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Need Custom Slit Widths?</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Our vetted converting plants slit jumbo rolls from 3mm to 1250mm with ±0.1mm tolerance.
              </p>
              <Link 
                href="/agent" 
                className="text-blue-400 hover:underline block text-[11px] font-bold"
              >
                Upload Technical Drawing →
              </Link>
            </div>
          </aside>

          {/* RIGHT COLUMN: MAIN PRODUCT GRIDS (9 cols on lg) */}
          <main className="lg:col-span-9 space-y-10">
            {displayedSubCategories.map((subCat) => (
              <section key={subCat.id} className="space-y-4">
                {/* Subcategory Header */}
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {subCat.name}
                    </h2>
                    <span className="text-xs font-mono text-slate-500">
                      {subCat.products.length} Specifications Available
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    {subCat.description}
                  </p>
                </div>

                {/* 3x2 Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subCat.products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group shadow-sm"
                    >
                      {/* Product Image */}
                      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/3] bg-slate-950 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-white/10">
                          ASTM D3330
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                              {product.name}
                            </h3>
                          </Link>
                          <span className="text-[11px] font-mono text-slate-400 block">
                            {product.specs}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">
                            Benchmark Rate:
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {product.priceEstimate}
                          </span>
                        </div>

                        {/* Two Action Buttons (View Detail & Get Quote) */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Link
                            href={`/products/${product.slug}`}
                            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors"
                          >
                            View Detail
                          </Link>
                          <button
                            onClick={() => { setModalProduct(product); setIsQuoteModalOpen(true); }}
                            className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Get Quote</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>

      {/* FLOATING "ASK TARAS COPILOT" BUTTON */}
      <Link
        href="/agent"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-2xl shadow-blue-500/40 hover:from-blue-500 hover:to-indigo-500 transition-transform hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Sparkles className="w-4 h-4 text-white" />
        <span>Ask Taras Copilot</span>
      </Link>

      {/* INTERACTIVE RFQ & OFFTAKE MODAL */}
      <AnimatePresence>
        {isQuoteModalOpen && modalProduct && (
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
                  Request Quote: {modalProduct.name}
                </h3>
                <p className="text-xs text-slate-400">{modalProduct.specs}</p>
              </div>

              {quoteSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Quote Request Submitted</h4>
                  <p className="text-xs text-slate-300">
                    Your request has been routed to the TriFlow liquidity desk. An official contract offer with Certificate of Analysis (CoA) will be issued within 24 hours.
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
                    <label className="text-slate-400 font-medium">Order Quantity (Rolls / Packs):</label>
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
