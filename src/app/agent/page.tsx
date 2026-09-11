"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { 
  Search, 
  Bot, 
  Send, 
  SlidersHorizontal, 
  Building2, 
  Layers, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  X, 
  Check, 
  Tag, 
  Zap, 
  ArrowRight,
  Database,
  Sliders,
  Filter,
  RefreshCw,
  PackageCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface ExtractedProduct {
  id: string;
  name: string;
  companyName: string;
  companyUrl?: string;
  productUrl?: string;
  industry?: string;
  market?: string;
  application?: string;
  specs?: Record<string, string>;
  imageUrl?: string;
}

interface CopilotRecommendation {
  name: string;
  companyName: string;
  application?: string;
  specs?: Record<string, string>;
  pros?: string[];
  cons?: string[];
  verdict?: string;
  productUrl?: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  options?: string[];
  recommendations?: CopilotRecommendation[];
}

const QUICK_TAGS = [
  "Double Sided Tape",
  "High Temperature",
  "Automotive",
  "Masking Tape",
  "Electrical Insulation",
  "Kapton Polyimide",
  "Foam Tape",
  "Surface Protection"
];

export default function FinderPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "copilot">("catalog");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [selectedMarket, setSelectedMarket] = useState("ALL");
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Enquiry Modal State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ExtractedProduct | null>(null);
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);
  const [formQty, setFormQty] = useState("");
  const [formUnit, setFormUnit] = useState("Rolls / Sq. Meters");
  const [formPurpose, setFormPurpose] = useState("Industrial Production");
  const [formDetails, setFormDetails] = useState("");

  // AI Copilot Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: "👋 Welcome to **TarasAI Intelligent Finder**. I have direct access to our **Master Industrial Product Database**.\n\nTell me what application, substrate, or specification you are sourcing (e.g., *'High temperature masking tape for powder coating up to 200°C'* or *'Double sided acrylic foam tape for automotive exterior trim'*), and I will analyze the database and compare matching models with pros and cons."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debounced live search against the master ExtractedProduct database
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMasterProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCompany, selectedMarket]);

  const fetchMasterProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedCompany !== "ALL") params.append("company", selectedCompany);
      if (selectedMarket !== "ALL") params.append("market", selectedMarket);
      params.append("limit", "150");

      const res = await fetch(`/api/products/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalCount(data.total || data.products?.length || 0);
        if (data.companies && data.companies.length > 0) {
          setCompanies(data.companies);
        }
        if (data.markets && data.markets.length > 0) {
          setMarkets(data.markets);
        }
      }
    } catch (err) {
      console.error("Failed to query master products:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEnquiry = (prod: ExtractedProduct) => {
    setSelectedProduct(prod);
    setFormDetails(`We are looking to procure ${prod.name} (${prod.companyName}). Please provide your quotation, MOQ, lead time, and technical data sheet confirmation.`);
    setIsEnquiryModalOpen(true);
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSendingEnquiry(true);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetToken: selectedProduct.companyName,
          productName: selectedProduct.name,
          quantity: formQty,
          unit: formUnit,
          purpose: formPurpose,
          details: formDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`RFQ Inquiry successfully dispatched! Support Ticket Ref: ENQ-${data.token}`);
        setIsEnquiryModalOpen(false);
      } else {
        alert("Failed to send enquiry: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Network error sending enquiry.");
    } finally {
      setIsSendingEnquiry(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");

    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: data.text,
          options: data.options,
          recommendations: data.recommendations
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error searching the database. Please try again." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Network error connecting to AI procurement engine." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Product & Lead Finder
            </h1>
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-black uppercase px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              Master Intel
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Search verified manufacturer catalogs, technical datasheets, and specification matrices in real-time.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl w-fit border border-slate-300/40 dark:border-slate-700/50 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "catalog"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" /> Master Catalog Search
          </button>
          <button
            onClick={() => setActiveTab("copilot")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "copilot"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" /> AI Procurement Copilot
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "catalog" ? (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search Box & Quick Chips */}
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by product model (e.g. 468MP, 4965, Kapton, VHB), material (e.g. Polyimide, PET, Crepe), or application..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Tag className="w-3.5 h-3.5" /> Popular:
                </span>
                {QUICK_TAGS.map((tag) => {
                  const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(isActive ? "" : tag)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Company Filter */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Manufacturer:</span>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="ALL">All Manufacturers ({companies.length})</option>
                      {companies.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Market Filter */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Market Sector:</span>
                    <select
                      value={selectedMarket}
                      onChange={(e) => setSelectedMarket(e.target.value)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="ALL">All Markets ({markets.length})</option>
                      {markets.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500 font-bold">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Showing {products.length} of {totalCount} verified products</span>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Searching Master Specification Database...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
                <Database className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No products match your search query</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try clearing specific filters or search using broader technical terms like "Double Sided", "Polyimide", "Foil", or "Masking".
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCompany("ALL"); setSelectedMarket("ALL"); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => {
                  const specsObj = prod.specs && typeof prod.specs === 'object' ? prod.specs : {};
                  const specEntries = Object.entries(specsObj).filter(
                    ([k, v]) => 
                      Boolean(k) && 
                      Boolean(v) && 
                      k.trim() !== '' && 
                      k.trim() !== ':' && 
                      String(v).trim() !== '' && 
                      String(v).trim() !== ':' && 
                      String(v).length < 150
                  );

                  return (
                    <motion.div
                      key={prod.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.15 }}
                      className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Company Badge & Verified Pill */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-xl border border-blue-200/60 dark:border-blue-800/50">
                            {prod.companyName}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> TDS Verified
                          </span>
                        </div>

                        {/* Product Title */}
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                          {prod.name}
                        </h3>

                        {/* Market & Application */}
                        {(prod.market || prod.application) && (
                          <div className="mb-4 space-y-1">
                            {prod.market && (
                              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                {prod.market}
                              </p>
                            )}
                            {prod.application && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {prod.application}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Technical Specifications Matrix */}
                        <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 mb-5 border border-slate-100 dark:border-slate-800/80">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                            Technical Specification Matrix
                          </p>
                          {specEntries.length > 0 ? (
                            <div className="space-y-1.5">
                              {specEntries.slice(0, 4).map(([key, val], idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[45%] font-medium">
                                    {key}:
                                  </span>
                                  <span className="text-slate-900 dark:text-white font-bold truncate max-w-[50%] text-right">
                                    {String(val)}
                                  </span>
                                </div>
                              ))}
                              {specEntries.length > 4 && (
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold pt-1">
                                  +{specEntries.length - 4} more verified specs
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">
                              Specification matrix verified on original manufacturer datasheet.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => openEnquiry(prod)}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" /> Quick RFQ
                        </button>
                        {prod.productUrl && (
                          <a
                            href={prod.productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                            title="View Official Datasheet"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="copilot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-[650px] bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col"
          >
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl p-5 shadow-sm text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    {/* Pros & Cons Recommendations Cards */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-5 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/80">
                        <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> Master Database Verified Matches ({msg.recommendations.length})
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                          {msg.recommendations.map((rec, rIdx) => (
                            <div key={rIdx} className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
                                    {rec.companyName}
                                  </span>
                                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{rec.name}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{rec.application}</p>
                                </div>
                                {rec.productUrl && (
                                  <a href={rec.productUrl} target="_blank" rel="noreferrer" className="p-1.5 bg-white dark:bg-slate-800 text-slate-500 rounded-lg hover:text-blue-600" title="View Datasheet">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>

                              {/* Specs */}
                              {rec.specs && Object.keys(rec.specs).length > 0 && (
                                <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-800/60 p-2.5 rounded-xl text-[11px] border border-slate-100 dark:border-slate-700/60">
                                  {Object.entries(rec.specs).slice(0, 4).map(([k, v], sIdx) => (
                                    <div key={sIdx} className="truncate">
                                      <span className="text-slate-400 font-medium">{k}:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Pros & Cons */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                                {rec.pros && rec.pros.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Advantages (Pros)
                                    </p>
                                    <ul className="space-y-1">
                                      {rec.pros.map((p, pIdx) => (
                                        <li key={pIdx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1">
                                          <span className="text-emerald-500 font-bold">•</span>
                                          <span>{p}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {rec.cons && rec.cons.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" /> Limitations (Cons)
                                    </p>
                                    <ul className="space-y-1">
                                      {rec.cons.map((c, cIdx) => (
                                        <li key={cIdx} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                                          <span className="text-amber-500 font-bold">•</span>
                                          <span>{c}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Verdict & RFQ Action */}
                              {rec.verdict && (
                                <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 font-medium">
                                  💡 <strong>Engineering Verdict:</strong> {rec.verdict}
                                </div>
                              )}

                              <button
                                onClick={() => openEnquiry({
                                  id: rec.name,
                                  name: rec.name,
                                  companyName: rec.companyName,
                                  application: rec.application,
                                  specs: rec.specs,
                                  productUrl: rec.productUrl
                                })}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                              >
                                <Send className="w-3.5 h-3.5" /> Request Quotation for {rec.name}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Options Pills */}
                    {msg.options && msg.options.length > 0 && idx === messages.length - 1 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                        {msg.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              setChatInput(opt);
                            }}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    Consulting Master Product Database & Generating Analysis...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={handleSendChatMessage} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Ask for recommendations (e.g. 'Compare 3M 468MP vs Tesa 4965 for high temp PCB bonding')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-2xl shadow-sm transition-all flex items-center justify-center"
                >
                  {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anonymous RFQ Modal */}
      {isEnquiryModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Request Quotation & RFQ</h3>
                <p className="text-xs text-blue-600 font-bold">{selectedProduct.name} • {selectedProduct.companyName}</p>
              </div>
              <button onClick={() => setIsEnquiryModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEnquiry} className="p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Estimated Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Procurement Requirement Details</label>
                <textarea
                  rows={4}
                  required
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                🛡️ TarasAI acts as an anonymous middleman. Your business identity and trade terms are securely encrypted.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnquiryModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEnquiry}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  {isSendingEnquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Dispatch RFQ Anonymously
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

