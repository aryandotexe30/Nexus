"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Database, 
  Search, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Filter, 
  Building2, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  Network
} from "lucide-react";
import Link from "next/link";

interface ExtractedProduct {
  id: string;
  serialCode?: string;
  companyName: string;
  companyUrl?: string;
  name: string;
  industry?: string;
  market?: string;
  application?: string;
  specs?: Record<string, string>;
  price?: string;
  imageUrl?: string;
  productUrl?: string;
  createdAt: string;
  classification?: {
    productType: string;
    sideType: string;
    backingType: string;
    adhesionType: string;
    thicknessCategory: string;
    tempRange: string;
    location?: string;
    attributesList: string[];
  };
}

const getLocationBadge = (loc?: string) => {
  if (!loc) return null;
  switch (loc) {
    case 'India': return '🇮🇳 India';
    case 'China': return '🇨🇳 China';
    default: return loc;
  }
};

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [harvestLogs, setHarvestLogs] = useState<string[]>([]);
  const [harvestError, setHarvestError] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (harvestLogs.length > 0) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [harvestLogs]);

  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [marketFilter, setMarketFilter] = useState("ALL");
  const [productTypeFilter, setProductTypeFilter] = useState("ALL");
  const [sideTypeFilter, setSideTypeFilter] = useState("ALL");
  const [backingFilter, setBackingFilter] = useState("ALL");
  const [adhesionFilter, setAdhesionFilter] = useState("ALL");
  const [thicknessFilter, setThicknessFilter] = useState("ALL");
  const [tempRangeFilter, setTempRangeFilter] = useState("ALL");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>({});

  // Fetch product list
  const fetchProducts = async () => {
    setIsLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (companyFilter && companyFilter !== "ALL") params.append("company", companyFilter);
      if (locationFilter && locationFilter !== "ALL") params.append("location", locationFilter);
      if (marketFilter && marketFilter !== "ALL") params.append("market", marketFilter);
      if (productTypeFilter && productTypeFilter !== "ALL") params.append("productType", productTypeFilter);
      if (sideTypeFilter && sideTypeFilter !== "ALL") params.append("sideType", sideTypeFilter);
      if (backingFilter && backingFilter !== "ALL") params.append("backing", backingFilter);
      if (adhesionFilter && adhesionFilter !== "ALL") params.append("adhesionType", adhesionFilter);
      if (thicknessFilter && thicknessFilter !== "ALL") params.append("thickness", thicknessFilter);
      if (tempRangeFilter && tempRangeFilter !== "ALL") params.append("tempRange", tempRangeFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "5000");

      const res = await fetch(`/api/products/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalCount(data.total || 0);
        if (data.companies) setAvailableCompanies(data.companies);
        if (data.markets) setAvailableMarkets(data.markets);
        if (data.filterOptions) setFilterOptions(data.filterOptions);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const resetAllFilters = () => {
    setCompanyFilter("ALL");
    setLocationFilter("ALL");
    setMarketFilter("ALL");
    setProductTypeFilter("ALL");
    setSideTypeFilter("ALL");
    setBackingFilter("ALL");
    setAdhesionFilter("ALL");
    setThicknessFilter("ALL");
    setTempRangeFilter("ALL");
    setSearchTerm("");
  };

  const activeFilterCount = [
    companyFilter !== "ALL",
    locationFilter !== "ALL",
    marketFilter !== "ALL",
    productTypeFilter !== "ALL",
    sideTypeFilter !== "ALL",
    backingFilter !== "ALL",
    adhesionFilter !== "ALL",
    thicknessFilter !== "ALL",
    tempRangeFilter !== "ALL",
    searchTerm.trim() !== ""
  ].filter(Boolean).length;

  useEffect(() => {
    fetchProducts();
  }, [
    companyFilter, 
    locationFilter,
    marketFilter,
    productTypeFilter,
    sideTypeFilter,
    backingFilter,
    adhesionFilter,
    thicknessFilter,
    tempRangeFilter
  ]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Trigger autonomous catalog scrape with live SSE streaming
  const handleHarvest = async (e?: React.FormEvent, targetQuery?: string) => {
    if (e) e.preventDefault();
    const q = targetQuery || query;
    if (!q.trim()) return;

    setIsHarvesting(true);
    setHarvestError("");
    setHarvestLogs([`[INITIALIZE] Connecting to TarasAI Real-Time Harvester for "${q}"...`]);

    try {
      const response = await fetch("/api/products/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(trimmed.slice(6));
              if (eventData.type === "log") {
                setHarvestLogs(prev => [...prev, eventData.message]);
              } else if (eventData.type === "done") {
                setHarvestLogs(prev => [...prev, `[SUCCESS] Discovered & stored ${eventData.result?.totalProducts || 0} products into database.`]);
                fetchProducts();
              } else if (eventData.type === "error") {
                setHarvestError(eventData.error);
              }
            } catch {}
          }
        }
      }

      // Final refresh
      fetchProducts();
    } catch (err: any) {
      setHarvestError(err.message || "An error occurred during catalog harvesting");
    } finally {
      setIsHarvesting(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (products.length === 0) return;
    const headers = ["Item Name", "Company", "Industry", "Market", "Application", "Technical Specifications", "Product URL"];
    const rows = products.map(p => {
      const specStr = p.specs ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join('; ') : '';
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${(p.companyName || '').replace(/"/g, '""')}"`,
        `"${(p.industry || '').replace(/"/g, '""')}"`,
        `"${(p.market || '').replace(/"/g, '""')}"`,
        `"${(p.application || '').replace(/"/g, '""')}"`,
        `"${specStr.replace(/"/g, '""')}"`,
        `"${p.productUrl || ''}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tarasai_products_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Autonomous Model Training & Ingestion
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Products Catalog Master
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
              Deep website scraper that extracts entire manufacturer catalogs, specification matrices, and stores them for AI training.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={products.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => fetchProducts()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Harvester Scraper Console */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Ingest New Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Provide any company name or direct website URL. The engine recursively discovers all markets, applications, and specification tables.
          </p>

          <form onSubmit={handleHarvest} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. tesa tapes, https://www.tesa.com/en-in/industry, Sri Vasavi Tapes, Havells..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isHarvesting || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {isHarvesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scraping Entire Catalog...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Scrape & Ingest Products
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs font-semibold text-slate-400">Quick Test Brands:</span>
            {[
              "tesa tapes", 
              "Sri Vasavi Tapes", 
              "3M India", 
              "Nitto Denko", 
              "Saint-Gobain", 
              "Shurtape", 
              "Lohmann Tapes", 
              "Avery Dennison", 
              "Scapa Industrial",
              "CG Adhesive Products",
              "Ajit Industries",
              "Advance Tapes",
              "Havells India",
              "Polycab India"
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  handleHarvest(undefined, sample);
                }}
                disabled={isHarvesting}
                className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Real-time Harvest Status Log */}
          {harvestLogs.length > 0 && (
            <div className="mt-4 p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800/80 text-[11px] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Harvester Live Execution Terminal
                </span>
                {isHarvesting ? (
                  <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                    <RefreshCw className="w-3 h-3 animate-spin" /> STREAMING CRAWL
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">● INGESTION READY</span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {harvestLogs.map((log, i) => {
                  let badgeColor = "text-blue-400";
                  if (log.startsWith("[DOMAIN]")) badgeColor = "text-cyan-400 font-bold";
                  else if (log.startsWith("[HIERARCHY]")) badgeColor = "text-purple-400 font-bold";
                  else if (log.startsWith("[QUEUE]")) badgeColor = "text-amber-400 font-bold";
                  else if (log.startsWith("[CRAWL]")) badgeColor = "text-emerald-400";
                  else if (log.startsWith("[DATABASE]")) badgeColor = "text-teal-300 font-bold";
                  else if (log.startsWith("[FINISH]") || log.startsWith("[SUCCESS]")) badgeColor = "text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded";
                  else if (log.startsWith("[NOTICE]")) badgeColor = "text-amber-300";

                  return (
                    <div key={i} className={`flex items-start gap-2 leading-relaxed ${badgeColor}`}>
                      <span className="text-slate-600 select-none">{String(i + 1).padStart(2, '0')}.</span>
                      <span className="break-all">{log}</span>
                    </div>
                  );
                })}
                {harvestError && (
                  <div className="text-red-400 flex items-center gap-2 pt-1 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Error: {harvestError}</span>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Location Filter */}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="ALL">All Locations</option>
                  {(filterOptions.locations?.filter((l: string) => ['India', 'China'].includes(l)) || ['India', 'China']).map((loc: string) => (
                    <option key={loc} value={loc}>
                      {getLocationBadge(loc) || loc} {filterOptions.facetCounts?.locations?.[loc] ? `(${filterOptions.facetCounts.locations[loc]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-slate-400" />
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="ALL">All Companies ({availableCompanies.length})</option>
                  {availableCompanies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Product Type Filter */}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Tag className="w-4 h-4 text-slate-400" />
                <select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="ALL">All Product Types</option>
                  {(filterOptions.productTypes || ['Tape', 'Adhesive & Sealant', 'Cable & Wire', 'Laminate & Insulation', 'Label & Marking', 'Surface Protection']).map((t: string) => (
                    <option key={t} value={t}>{t} {filterOptions.facetCounts?.productTypes?.[t] ? `(${filterOptions.facetCounts.productTypes[t]})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Advanced Specs Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  showAdvancedFilters || activeFilterCount > 0
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Technical Specs</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 font-bold underline text-xs"
                >
                  Reset ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Search bar inside products */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search model, Tarasai serial (TAR-...), spec..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Advanced Technical Dropdown Matrix */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {/* Side Format */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" /> Side Format
                </label>
                <select
                  value={sideTypeFilter}
                  onChange={(e) => setSideTypeFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">All Sides</option>
                  {(filterOptions.sideTypes || ['Double-Sided', 'Single-Sided', 'Transfer (Unsupported)', 'Self-Amalgamating / Non-Adhesive']).map((s: string) => (
                    <option key={s} value={s}>{s} {filterOptions.facetCounts?.sideTypes?.[s] ? `(${filterOptions.facetCounts.sideTypes[s]})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Backing Material */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-500" /> Backing Material
                </label>
                <select
                  value={backingFilter}
                  onChange={(e) => setBackingFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">All Backing Materials</option>
                  {(filterOptions.backingTypes || ['Polyimide / Kapton', 'PET / Polyester Film', 'Fiberglass / Glass Cloth', 'Aluminum / Copper Foil', 'Foam (Acrylic / PE / PU)', 'PVC / Vinyl', 'Paper / Crepe / Washi', 'Tissue / Non-Woven', 'Cloth / Cotton / Rayon', 'PTFE / Fluoropolymer']).map((b: string) => (
                    <option key={b} value={b}>{b} {filterOptions.facetCounts?.backingTypes?.[b] ? `(${filterOptions.facetCounts.backingTypes[b]})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Adhesion Chemistry */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Adhesion Chemistry
                </label>
                <select
                  value={adhesionFilter}
                  onChange={(e) => setAdhesionFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">All Adhesives</option>
                  {(filterOptions.adhesionTypes || ['Acrylic (Solvent / Pure)', 'Silicone / Polysiloxane', 'Rubber / Synthetic Resin', 'Anaerobic (Dimethacrylate)', 'Cyanoacrylate (Instant)', 'Self-Fusing / Non-Adhesive']).map((a: string) => (
                    <option key={a} value={a}>{a} {filterOptions.facetCounts?.adhesionTypes?.[a] ? `(${filterOptions.facetCounts.adhesionTypes[a]})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Temperature Class */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Temperature Rating
                </label>
                <select
                  value={tempRangeFilter}
                  onChange={(e) => setTempRangeFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">All Temperature Classes</option>
                  {(filterOptions.tempRanges || ['Ultra-High Temp (≥ 200°C)', 'High Temp (150 - 199°C)', 'Medium Temp (80 - 149°C)', 'Standard (< 80°C)']).map((t: string) => (
                    <option key={t} value={t}>{t} {filterOptions.facetCounts?.tempRanges?.[t] ? `(${filterOptions.facetCounts.tempRanges[t]})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Thickness Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-emerald-500" /> Thickness Range
                </label>
                <select
                  value={thicknessFilter}
                  onChange={(e) => setThicknessFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">All Thickness Ranges</option>
                  {(filterOptions.thicknessCategories || ['Ultra-Thin (< 0.1 mm)', 'Standard (0.1 - 0.5 mm)', 'Heavy / Foam (0.5 - 1.0 mm)', 'Thick (> 1.0 mm)']).map((th: string) => (
                    <option key={th} value={th}>{th} {filterOptions.facetCounts?.thicknessCategories?.[th] ? `(${filterOptions.facetCounts.thicknessCategories[th]})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

          {/* Products Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Extracted Products ({totalCount})
              </h3>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Specs
              </span>
            </div>
            {searchTerm.trim().toUpperCase().startsWith("TAR-") && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg text-xs">
                <Network className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-200">
                  Group Filter: <code className="font-mono font-bold">{searchTerm.trim()}</code>
                </span>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="ml-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {isLoadingList ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm font-semibold">Loading product catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Database className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">No products found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Type a company name or URL (e.g. <code>tesa tapes</code> or <code>https://www.tesa.com/en-in/industry</code>) in the ingestion console above to extract all products!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-[280px] min-w-[260px]">Product / Model</th>
                    <th className="py-3.5 px-4 w-[140px] min-w-[120px]">Company</th>
                    <th className="py-3.5 px-4 w-[200px] min-w-[180px]">Market & Application</th>
                    <th className="py-3.5 px-4 min-w-[360px]">Technical Specifications</th>
                    <th className="py-3.5 px-4 w-[110px] min-w-[100px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs">
                  {products
                    .filter((p) => {
                      const specsObj = p.specs && typeof p.specs === 'object' ? p.specs : {};
                      const count = Object.entries(specsObj).filter(
                        ([k, v]) => 
                          Boolean(k) && 
                          Boolean(v) && 
                          k.trim() !== '' && 
                          k.trim() !== ':' && 
                          String(v).trim() !== '' && 
                          String(v).trim() !== ':' && 
                          String(v).length < 150 &&
                          !k.toLowerCase().includes('competitive') &&
                          !k.toLowerCase().includes('year of establishment') &&
                          !k.toLowerCase().includes('import market') &&
                          !k.toLowerCase().includes('business type') &&
                          !k.toLowerCase().includes('technical data') &&
                          !k.toLowerCase().includes('datasheet') &&
                          !k.toLowerCase().includes('brochure') &&
                          !k.toLowerCase().includes('download') &&
                          !k.toLowerCase().includes('document') &&
                          !k.toLowerCase().includes('library') &&
                          !k.toLowerCase().includes('specification') &&
                          String(v).toLowerCase() !== 'download' &&
                          String(v).toLowerCase() !== 'download pdf' &&
                          String(v).toLowerCase() !== 'view' &&
                          String(v).toLowerCase() !== 'pdf' &&
                          !String(v).toLowerCase().startsWith('http')
                      ).length;
                      return count >= 2;
                    })
                    .map((p) => {
                      const specsObj = p.specs && typeof p.specs === 'object' ? p.specs : {};
                      const specEntries = Object.entries(specsObj).filter(
                        ([k, v]) => 
                          Boolean(k) && 
                          Boolean(v) && 
                          k.trim() !== '' && 
                          k.trim() !== ':' && 
                          String(v).trim() !== '' && 
                          String(v).trim() !== ':' && 
                          String(v).length < 150 &&
                          !k.toLowerCase().includes('competitive') &&
                          !k.toLowerCase().includes('year of establishment') &&
                          !k.toLowerCase().includes('import market') &&
                          !k.toLowerCase().includes('business type') &&
                          !k.toLowerCase().includes('technical data') &&
                          !k.toLowerCase().includes('datasheet') &&
                          !k.toLowerCase().includes('brochure') &&
                          !k.toLowerCase().includes('download') &&
                          !k.toLowerCase().includes('document') &&
                          !k.toLowerCase().includes('library') &&
                          !k.toLowerCase().includes('specification') &&
                          String(v).toLowerCase() !== 'download' &&
                          String(v).toLowerCase() !== 'download pdf' &&
                          String(v).toLowerCase() !== 'view' &&
                          String(v).toLowerCase() !== 'pdf' &&
                          !String(v).toLowerCase().startsWith('http')
                      );

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Product / Image */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-start gap-3">
                            {p.imageUrl ? (
                              <img 
                                src={p.imageUrl} 
                                alt={p.name} 
                                className="w-11 h-11 object-contain rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex-shrink-0 shadow-sm"
                                onError={(e) => { (e.target as any).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-blue-200 dark:border-blue-800 shadow-sm">
                                {p.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              {p.serialCode && (
                                <div className="mb-1">
                                  <button
                                    type="button"
                                    onClick={() => setSearchTerm(p.serialCode || '')}
                                    className="inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 bg-slate-900 hover:bg-blue-600 dark:bg-slate-100 dark:hover:bg-blue-500 text-white dark:text-slate-900 dark:hover:text-white rounded tracking-wider shadow-2xs transition-colors cursor-pointer"
                                    title={`Filter all products grouped under Tarasai serial code ${p.serialCode}`}
                                  >
                                    <Network className="w-2.5 h-2.5 opacity-70" />
                                    <span>{p.serialCode}</span>
                                  </button>
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                  {p.name}
                                </span>
                                {(p.price || (p.specs && (p.specs['Indicative Price'] || p.specs['Price']))) && (
                                  <span className="inline-flex items-center font-bold text-[11px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                                    {p.price || (p.specs && (p.specs['Indicative Price'] || p.specs['Price']))}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                                {p.industry || 'Specialty Industrial Solutions'}
                              </div>
                              {p.classification && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {p.classification.sideType && p.classification.sideType !== 'Single-Sided' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                      {p.classification.sideType}
                                    </span>
                                  )}
                                  {p.classification.backingType && p.classification.backingType !== 'Other / Unspecified' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                      {p.classification.backingType}
                                    </span>
                                  )}
                                  {p.classification.adhesionType && p.classification.adhesionType !== 'Other / Unspecified' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                      {p.classification.adhesionType}
                                    </span>
                                  )}
                                  {p.classification.tempRange && p.classification.tempRange !== 'Standard (< 80°C)' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                      {p.classification.tempRange}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="py-4 px-4 align-top space-y-1">
                          <span className="inline-block font-semibold text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs whitespace-nowrap">
                            {p.companyName}
                          </span>
                          {p.classification?.location && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                {getLocationBadge(p.classification.location)}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Market & Application */}
                        <td className="py-4 px-4 align-top space-y-1.5">
                          {p.market && (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-md border border-blue-200 dark:border-blue-800">
                              {p.market}
                            </span>
                          )}
                          <div className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-snug">
                            {p.application || 'General Application'}
                          </div>
                        </td>

                        {/* Technical Specifications */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {specEntries.map(([k, v]) => (
                              <span 
                                key={k} 
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700/80 shadow-2xs leading-none"
                              >
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{k}:</span> 
                                <strong className="text-slate-900 dark:text-slate-100 font-bold">{v}</strong>
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.productUrl && (
                              <a
                                href={p.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors inline-flex items-center justify-center border border-slate-200/60 dark:border-slate-700"
                                title="Open Manufacturer Spec Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <Link
                              href={`/network`}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 border border-blue-200/60 dark:border-blue-800"
                              title="Map in Value Chain Network"
                            >
                              <Network className="w-3.5 h-3.5" />
                              Map
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}
