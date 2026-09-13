"use client";

import { useState, useRef, useEffect } from "react";
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
  Filter,
  RefreshCw,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  PanelRightOpen,
  PanelRightClose
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

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

interface CopilotRecommendation {
  name: string;
  companyName: string;
  location?: string;
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

const getLocationBadge = (loc?: string) => {
  if (!loc) return null;
  switch (loc) {
    case 'India': return '🇮🇳 India';
    case 'China': return '🇨🇳 China';
    case 'Germany': return '🇩🇪 Germany';
    case 'United States': return '🇺🇸 USA';
    case 'Japan': return '🇯🇵 Japan';
    case 'France': return '🇫🇷 France';
    default: return `🌐 ${loc}`;
  }
};

export default function FinderPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const companyName = user?.companyName || "Industrial Enterprise";
  const userIndustry = user?.industry || "Industrial Manufacturing";

  // Mode: "chatbot" (default front-and-center) with optional side catalog drawer
  const [showCatalogDrawer, setShowCatalogDrawer] = useState(false);

  // Search & Filter State for Catalog Drawer
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [selectedMarket, setSelectedMarket] = useState("ALL");
  const [selectedProductType, setSelectedProductType] = useState("ALL");
  const [selectedSideType, setSelectedSideType] = useState("ALL");
  const [selectedBacking, setSelectedBacking] = useState("ALL");
  const [selectedAdhesionType, setSelectedAdhesionType] = useState("ALL");
  const [selectedThickness, setSelectedThickness] = useState("ALL");
  const [selectedTempRange, setSelectedTempRange] = useState("ALL");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Enquiry Modal State
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);
  const [formQty, setFormQty] = useState("");
  const [formUnit, setFormUnit] = useState("Rolls / Sq. Meters");
  const [formPurpose, setFormPurpose] = useState("Industrial Production");
  const [formDetails, setFormDetails] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // AI Copilot Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: `👋 **Welcome, ${companyName}!**\n\nI am your **AI Materials & Tape Sourcing Copilot**, trained on our **Master Database of 750+ verified industrial specifications** across premier global and Chinese manufacturers (3M, Tesa, CGAPL, Shanghai Yongguan, Xiamen Naikos, Shenzhen YouSan, CYG Changtong, Wanghao Camat, Jiangsu Crown, Shenzhen Kingzom, Zhejiang Furukawa China, Hebei Huaxia, Dongguan Haotian, Shandong Lianjie, Guangzhou Broadya, Nitto, AIPL, Sri Vasavi, Henkel Loctite, Shurtape, Saint-Gobain).\n\nBased on your manufacturing profile (**${userIndustry}**), tell me what application, region/origin, or technical parameters you are sourcing (e.g. *Indian Class H tapes, Chinese acrylic foam, German double-sided PET, temperature rating, substrate material*).`,
      options: [
        "Class H High Temp Insulation (260°C)",
        "Double-Sided Acrylic Foam VHB",
        "Wave Solder Kapton Polyimide",
        "Aluminium Foil HVAC & Shielding",
        "Indian Manufacturers for Class H",
        "Chinese VHB, Aerogel & Kapton Suppliers"
      ]
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiLoading]);

  // Load catalog products when drawer is open or search changes
  useEffect(() => {
    if (!showCatalogDrawer && products.length > 0) return;
    const timer = setTimeout(() => {
      fetchMasterProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [
    showCatalogDrawer,
    searchQuery, 
    selectedLocation,
    selectedCompany, 
    selectedMarket,
    selectedProductType,
    selectedSideType,
    selectedBacking,
    selectedAdhesionType,
    selectedThickness,
    selectedTempRange
  ]);

  const fetchMasterProducts = async () => {
    setLoadingCatalog(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedLocation !== "ALL") params.append("location", selectedLocation);
      if (selectedCompany !== "ALL") params.append("company", selectedCompany);
      if (selectedMarket !== "ALL") params.append("market", selectedMarket);
      if (selectedProductType !== "ALL") params.append("productType", selectedProductType);
      if (selectedSideType !== "ALL") params.append("sideType", selectedSideType);
      if (selectedBacking !== "ALL") params.append("backing", selectedBacking);
      if (selectedAdhesionType !== "ALL") params.append("adhesionType", selectedAdhesionType);
      if (selectedThickness !== "ALL") params.append("thickness", selectedThickness);
      if (selectedTempRange !== "ALL") params.append("tempRange", selectedTempRange);
      params.append("limit", "100");

      const res = await fetch(`/api/products/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalCount(data.total || data.products?.length || 0);
        if (data.companies) setCompanies(data.companies);
        if (data.markets) setMarkets(data.markets);
        if (data.filterOptions) setFilterOptions(data.filterOptions);
      }
    } catch (err) {
      console.warn("Failed to fetch catalog products", err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || chatInput;
    if (!promptToSend.trim() || isAiLoading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', text: promptToSend }
    ];

    setMessages(newMessages);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          companyContext: {
            companyName,
            industry: userIndustry
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages([
          ...newMessages,
          {
            role: 'ai',
            text: data.text,
            options: data.options,
            recommendations: data.recommendations
          }
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'ai',
            text: `⚠️ **Notice:** ${data.error || "Could not retrieve AI response. Please try again."}`
          }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'ai',
          text: "⚠️ Network connection issue. Please check your internet or retry."
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const openEnquiry = (prod: any) => {
    setSelectedProduct(prod);
    setFormQty("");
    setFormDetails("");
    setEnquirySuccess(false);
    setIsEnquiryModalOpen(true);
  };

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSendingEnquiry(true);
    try {
      const res = await fetch("/api/marketplace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Procurement RFQ: ${selectedProduct.name} (${selectedProduct.companyName})`,
          description: `Target Product: ${selectedProduct.name}\nManufacturer: ${selectedProduct.companyName}\nRequired Quantity: ${formQty} ${formUnit}\nUsage Application: ${formPurpose}\n\nTechnical Specifications Required:\n${JSON.stringify(selectedProduct.specs || {}, null, 2)}\n\nBuyer Notes:\n${formDetails || 'Please provide quotation with TDS certification.'}`,
          type: "REQUEST",
          budget: "Negotiable / Factory Direct",
          isAnonymous: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setEnquirySuccess(true);
        setTimeout(() => {
          setIsEnquiryModalOpen(false);
          setEnquirySuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.warn("Failed to create RFQ", err);
    } finally {
      setIsSendingEnquiry(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              AI Procurement Copilot
            </span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              160+ Master TDS Models
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Intelligent Material & Tape Finder
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Grounded in verified manufacturer datasheets (3M, Tesa, CGAPL, Nitto, AIPL, Sri Vasavi, Henkel Loctite, Shurtape).
          </p>
        </div>

        {/* Drawer Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowCatalogDrawer(!showCatalogDrawer);
              if (!showCatalogDrawer && products.length === 0) fetchMasterProducts();
            }}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all border shadow-2xs ${
              showCatalogDrawer 
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            {showCatalogDrawer ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            <span>{showCatalogDrawer ? "Hide Catalog Drawer" : "Browse Technical Catalog"}</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className={`grid grid-cols-1 ${showCatalogDrawer ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6 items-start`}>
        
        {/* Chatbot Interface (Main Area) */}
        <div className={`${showCatalogDrawer ? 'lg:col-span-7' : 'w-full max-w-5xl mx-auto'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[750px]`}>
          
          {/* Chat Header Bar */}
          <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  TarasAI Sourcing Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Personalized for {companyName} • {userIndustry}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    role: 'ai',
                    text: `👋 **Welcome back, ${companyName}!**\n\nWhat industrial tape or material specification are you looking for today?`,
                    options: [
                      "Class H High Temp Insulation (260°C)",
                      "Double-Sided Acrylic Foam VHB",
                      "Wave Solder Kapton Polyimide",
                      "Aluminium Foil HVAC & Shielding",
                      "Automotive Wire Harnessing"
                    ]
                  }
                ]);
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Chat"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40 dark:bg-slate-950/40">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-3xl p-5 shadow-sm text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {/* Interactive Option Chips */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                        Suggested Technical Specifications:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleSendMessage(opt)}
                            disabled={isAiLoading}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all border border-blue-200 dark:border-blue-800/60 flex items-center gap-1 active:scale-95 text-left"
                          >
                            <span>{opt}</span>
                            <ChevronRight className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Products Cards with Pros & Cons */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-5 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/80">
                      <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Master Database Verified Matches ({msg.recommendations.length})
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {msg.recommendations.map((rec, rIdx) => (
                          <div key={rIdx} className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
                                    {rec.companyName}
                                  </span>
                                  {rec.location && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                      {getLocationBadge(rec.location)}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">{rec.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{rec.application}</p>
                              </div>
                              {rec.productUrl && (
                                <a href={rec.productUrl} target="_blank" rel="noreferrer" className="p-1.5 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-lg shadow-2xs" title="Official Datasheet">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>

                          {/* Technical Specs */}
                          {rec.specs && Object.keys(rec.specs).length > 0 && (
                            <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-800/60 p-2.5 rounded-xl text-[11px] border border-slate-100 dark:border-slate-700/60">
                              {Object.entries(rec.specs).slice(0, 4).map(([k, v], sIdx) => (
                                <div key={sIdx} className="truncate">
                                  <span className="text-slate-400 font-medium">{k}: </span>
                                  <span className="text-slate-800 dark:text-slate-200 font-bold">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pros & Cons */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {rec.pros && rec.pros.length > 0 && (
                              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Key Strengths
                                </span>
                                {rec.pros.map((p, pIdx) => (
                                  <p key={pIdx} className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-tight">• {p}</p>
                                ))}
                              </div>
                            )}
                            {rec.cons && rec.cons.length > 0 && (
                              <div className="bg-rose-50/60 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-rose-600" /> Engineering Caveats
                                </span>
                                {rec.cons.map((c, cIdx) => (
                                  <p key={cIdx} className="text-[11px] text-rose-900 dark:text-rose-200 leading-tight">• {c}</p>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Verdict & Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] text-slate-500 italic max-w-[65%] truncate">
                              {rec.verdict || `Recommended model from ${rec.companyName}`}
                            </p>
                            <button
                              onClick={() => openEnquiry(rec)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1 active:scale-95"
                            >
                              <Send className="w-3 h-3" /> Quick RFQ
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isAiLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl rounded-bl-none p-4 shadow-sm flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Analyzing 750+ master TDS models and matching engineering parameters...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about any tape specification, substrate compatibility, or temperature requirements..."
              disabled={isAiLoading}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isAiLoading}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Collapsible Technical Catalog Drawer */}
      {showCatalogDrawer && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 h-[750px] flex flex-col"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Technical Catalog ({totalCount})
              </h3>
            </div>
            <button
              onClick={() => setShowCatalogDrawer(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog models..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* Location / Country Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Origins</option>
                {(filterOptions.locations || ['India', 'China', 'Germany', 'United States', 'Japan', 'France', 'Global / Other']).map((loc: string) => (
                  <option key={loc} value={loc}>{getLocationBadge(loc) || loc}</option>
                ))}
              </select>

              {/* Backing Filter */}
              <select
                value={selectedBacking}
                onChange={(e) => setSelectedBacking(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Backings</option>
                {(filterOptions.backingTypes || ['Polyimide / Kapton', 'PET / Polyester Film', 'Fiberglass / Glass Cloth', 'Aluminum / Copper Foil', 'Foam (Acrylic / PE / PU)', 'PVC / Vinyl', 'Paper / Crepe / Washi']).map((b: string) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Company Filter */}
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Cards List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loadingCatalog ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <p className="text-xs font-semibold">Filtering catalog database...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                No products matched the current filters.
              </div>
            ) : (
              products.map((prod) => (
                <div key={prod.id} className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-3.5 space-y-2 hover:border-blue-400 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
                          {prod.companyName}
                        </span>
                        {prod.classification?.location && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md">
                            {getLocationBadge(prod.classification.location)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1">{prod.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{prod.application}</p>
                    </div>
                    {prod.productUrl && (
                      <a href={prod.productUrl} target="_blank" rel="noreferrer" className="p-1 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-md">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Attribute Badges */}
                  {prod.classification && (
                    <div className="flex flex-wrap gap-1">
                      {prod.classification.sideType && prod.classification.sideType !== 'Single-Sided' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded">
                          {prod.classification.sideType}
                        </span>
                      )}
                      {prod.classification.backingType && prod.classification.backingType !== 'Other / Unspecified' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded">
                          {prod.classification.backingType}
                        </span>
                      )}
                      {prod.classification.tempRange && prod.classification.tempRange !== 'Standard (< 80°C)' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded">
                          {prod.classification.tempRange}
                        </span>
                      )}
                    </div>
                  )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <button
                        onClick={() => handleSendMessage(`Tell me about ${prod.name} from ${prod.companyName} and compare it with alternatives.`)}
                        className="flex-1 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1"
                      >
                        <Bot className="w-3 h-3 text-blue-600" /> Ask Copilot
                      </button>
                      <button
                        onClick={() => openEnquiry(prod)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl transition-all"
                      >
                        RFQ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* RFQ Enquiry Modal */}
      <AnimatePresence>
        {isEnquiryModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => setIsEnquiryModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>

              {enquirySuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Anonymous RFQ Dispatched</h3>
                  <p className="text-xs text-slate-500">Your requirement has been listed on the marketplace for certified distributors.</p>
                </div>
              ) : (
                <form onSubmit={submitEnquiry} className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
                      {selectedProduct.companyName}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{selectedProduct.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Publish an anonymous procurement request to certified suppliers.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Required Quantity</label>
                      <input
                        type="text"
                        required
                        value={formQty}
                        onChange={(e) => setFormQty(e.target.value)}
                        placeholder="e.g. 500, 2000"
                        className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Unit</label>
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Application Purpose</label>
                    <input
                      type="text"
                      value={formPurpose}
                      onChange={(e) => setFormPurpose(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Additional Notes / Custom Widths</label>
                    <textarea
                      rows={2}
                      value={formDetails}
                      onChange={(e) => setFormDetails(e.target.value)}
                      placeholder="e.g. 24mm width rolls, batch test certificate required..."
                      className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEnquiryModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingEnquiry}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                    >
                      {isSendingEnquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Dispatch RFQ</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
