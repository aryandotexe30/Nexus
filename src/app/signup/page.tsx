"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Building2, 
  User, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Factory, 
  Briefcase, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  FileSpreadsheet,
  Tag,
  ShoppingCart,
  Cpu,
  Car,
  Zap,
  Plane,
  Sun,
  Tv,
  Building,
  HeartPulse,
  Package,
  Wrench,
  Globe,
  MapPin,
  TrendingDown,
  Clock,
  Award
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// DYNAMIC BUYER INDUSTRY CONFIGURATIONS
// ============================================================================
export interface IndustryConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  categories: string[];
  goals: string[];
}

export const BUYER_INDUSTRIES: IndustryConfig[] = [
  {
    id: "automotive",
    name: "Automotive & EV Manufacturing",
    description: "Passenger cars, commercial vehicles, 2/3W, and EV battery systems",
    icon: Car,
    categories: [
      "EV Battery Thermal Interface Materials (TIM)",
      "High-Strength VHB & Body Panel Acrylic Tapes",
      "NVH Vibration Damping & Acoustic Foams",
      "Wire Harness & Engine Bay Tapes (Class T4/T5)",
      "Automotive Die-Cut Gaskets & Weatherstrips",
      "Surface Protection & Transit Protective Films",
      "Liquid Structural Adhesives & Polyurethanes"
    ],
    goals: [
      "Find Direct Indian Alternative Manufacturers",
      "IATF 16949 & PPAP Compliant Vendors",
      "Consortium Volume Discounts / Group Buying",
      "Reduce Sourcing Lead Times for Production"
    ]
  },
  {
    id: "electronics",
    name: "Electronics, PCB & Semiconductor",
    description: "Consumer electronics, telecom hardware, PCB assembly & IoT",
    icon: Cpu,
    categories: [
      "Polyimide / Kapton High-Temperature Films",
      "Anti-Static (ESD) Shielding & Cleanroom Tapes",
      "Solder Wave Masking & Anodizing Tapes",
      "EMI / RFI Shielding Copper & Aluminum Foils",
      "Thermally Conductive Pastes & Gap Fillers",
      "Optically Clear Adhesives (OCA) for Displays",
      "Electrically Conductive Adhesives (ECA)"
    ],
    goals: [
      "RoHS / REACH Certified Materials",
      "Precision Micro Die-Cut Tolerances",
      "Direct Factory Pricing on Kapton / EMI Foils",
      "Immediate Spot Sourcing for Urgent BOMs"
    ]
  },
  {
    id: "power_electrical",
    name: "Power, Electrical & Transformers",
    description: "Transformers, switchgears, transmission line hardware & motors",
    icon: Zap,
    categories: [
      "CRGO / CRNGO Electrical Steel Cores",
      "Enamelled Copper & Aluminum Winding Wires",
      "High-Voltage Mica & Nomex Insulation Tapes",
      "Transformer Insulating Oil & Dielectric Resins",
      "Epoxy Resin Bushings & Polymer Insulators",
      "Copper Busbars, Strips & Contacts",
      "Medium & High Voltage Switchgear Parts"
    ],
    goals: [
      "CPRI & Bureau of Indian Standards Verified",
      "IS / IEC Standard Compliant Raw Materials",
      "Direct Domestic Sourcing for Govt / Utility Tenders",
      "Annual Rate Contracts & Supply Guarantees"
    ]
  },
  {
    id: "aerospace_defense",
    name: "Aerospace, Defense & Marine",
    description: "Aviation components, naval defense systems & avionics",
    icon: Plane,
    categories: [
      "Flame Retardant (FAR 25.853) Tapes & Foams",
      "Carbon Fiber Prepregs & High-Modulus Resins",
      "Fuel Tank & Polysulfide Aircraft Sealants",
      "High-Temperature Titanium & Inconel Hardware",
      "Radar Absorbent & EMI Attenuation Materials",
      "Cryogenic & Thermal Barrier Blanket Insulation"
    ],
    goals: [
      "AS9100 / Mil-Spec Certified Quality",
      "100% Lot Traceability & Certificate of Conformance (CoC)",
      "Custom Engineering & Specialized Formulation",
      "Secure Domestic Supply Chains"
    ]
  },
  {
    id: "renewables",
    name: "Renewable Energy (Solar & Wind)",
    description: "Solar PV module manufacturing, inverters & wind turbine blades",
    icon: Sun,
    categories: [
      "Solar PV Backsheet & Fluoropolymer Films",
      "EVA / POE Solar Cell Encapsulant Sheets",
      "Junction Box Silicone Adhesives & Sealants",
      "Wind Blade Structural Epoxy & Infusion Resins",
      "UV-Resistant Edge Sealing Tapes",
      "Grounding & Lightning Protection Conductive Foils"
    ],
    goals: [
      "25-Year Outdoor Weathering Durability (IEC 61215)",
      "High-Volume Container Sourcing Pricing",
      "Direct Factory Tie-Ups with Indian Converters",
      "Local Content Requirement (ALMM) Compliance"
    ]
  },
  {
    id: "appliances",
    name: "Consumer Appliances & White Goods",
    description: "Refrigeration, HVAC, washing machines & consumer durables",
    icon: Tv,
    categories: [
      "Refrigerator Vacuum Insulation Panels (VIP)",
      "Aluminum Foil Evaporator & Condenser Tapes",
      "Glass Door Structural Bonding Acrylic Foams",
      "EPDM & PU Foam Gaskets for Sealing",
      "Scratch-Resistant Appliance Surface Films",
      "Instant Cyanoacrylate & Threadlocker Adhesives"
    ],
    goals: [
      "BEE Star Rating Energy Efficiency Materials",
      "Automated High-Speed Dispensing Compatibility",
      "Targeted 15-25% Bill-of-Materials Cost Reduction",
      "Vendor Consolidation Across Plants"
    ]
  },
  {
    id: "building_facades",
    name: "Building, Facades & Architecture",
    description: "Structural glazing, curtain walls, ACP cladding & interior fitouts",
    icon: Building,
    categories: [
      "Structural Glazing Neutral Silicone Sealants",
      "High-Strength ACP Cladding VHB Tapes",
      "Weatherproof Waterproofing Flashing Membranes",
      "Acoustic Insulation & Firestop Intumescent Foams",
      "Double-Sided Mirror Mounting Tapes",
      "Glass Protection & Transit Surface Films"
    ],
    goals: [
      "ASTM C1184 & 20-Year Warranty Support",
      "High Wind-Load Shear & Dynamic Stress Compliance",
      "Job-Site Bulk Supply & Logistics Support",
      "Direct Architectural Consultant Approvals"
    ]
  },
  {
    id: "medical_devices",
    name: "Medical Devices & Healthcare",
    description: "Diagnostic equipment, surgical wearables, consumables & labware",
    icon: HeartPulse,
    categories: [
      "Skin-Contact Biocompatible Tapes (ISO 10993)",
      "Hydrocolloid & Polyurethane Dressing Films",
      "Diagnostic Microfluidic Spacer Double-Coated Tapes",
      "Sterile Medical Device Packaging Pouches",
      "Medical Grade Liquid Silicones & UV Curables"
    ],
    goals: [
      "Cleanroom Manufactured (ISO Class 7/8)",
      "Gamma / EtO / Autoclave Sterilization Stable",
      "USP Class VI Biocompatibility Documentation",
      "Audit-Ready Quality Assurance"
    ]
  },
  {
    id: "industrial_general",
    name: "General Industrial Manufacturing & Converting",
    description: "Machinery, industrial fabrication, packaging & general assembly",
    icon: Wrench,
    categories: [
      "Heavy-Duty Industrial Packaging & Strapping Tapes",
      "Abrasive Sanding Belts, Discs & Flap Wheels",
      "Industrial Reclosable Dual-Lock Fasteners",
      "High-Strength Retaining Compounds & Epoxies",
      "General Purpose Masking & Duct Tapes",
      "Custom Precision Die-Cut Components"
    ],
    goals: [
      "Best Factory-Direct Volume Pricing",
      "Fast 24-48hr Dispatch on Standard Sizes",
      "Custom Slitting, Log Rolling & Die-Cutting",
      "Single-Source Multi-Category Vendor"
    ]
  }
];

export const ANNUAL_SPEND_OPTIONS = [
  { id: "tier1", label: "Under ₹50 Lakhs / year", desc: "Small to mid-size operations" },
  { id: "tier2", label: "₹50 Lakhs – ₹2 Crores / year", desc: "Growing manufacturing plant" },
  { id: "tier3", label: "₹2 Crores – ₹10 Crores / year", desc: "Multi-line manufacturing enterprise" },
  { id: "tier4", label: "₹10 Crores+ / Global Enterprise", desc: "High-volume OEM / Tier-1 procurement" }
];

export const SELLER_PRODUCT_CATEGORIES = [
  "Adhesive Tapes & Transfer Films",
  "Liquid Adhesives & Structural Sealants",
  "Foams, Gaskets & Cushioning",
  "Thermal Interface Materials (TIM)",
  "Electrical & High-Dielectric Insulation",
  "Optical, Display & Barrier Films",
  "EMI / RFI Shielding & Conductive Foils",
  "Protective Films & Surface Protection",
  "Specialty Industrial Packaging & Strapping",
  "Custom Precision Die-Cut Components",
  "Abrasives, Polishing & Surface Finishing",
  "Industrial Fasteners & Reclosables",
  "Specialty Polymers, Resins & Raw Compounds",
  "Transformers & Power Electrical Machinery",
  "Cables, Conductors & Winding Wires",
  "Switchgear, Panels & Automation Equipment",
  "Other Industrial Materials & Consumables"
] as const;

interface SellerProductItem {
  name: string;
  category: string;
  productType: string;
  sideType: string;
  backing: string;
  adhesionType: string;
  thickness: string;
  tempRange: string;
  application: string;
  price: string;
  specs?: Record<string, string>;
}

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "seller" ? "SELLER" : "BUYER";

  const [accountType, setAccountType] = useState<"BUYER" | "SELLER">(initialRole);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Base Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "Procurement Manager",
    email: "",
    password: "",
    companyName: "",
    gstNumber: "",
    udyamNumber: "",
    cinNumber: "",
    personalEmail: "",
    companyPhone: "",
    personalPhone: "",
    industry: "Automotive & EV Manufacturing",
    selectedIndustryId: "automotive",
    annualSpend: "₹50 Lakhs – ₹2 Crores / year",
    deliveryLocations: "",
    buyerRequirements: "",
    agreedToTerms: false
  });

  // Dynamic Selected Categories for Buyer (multi-select)
  const [selectedBuyerCategories, setSelectedBuyerCategories] = useState<string[]>(
    BUYER_INDUSTRIES[0].categories.slice(0, 4)
  );

  // Dynamic Selected Goals for Buyer (multi-select)
  const [selectedBuyerGoals, setSelectedBuyerGoals] = useState<string[]>(
    [BUYER_INDUSTRIES[0].goals[0], BUYER_INDUSTRIES[0].goals[1]]
  );

  // Custom Category Input for Buyer
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Seller Products State
  const [sellerProducts, setSellerProducts] = useState<SellerProductItem[]>([
    {
      name: "",
      category: "Adhesive Tapes & Transfer Films",
      productType: "Tape",
      sideType: "Single-Sided",
      backing: "Polyimide Film",
      adhesionType: "Silicone",
      thickness: "0.05 mm (50 µm)",
      tempRange: "260°C",
      application: "High-temperature masking & electronic insulation",
      price: ""
    }
  ]);

  // Catalog Ingestion Mode for Seller
  const [ingestionMode, setIngestionMode] = useState<"manual" | "upload">("manual");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync role from query if changed
  useEffect(() => {
    if (searchParams.get("role") === "seller") {
      setAccountType("SELLER");
    } else if (searchParams.get("role") === "buyer") {
      setAccountType("BUYER");
    }
  }, [searchParams]);

  // When industry changes, dynamically update default categories & goals
  const handleIndustryChange = (indId: string) => {
    const found = BUYER_INDUSTRIES.find(i => i.id === indId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        selectedIndustryId: indId,
        industry: found.name
      }));
      setSelectedBuyerCategories(found.categories.slice(0, 4));
      setSelectedBuyerGoals([found.goals[0], found.goals[1] || ""]);
    }
  };

  const toggleBuyerCategory = (cat: string) => {
    if (selectedBuyerCategories.includes(cat)) {
      setSelectedBuyerCategories(selectedBuyerCategories.filter(c => c !== cat));
    } else {
      setSelectedBuyerCategories([...selectedBuyerCategories, cat]);
    }
  };

  const addCustomBuyerCategory = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (customCategoryInput.trim() && !selectedBuyerCategories.includes(customCategoryInput.trim())) {
      setSelectedBuyerCategories([...selectedBuyerCategories, customCategoryInput.trim()]);
      setCustomCategoryInput("");
    }
  };

  const toggleBuyerGoal = (goal: string) => {
    if (selectedBuyerGoals.includes(goal)) {
      setSelectedBuyerGoals(selectedBuyerGoals.filter(g => g !== goal));
    } else {
      setSelectedBuyerGoals([...selectedBuyerGoals, goal]);
    }
  };

  const maxSteps = accountType === "SELLER" ? 4 : 3;

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!formData.email || !formData.password) {
        setError("Work Email and password are required.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.companyName || !formData.gstNumber) {
        setError("Company Name and GSTIN / Tax ID are required for business verification.");
        return;
      }
      if (accountType === "BUYER" && selectedBuyerCategories.length === 0) {
        setError("Please select at least one material/product category you plan to source.");
        return;
      }
      setStep(3);
    } else if (step === 3 && accountType === "SELLER") {
      const validProducts = sellerProducts.filter(p => p.name.trim().length > 0);
      if (validProducts.length === 0) {
        setError("Please add at least one product specification or upload a catalog file.");
        return;
      }
      setStep(4);
    }
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  // Add a new empty product row for Seller
  const handleAddProduct = () => {
    setSellerProducts([
      ...sellerProducts,
      {
        name: "",
        category: "Adhesive Tapes & Transfer Films",
        productType: "Tape",
        sideType: "Single-Sided",
        backing: "Polyimide Film",
        adhesionType: "Silicone",
        thickness: "0.05 mm (50 µm)",
        tempRange: "260°C",
        application: "Industrial engineering application",
        price: ""
      }
    ]);
  };

  // Remove a product row for Seller
  const handleRemoveProduct = (index: number) => {
    if (sellerProducts.length === 1) {
      setSellerProducts([{
        name: "",
        category: "Adhesive Tapes & Transfer Films",
        productType: "Tape",
        sideType: "Single-Sided",
        backing: "Polyimide Film",
        adhesionType: "Silicone",
        thickness: "0.05 mm (50 µm)",
        tempRange: "260°C",
        application: "",
        price: ""
      }]);
      return;
    }
    setSellerProducts(sellerProducts.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = (index: number, field: keyof SellerProductItem, value: string) => {
    const updated = [...sellerProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSellerProducts(updated);
  };

  // Handle AI File / Spreadsheet Upload for Seller
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setError("");
    setParseSuccessMsg("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("companyName", formData.companyName || "Manufacturer");

      const res = await fetch("/api/seller/parse-catalog", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse document");
      }

      if (Array.isArray(data.products) && data.products.length > 0) {
        const normalized = data.products.map((p: any) => ({
          name: p.name || "",
          category: p.category || "Adhesive Tapes & Transfer Films",
          productType: p.productType || "Tape",
          sideType: p.sideType || "Single-Sided",
          backing: p.backing || "Specialty Substrate",
          adhesionType: p.adhesionType || "Polymer Adhesive",
          thickness: p.thickness || "Standard",
          tempRange: p.tempRange || "Industrial Grade",
          application: p.application || "Industrial engineering",
          price: p.price || "",
          specs: p.specs
        }));

        setSellerProducts(normalized);
        setParseSuccessMsg(`✨ AI successfully extracted ${normalized.length} products across categories from ${file.name}! Review below.`);
        setIngestionMode("manual");
      } else {
        throw new Error("No products found in file.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse brochure or spreadsheet.");
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Final Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const validProducts = accountType === "SELLER" 
        ? sellerProducts.filter(p => p.name.trim().length > 0)
        : [];

      const payload = {
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        companyPhone: formData.companyPhone || "+91 00000 00000",
        personalPhone: formData.personalPhone || undefined,
        personalEmail: formData.personalEmail || undefined,
        cinNumber: formData.cinNumber || undefined,
        udyamNumber: formData.udyamNumber || undefined,
        industry: formData.industry,
        accountType,
        designation: formData.designation,
        sourcingCategories: accountType === "BUYER" ? selectedBuyerCategories : undefined,
        annualSpend: accountType === "BUYER" ? formData.annualSpend : undefined,
        procurementNeeds: accountType === "BUYER" ? selectedBuyerGoals : undefined,
        deliveryLocations: accountType === "BUYER" ? formData.deliveryLocations : undefined,
        buyerRequirements: accountType === "BUYER" ? formData.buyerRequirements : undefined,
        products: validProducts
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register account");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const currentIndustryConfig = BUYER_INDUSTRIES.find(i => i.id === formData.selectedIndustryId) || BUYER_INDUSTRIES[0];
  const IndustryIcon = currentIndustryConfig.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden py-12 selection:bg-blue-600/40">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      {accountType === "SELLER" && (
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-3xl pointer-events-none transition-all duration-700" />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${(step === 2 && accountType === "BUYER") || (step === 3 && accountType === "SELLER") ? "max-w-4xl" : "max-w-2xl"} bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-2xl relative z-10 transition-all duration-300`}
      >
        {/* ========================================================= */}
        {/* TOP DUAL-TAB ROLE SELECTOR                                */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/90 border border-slate-800/90 rounded-2xl mb-8 gap-1.5 shadow-inner">
          {/* TAB 1: BUYER */}
          <button
            type="button"
            onClick={() => { setAccountType("BUYER"); setStep(1); setError(""); }}
            className={`py-3 px-4 rounded-xl text-left transition-all relative flex flex-col justify-center ${
              accountType === "BUYER"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <ShoppingCart className={`w-4 h-4 ${accountType === "BUYER" ? "text-white" : "text-blue-400"}`} />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">Sign up as a Buyer</span>
            </div>
            <p className={`text-[11px] leading-tight line-clamp-1 ${accountType === "BUYER" ? "text-blue-100" : "text-slate-500"}`}>
              Source materials, launch RFQs & compare specs
            </p>
          </button>

          {/* TAB 2: SELLER */}
          <button
            type="button"
            onClick={() => { setAccountType("SELLER"); setStep(1); setError(""); }}
            className={`py-3 px-4 rounded-xl text-left transition-all relative flex flex-col justify-center ${
              accountType === "SELLER"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <Factory className={`w-4 h-4 ${accountType === "SELLER" ? "text-white" : "text-emerald-400"}`} />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">Sign up as a Seller</span>
            </div>
            <p className={`text-[11px] leading-tight line-clamp-1 ${accountType === "SELLER" ? "text-emerald-100" : "text-slate-500"}`}>
              List product catalogs & receive RFQs
            </p>
          </button>
        </div>

        {/* Step Header & Indicator */}
        <div className="text-center mb-8">
          <div className={`w-14 h-14 ${accountType === "SELLER" ? "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20" : "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20"} rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg transition-colors`}>
            {step === 1 && <User className="w-7 h-7 text-white" />}
            {step === 2 && (accountType === "BUYER" ? <IndustryIcon className="w-7 h-7 text-white" /> : <Briefcase className="w-7 h-7 text-white" />)}
            {step === 3 && (accountType === "SELLER" ? <Layers className="w-7 h-7 text-white" /> : <ShieldCheck className="w-7 h-7 text-white" />)}
            {step === 4 && <ShieldCheck className="w-7 h-7 text-white" />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {accountType === "BUYER" ? (
              <>
                {step === 1 && "Enterprise Buyer Setup"}
                {step === 2 && "Company & Industry Sourcing Profile"}
                {step === 3 && "Procurement Goals & Verification"}
              </>
            ) : (
              <>
                {step === 1 && "Manufacturer & Seller Registration"}
                {step === 2 && "Manufacturing Plant & Tax Details"}
                {step === 3 && "Product Catalog & Materials Ingestion"}
                {step === 4 && "Terms & Compliance Verification"}
              </>
            )}
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {accountType === "BUYER" ? (
              <>
                {step === 1 && "Step 1: Your corporate work identity & credentials."}
                {step === 2 && "Step 2: Tell us your industry & exact materials you procure."}
                {step === 3 && "Step 3: Set sourcing priorities and unlock instant manufacturer access."}
              </>
            ) : (
              <>
                {step === 1 && "Step 1: Setup manufacturer login and corporate credentials."}
                {step === 2 && "Step 2: Corporate details, GSTIN, and manufacturing domains."}
                {step === 3 && "Step 3: Ingest your product specifications manually or via AI brochure upload."}
                {step === 4 && "Step 4: Final verification and catalog publication."}
              </>
            )}
          </p>
          
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: maxSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                  step >= i + 1 
                    ? (accountType === "SELLER" ? "bg-emerald-500" : "bg-blue-500") 
                    : "bg-slate-800"
                }`} 
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        {parseSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-emerald-300 font-medium">{parseSuccessMsg}</p>
          </div>
        )}

        <form onSubmit={step === maxSteps ? handleSubmit : nextStep} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* ========================================================= */}
            {/* STEP 1: CREDENTIALS (BOTH BUYER & SELLER)                */}
            {/* ========================================================= */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {accountType === "BUYER" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Full Name / Contact Person *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                          className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                          placeholder="e.g. Rajesh Sharma"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Official Designation / Role *
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text"
                          required
                          value={formData.designation}
                          onChange={e => setFormData({...formData, designation: e.target.value})}
                          className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                          placeholder="e.g. Sourcing Head / Procurement Manager"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    {accountType === "BUYER" ? "Corporate Work Email (Login) *" : "Manufacturer / Supplier Work Email (Login) *"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 font-medium"
                      placeholder={accountType === "BUYER" ? "procurement@enterprise.com" : "sales@manufacturer.com"}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">We verify company domains to grant instant access to verified supplier pricing.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Password *</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Minimum 8 characters with letters & numbers.</p>
                </div>

                <button 
                  type="submit" 
                  className={`w-full ${accountType === "SELLER" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"} text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group text-sm mt-2`}
                >
                  {accountType === "BUYER" ? "Continue to Industry Sourcing Profile" : "Continue to Company Details"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 2 (BUYER): DYNAMIC INDUSTRY & SOURCING PROFILE       */}
            {/* ========================================================= */}
            {step === 2 && accountType === "BUYER" && (
              <motion.div 
                key="step2-buyer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Company & GST Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Company / OEM Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={e => setFormData({...formData, companyName: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                        placeholder="e.g. Mahindra Auto / Havells / Tata Electronics"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      GSTIN / Corporate Tax ID *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        required
                        value={formData.gstNumber}
                        onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 uppercase font-mono"
                        placeholder="27AAAAA0000A1Z5"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Industry Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>Select Primary Manufacturing Vertical / Industry *</span>
                    <span className="text-blue-400 text-[11px] font-normal">Adapts sourcing catalog</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                    {BUYER_INDUSTRIES.map(ind => {
                      const IconComponent = ind.icon;
                      const isSelected = formData.selectedIndustryId === ind.id;
                      return (
                        <button
                          key={ind.id}
                          type="button"
                          onClick={() => handleIndustryChange(ind.id)}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50 shadow-md"
                              : "bg-slate-950/60 border-slate-800/90 text-slate-400 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <IconComponent className={`w-5 h-5 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                          </div>
                          <span className="text-xs font-bold leading-tight">{ind.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DYNAMIC SOURCING CATEGORIES (CHIPS) */}
                <div className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5 text-blue-400" />
                      Materials & Components You Procure ({selectedBuyerCategories.length} selected)
                    </label>
                    <span className="text-[11px] text-slate-400">Click to toggle</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentIndustryConfig.categories.map(cat => {
                      const isChecked = selectedBuyerCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleBuyerCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isChecked
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                              : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {isChecked ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Category Field */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                    <input 
                      type="text"
                      value={customCategoryInput}
                      onChange={e => setCustomCategoryInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomBuyerCategory(e); } }}
                      placeholder="Add custom material or specification (e.g. 0.27mm CRGO, PTFE Skived Tape, RTV Gasket)..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomBuyerCategory}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Annual Spend & Factory Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Estimated Annual Materials Spend
                    </label>
                    <select 
                      value={formData.annualSpend}
                      onChange={e => setFormData({...formData, annualSpend: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 px-3.5 text-xs focus:outline-none focus:border-blue-500 transition-all font-medium"
                    >
                      {ANNUAL_SPEND_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.label}>
                          {opt.label} — {opt.desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Plant / Delivery Locations
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        value={formData.deliveryLocations}
                        onChange={e => setFormData({...formData, deliveryLocations: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                        placeholder="e.g. Pune, Manesar, Bengaluru, Chennai"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group text-sm shadow-lg shadow-blue-600/30"
                  >
                    Proceed to Sourcing Goals & Access
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 3 (BUYER): PROCUREMENT GOALS, IMMEDIATE RFQ & TERMS  */}
            {/* ========================================================= */}
            {step === 3 && accountType === "BUYER" && (
              <motion.div 
                key="step3-buyer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Dynamic Primary Procurement Goals */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>Primary Procurement Priorities</span>
                    <span className="text-slate-500 text-[11px] font-normal">Select all that apply</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentIndustryConfig.goals.map(goal => {
                      const isChecked = selectedBuyerGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleBuyerGoal(goal)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                            isChecked
                              ? "bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 ${isChecked ? "bg-blue-500 text-white" : "border border-slate-700"}`}>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-medium leading-tight">{goal}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Immediate Active Requirements or Part Numbers */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                    <span>Active Sourcing Requirements / Part Numbers (Optional)</span>
                    <span className="text-emerald-400 text-[11px]">Instant AI Match</span>
                  </label>
                  <textarea 
                    rows={2}
                    value={formData.buyerRequirements}
                    onChange={e => setFormData({...formData, buyerRequirements: e.target.value})}
                    placeholder="e.g. Looking for direct manufacturer alternates for 3M 4910, Kapton 5413 tape, 0.27mm CRGO core laminations, or Loctite 243 with bulk monthly dispatch..."
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl p-3 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                {/* Authorized Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Procurement Direct Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="tel"
                      required
                      value={formData.companyPhone}
                      onChange={e => setFormData({...formData, companyPhone: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Used to dispatch verified RFQ responses and price quotes directly to your desk.</p>
                </div>

                {/* Free Instant Access Banner */}
                <div className="p-3.5 bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-slate-950/80 border border-blue-800/60 rounded-2xl flex items-center gap-3">
                  <Award className="w-6 h-6 text-blue-400 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-blue-200">Verified Enterprise Buyer Account</div>
                    <div className="text-slate-400 text-[11px]">Includes 3 free AI Sourcing queries and immediate access to 1,084+ direct Indian manufacturer catalogs.</div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3 pt-1">
                  <input 
                    type="checkbox" 
                    id="terms-buyer" 
                    checked={formData.agreedToTerms}
                    onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})}
                    className="mt-1 w-4 h-4 bg-slate-900 border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950 cursor-pointer" 
                  />
                  <label htmlFor="terms-buyer" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <a href="/terms-of-service" target="_blank" className="text-blue-400 hover:underline">Terms of Service</a> and{' '}
                    <a href="/privacy-policy" target="_blank" className="text-blue-400 hover:underline">Privacy Policy</a>.
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 text-sm"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Complete Buyer Registration & Start Sourcing
                        <ShieldCheck className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 2 (FOR SELLER): MANUFACTURING & TAX DETAILS          */}
            {/* ========================================================= */}
            {step === 2 && accountType === "SELLER" && (
              <motion.div 
                key="step2-seller"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Manufacturing Plant / Supplier Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                      placeholder="e.g. Apex Polymer Converting Ltd"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">GSTIN / Tax ID *</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        required
                        value={formData.gstNumber}
                        onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600 uppercase font-mono"
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Corporate CIN (Optional)</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        value={formData.cinNumber}
                        onChange={e => setFormData({...formData, cinNumber: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                        placeholder="U72900MH..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Primary Manufacturing Domain</label>
                  <div className="relative">
                    <Factory className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select 
                      value={formData.industry}
                      onChange={e => setFormData({...formData, industry: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    >
                      <option value="Specialty Tapes & Adhesives Manufacturing">Specialty Tapes & Adhesives</option>
                      <option value="Electrical & Power Equipment (Transformers/Switchgear)">Electrical & Power Equipment (Transformers/Switchgear)</option>
                      <option value="Polymer, Foam & Gasket Converting">Polymer, Foam & Gasket Converting</option>
                      <option value="Thermal Interface & Dielectric Insulation">Thermal Interface & Dielectric Insulation</option>
                      <option value="Optical, Display & Barrier Films">Optical, Display & Barrier Films</option>
                      <option value="EMI / RFI Shielding & Conductive Foils">EMI / RFI Shielding & Conductive Foils</option>
                      <option value="Abrasives & Surface Finishing">Abrasives & Surface Finishing</option>
                      <option value="Industrial Packaging & Fasteners">Industrial Packaging & Fasteners</option>
                      <option value="General Industrial Materials">General Industrial Materials</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Plant / Office Contact Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="tel"
                      required
                      value={formData.companyPhone}
                      onChange={e => setFormData({...formData, companyPhone: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group text-sm shadow-lg shadow-emerald-600/30"
                  >
                    Proceed to Materials Ingestion
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 3 (FOR SELLER): PRODUCTS & MATERIALS INGESTION       */}
            {/* ========================================================= */}
            {step === 3 && accountType === "SELLER" && (
              <motion.div 
                key="step3-seller"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Ingestion Mode Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Product Catalog Specifications ({sellerProducts.filter(p => p.name.trim()).length} Active)
                    </h3>
                    <p className="text-xs text-slate-400">Add materials across any industrial category or let AI parse your brochure.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIngestionMode("manual")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ingestionMode === "manual" 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      Manual Entry
                    </button>
                    <button
                      type="button"
                      onClick={() => setIngestionMode("upload")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        ingestionMode === "upload" 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      AI Brochure / Excel Upload
                    </button>
                  </div>
                </div>

                {/* AI FILE DROPZONE */}
                {ingestionMode === "upload" && (
                  <div className="p-6 bg-slate-950/80 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-3xl text-center space-y-4 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">Upload Technical Brochure, Datasheet, or Excel</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Supports all products: Tapes, Adhesives, Transformers, Switchgear, Foams, TIM Pads, Insulation, Cables. Upload <span className="text-emerald-300 font-mono">.xlsx</span>, <span className="text-emerald-300 font-mono">.csv</span>, <span className="text-emerald-300 font-mono">.pdf</span>, or images.
                      </p>
                    </div>

                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="seller-file-upload"
                    />

                    <div>
                      <button
                        type="button"
                        disabled={isParsingFile}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {isParsingFile ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            AI Normalizing Multi-Category Specifications...
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-4 h-4" />
                            Select Brochure or Excel File
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* MANUAL PRODUCT ROWS */}
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {sellerProducts.map((product, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" /> Product Item #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(idx)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                          title="Remove Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Category Dropdown */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Product Category / Material Family *
                        </label>
                        <select
                          value={product.category || SELLER_PRODUCT_CATEGORIES[0]}
                          onChange={e => handleUpdateProduct(idx, "category", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                        >
                          {SELLER_PRODUCT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Name & Format */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Product Model / Specification Title *</label>
                          <input 
                            type="text"
                            required
                            value={product.name}
                            onChange={e => handleUpdateProduct(idx, "name", e.target.value)}
                            placeholder="e.g. Polyimide High-Temp Film or RTV Industrial Silicone Gasket"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Format / Side Coating</label>
                          <select
                            value={product.sideType}
                            onChange={e => handleUpdateProduct(idx, "sideType", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Single-Sided">Single-Sided</option>
                            <option value="Double-Sided">Double-Sided</option>
                            <option value="Transfer">Adhesive Transfer Film</option>
                            <option value="N/A (Liquid / Non-Adhesive)">N/A (Equipment / Component / Liquid)</option>
                          </select>
                        </div>
                      </div>

                      {/* Substrate & Chemistry */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Substrate / Base Material</label>
                          <input 
                            type="text"
                            value={product.backing}
                            onChange={e => handleUpdateProduct(idx, "backing", e.target.value)}
                            placeholder="e.g. Polyimide / CRGO Steel / EPDM / Glass Cloth / Copper"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Adhesive / Coating System</label>
                          <input 
                            type="text"
                            value={product.adhesionType}
                            onChange={e => handleUpdateProduct(idx, "adhesionType", e.target.value)}
                            placeholder="e.g. Silicone / Epoxy Resin / Pure Acrylic / Enamel"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Caliper, Temp, Price */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Caliper / Rating / Size</label>
                          <input 
                            type="text"
                            value={product.thickness}
                            onChange={e => handleUpdateProduct(idx, "thickness", e.target.value)}
                            placeholder="e.g. 0.05 mm / 33 kV / 150 cP"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Temperature Resistance</label>
                          <input 
                            type="text"
                            value={product.tempRange}
                            onChange={e => handleUpdateProduct(idx, "tempRange", e.target.value)}
                            placeholder="e.g. 260°C / 180°C / -40°C to 150°C"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Price / MOQ</label>
                          <input 
                            type="text"
                            value={product.price}
                            onChange={e => handleUpdateProduct(idx, "price", e.target.value)}
                            placeholder="e.g. ₹320 / roll ($4.20) / MOQ 500 units"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Application */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Primary Industrial Applications</label>
                        <input 
                          type="text"
                          value={product.application}
                          onChange={e => handleUpdateProduct(idx, "application", e.target.value)}
                          placeholder="e.g. EV battery pack insulation, transformer core winding, wave solder masking"
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Product / Material
                  </button>
                  <span className="text-xs font-mono text-slate-400">
                    {sellerProducts.filter(p => p.name.trim()).length} specifications configured
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group text-sm shadow-lg shadow-emerald-600/30"
                  >
                    Review & Complete Seller Verification
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 4 (FOR SELLER): KYC & FINAL PUBLICATION              */}
            {/* ========================================================= */}
            {step === 4 && accountType === "SELLER" && (
              <motion.div 
                key="step4-seller"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Authorized Officer Personal Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email"
                      value={formData.personalEmail}
                      onChange={e => setFormData({...formData, personalEmail: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                      placeholder="officer.personal@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Personal / Mobile Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="tel"
                        value={formData.personalPhone}
                        onChange={e => setFormData({...formData, personalPhone: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                        placeholder="+91..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Udyam Registration (Optional)</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        value={formData.udyamNumber}
                        onChange={e => setFormData({...formData, udyamNumber: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                        placeholder="UDYAM-MH-00..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl space-y-1 text-xs">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {sellerProducts.filter(p => p.name.trim()).length} Products & Materials Configured for Ingestion
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Your specifications will be normalized, indexed, and published to the TarasAI Master Catalog upon registration.
                  </p>
                </div>

                <div className="flex items-start gap-3 mt-4 mb-2">
                  <input 
                    type="checkbox" 
                    id="terms-seller" 
                    checked={formData.agreedToTerms}
                    onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})}
                    className="mt-1 w-4 h-4 bg-slate-900 border-slate-700 rounded text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer" 
                  />
                  <label htmlFor="terms-seller" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                    I attest that this information is accurate and I agree to the{' '}
                    <a href="/terms-of-service" target="_blank" className="text-emerald-400 hover:underline">Terms of Service</a> and{' '}
                    <a href="/privacy-policy" target="_blank" className="text-emerald-400 hover:underline">Privacy Policy</a>.
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 text-sm"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Complete Seller Registration & Ingest Catalog
                        <ShieldCheck className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="mt-8 text-center text-slate-400 text-xs sm:text-sm">
          Already registered on TarasAI?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
