"use client";

import React, { useState } from 'react';
import { Search, Loader2, ChevronDown, ChevronRight, Package, Factory, Cpu, Zap, Globe, Layers } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const icons = {
  Company: <Globe className="w-5 h-5 text-blue-500" />,
  Product: <Package className="w-5 h-5 text-purple-500" />,
  "Raw Material": <Cpu className="w-5 h-5 text-orange-500" />,
  Supplier: <Factory className="w-5 h-5 text-green-500" />,
  Application: <Zap className="w-5 h-5 text-red-500" />,
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

const parseLabel = (label: string) => {
  if (!label || typeof label !== 'string') return { title: String(label), tags: [] };
  const parts = label.split('|').map(s => s.trim()).filter(Boolean);
  if (parts.length === 1) return { title: parts[0], tags: [] };
  
  const title = parts[0];
  const tags = parts.slice(1).map(t => {
    if (t.includes(':')) {
      const [k, ...v] = t.split(':');
      return { key: k.trim(), val: v.join(':').trim() };
    }
    return { key: '', val: t };
  });
  return { title, tags };
};

const TreeNode = ({ label, type, level = 0, context = "" }: { label: string; type: string; level?: number, context?: string }) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [action: string]: {label: string, type: string}[] }>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
        body: JSON.stringify({ nodeLabel: label, nodeType: type, action, context: nodeContext })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setExpandedGroups((prev: any) => ({
        ...prev,
        [action]: data.items.map((item: string) => ({ label: item, type: data.targetType }))
      }));
    } catch (error: any) {
      console.error(error);
      alert(`Failed to expand node: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="w-full relative"
    >
      {/* Node Content */}
      <motion.div 
        whileHover={{ scale: 1.01, boxShadow: "0px 10px 30px -10px rgba(59, 130, 246, 0.2)" }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl transition-all shadow-sm relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-start gap-4 relative z-10 w-full">
          <div className="mt-1 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm">
            {icons[type as keyof typeof icons] || icons["Company"]}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">{type}</div>
            <div className="font-bold text-slate-800 text-lg leading-tight mb-2">{parsed.title}</div>
            
            {parsed.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {parsed.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                    {tag.key && <span className="text-slate-400 mr-1.5 font-semibold">{tag.key}:</span>}
                    {tag.val}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {options.length > 0 && (
          <div className="relative z-20 shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-sm"
            >
              <Layers className="w-4 h-4 text-blue-500" />
              Explore
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute right-0 top-full mt-3 w-64 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-50 py-2"
                >
                  {options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleExpand(opt)}
                      disabled={loadingAction !== null}
                      className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 flex items-center justify-between transition-colors"
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
      </motion.div>

      {/* Expanded Children */}
      <div className="flex flex-col gap-4 mt-4" style={{ marginLeft: `${level === 0 ? 1.5 : 3}rem` }}>
        <AnimatePresence>
          {Object.entries(expandedGroups).map(([action, children]) => (
            <motion.div 
              key={action}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative mt-2"
            >
              <div className="absolute -left-8 top-0 bottom-8 w-px bg-gradient-to-b from-blue-200 to-transparent"></div>
              
              <div className="flex items-center gap-3 mb-4 -ml-8 relative">
                <div className="w-8 h-px bg-blue-200"></div>
                <span className="px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-[0.15em] rounded-lg shadow-sm">
                  {action}
                </span>
              </div>
              
              <div className="flex flex-col gap-5">
                {children.map((child, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-8 top-8 w-8 h-px bg-slate-200"></div>
                    <TreeNode label={child.label} type={child.type} level={level + 1} context={nodeContext} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <AnimatePresence>
          {loadingAction && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative mt-2"
            >
              <div className="absolute -left-8 top-0 bottom-0 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3 mb-3 -ml-8 relative">
                <div className="w-8 h-px bg-slate-200"></div>
                <span className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  Generating {loadingAction}...
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
  const [rootNode, setRootNode] = useState<{label: string, type: string} | null>(null);

  const startTree = () => {
    if (!search.trim()) return;
    setRootNode({ label: search, type: 'Company' });
  };

  return (
    <div className="w-full h-full relative overflow-y-auto bg-transparent p-6 sm:p-10">
      
      {/* Search Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Value Chain Explorer</h2>
            <p className="text-sm text-slate-500">Search a company to begin recursively mapping its supply chain.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. Tesla, TSMC..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startTree()}
              className="flex-1 sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
            <button 
              onClick={startTree}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tree View Canvas */}
      <div className="max-w-4xl mx-auto pb-32">
        {rootNode ? (
          <TreeNode label={rootNode.label} type={rootNode.type} level={0} />
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-400">Your network map will appear here</h3>
          </div>
        )}
      </div>

    </div>
  );
}
