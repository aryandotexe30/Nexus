"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  Sparkles, 
  FileSpreadsheet, 
  Layers, 
  Tag, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Image as ImageIcon, 
  Sliders, 
  Check, 
  X,
  FileText,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export interface SellerProductItem {
  id?: string;
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
  imageUrl?: string;
  specs?: Record<string, string>;
  missingFields?: string[];
}

export function computeProductMissingFields(p: SellerProductItem): string[] {
  const missing: string[] = [];
  if (!p.name || p.name.trim().length === 0) missing.push("Product Title / Model");
  if (!p.backing || p.backing === "Specialty Substrate" || p.backing === "Unknown" || p.backing.trim().length === 0) missing.push("Backing Substrate");
  if (!p.adhesionType || p.adhesionType === "Standard Polymer" || p.adhesionType === "Polymer System" || p.adhesionType.trim().length === 0) missing.push("Adhesive Chemistry");
  if (!p.thickness || p.thickness === "Standard" || p.thickness === "N/A" || p.thickness.trim().length === 0) missing.push("Thickness / Caliper");
  if (!p.tempRange || p.tempRange === "Industrial Grade" || p.tempRange === "N/A" || p.tempRange.trim().length === 0) missing.push("Temperature Rating");
  if (!p.application || p.application.trim().length === 0) missing.push("Application Scope");
  if (!p.price || p.price.trim().length === 0 || p.price === "Inquire on Request") missing.push("Price / MOQ");
  return missing;
}

interface BrochureCatalogConfirmationWorkspaceProps {
  products: SellerProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<SellerProductItem[]>>;
  isParsingFile: boolean;
  parseSuccessMsg: string;
  onFileUpload: (file: File) => Promise<void>;
  companyName: string;
}

export default function BrochureCatalogConfirmationWorkspace({
  products,
  setProducts,
  isParsingFile,
  parseSuccessMsg,
  onFileUpload,
  companyName
}: BrochureCatalogConfirmationWorkspaceProps) {
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "ready">("all");
  const [expandedSpecs, setExpandedSpecs] = useState<Record<number, boolean>>({});
  const [newSpecKey, setNewSpecKey] = useState<Record<number, string>>({});
  const [newSpecVal, setNewSpecVal] = useState<Record<number, string>>({});
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const handleUpdate = (index: number, field: keyof SellerProductItem, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    updated[index].missingFields = computeProductMissingFields(updated[index]);
    setProducts(updated);
  };

  const handleAddProduct = () => {
    const newProd: SellerProductItem = {
      name: "",
      category: "Adhesive Tapes & Transfer Films",
      productType: "Tape",
      sideType: "Single-Sided",
      backing: "Polyimide Film",
      adhesionType: "Silicone",
      thickness: "0.05 mm (50 µm)",
      tempRange: "260°C",
      application: "Industrial engineering application",
      price: "",
      specs: {},
      missingFields: ["Product Title / Model", "Price / MOQ"]
    };
    setProducts([...products, newProd]);
  };

  const handleDuplicateProduct = (index: number) => {
    const target = products[index];
    const duplicated: SellerProductItem = {
      ...target,
      name: `${target.name} (Variant)`,
      specs: { ...(target.specs || {}) },
      missingFields: computeProductMissingFields(target)
    };
    const updated = [...products];
    updated.splice(index + 1, 0, duplicated);
    setProducts(updated);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length === 1) {
      setProducts([{
        name: "",
        category: "Adhesive Tapes & Transfer Films",
        productType: "Tape",
        sideType: "Single-Sided",
        backing: "",
        adhesionType: "",
        thickness: "",
        tempRange: "",
        application: "",
        price: "",
        specs: {}
      }]);
      return;
    }
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleAddCustomSpec = (index: number) => {
    const key = (newSpecKey[index] || "").trim();
    const val = (newSpecVal[index] || "").trim();
    if (!key || !val) return;

    const target = products[index];
    const updatedSpecs = { ...(target.specs || {}), [key]: val };
    handleUpdate(index, "specs", updatedSpecs);

    setNewSpecKey(prev => ({ ...prev, [index]: "" }));
    setNewSpecVal(prev => ({ ...prev, [index]: "" }));
  };

  const handleRemoveCustomSpec = (index: number, keyToRemove: string) => {
    const target = products[index];
    const updatedSpecs = { ...(target.specs || {}) };
    delete updatedSpecs[keyToRemove];
    handleUpdate(index, "specs", updatedSpecs);
  };

  const toggleSpecsAccordion = (index: number) => {
    setExpandedSpecs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeImageIndex === null) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      handleUpdate(activeImageIndex, "imageUrl", dataUrl);
      setActiveImageIndex(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = (index: number) => {
    setActiveImageIndex(index);
    imageInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const incompleteProductsCount = products.filter(p => computeProductMissingFields(p).length > 0).length;
  const readyProductsCount = products.filter(p => computeProductMissingFields(p).length === 0 && p.name.trim().length > 0).length;

  const filteredProducts = products.map((prod, originalIdx) => ({ prod, originalIdx })).filter(({ prod }) => {
    const missing = computeProductMissingFields(prod);
    if (filterMode === "pending") return missing.length > 0;
    if (filterMode === "ready") return missing.length === 0 && prod.name.trim().length > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hidden file input for product image upload */}
      <input 
        ref={imageInputRef}
        type="file" 
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Hidden file input for brochure upload */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.txt,.docx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileUpload(f);
        }}
        className="hidden"
      />

      {/* ========================================================= */}
      {/* 1. BROCHURE & CATALOG UPLOAD DROPZONE                     */}
      {/* ========================================================= */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-4 transition-all ${
          dragActive 
            ? "border-[#0B4FDF] bg-blue-50/70 scale-[1.01]" 
            : "border-slate-300 hover:border-emerald-500 bg-slate-50/80"
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
          {isParsingFile ? (
            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
            Upload Product Brochure, Datasheet PDF, or Excel Catalog
          </h4>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Drag & drop multi-page brochures, spec tables, catalog scans, or Excel sheets. Our AI will extract all product models, chemical backings, dielectric/thermal specs, and images for your confirmation.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            disabled={isParsingFile}
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isParsingFile ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI Reading Brochure Tables & Extracting Specs...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Select Brochure File (.pdf, .xlsx, .csv, images)
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
          <span>✓ PDF Multi-Page</span>
          <span>•</span>
          <span>✓ Excel / CSV</span>
          <span>•</span>
          <span>✓ JPEG / PNG Images</span>
          <span>•</span>
          <span>✓ 100% Confidential</span>
        </div>
      </div>

      {/* Parsing Success Alert Banner */}
      {parseSuccessMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900">
            <div className="font-bold">{parseSuccessMsg}</div>
            <div className="text-emerald-700 mt-0.5">
              Review each item below. If any technical parameter was missing in the brochure, fill it in or leave as default before finalizing.
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* 2. CATALOG CONFIRMATION WORKSPACE & FILTER BAR           */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                Brochure Ingestion Workspace ({products.length} Products)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and confirm technical attributes, add custom test parameters, and attach product images.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("pending")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                filterMode === "pending" 
                  ? "bg-amber-500 text-white shadow-xs" 
                  : "text-amber-700 hover:text-amber-900"
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Missing Fields ({incompleteProductsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("ready")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                filterMode === "ready" 
                  ? "bg-emerald-600 text-white shadow-xs" 
                  : "text-emerald-700 hover:text-emerald-900"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Ready ({readyProductsCount})
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. PRODUCT CARDS LIST WITH INLINE EDITORS                 */}
        {/* ========================================================= */}
        <div className="space-y-5 max-h-[560px] overflow-y-auto pr-1">
          {filteredProducts.map(({ prod, originalIdx }) => {
            const missing = computeProductMissingFields(prod);
            const isComplete = missing.length === 0 && prod.name.trim().length > 0;
            const isSpecsExpanded = !!expandedSpecs[originalIdx];
            const customSpecsEntries = Object.entries(prod.specs || {}).filter(
              ([k]) => !['Category', 'Backing material', 'Adhesive type', 'Total thickness', 'Temperature resistance', 'Side format'].includes(k)
            );

            return (
              <div 
                key={originalIdx}
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 relative ${
                  isComplete
                    ? "bg-slate-50/70 border-slate-200 hover:border-emerald-300"
                    : "bg-amber-50/30 border-amber-300 ring-1 ring-amber-200/60"
                }`}
              >
                {/* Card Header & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-slate-900 text-white font-mono text-[11px] font-black rounded-md">
                      #{originalIdx + 1}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate max-w-[280px]">
                      {prod.name || "Untitled Specification"}
                    </span>

                    {/* Completeness Badge */}
                    {isComplete ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Complete & Validated
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full flex items-center gap-1 border border-amber-300 animate-pulse">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        {missing.length} Field{missing.length === 1 ? "" : "s"} Pending: {missing.slice(0, 2).join(", ")}{missing.length > 2 ? "..." : ""}
                      </span>
                    )}
                  </div>

                  {/* Actions: Duplicate & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleDuplicateProduct(originalIdx)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                      title="Duplicate this product variant"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicate Variant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(originalIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove product from catalog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Product Edit Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Image Preview & Upload (Left column on large screens) */}
                  <div className="lg:col-span-3 flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-center">
                    {prod.imageUrl ? (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdate(originalIdx, "imageUrl", "")}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-28 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-2">
                        <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                        <span className="text-[10px] font-semibold text-slate-500">No Image Attached</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => triggerImageUpload(originalIdx)}
                      className="w-full py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-[#0B4FDF] text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{prod.imageUrl ? "Replace Image" : "Upload Product Photo"}</span>
                    </button>
                  </div>

                  {/* Specification Fields (Right columns) */}
                  <div className="lg:col-span-9 space-y-3">
                    {/* Category & Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                          Product Category *
                        </label>
                        <select
                          value={prod.category || SELLER_PRODUCT_CATEGORIES[0]}
                          onChange={e => handleUpdate(originalIdx, "category", e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-1.5 px-2.5 text-xs font-bold focus:outline-none focus:border-emerald-600"
                        >
                          {SELLER_PRODUCT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1 flex items-center justify-between">
                          <span>Product Model & Name *</span>
                          {!prod.name && <span className="text-rose-600 text-[10px]">Required</span>}
                        </label>
                        <input 
                          type="text"
                          required
                          value={prod.name}
                          onChange={e => handleUpdate(originalIdx, "name", e.target.value)}
                          placeholder="e.g. 50µm Polyimide High-Temp Film (Silicone)"
                          className={`w-full bg-white border rounded-lg py-1.5 px-2.5 text-xs font-semibold focus:outline-none ${
                            !prod.name ? "border-rose-400 bg-rose-50/20" : "border-slate-300 focus:border-emerald-600"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Format, Substrate & Chemistry */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                          Format / Side Coating
                        </label>
                        <select
                          value={prod.sideType}
                          onChange={e => handleUpdate(originalIdx, "sideType", e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-1.5 px-2.5 text-xs font-medium focus:outline-none focus:border-emerald-600"
                        >
                          <option value="Single-Sided">Single-Sided</option>
                          <option value="Double-Sided">Double-Sided</option>
                          <option value="Transfer">Adhesive Transfer Film</option>
                          <option value="N/A (Liquid / Non-Adhesive)">N/A (Liquid / Steel / Gasket)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1 flex items-center justify-between">
                          <span>Substrate / Backing *</span>
                          {missing.includes("Backing Substrate") && <span className="text-amber-600 text-[9px] font-bold">Pending</span>}
                        </label>
                        <input 
                          type="text"
                          value={prod.backing}
                          onChange={e => handleUpdate(originalIdx, "backing", e.target.value)}
                          placeholder="e.g. Polyimide / Acrylic Foam / EPDM / Glass Cloth"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1 flex items-center justify-between">
                          <span>Adhesive / Chemistry *</span>
                          {missing.includes("Adhesive Chemistry") && <span className="text-amber-600 text-[9px] font-bold">Pending</span>}
                        </label>
                        <input 
                          type="text"
                          value={prod.adhesionType}
                          onChange={e => handleUpdate(originalIdx, "adhesionType", e.target.value)}
                          placeholder="e.g. Silicone / Pure Acrylic / Epoxy Resin / Rubber"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Thickness, Temperature & Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1 flex items-center justify-between">
                          <span>Thickness / Caliper *</span>
                          {missing.includes("Thickness / Caliper") && <span className="text-amber-600 text-[9px] font-bold">Pending</span>}
                        </label>
                        <input 
                          type="text"
                          value={prod.thickness}
                          onChange={e => handleUpdate(originalIdx, "thickness", e.target.value)}
                          placeholder="e.g. 0.05 mm (50 µm) / 1.1 mm"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1 flex items-center justify-between">
                          <span>Temp Resistance *</span>
                          {missing.includes("Temperature Rating") && <span className="text-amber-600 text-[9px] font-bold">Pending</span>}
                        </label>
                        <input 
                          type="text"
                          value={prod.tempRange}
                          onChange={e => handleUpdate(originalIdx, "tempRange", e.target.value)}
                          placeholder="e.g. 260°C / 180°C Class H / -40°C to 150°C"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1 flex items-center justify-between">
                          <span>Price / Target MOQ</span>
                          {missing.includes("Price / MOQ") && <span className="text-slate-400 text-[9px]">Optional</span>}
                        </label>
                        <input 
                          type="text"
                          value={prod.price}
                          onChange={e => handleUpdate(originalIdx, "price", e.target.value)}
                          placeholder="e.g. ₹340 / roll / MOQ 500"
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Applications */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                        Primary Industrial Applications & Use Cases
                      </label>
                      <input 
                        type="text"
                        value={prod.application}
                        onChange={e => handleUpdate(originalIdx, "application", e.target.value)}
                        placeholder="e.g. SMT wave solder masking, EV battery cell wrapping, high-voltage transformer winding"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 4. DYNAMIC CUSTOM TECHNICAL SPECS ACCORDION               */}
                {/* ========================================================= */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleSpecsAccordion(originalIdx)}
                      className="text-xs font-extrabold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Technical Datasheet Parameters ({customSpecsEntries.length + 4} Specs)
                      </span>
                      {isSpecsExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    <span className="text-[10px] text-slate-400 font-mono">
                      ASTM / ISO / UL Test Values
                    </span>
                  </div>

                  <AnimatePresence>
                    {isSpecsExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-3 overflow-hidden"
                      >
                        {/* Custom Specs Chips / Table */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {customSpecsEntries.map(([k, v]) => (
                            <div 
                              key={k} 
                              className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex items-center justify-between gap-2 shadow-2xs"
                            >
                              <div className="truncate">
                                <span className="font-bold text-slate-700">{k}: </span>
                                <span className="text-slate-900 font-mono">{v}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomSpec(originalIdx, k)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                                title="Remove parameter"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add New Spec Field */}
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2 text-xs">
                          <input 
                            type="text"
                            value={newSpecKey[originalIdx] || ""}
                            onChange={e => setNewSpecKey(prev => ({ ...prev, [originalIdx]: e.target.value }))}
                            placeholder="Parameter (e.g. Dielectric Breakdown, Tensile Strength, Flame Rating)"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-emerald-600"
                          />
                          <input 
                            type="text"
                            value={newSpecVal[originalIdx] || ""}
                            onChange={e => setNewSpecVal(prev => ({ ...prev, [originalIdx]: e.target.value }))}
                            placeholder="Test Value (e.g. 6.5 kV, 140 N/25mm, UL 94 V-0)"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomSpec(originalIdx)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0 transition-colors"
                          >
                            + Add Spec
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workspace Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddProduct}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Product Manually</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload More Brochures</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500">
            {readyProductsCount} of {products.length} specifications complete & ready for catalog import
          </div>
        </div>
      </div>
    </div>
  );
}
