"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Filter, 
  Layers, 
  ShieldCheck, 
  Building2, 
  Tag, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ExternalLink,
  Truck,
  Clock,
  Send,
  Download,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGeneralProductImage } from "@/lib/productImages";

export interface MasterProduct {
  id: string;
  serialCode?: string;
  name: string;
  companyName: string;
  companyUrl?: string;
  industry?: string;
  market?: string;
  application?: string;
  price?: string;
  specs?: Record<string, string>;
  imageUrl?: string;
  productUrl?: string;
  classification?: {
    productType?: string;
    sideType?: string;
    backingType?: string;
    adhesionType?: string;
    thicknessCategory?: string;
    tempRange?: string;
    location?: string;
    attributesList?: string[];
  };
}

const PRIMARY_VERTICALS = [
  { id: "ALL", label: "All Industrial Categories", icon: "📦" },
  { id: "tapes", label: "Technical Tapes & Bonding", query: "tape", icon: "⚡" },
  { id: "electrical", label: "Electrical & Power Equipment", query: "electrical", icon: "🔌" },
  { id: "resins", label: "Raw Resins & Chemical Precursors", query: "resin", icon: "🧪" },
  { id: "diecut", label: "Precision Die-Cuts & Gaskets", query: "die-cut", icon: "✂️" },
  { id: "thermal", label: "Thermal Interface (TIM) & EMI", query: "thermal", icon: "🌡️" },
  { id: "automotive", label: "Automotive & Wire Harness", query: "automotive", icon: "🚗" },
];

function ProductExplorationContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";
  const initialSearch = searchParams.get("search") || "";
  const initialCompany = searchParams.get("company") || "ALL";

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeVertical, setActiveVertical] = useState(initialCategory);
  const [selectedCompany, setSelectedCompany] = useState(initialCompany);
  const [selectedMarket, setSelectedMarket] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [selectedBacking, setSelectedBacking] = useState("ALL");
  const [selectedAdhesive, setSelectedAdhesive] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Data State
  const [products, setProducts] = useState<MasterProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>({});

  // RFQ Modal State
  const [selectedRfqProduct, setSelectedRfqProduct] = useState<MasterProduct | null>(null);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqQuantity, setRfqQuantity] = useState("1,000 Rolls / Units");
  const [rfqPincode, setRfqPincode] = useState("411018 (Pune MIDC)");
  const [rfqCompanyName, setRfqCompanyName] = useState("");
  const [rfqGst, setRfqGst] = useState("");
  const [rfqContact, setRfqContact] = useState("");
  const [rfqTargetPrice, setRfqTargetPrice] = useState("");
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  // Fetch Master Products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCompany && selectedCompany !== "ALL") params.append("company", selectedCompany);
      if (selectedMarket && selectedMarket !== "ALL") params.append("market", selectedMarket);
      if (selectedLocation && selectedLocation !== "ALL") params.append("location", selectedLocation);
      if (selectedBacking && selectedBacking !== "ALL") params.append("backing", selectedBacking);
      if (selectedAdhesive && selectedAdhesive !== "ALL") params.append("adhesionType", selectedAdhesive);

      // Handle category/vertical query
      let combinedSearch = searchTerm.trim();
      if (activeVertical !== "ALL") {
        const vert = PRIMARY_VERTICALS.find(v => v.id === activeVertical);
        if (vert && vert.query) {
          combinedSearch = combinedSearch ? `${combinedSearch} ${vert.query}` : vert.query;
        }
      }
      if (combinedSearch) params.append("search", combinedSearch);
      params.append("limit", "150");

      const res = await fetch(`/api/products/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalCount(data.total || 0);
        if (data.companies && data.companies.length > 0) setAvailableCompanies(data.companies);
        if (data.markets && data.markets.length > 0) setAvailableMarkets(data.markets);
        if (data.filterOptions) setFilterOptions(data.filterOptions);
      }
    } catch (err) {
      console.error("Failed to load master products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [
    searchTerm, 
    activeVertical, 
    selectedCompany, 
    selectedMarket, 
    selectedLocation,
    selectedBacking,
    selectedAdhesive
  ]);

  const resetAllFilters = () => {
    setSearchTerm("");
    setActiveVertical("ALL");
    setSelectedCompany("ALL");
    setSelectedMarket("ALL");
    setSelectedLocation("ALL");
    setSelectedBacking("ALL");
    setSelectedAdhesive("ALL");
  };

  const activeFiltersCount = useMemo(() => {
    return [
      activeVertical !== "ALL",
      selectedCompany !== "ALL",
      selectedMarket !== "ALL",
      selectedLocation !== "ALL",
      selectedBacking !== "ALL",
      selectedAdhesive !== "ALL",
      searchTerm.trim() !== ""
    ].filter(Boolean).length;
  }, [activeVertical, selectedCompany, selectedMarket, selectedLocation, selectedBacking, selectedAdhesive, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* 1. TOP HEADER & SEARCH HERO */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Stats */}
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0B4FDF]/10 text-[#0B4FDF] border border-[#0B4FDF]/20">
                  <Sparkles className="w-3 h-3" /> Live Factory Master Catalog
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {totalCount.toLocaleString()} Verified Items
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Explore Industrial Products & Materials
              </h1>
            </div>

            {/* Global Search Bar */}
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by material, SKU, application (e.g. Kapton, VHB 4910, Silicone Resin, EPDM)..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4FDF] focus:bg-white transition-all shadow-2xs"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === "grid" ? "bg-white text-[#0B4FDF] shadow-2xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === "table" ? "bg-white text-[#0B4FDF] shadow-2xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#0B4FDF]" />
                <span>Filters ({activeFiltersCount})</span>
              </button>
            </div>

          </div>

          {/* Category Quick Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-3 pb-1 text-xs">
            {PRIMARY_VERTICALS.map((vert) => {
              const isActive = activeVertical === vert.id;
              return (
                <button
                  key={vert.id}
                  onClick={() => setActiveVertical(vert.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0B4FDF] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80"
                  }`}
                >
                  <span>{vert.icon}</span>
                  <span>{vert.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. MAIN BROWSE LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR FILTERS (3 cols) */}
          <aside className={`lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs sticky top-36 ${
            showMobileFilters ? "block fixed inset-4 z-50 overflow-y-auto bg-white" : "hidden lg:block"
          }`}>
            {showMobileFilters && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 lg:hidden">
                <span className="font-bold text-slate-900 text-sm">Filter Specifications</span>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-900">
                <Filter className="w-3.5 h-3.5 text-[#0B4FDF]" />
                <span>Filters & Facets</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] font-bold text-[#FF5500] hover:underline"
                >
                  Reset ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Manufacturer Brand Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Manufacturer / Brand</span>
                <span className="text-[10px] font-mono text-slate-400">{availableCompanies.length}</span>
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B4FDF]"
              >
                <option value="ALL">All Manufacturers</option>
                {availableCompanies.slice(0, 50).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Market / Application Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Industry & Market</span>
                <span className="text-[10px] font-mono text-slate-400">{availableMarkets.length}</span>
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B4FDF]"
              >
                <option value="ALL">All Industrial Markets</option>
                {availableMarkets.slice(0, 40).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Country of Origin Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Production Origin
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {["ALL", "India", "China"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`py-1.5 px-2 rounded-lg text-center font-bold text-[11px] transition-colors cursor-pointer border ${
                      selectedLocation === loc
                        ? "bg-[#0B4FDF] text-white border-[#0B4FDF] shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {loc === "India" ? "🇮🇳 India" : loc === "China" ? "🇨🇳 China" : "All Origins"}
                  </button>
                ))}
              </div>
            </div>

            {/* Backing Material Quick Facets */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800">
                Substrate & Backing
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["ALL", "Polyimide", "Acrylic Foam", "Glass Cloth", "Copper Foil", "PVC", "Polyester", "Crepe"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBacking(b)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      selectedBacking === b
                        ? "bg-[#0B4FDF] text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {b === "ALL" ? "All Substrates" : b}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Standard Badges Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#0B4FDF]">
                <ShieldCheck className="w-4 h-4" />
                <span>ASTM & CPRI Tested</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Every lot is delivered with certified peel adhesion, thermal shear, and breakdown voltage test certificates.
              </p>
            </div>
          </aside>

          {/* RIGHT PRODUCT GRID (9 cols) */}
          <main className="lg:col-span-9 space-y-4">
            
            {/* Results Bar */}
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs shadow-2xs">
              <div className="text-slate-600">
                Found <strong className="text-slate-900">{totalCount.toLocaleString()}</strong> industrial products from verified manufacturing plants
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Direct Plant Sourcing</span>
              </div>
            </div>

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse">
                    <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && products.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0B4FDF] mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No matching industrial materials found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try clearing some filters or searching with alternative terms (e.g. &ldquo;VHB&rdquo;, &ldquo;Kapton&rdquo;, &ldquo;Mica&rdquo;, &ldquo;Silicone&rdquo;).
                  </p>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 rounded-xl bg-[#0B4FDF] text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* GRID VIEW */}
            {!isLoading && viewMode === "grid" && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((p) => {
                  const specs = p.specs || {};
                  const backing = p.classification?.backingType || specs["Backing material"] || specs["Backing"] || specs["Carrier"];
                  const adhesive = p.classification?.adhesionType || specs["Adhesive type"] || specs["Adhesive"] || specs["Binder"];
                  const temp = p.classification?.tempRange || specs["Temperature resistance"] || specs["Max Temperature"];
                  const price = p.price || "Contact for Bulk RFQ";
                  const image = getGeneralProductImage(p);

                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#0B4FDF]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group shadow-xs"
                    >
                      {/* Product Header / Image */}
                      <div>
                        <div className="relative aspect-[4/3] bg-white border-b border-slate-100 overflow-hidden">
                          <img
                            src={image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-800 font-bold border border-slate-200 shadow-2xs">
                            {p.companyName}
                          </div>
                          {p.classification?.location && (
                            <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white font-bold">
                              {p.classification.location === "India" ? "🇮🇳 India" : "🇨🇳 China"}
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0B4FDF] transition-colors line-clamp-2 leading-tight">
                              {p.name}
                            </h3>
                            {p.application && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                                {p.application}
                              </p>
                            )}
                          </div>

                          {/* Technical Specification Chips */}
                          <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-600">
                            {backing && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 truncate max-w-[140px]">
                                {backing}
                              </span>
                            )}
                            {adhesive && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 truncate max-w-[140px]">
                                {adhesive}
                              </span>
                            )}
                            {temp && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                {temp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer with Price and Actions */}
                      <div className="p-4 pt-0 space-y-3">
                        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">
                              Indicative Rate:
                            </span>
                            <span className="text-xs font-mono font-black text-emerald-700">
                              {price}
                            </span>
                          </div>
                          {p.serialCode && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {p.serialCode}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/products/${encodeURIComponent(p.id)}`}
                            className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition-colors"
                          >
                            View Specs
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedRfqProduct(p);
                              setIsRfqModalOpen(true);
                            }}
                            className="py-2 px-3 rounded-lg bg-[#FF5500] hover:bg-[#E04800] text-white text-xs font-extrabold text-center transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Get Quote</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABLE / PROCUREMENT VIEW */}
            {!isLoading && viewMode === "table" && products.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase font-mono text-[11px]">
                      <tr>
                        <th className="p-3.5">Material & Description</th>
                        <th className="p-3.5">Manufacturer</th>
                        <th className="p-3.5">Key Specifications</th>
                        <th className="p-3.5">Indicative Price</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => {
                        const specs = p.specs || {};
                        const backing = p.classification?.backingType || specs["Backing material"] || specs["Backing"];
                        const adhesive = p.classification?.adhesionType || specs["Adhesive type"] || specs["Adhesive"];
                        const temp = p.classification?.tempRange || specs["Temperature resistance"];
                        const price = p.price || "RFQ";

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 max-w-xs">
                              <Link 
                                href={`/products/${encodeURIComponent(p.id)}`}
                                className="font-bold text-slate-900 hover:text-[#0B4FDF] block leading-tight"
                              >
                                {p.name}
                              </Link>
                              <span className="text-[11px] text-slate-500 font-mono mt-0.5 block truncate">
                                {p.application || p.market || "Industrial Application"}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-slate-800 whitespace-nowrap">
                              <div>{p.companyName}</div>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {p.classification?.location || "India"}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-slate-600">
                              <div className="truncate max-w-[200px]">{backing || "Standard"} • {adhesive || "PSA"}</div>
                              {temp && <div className="text-amber-700 text-[10px]">{temp}</div>}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-emerald-700 whitespace-nowrap">
                              {price}
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                              <Link
                                href={`/products/${encodeURIComponent(p.id)}`}
                                className="inline-block py-1 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
                              >
                                Specs
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedRfqProduct(p);
                                  setIsRfqModalOpen(true);
                                }}
                                className="py-1 px-2.5 rounded bg-[#FF5500] hover:bg-[#E04800] text-white text-[11px] font-bold shadow-2xs"
                              >
                                Quote →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* 3. INSTANT RFQ / QUOTE MODAL */}
      <AnimatePresence>
        {isRfqModalOpen && selectedRfqProduct && (
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
                  Request Quotation: {selectedRfqProduct.name}
                </h3>
              </div>

              {rfqSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">RFQ Successfully Logged</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Your request for <strong>{selectedRfqProduct.name}</strong> ({rfqQuantity}) has been transmitted to the TarasAI sourcing desk. A binding quotation with verified test certificates will be issued within 24 hours.
                  </p>
                  <button
                    onClick={() => { setIsRfqModalOpen(false); setRfqSubmitted(false); }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-lg text-white"
                  >
                    Done
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
                  {/* Selected Item Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                      <img 
                        src={getGeneralProductImage(selectedRfqProduct)} 
                        alt={selectedRfqProduct.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">{selectedRfqProduct.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        Brand: {selectedRfqProduct.companyName} • {selectedRfqProduct.market || "Specialty Sourcing"}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {selectedRfqProduct.price || "Bulk RFQ"}
                    </span>
                  </div>

                  {/* Quantity & Pincode Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Estimated Quantity / Batch</label>
                      <input 
                        type="text" 
                        value={rfqQuantity}
                        onChange={(e) => setRfqQuantity(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        placeholder="e.g. 5,000 Rolls or 500 Kgs"
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
                        placeholder="e.g. 411018 Pune"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Name & GST */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Company / Buyer Entity</label>
                      <input 
                        type="text" 
                        value={rfqCompanyName}
                        onChange={(e) => setRfqCompanyName(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        placeholder="e.g. Apex Industrial Converters"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">GST Number (Optional)</label>
                      <input 
                        type="text" 
                        value={rfqGst}
                        onChange={(e) => setRfqGst(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        placeholder="27AABCU9603R1ZM"
                      />
                    </div>
                  </div>

                  {/* Contact Phone / Email */}
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Contact Email or Phone Number</label>
                    <input 
                      type="text" 
                      value={rfqContact}
                      onChange={(e) => setRfqContact(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                      placeholder="procurement@company.com or +91 98765 43210"
                      required
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Binding RFQ Inquiry</span>
                  </button>

                  <p className="text-[10px] text-slate-500 text-center">
                    TarasAI verifies GSTIN credentials, laboratory CoAs, and dispatches directly under blind e-Way bill.
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

export default function ProductsExplorationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#0B4FDF] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductExplorationContent />
    </Suspense>
  );
}
