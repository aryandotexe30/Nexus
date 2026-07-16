"use client";

import React, { useState } from 'react';
import { Search, Loader2, ChevronDown, ChevronRight, Package, Factory, Cpu, Zap, Globe, Layers } from 'lucide-react';

const icons = {
  Company: <Globe className="w-4 h-4 text-blue-500" />,
  Product: <Package className="w-4 h-4 text-purple-500" />,
  "Raw Material": <Cpu className="w-4 h-4 text-orange-500" />,
  Supplier: <Factory className="w-4 h-4 text-green-500" />,
  Application: <Zap className="w-4 h-4 text-red-500" />,
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

const safeRender = (val: any): React.ReactNode => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.map(v => safeRender(v)).join(', ');
  if (typeof val === 'object') return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join('\n');
  return String(val);
};

const TreeNode = ({ label, type, level = 0, context = "" }: { label: string; type: string; level?: number, context?: string }) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [action: string]: {label: string, type: string}[] }>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const options = getOptions(type);
  const nodeContext = context || label; // The root context is passed down

  const handleExpand = async (action: string) => {
    setMenuOpen(false);
    
    // Toggle off if already expanded
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
    <div className="w-full">
      {/* Node Content */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors shadow-sm`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
            {icons[type as keyof typeof icons] || icons["Company"]}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{type}</div>
            <div className="font-semibold text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap font-mono text-sm">{safeRender(label)}</div>
          </div>
        </div>

        {options.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 font-medium text-sm rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4" />
              Explore...
              <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleExpand(opt)}
                    disabled={loadingAction !== null}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 flex items-center justify-between"
                  >
                    {opt}
                    {expandedGroups[opt] && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Children */}
      <div className="flex flex-col gap-2 mt-2" style={{ marginLeft: `${level === 0 ? 1 : 2}rem` }}>
        {Object.entries(expandedGroups).map(([action, children]) => (
          <div key={action} className="relative mt-2">
            {/* The vertical connection line */}
            <div className="absolute -left-6 top-0 bottom-8 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-2 mb-3 -ml-6 relative">
              <div className="w-6 h-px bg-slate-200"></div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-md">
                {action}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {children.map((child, idx) => (
                <div key={idx} className="relative">
                  {/* The horizontal branch line to the node */}
                  <div className="absolute -left-6 top-6 w-6 h-px bg-slate-200"></div>
                  <TreeNode label={child.label} type={child.type} level={level + 1} context={nodeContext} />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {loadingAction && (
          <div className="relative mt-2">
            <div className="absolute -left-6 top-0 bottom-0 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 mb-3 -ml-6 relative">
              <div className="w-6 h-px bg-slate-200"></div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing {loadingAction}...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
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
    <div className="w-full h-full relative overflow-y-auto bg-slate-50/50 p-6 sm:p-10">
      
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
