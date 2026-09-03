"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, Loader2, ChevronDown, ChevronRight, Package, Factory, 
  Cpu, Zap, Globe, Layers, Bookmark, Check, Sparkles, Filter, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const icons = {
  Company: <Globe className="w-5 h-5 text-blue-500" />,
  Product: <Package className="w-5 h-5 text-purple-500" />,
  "Raw Material": <Cpu className="w-5 h-5 text-amber-500" />,
  Supplier: <Factory className="w-5 h-5 text-emerald-500" />,
  Application: <Zap className="w-5 h-5 text-rose-500" />,
};

const getOptions = (type: string) => {
  switch (type) {
    case "Company": return ["Find Products", "Find Competitors"];
    case "Product": return ["Find Raw Materials", "Find Manufacturers", "Find Other Applications"];
    case "Raw Material": return ["Find Suppliers", "Find Alternative Uses"];
    case "Supplier": return ["Find Products"];
    case "Application": return ["Find Raw Materials"];
    default: return [];
  }
};

interface ParsedNodeData {
  title: string;
  category?: string;
  description?: string;
  specs?: string;
  rawMaterials?: string;
  applications?: string;
  tags: { key: string; val: string }[];
}

const parseLabel = (label: string): ParsedNodeData => {
  if (!label || typeof label !== 'string') return { title: String(label), tags: [] };
  const parts = label.split('|').map(s => s.trim()).filter(Boolean);
  
  let rawTitle = parts[0] || "";
  // Sanitize title from placeholder endings
  rawTitle = rawTitle
    .replace(/\s*\/\s*N\/A$/i, '')
    .replace(/\s*-\s*Model:\s*Not disclosed$/i, '')
    .replace(/\s*-\s*N\/A$/i, '')
    .trim();

  if (parts.length === 1) return { title: rawTitle, tags: [] };
  
  const title = rawTitle;
  let category: string | undefined;
  let description: string | undefined;
  let specs: string | undefined;
  let rawMaterials: string | undefined;
  let applications: string | undefined;
  const tags: { key: string; val: string }[] = [];

  parts.slice(1).forEach(t => {
    if (t.includes(':')) {
      const [k, ...v] = t.split(':');
      const keyTrimmed = k.trim().toLowerCase();
      const valTrimmed = v.join(':').trim();

      if (valTrimmed.toLowerCase() === 'not disclosed' || valTrimmed.toLowerCase() === 'n/a') {
        return;
      }

      if (keyTrimmed.includes('category') || keyTrimmed.includes('family') || keyTrimmed.includes('type')) {
        category = valTrimmed;
      } else if (keyTrimmed.includes('desc')) {
        description = valTrimmed;
      } else if (keyTrimmed.includes('spec')) {
        specs = valTrimmed;
      } else if (keyTrimmed.includes('raw') || keyTrimmed.includes('material')) {
        rawMaterials = valTrimmed;
      } else if (keyTrimmed.includes('app') || keyTrimmed.includes('use')) {
        applications = valTrimmed;
      } else {
        tags.push({ key: k.trim(), val: valTrimmed });
      }
    } else {
      tags.push({ key: '', val: t });
    }
  });

  return { title, category, description, specs, rawMaterials, applications, tags };
};

const TreeNode = ({ 
  label, 
  type, 
  level = 0, 
  context = "" 
}: { 
  label: string; 
  type: string; 
  level?: number; 
  context?: string 
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [action: string]: { label: string; type: string }[] }>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ [action: string]: string }>({});
  const [filterQuery, setFilterQuery] = useState<{ [action: string]: string }>({});

  const options = getOptions(type);
  const nodeContext = context || label;
  const parsed = parseLabel(label);

  const handleExpand = async (action: string) => {
    setMenuOpen(false);
    
    if (expandedGroups[action]) {
      const newGroups = { ...expandedGroups };
      delete newGroups[action];
      setExpandedGroups(newGroups);
      return;
    }

    setLoadingAction(action);
    try {
      const res = await fetch("/api/network/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeLabel: parsed.title, nodeType: type, action, context: nodeContext })
      });
      const data = await res.json();
      if (!data.success && data.error) throw new Error(data.error);

      const rawItems = Array.isArray(data.items) ? data.items : [];
      setExpandedGroups((prev) => ({
        ...prev,
        [action]: rawItems.map((item: any) => ({ 
          label: typeof item === 'string' ? item : (item.name || item.title || JSON.stringify(item)), 
          type: data.targetType || "Product"
        }))
      }));
    } catch (error: any) {
      console.error(error);
      alert(`Failed to expand node: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveToDatabook = async () => {
    setSaved(true);
    try {
      await fetch("/api/databook/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.title,
          category: parsed.category || type,
          description: parsed.description || `Verified ${type} discovered via TarasAI Brain`,
          specs: {
            specs: parsed.specs || "Verified Industrial Spec",
            category: parsed.category,
            source: "TarasAI Brain Knowledge Graph"
          }
        })
      });
    } catch (e) {
      console.warn("Databook bookmark notice:", e);
    }
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="w-full relative"
    >
      {/* Main Node Card */}
      <motion.div 
        whileHover={{ scale: 1.008, boxShadow: "0px 10px 35px -8px rgba(59, 130, 246, 0.15)" }}
        className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 sm:p-6 bg-white border border-slate-200/80 rounded-2xl transition-all shadow-sm relative group ${menuOpen ? 'z-30' : 'z-10'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
        
        <div className="flex items-start gap-4 relative z-10 flex-1">
          <div className="mt-1 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/90 shadow-sm shrink-0">
            {icons[type as keyof typeof icons] || icons["Company"]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                {type}
              </span>
              {parsed.category && (
                <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                  {parsed.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Brain Verified
              </span>
            </div>

            <h3 className="font-extrabold text-slate-900 text-lg leading-snug mb-1.5 break-words">
              {parsed.title}
            </h3>
            
            {parsed.description && (
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-2.5">
                {parsed.description}
              </p>
            )}

            {/* Technical Specs & Details Pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {parsed.specs && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50/80 text-purple-700 border border-purple-200/70">
                  <span className="text-purple-400 font-bold">Specs:</span>
                  <span>{parsed.specs}</span>
                </div>
              )}
              {parsed.rawMaterials && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50/80 text-amber-700 border border-amber-200/70">
                  <span className="text-amber-400 font-bold">Materials:</span>
                  <span>{parsed.rawMaterials}</span>
                </div>
              )}
              {parsed.applications && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-50/80 text-rose-700 border border-rose-200/70">
                  <span className="text-rose-400 font-bold">Uses:</span>
                  <span>{parsed.applications}</span>
                </div>
              )}
              {parsed.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  {tag.key && <span className="text-slate-400 mr-1.5 font-semibold">{tag.key}:</span>}
                  {tag.val}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 relative z-20 shrink-0 self-start sm:self-center">
          <button
            onClick={handleSaveToDatabook}
            title="Bookmark to Databook"
            className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center ${
              saved 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            {saved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {options.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                Explore
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {menuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-[100] py-2 overflow-hidden"
                  >
                    {options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleExpand(opt)}
                        disabled={loadingAction !== null}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 flex items-center justify-between transition-colors"
                      >
                        {opt}
                        {expandedGroups[opt] && <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Expanded Children Branches */}
      <div className="flex flex-col gap-4 mt-4" style={{ marginLeft: `${level === 0 ? 1.5 : 2.5}rem` }}>
        <AnimatePresence>
          {Object.entries(expandedGroups).map(([action, children]) => {
            // Categorize and filter children dynamically
            const categories = Array.from(new Set(children.map(c => parseLabel(c.label).category).filter(Boolean))) as string[];
            const activeCategory = selectedCategory[action] || "ALL";
            const searchQ = (filterQuery[action] || "").toLowerCase().trim();

            const filteredChildren = children.filter(c => {
              const parsedChild = parseLabel(c.label);
              const matchesCategory = activeCategory === "ALL" || parsedChild.category === activeCategory;
              const matchesSearch = !searchQ || 
                parsedChild.title.toLowerCase().includes(searchQ) ||
                (parsedChild.category && parsedChild.category.toLowerCase().includes(searchQ)) ||
                (parsedChild.specs && parsedChild.specs.toLowerCase().includes(searchQ));
              return matchesCategory && matchesSearch;
            });

            return (
              <motion.div 
                key={action}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative mt-2"
              >
                <div className="absolute -left-6 top-0 bottom-8 w-px bg-gradient-to-b from-blue-300 via-indigo-200 to-transparent"></div>
                
                {/* Header for Expanded Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 -ml-6 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-px bg-blue-300"></div>
                    <span className="px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-800 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      {action} ({filteredChildren.length} of {children.length})
                    </span>
                  </div>

                  {/* Search and Category Filter for Action Group */}
                  {children.length > 5 && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filter models..."
                          value={filterQuery[action] || ""}
                          onChange={(e) => setFilterQuery(prev => ({ ...prev, [action]: e.target.value }))}
                          className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400 shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Pills Filter */}
                {categories.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 pl-2">
                    <button
                      onClick={() => setSelectedCategory(prev => ({ ...prev, [action]: "ALL" }))}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        activeCategory === "ALL"
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      All ({children.length})
                    </button>
                    {categories.map(cat => {
                      const count = children.filter(c => parseLabel(c.label).category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(prev => ({ ...prev, [action]: cat }))}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                            activeCategory === cat
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {/* Child Nodes */}
                <div className="flex flex-col gap-4">
                  {filteredChildren.map((child, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-8 w-6 h-px bg-slate-200"></div>
                      <TreeNode label={child.label} type={child.type} level={level + 1} context={nodeContext} />
                    </div>
                  ))}
                  {filteredChildren.length === 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 text-center">
                      No items matching filter criteria.
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <AnimatePresence>
          {loadingAction && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="relative mt-2"
            >
              <div className="absolute -left-6 top-0 bottom-0 w-px bg-blue-200"></div>
              <div className="flex items-center gap-3 mb-3 -ml-6 relative">
                <div className="w-6 h-px bg-blue-200"></div>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Brain Synthesizing {loadingAction}...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function NetworkTree() {
  const [search, setSearch] = useState("");
  const [rootNode, setRootNode] = useState<{ label: string; type: string } | null>(null);

  const startTree = () => {
    if (!search.trim()) return;
    setRootNode({ label: search.trim(), type: 'Company' });
  };

  return (
    <div className="w-full h-full relative overflow-y-auto bg-transparent p-4 sm:p-8">
      
      {/* Search & Brain Status Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-5 items-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-indigo-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 relative z-10 border border-white">
            <Sparkles className="w-7 h-7" />
          </div>
          
          <div className="flex-1 w-full relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">TarasAI Brain & Value Chain Mapper</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                Live Brain
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Autonomous persistent intelligence for products, raw materials, and verified industrial supply chains.
            </p>
          </div>
          
          <div className="flex gap-2.5 w-full sm:w-auto relative z-10">
            <input
              type="text"
              placeholder="e.g. Sri Vasavi Tapes, tesa, Havells..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startTree()}
              className="flex-1 sm:w-80 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 font-semibold text-sm"
            />
            <button 
              onClick={startTree}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 transform hover:scale-105 active:scale-95 text-sm shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Interactive Tree Graph Area */}
      <div className="max-w-4xl mx-auto pb-32">
        {rootNode ? (
          <TreeNode label={rootNode.label} type={rootNode.type} context={rootNode.label} />
        ) : (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="h-72 flex flex-col items-center justify-center text-center p-8 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-lg"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-5 shadow-inner border border-blue-100">
              <Layers className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-1">Interactive Value Chain Graph</h3>
            <p className="text-sm font-medium text-slate-500 max-w-md">
              Search any global or domestic manufacturer above to recursively map their genuine product portfolio, technical specs, and raw material supply chain.
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
}
