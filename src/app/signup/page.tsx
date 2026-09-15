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
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SellerProductItem {
  name: string;
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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    gstNumber: "",
    udyamNumber: "",
    industry: "Manufacturing",
    cinNumber: "",
    personalEmail: "",
    companyPhone: "",
    personalPhone: "",
    agreedToTerms: false
  });

  // Seller Products State
  const [sellerProducts, setSellerProducts] = useState<SellerProductItem[]>([
    {
      name: "",
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

  // Catalog Ingestion Mode
  const [ingestionMode, setIngestionMode] = useState<"manual" | "upload">("manual");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync role from query if changes
  useEffect(() => {
    if (searchParams.get("role") === "seller") {
      setAccountType("SELLER");
    }
  }, [searchParams]);

  const maxSteps = accountType === "SELLER" ? 4 : 3;

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!formData.email || !formData.password) {
        setError("Email and password are required.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.companyName || !formData.gstNumber) {
        setError("Company Name and GSTIN / Tax ID are required.");
        return;
      }
      if (accountType === "SELLER") {
        setStep(3); // Go to Materials Ingestion
      } else {
        setStep(3); // Go to Buyer Terms
      }
    } else if (step === 3 && accountType === "SELLER") {
      // Validate that at least one product has a name
      const validProducts = sellerProducts.filter(p => p.name.trim().length > 0);
      if (validProducts.length === 0) {
        setError("Please add at least one material/product specification or upload a brochure.");
        return;
      }
      setStep(4); // Go to Seller Terms
    }
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  // Add a new empty product row
  const handleAddProduct = () => {
    setSellerProducts([
      ...sellerProducts,
      {
        name: "",
        productType: "Tape",
        sideType: "Single-Sided",
        backing: "Polyimide Film",
        adhesionType: "Silicone",
        thickness: "0.05 mm (50 µm)",
        tempRange: "260°C",
        application: "Industrial bonding and masking",
        price: ""
      }
    ]);
  };

  // Remove a product row
  const handleRemoveProduct = (index: number) => {
    if (sellerProducts.length === 1) {
      setSellerProducts([{
        name: "",
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

  // Update a single product field
  const handleUpdateProduct = (index: number, field: keyof SellerProductItem, value: string) => {
    const updated = [...sellerProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSellerProducts(updated);
  };

  // Handle AI File / Spreadsheet Upload
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
        setSellerProducts(data.products);
        setParseSuccessMsg(`✨ AI successfully extracted ${data.products.length} materials from ${file.name}! Review below.`);
        setIngestionMode("manual"); // Switch to view extracted rows
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

  // Submit Final Registration
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
        ...formData,
        accountType,
        industry: formData.industry || (accountType === "SELLER" ? "Tape & Adhesive Manufacturing" : "Industrial Manufacturing"),
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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Subtle Atmospheric Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${step === 3 && accountType === "SELLER" ? "max-w-4xl" : "max-w-xl"} bg-slate-900/70 backdrop-blur-2xl border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-2xl relative z-10 transition-all duration-300`}
      >
        {/* Account Role Selector Header */}
        <div className="flex items-center justify-center gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-8 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => { setAccountType("BUYER"); setStep(1); }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
              accountType === "BUYER"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Enterprise Buyer
          </button>
          <button
            type="button"
            onClick={() => { setAccountType("SELLER"); setStep(1); }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              accountType === "SELLER"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            Sign in as a Seller
          </button>
        </div>

        {/* Step Indicator */}
        <div className="text-center mb-8">
          <div className={`w-14 h-14 ${accountType === "SELLER" ? "bg-gradient-to-tr from-emerald-600 to-teal-500" : "bg-gradient-to-tr from-blue-600 to-indigo-600"} rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20`}>
            {step === 1 && <User className="w-7 h-7 text-white" />}
            {step === 2 && <Briefcase className="w-7 h-7 text-white" />}
            {step === 3 && (accountType === "SELLER" ? <Layers className="w-7 h-7 text-white" /> : <ShieldCheck className="w-7 h-7 text-white" />)}
            {step === 4 && <ShieldCheck className="w-7 h-7 text-white" />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {step === 1 && (accountType === "SELLER" ? "Seller Registration" : "Create Buyer Account")}
            {step === 2 && "Company & Tax Details"}
            {step === 3 && (accountType === "SELLER" ? "Materials & Products Ingestion" : "Identity Verification")}
            {step === 4 && "Terms & Final Verification"}
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {step === 1 && "Step 1: Setup your credentials and company login."}
            {step === 2 && "Step 2: Basic corporate and manufacturing details."}
            {step === 3 && (accountType === "SELLER" 
              ? "Step 3: Add your manufactured materials manually or upload a technical brochure." 
              : "Step 3: Complete verification and account setup.")}
            {step === 4 && "Step 4: Review compliance and finalize seller listing."}
          </p>
          
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: maxSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-10 rounded-full transition-colors ${
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
            {/* STEP 1: CREDENTIALS                                       */}
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
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    {accountType === "SELLER" ? "Manufacturer Work Email (Login)" : "Company Work Email (Login)"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="sales@manufacturer.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Minimum 8 characters with letters & numbers.</p>
                </div>

                <button 
                  type="submit" 
                  className={`w-full ${accountType === "SELLER" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"} text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group text-sm`}
                >
                  Continue to Company Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: COMPANY & TAX DETAILS                             */}
            {/* ========================================================= */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    {accountType === "SELLER" ? "Manufacturing Plant / Company Name" : "Registered Company Name"}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder={accountType === "SELLER" ? "e.g. Apex Polymer Converting Ltd" : "e.g. Acme Industrial Corp"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">GSTIN / Tax ID</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text"
                        required
                        value={formData.gstNumber}
                        onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
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
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                        placeholder="U72900MH..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Industry Sector</label>
                  <div className="relative">
                    <Factory className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select 
                      value={formData.industry}
                      onChange={e => setFormData({...formData, industry: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    >
                      <option value="Tape & Adhesive Manufacturing">Tape & Adhesive Manufacturing</option>
                      <option value="Polymer & Film Converting">Polymer & Film Converting</option>
                      <option value="Automotive & Transportation OEM">Automotive & Transportation OEM</option>
                      <option value="Electronics & Semiconductor">Electronics & Semiconductor</option>
                      <option value="Industrial Electrical & Power">Industrial Electrical & Power</option>
                      <option value="Aerospace & Defense">Aerospace & Defense</option>
                      <option value="General Industrial Manufacturing">General Industrial Manufacturing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Plant / Office Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="tel"
                      required
                      value={formData.companyPhone}
                      onChange={e => setFormData({...formData, companyPhone: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
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
                    className={`flex-1 ${accountType === "SELLER" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"} text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group text-sm shadow-lg`}
                  >
                    {accountType === "SELLER" ? "Proceed to Materials Ingestion" : "Proceed to Verification"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 3 (FOR SELLER): MATERIALS & PRODUCT CATALOG INGESTION */}
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
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Catalog Specifications ({sellerProducts.filter(p => p.name.trim()).length} Active)
                    </h3>
                    <p className="text-xs text-slate-400">Add products matching our 5-point chemical & thermal matrix.</p>
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

                {/* MODE 1: AI FILE DROPZONE */}
                {ingestionMode === "upload" && (
                  <div className="p-6 bg-slate-950/80 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-3xl text-center space-y-4 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">Upload Technical Brochure, Datasheet, or Excel</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Supports <span className="text-emerald-300 font-mono">.xlsx</span>, <span className="text-emerald-300 font-mono">.csv</span>, <span className="text-emerald-300 font-mono">.pdf</span>, or images. Our AI automatically extracts models, backings, adhesives, calipers, and temp ratings into our Master Catalog schema.
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
                            AI Normalizing Specifications...
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

                {/* MODE 2: INTERACTIVE PRODUCT ROWS FORM */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {sellerProducts.map((product, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Material #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(idx)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                          title="Remove Material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Row 1: Name & Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Product Model / Specification Title *</label>
                          <input 
                            type="text"
                            required
                            value={product.name}
                            onChange={e => handleUpdateProduct(idx, "name", e.target.value)}
                            placeholder="e.g. Polyimide High-Temp SMT Tape 50µm"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Format</label>
                          <select
                            value={product.sideType}
                            onChange={e => handleUpdateProduct(idx, "sideType", e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Single-Sided">Single-Sided</option>
                            <option value="Double-Sided">Double-Sided</option>
                            <option value="Transfer">Adhesive Transfer</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Carrier & Adhesive */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Carrier / Backing Material</label>
                          <input 
                            type="text"
                            value={product.backing}
                            onChange={e => handleUpdateProduct(idx, "backing", e.target.value)}
                            placeholder="e.g. Polyimide Film / Acrylic Foam / PVC"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Adhesive Chemistry</label>
                          <input 
                            type="text"
                            value={product.adhesionType}
                            onChange={e => handleUpdateProduct(idx, "adhesionType", e.target.value)}
                            placeholder="e.g. Cross-Linked Silicone / Pure Acrylic"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Row 3: Caliper, Temp, Price */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Total Caliper</label>
                          <input 
                            type="text"
                            value={product.thickness}
                            onChange={e => handleUpdateProduct(idx, "thickness", e.target.value)}
                            placeholder="e.g. 0.05 mm"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Temp Rating</label>
                          <input 
                            type="text"
                            value={product.tempRange}
                            onChange={e => handleUpdateProduct(idx, "tempRange", e.target.value)}
                            placeholder="e.g. 260°C"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Wholesale Price / MOQ</label>
                          <input 
                            type="text"
                            value={product.price}
                            onChange={e => handleUpdateProduct(idx, "price", e.target.value)}
                            placeholder="e.g. ₹320 / roll"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
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
                    Add Another Material
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
            {/* STEP 3 (BUYER) OR STEP 4 (SELLER): FINAL KYC & TERMS     */}
            {/* ========================================================= */}
            {((step === 3 && accountType === "BUYER") || (step === 4 && accountType === "SELLER")) && (
              <motion.div 
                key="step-final"
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
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
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
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
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
                        className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                        placeholder="UDYAM-MH-00..."
                      />
                    </div>
                  </div>
                </div>

                {accountType === "SELLER" && (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl space-y-1 text-xs">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {sellerProducts.filter(p => p.name.trim()).length} Manufacturer Materials Ready for Ingestion
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Your specifications will be normalized and published to the TarasAI Master Catalog upon approval.
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-3 mt-4 mb-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={formData.agreedToTerms}
                    onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})}
                    className="mt-1 w-4 h-4 bg-slate-900 border-slate-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950" 
                  />
                  <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                    I attest that this information is accurate and I agree to the{' '}
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
                    className={`flex-1 ${accountType === "SELLER" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30" : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"} text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 text-sm`}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {accountType === "SELLER" ? "Complete Seller Registration & Ingest Catalog" : "Submit Buyer Verification"}
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
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
