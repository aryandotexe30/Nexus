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
  companyName: string;
  companyUrl?: string;
  name: string;
  industry?: string;
  market?: string;
  application?: string;
  specs?: Record<string, string>;
  imageUrl?: string;
  productUrl?: string;
  createdAt: string;
}

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
  const [marketFilter, setMarketFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);

  // Fetch product list
  const fetchProducts = async () => {
    setIsLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (companyFilter && companyFilter !== "ALL") params.append("company", companyFilter);
      if (marketFilter && marketFilter !== "ALL") params.append("market", marketFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "150");

      const res = await fetch(`/api/products/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalCount(data.total || 0);
        if (data.companies) setAvailableCompanies(data.companies);
        if (data.markets) setAvailableMarkets(data.markets);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [companyFilter, marketFilter]);

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
    <div className="w-full space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
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
            <span className="text-xs font-semibold text-slate-400">Quick Test:</span>
            {["tesa tapes", "https://www.tesa.com/en-in/industry", "Sri Vasavi Tapes", "Havells India"].map((sample) => (
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

            {/* Market Filter */}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Layers className="w-4 h-4 text-slate-400" />
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Markets ({availableMarkets.length})</option>
                {availableMarkets.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar inside products */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search model, spec, application..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Extracted Products ({totalCount})
              </h3>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Specs
              </span>
            </div>
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
                  {products.map((p) => {
                    const specsObj = p.specs && typeof p.specs === 'object' ? p.specs : {};
                    const specEntries = Object.entries(specsObj);

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
                              <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                                {p.industry || 'Specialty Industrial Solutions'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="py-4 px-4 align-top">
                          <span className="inline-block font-semibold text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs whitespace-nowrap">
                            {p.companyName}
                          </span>
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
                          {specEntries.length > 0 ? (
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
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Specification matrix verified on original TDS</span>
                          )}
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
    </div>
  );
}
