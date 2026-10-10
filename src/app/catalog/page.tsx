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
  Sparkles, 
  ShieldCheck, 
  Send, 
  X, 
  CheckCircle2, 
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TapeProductVisual from "@/components/TapeProductVisual";

export interface CatalogProduct {
  id: string;
  name: string;
  specs: string;
  priceEstimate: string;
  visualType: 
    | "polyimide" 
    | "vhb-red" 
    | "vhb-clear"
    | "vhb-black"
    | "green-masking" 
    | "copper-foil" 
    | "glass-cloth" 
    | "cloth-fleece" 
    | "pvc-blue" 
    | "pvc-black" 
    | "tim-pad" 
    | "aluminum-foil"
    | "pet-clear"
    | "filament";
  slug: string;
  sku: string;
  standard: string;
}

export interface CatalogSubCategory {
  id: string;
  name: string;
  count: number;
  description: string;
  products: CatalogProduct[];
}

export const CATALOG_DATA: CatalogSubCategory[] = [
  {
    id: "high-temp-smt",
    name: "High-Temp Polyimide & SMT Tapes",
    count: 6,
    description: "Amber Kapton-equivalent dielectric films, wave solder masking, cleanroom ESD shielding, and high-voltage transformer wraps with crosslinked silicone pressure-sensitive adhesive.",
    products: [
      {
        id: "p1",
        name: "Polyimide SMT Masking Tape",
        specs: "260°C • 50µm • Silicone PSA",
        priceEstimate: "₹145 - ₹165 / Roll",
        visualType: "polyimide",
        slug: "polyimide-smt-tape",
        sku: "TARAS-PI-5413",
        standard: "ASTM D3330 • UL 510"
      },
      {
        id: "p2",
        name: "Anti-Static ESD Polyimide Tape",
        specs: "10^6 - 10^9 Ω • Low Charge (<50V)",
        priceEstimate: "₹210 - ₹245 / Roll",
        visualType: "polyimide",
        slug: "esd-dissipative-tape",
        sku: "TARAS-PI-ESD",
        standard: "ANSI/ESD S20.20"
      },
      {
        id: "p3",
        name: "Amber Wave Solder Masking Tape",
        specs: "280°C Peak • 65µm • Clean Peel",
        priceEstimate: "₹155 - ₹180 / Roll",
        visualType: "polyimide",
        slug: "amber-masking-tape",
        sku: "TARAS-PI-280",
        standard: "Zero Residue ASTM"
      },
      {
        id: "p4",
        name: "High-Tensile Glass Cloth Tape",
        specs: "200°C Class H • Solventless Silicone",
        priceEstimate: "₹180 - ₹210 / Roll",
        visualType: "glass-cloth",
        slug: "glass-cloth-tape",
        sku: "TARAS-GC-200",
        standard: "IS 13357 / IEC"
      },
      {
        id: "p5",
        name: "Low-Static Semiconductor Film",
        specs: "Removes Below 50V • Cleanroom ISO 6",
        priceEstimate: "₹230 - ₹260 / Roll",
        visualType: "polyimide",
        slug: "low-static-polyimide",
        sku: "TARAS-PI-LS50",
        standard: "Cleanroom Class 6"
      },
      {
        id: "p6",
        name: "Silicone Splicing Polyimide Tape",
        specs: "Ultra-Thin 25µm • High Dynamic Shear",
        priceEstimate: "₹135 - ₹155 / Roll",
        visualType: "polyimide",
        slug: "silicone-splicing-tape",
        sku: "TARAS-PI-SPLICE",
        standard: "High-Tack Silicone"
      }
    ]
  },
  {
    id: "structural-vhb",
    name: "Structural Acrylic Foam & VHB Tapes",
    count: 6,
    description: "Viscoelastic solid acrylic foam bonding tapes engineered to eliminate rivets, screws, and welds across automotive panels, EV battery casings, and architectural facade cladding.",
    products: [
      {
        id: "p7",
        name: "Acrylic Foam VHB Tape 1.0mm",
        specs: "1000µm Solid Core • High Dynamic Shear",
        priceEstimate: "₹380 - ₹430 / Roll",
        visualType: "vhb-red",
        slug: "acrylic-foam-vhb",
        sku: "TARAS-VAF-1000",
        standard: "ASTM D3654 • IATF"
      },
      {
        id: "p8",
        name: "Thin Acrylic Foam Tape 0.5mm",
        specs: "500µm • Bezel & Emblem High Bond",
        priceEstimate: "₹290 - ₹340 / Roll",
        visualType: "vhb-red",
        slug: "thin-acrylic-foam",
        sku: "TARAS-VAF-0500",
        standard: "High Cohesion"
      },
      {
        id: "p9",
        name: "Clear Optical Acrylic Bonding Tape",
        specs: "Optically Clear Solid Acrylic • Glass Bond",
        priceEstimate: "₹420 - ₹480 / Roll",
        visualType: "vhb-clear",
        slug: "clear-optical-vhb",
        sku: "TARAS-VAF-4910",
        standard: "100% Solid Acrylic"
      },
      {
        id: "p10",
        name: "Automotive Black Body Foam Tape",
        specs: "1.1mm Weatherproof • Trim & Molding",
        priceEstimate: "₹360 - ₹415 / Roll",
        visualType: "vhb-black",
        slug: "black-automotive-foam",
        sku: "TARAS-VAF-5952",
        standard: "IATF 16949 Aligned"
      },
      {
        id: "p11",
        name: "Pre-Paint High-Temp Foam Tape",
        specs: "230°C Powder Coat Bake Resistance",
        priceEstimate: "₹440 - ₹495 / Roll",
        visualType: "vhb-black",
        slug: "prepaint-hightemp-foam",
        sku: "TARAS-VAF-GPH",
        standard: "230°C Cure Stable"
      },
      {
        id: "p12",
        name: "Plasticizer-Resistant Gray Foam",
        specs: "1.1mm • Multi-Surface Vinyl Bonding",
        priceEstimate: "₹390 - ₹440 / Roll",
        visualType: "vhb-black",
        slug: "gray-industrial-foam",
        sku: "TARAS-VAF-4941",
        standard: "Plasticizer Immune"
      }
    ]
  },
  {
    id: "double-sided",
    name: "Industrial Double-Sided Filmic Tapes",
    count: 6,
    description: "High-adhesion double-coated polyester, tissue, and transfer adhesive films with differential release liners for automotive extrusions, nameplates, and electronic assemblies.",
    products: [
      {
        id: "p13",
        name: "Clear PET Double-Sided Tape",
        specs: "Tesa 4965 Type • Red MOPP Release Liner",
        priceEstimate: "₹165 - ₹195 / Roll",
        visualType: "pet-clear",
        slug: "clear-pet-double-sided",
        sku: "TARAS-DS-4965",
        standard: "ASTM D3330 22N/25mm"
      },
      {
        id: "p14",
        name: "Non-Woven Tissue Double-Sided",
        specs: "9080A Type • High Initial Tack 150µm",
        priceEstimate: "₹110 - ₹135 / Roll",
        visualType: "pet-clear",
        slug: "tissue-double-sided",
        sku: "TARAS-DS-9080",
        standard: "High Initial Tack"
      },
      {
        id: "p15",
        name: "High-Performance Transfer Film",
        specs: "468MP Adhesive Transfer • 130µm Pure Acrylic",
        priceEstimate: "₹240 - ₹280 / Roll",
        visualType: "pet-clear",
        slug: "transfer-adhesive-film",
        sku: "TARAS-AT-468",
        standard: "Solvent Resistant"
      },
      {
        id: "p16",
        name: "Optically Clear Adhesive (OCA Film)",
        specs: "Display Screen Lamination • 175µm Ultra-Clear",
        priceEstimate: "₹450 - ₹520 / Pack",
        visualType: "vhb-clear",
        slug: "oca-optical-film",
        sku: "TARAS-OCA-175",
        standard: "99.8% Transmission"
      },
      {
        id: "p17",
        name: "Differential Removable Film Tape",
        specs: "Permanent Face / Clean-Peel Liner Side",
        priceEstimate: "₹185 - ₹215 / Roll",
        visualType: "pet-clear",
        slug: "differential-removable-tape",
        sku: "TARAS-DS-DIFF",
        standard: "Dual Chemistry"
      },
      {
        id: "p18",
        name: "Cross-Filament Strapping Tape",
        specs: "High-Tensile Glass Yarn Core • Heavy Bundling",
        priceEstimate: "₹140 - ₹165 / Roll",
        visualType: "filament",
        slug: "cross-filament-tape",
        sku: "TARAS-STRAP-FIL",
        standard: "Extreme Tensile"
      }
    ]
  },
  {
    id: "process-masking",
    name: "Surface Protection & Process Masking",
    count: 6,
    description: "Heavy-duty powder coating green films, clean-removal surface protection, and high-temperature crepe paper masking tapes for precision industrial manufacturing.",
    products: [
      {
        id: "p19",
        name: "Green Powder Coating Masking Tape",
        specs: "220°C Bake • 85µm Polyester • Clean Removal",
        priceEstimate: "₹190 - ₹225 / Roll",
        visualType: "green-masking",
        slug: "green-powder-coating-tape",
        sku: "TARAS-MASK-220",
        standard: "3M 8992 Equivalent"
      },
      {
        id: "p20",
        name: "Automotive Crepe Masking Tape",
        specs: "120°C Oven Bake • Clean Paint Line",
        priceEstimate: "₹95 - ₹120 / Roll",
        visualType: "filament",
        slug: "crepe-masking-tape",
        sku: "TARAS-MASK-120",
        standard: "Automotive Paint"
      },
      {
        id: "p21",
        name: "PE Surface Protection Film",
        specs: "Low-Tack Blue / Clear Film • Zero Ghosting",
        priceEstimate: "₹18 - ₹24 / sq.m",
        visualType: "pvc-blue",
        slug: "pe-surface-protection-film",
        sku: "TARAS-PROT-PE",
        standard: "Optical Substrates"
      },
      {
        id: "p22",
        name: "Sandblasting Heavy-Duty Barrier Tape",
        specs: "Thick Rubber Backing • Abrasion Resistant",
        priceEstimate: "₹340 - ₹390 / Roll",
        visualType: "glass-cloth",
        slug: "sandblast-barrier-tape",
        sku: "TARAS-BLAST-RUB",
        standard: "Severe Grit Tested"
      },
      {
        id: "p23",
        name: "Electroplating Chemical Masking Tape",
        specs: "Acid & Alkali Resistant Vinyl Backing",
        priceEstimate: "₹210 - ₹250 / Roll",
        visualType: "pvc-black",
        slug: "electroplating-masking-tape",
        sku: "TARAS-PLATING-VIN",
        standard: "Chemical Anodizing"
      },
      {
        id: "p24",
        name: "Glass Cloth Class H Masking Tape",
        specs: "200°C High-Tensile • Flame Retardant",
        priceEstimate: "₹195 - ₹225 / Roll",
        visualType: "glass-cloth",
        slug: "glass-cloth-masking-tape",
        sku: "TARAS-GC-CLASS-H",
        standard: "UL 510 Flame Rated"
      }
    ]
  },
  {
    id: "thermal-emi",
    name: "Thermal Management & EMI Shielding",
    count: 6,
    description: "Conductive copper and aluminum foil tapes, compressible silicone gap filler pads, and synthetic graphite heat spreaders for EV batteries and power electronics.",
    products: [
      {
        id: "p25",
        name: "Ultra-Therm Silicone Gap Pad (6.0 W/m-K)",
        specs: "6.0 W/m-K • High Compressibility • UL 94 V-0",
        priceEstimate: "₹1,450 - ₹1,700 / Sheet",
        visualType: "tim-pad",
        slug: "silicone-gap-pad-60",
        sku: "TARAS-TIM-6000",
        standard: "ASTM D5470 • IATF"
      },
      {
        id: "p26",
        name: "Ultra-Therm Standard Gap Pad (3.2 W/m-K)",
        specs: "3.2 W/m-K • Low Outgassing ASTM E595",
        priceEstimate: "₹680 - ₹820 / Sheet",
        visualType: "tim-pad",
        slug: "silicone-gap-pad-32",
        sku: "TARAS-TIM-3000",
        standard: "UL 94 V-0 Certified"
      },
      {
        id: "p27",
        name: "Copper Foil EMI Shielding Tape",
        specs: "Conductive Acrylic PSA • 85 dB Attenuation",
        priceEstimate: "₹280 - ₹340 / Roll",
        visualType: "copper-foil",
        slug: "copper-foil-emi-tape",
        sku: "TARAS-EMI-CU1181",
        standard: "MIL-STD-285 EMI"
      },
      {
        id: "p28",
        name: "Aluminum Foil Heat Reflective Tape",
        specs: "50µm Dead Soft Foil • Flame Spread UL 723",
        priceEstimate: "₹140 - ₹175 / Roll",
        visualType: "aluminum-foil",
        slug: "aluminum-foil-tape",
        sku: "TARAS-FOIL-AL50",
        standard: "UL 723 Vapor Seal"
      },
      {
        id: "p29",
        name: "Synthetic Graphite Heat Spreader",
        specs: "1500 W/m-K In-Plane Conductivity",
        priceEstimate: "₹590 - ₹690 / Sheet",
        visualType: "cloth-fleece",
        slug: "graphite-heat-spreader",
        sku: "TARAS-TIM-GRAPH",
        standard: "Ultra-High K-Value"
      },
      {
        id: "p30",
        name: "Thermally Conductive Transfer Tape",
        specs: "Ceramic Filled Acrylic • 1.2 W/m-K",
        priceEstimate: "₹310 - ₹360 / Roll",
        visualType: "tim-pad",
        slug: "thermal-transfer-tape",
        sku: "TARAS-TIM-8810",
        standard: "Bond & Dissipate"
      }
    ]
  },
  {
    id: "electrical-machinery",
    name: "Electrical Machinery & Wire Harness",
    count: 6,
    description: "High-voltage transformer mica tapes, automotive noise-dampening harness fleece, and flame-retardant electrical vinyl tapes for utilities and OEM manufacturing.",
    products: [
      {
        id: "p31",
        name: "ElectraShield Mica Glass Cloth Tape",
        specs: "18 kV/mm Breakdown • IEC 60331 Fire Safe",
        priceEstimate: "₹540 - ₹620 / Roll",
        visualType: "glass-cloth",
        slug: "mica-glass-cloth-tape",
        sku: "TARAS-MICA-800",
        standard: "CPRI Tested IS 13357"
      },
      {
        id: "p32",
        name: "Automotive Wire Harness Fleece Tape",
        specs: "Class C Noise Dampening • Tesa 51608 Type",
        priceEstimate: "₹85 - ₹105 / Roll",
        visualType: "cloth-fleece",
        slug: "wire-harness-fleece-tape",
        sku: "TARAS-HARN-516",
        standard: "LV 312 OEM Standard"
      },
      {
        id: "p33",
        name: "FR PVC Electrical Tape (Blue)",
        specs: "IS 7809 • 6 kV Breakdown • Flame Retardant",
        priceEstimate: "₹38 - ₹48 / Roll",
        visualType: "pvc-blue",
        slug: "pvc-electrical-tape-blue",
        sku: "TARAS-PVC-BLU",
        standard: "BIS IS 7809 Certified"
      },
      {
        id: "p34",
        name: "FR PVC Electrical Tape (Black)",
        specs: "IS 7809 • Weatherproof Vinyl • Non-Flagging",
        priceEstimate: "₹38 - ₹48 / Roll",
        visualType: "pvc-black",
        slug: "pvc-electrical-tape-black",
        sku: "TARAS-PVC-BLK",
        standard: "BIS IS 7809 Certified"
      },
      {
        id: "p35",
        name: "Self-Amalgamating Rubber Splicing Tape",
        specs: "High-Voltage Cable Jointing • Water Seal 35 kV",
        priceEstimate: "₹180 - ₹220 / Roll",
        visualType: "pvc-black",
        slug: "self-amalgamating-rubber-tape",
        sku: "TARAS-RUB-35KV",
        standard: "Emergency Splicing"
      },
      {
        id: "p36",
        name: "Nomex Aramid Insulation Tape",
        specs: "Class H 180°C Transformer Barrier",
        priceEstimate: "₹320 - ₹380 / Roll",
        visualType: "glass-cloth",
        slug: "nomex-aramid-insulation-tape",
        sku: "TARAS-NMX-410",
        standard: "High Dielectric"
      }
    ]
  }
];

export default function CatalogBrowsePage() {
  const [selectedSubCatId, setSelectedSubCatId] = useState<string>("ALL");
  const [showFullDesc, setShowFullDesc] = useState(false);

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
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 pb-20">
      {/* 1. TOP HORIZONTAL CATEGORY BAR */}
      <div className="border-b border-slate-200 bg-white/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 text-xs">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            <span 
              onClick={() => setSelectedSubCatId("ALL")}
              className={`py-3.5 px-1 whitespace-nowrap cursor-pointer font-bold ${
                selectedSubCatId === "ALL" 
                  ? "text-[#0B4FDF] border-b-2 border-[#0B4FDF]" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Technical Tapes
            </span>
            <span 
              onClick={() => setSelectedSubCatId("high-temp-smt")}
              className={`py-3.5 px-1 whitespace-nowrap cursor-pointer font-medium ${
                selectedSubCatId === "high-temp-smt" 
                  ? "text-[#0B4FDF] border-b-2 border-[#0B4FDF] font-bold" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Polyimide & SMT
            </span>
            <span 
              onClick={() => setSelectedSubCatId("structural-vhb")}
              className={`py-3.5 px-1 whitespace-nowrap cursor-pointer font-medium ${
                selectedSubCatId === "structural-vhb" 
                  ? "text-[#0B4FDF] border-b-2 border-[#0B4FDF] font-bold" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Structural Foam & VHB
            </span>
            <span 
              onClick={() => setSelectedSubCatId("double-sided")}
              className={`py-3.5 px-1 whitespace-nowrap cursor-pointer font-medium ${
                selectedSubCatId === "double-sided" 
                  ? "text-[#0B4FDF] border-b-2 border-[#0B4FDF] font-bold" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Double-Sided Filmic
            </span>
            <span 
              onClick={() => setSelectedSubCatId("process-masking")}
              className={`py-3.5 px-1 whitespace-nowrap cursor-pointer font-medium ${
                selectedSubCatId === "process-masking" 
                  ? "text-[#0B4FDF] border-b-2 border-[#0B4FDF] font-bold" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Process Masking
            </span>
            <span 
              onClick={() => setSelectedSubCatId("thermal-emi")}
              className={`py-3.5 px-1 whitespace-nowrap cursor-pointer font-medium ${
                selectedSubCatId === "thermal-emi" 
                  ? "text-[#0B4FDF] border-b-2 border-[#0B4FDF] font-bold" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Thermal TIM & EMI
            </span>
            <span 
              onClick={() => setSelectedSubCatId("electrical-machinery")}
              className={`py-3.5 px-1 whitespace-nowrap cursor-pointer font-medium ${
                selectedSubCatId === "electrical-machinery" 
                  ? "text-[#0B4FDF] border-b-2 border-[#0B4FDF] font-bold" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Electrical & Wire Harness
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Pan-India Supply & Tolling Network</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 2. BREADCRUMBS */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span className="text-slate-400">/</span>
          <span className="text-[#0B4FDF] font-bold">Industrial Technical Tapes</span>
        </div>

        {/* 3. CATEGORY TITLE, INTRO & TRUST BADGES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Technical Tapes — Bulk High-Temp & Structural Sourcing in India
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-sans max-w-4xl">
              TarasAI supplies precision engineered industrial tapes across polyimide, acrylic foam, PET polyester, fiberglass cloth, copper foil, and wire harness fleece. Enterprise OEMs and MSME converters can browse exact physical product specifications for automotive, electronics, power transformers, and appliance manufacturing.
              {showFullDesc && (
                <span className="text-slate-500 block mt-1.5">
                  All production lots undergo ASTM D3330 180° peel adhesion, ASTM D3654 thermal shear, and dielectric voltage testing. Master jumbo rolls available for contract converting with raw silicone resin supplied under GST Job-Work.
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

          {/* 3 Trust Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-[#0B4FDF]" />
              <span>ASTM D3330 Lab Report + GST Tax Invoice</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Dispatch from Pune / Gujarat / NCR</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Binding Price Quotation within 24 Hours</span>
            </div>
          </div>
        </div>

        {/* 4. MAIN BROWSE LAYOUT (SIDEBAR TREE + PRODUCT CARDS GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Vertical Subcategory Tree (3 cols) */}
          <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs sticky top-16">
            <div className="pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Tape Subcategories</h3>
              <span className="text-[11px] font-mono text-[#0B4FDF] font-bold">36 Products</span>
            </div>

            <ul className="space-y-1 text-xs">
              <li>
                <button
                  onClick={() => setSelectedSubCatId("ALL")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-bold transition-colors cursor-pointer ${
                    selectedSubCatId === "ALL"
                      ? "bg-[#0B4FDF] text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>All Product Lines</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    selectedSubCatId === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    36
                  </span>
                </button>
              </li>

              {CATALOG_DATA.map((subCat) => {
                const isActive = selectedSubCatId === subCat.id;
                return (
                  <li key={subCat.id}>
                    <button
                      onClick={() => setSelectedSubCatId(subCat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#0B4FDF] text-white font-bold shadow-xs"
                          : "text-slate-700 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      <span className="truncate">{subCat.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ml-2 ${
                        isActive ? "bg-white/20 text-white font-bold" : "bg-slate-100 text-slate-500"
                      }`}>
                        {subCat.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* AI Yield Calculator Prompt Card */}
            <div className="mt-5 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B4FDF]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Width Slitting?</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Ask Taras Copilot for exact roll yield calculations from master jumbo rolls (e.g. 500mm x 1000m logs).
              </p>
              <Link 
                href="/agent" 
                className="inline-block text-[11px] font-bold text-[#0B4FDF] hover:underline"
              >
                Launch Slitting Calculator →
              </Link>
            </div>
          </aside>

          {/* Right Product Grid Area (9 cols) */}
          <main className="lg:col-span-9 space-y-8">
            {displayedSubCategories.map((subCat) => (
              <section key={subCat.id} className="space-y-4">
                {/* Subcategory Header */}
                <div className="border-b border-slate-200 pb-3">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {subCat.name}
                    </h2>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {subCat.count} Items Available
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {subCat.description}
                  </p>
                </div>

                {/* 3x2 Product Grid (6 items) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {subCat.products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#0B4FDF]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group shadow-xs"
                    >
                      {/* Product Visual (Authentic Tape Roll Component) */}
                      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/3] bg-slate-50 overflow-hidden">
                        <TapeProductVisual 
                          type={product.visualType} 
                          badge={product.sku}
                          className="w-full h-full"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-800 font-bold border border-slate-200 shadow-2xs">
                          {product.standard}
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0B4FDF] transition-colors leading-tight">
                              {product.name}
                            </h3>
                          </Link>
                          <span className="text-[11px] font-mono text-slate-500 block">
                            {product.specs}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">
                            Indicative Rate:
                          </span>
                          <span className="text-xs font-mono font-black text-emerald-700">
                            {product.priceEstimate}
                          </span>
                        </div>

                        {/* Two Action Buttons (View Detail & Get Quote) */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Link
                            href={`/products/${product.slug}`}
                            className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition-colors"
                          >
                            View Detail
                          </Link>
                          <button
                            onClick={() => { setModalProduct(product); setIsQuoteModalOpen(true); }}
                            className="py-2 px-3 rounded-lg bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-extrabold text-center transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B4FDF] hover:bg-blue-700 text-white font-bold text-xs shadow-xl transition-transform hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Sparkles className="w-4 h-4 text-white" />
        <span>Ask Taras Copilot</span>
      </Link>

      {/* QUICK QUOTE MODAL */}
      <AnimatePresence>
        {isQuoteModalOpen && modalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl relative text-slate-900"
            >
              <button
                onClick={() => { setIsQuoteModalOpen(false); setQuoteSubmitted(false); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-mono font-bold text-[#0B4FDF] uppercase tracking-wider">
                  {userRole === "BUYER" ? "OEM Procurement RFQ" : "Converter Capacity Quota"}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Request Quotation: {modalProduct.name}
                </h3>
              </div>

              {quoteSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Quote Request Submitted</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Your RFQ for <strong>{modalProduct.name}</strong> ({quoteQuantity} units) has been routed to our supply desk. A binding quotation with test certificates will be sent within 24 hours.
                  </p>
                  <button
                    onClick={() => { setIsQuoteModalOpen(false); setQuoteSubmitted(false); }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-lg text-white"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Selected Spec Summary Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white">
                      <TapeProductVisual 
                        type={modalProduct.visualType}
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-xs">{modalProduct.name}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {modalProduct.sku} • {modalProduct.specs}
                      </div>
                    </div>
                  </div>

                  {/* Persona Switcher */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserRole("BUYER")}
                      className={`p-2.5 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                        userRole === "BUYER" 
                          ? "bg-blue-50 border-[#0B4FDF] text-[#0B4FDF]" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      I am an OEM Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRole("CONVERTER")}
                      className={`p-2.5 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                        userRole === "CONVERTER" 
                          ? "bg-emerald-50 border-emerald-600 text-emerald-700" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      I am an MSME Converter
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Target Quantity (Rolls / Logs):</label>
                    <input
                      type="text"
                      value={quoteQuantity}
                      onChange={(e) => setQuoteQuantity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:border-[#0B4FDF] focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Delivery Location / Pincode:</label>
                    <input
                      type="text"
                      value={quotePincode}
                      onChange={(e) => setQuotePincode(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:border-[#0B4FDF] focus:bg-white outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuoteSubmitted(true)}
                    className="w-full py-3.5 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Formal RFQ to TriFlow Desk
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
