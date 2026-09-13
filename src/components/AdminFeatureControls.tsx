"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Database, 
  Search, 
  Store, 
  Settings, 
  Landmark, 
  Headset, 
  Layers,
  Eye,
  EyeOff
} from "lucide-react";
import { ModuleConfig, ModuleAccessLevel } from "@/lib/featureFlags";

interface AdminFeatureControlsProps {
  initialModules: ModuleConfig[];
}

const ICON_MAP: Record<string, any> = {
  Search: Search,
  Store: Store,
  Database: Database,
  TrendingUp: TrendingUp,
  Landmark: Landmark,
  Settings: Settings,
  ShieldCheck: ShieldCheck,
  Headset: Headset
};

export default function AdminFeatureControls({ initialModules }: AdminFeatureControlsProps) {
  const [modules, setModules] = useState<ModuleConfig[]>(initialModules || []);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [tempMessage, setTempMessage] = useState<string>("");

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleAccessChange = async (moduleId: string, newAccess: ModuleAccessLevel) => {
    setSavingId(moduleId);
    try {
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, access: newAccess })
      });
      const data = await res.json();
      if (data.success && data.modules) {
        setModules(data.modules);
        showToast(`Updated "${modules.find(m => m.id === moduleId)?.name}" to ${newAccess === 'ALL' ? 'Public (All Users)' : newAccess === 'ADMIN_ONLY' ? 'Admins Only' : 'Maintenance Mode'}`);
      } else {
        showToast(data.error || "Failed to update module", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error updating module", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleSidebarToggle = async (moduleId: string, currentState: boolean) => {
    setSavingId(moduleId);
    try {
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, isSidebarVisible: !currentState })
      });
      const data = await res.json();
      if (data.success && data.modules) {
        setModules(data.modules);
        showToast(`Sidebar visibility updated for "${modules.find(m => m.id === moduleId)?.name}"`);
      } else {
        showToast(data.error || "Failed to update sidebar visibility", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSavingId(null);
    }
  };

  const saveMaintenanceMessage = async (moduleId: string) => {
    setSavingId(moduleId);
    try {
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, maintenanceMessage: tempMessage })
      });
      const data = await res.json();
      if (data.success && data.modules) {
        setModules(data.modules);
        setEditingMessageId(null);
        showToast("Maintenance announcement saved successfully");
      } else {
        showToast(data.error || "Failed to save message", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Reset all module permissions and sidebar visibility to system defaults?")) return;
    setSavingId("ALL");
    try {
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_DEFAULTS" })
      });
      const data = await res.json();
      if (data.success && data.modules) {
        setModules(data.modules);
        showToast("All modules reset to system defaults");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to reset defaults", "error");
    } finally {
      setSavingId(null);
    }
  };

  const publicCount = modules.filter(m => m.access === 'ALL').length;
  const adminOnlyCount = modules.filter(m => m.access === 'ADMIN_ONLY').length;
  const maintenanceCount = modules.filter(m => m.access === 'MAINTENANCE').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-md transition-all ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-500/20 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Navigation & Page Access Matrix
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Sidebar Tabs & Page Visibility Controls
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dynamically toggle which features and pages are visible to regular users vs restricted exclusively to administrators.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick 5-Year Plan Switch */}
          {modules.find(m => m.id === 'business_plan')?.access === 'ALL' ? (
            <button
              onClick={() => handleAccessChange('business_plan', 'ADMIN_ONLY')}
              disabled={savingId === 'business_plan'}
              className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock 5-Year Plan (Admins Only)
            </button>
          ) : (
            <button
              onClick={() => handleAccessChange('business_plan', 'ALL')}
              disabled={savingId === 'business_plan'}
              className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5" />
              Enable 5-Year Plan for All
            </button>
          )}

          <button
            onClick={handleResetDefaults}
            disabled={Boolean(savingId)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${savingId === 'ALL' ? 'animate-spin' : ''}`} />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Public (All Users)</p>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{publicCount}</p>
          </div>
          <Globe className="w-6 h-6 text-emerald-500 opacity-60" />
        </div>
        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Admins Only</p>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{adminOnlyCount}</p>
          </div>
          <Lock className="w-6 h-6 text-amber-500 opacity-60" />
        </div>
        <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">Under Maintenance</p>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{maintenanceCount}</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-500 opacity-60" />
        </div>
      </div>

      {/* Modules Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Sidebar Tab & Module</th>
              <th className="py-3.5 px-4">Route Path</th>
              <th className="py-3.5 px-4">Access Permission</th>
              <th className="py-3.5 px-4">Sidebar Visibility</th>
              <th className="py-3.5 px-4 text-right">Maintenance Notice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {modules.map((m) => {
              const IconComp = ICON_MAP[m.iconName] || Layers;
              const isSaving = savingId === m.id;

              return (
                <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Tab / Module Info */}
                  <td className="py-4 px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs border ${
                        m.access === 'ALL' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : m.access === 'ADMIN_ONLY'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          {m.name}
                          {m.id === 'products' && (
                            <span className="text-[10px] px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-md font-bold border border-purple-200 dark:border-purple-800">
                              Backend DB
                            </span>
                          )}
                          {m.id === 'business_plan' && m.access === 'ADMIN_ONLY' && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-md font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Admin Protected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xs truncate">{m.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-4 px-4 align-middle font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200/60 dark:border-slate-700">
                      {m.path}
                    </span>
                  </td>

                  {/* Access Level Selector */}
                  <td className="py-4 px-4 align-middle">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                      <button
                        onClick={() => handleAccessChange(m.id, 'ALL')}
                        disabled={isSaving}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                          m.access === 'ALL'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Accessible to all users"
                      >
                        <Globe className="w-3 h-3" />
                        Everyone
                      </button>

                      <button
                        onClick={() => handleAccessChange(m.id, 'ADMIN_ONLY')}
                        disabled={isSaving}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                          m.access === 'ADMIN_ONLY'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Restricted to Admins Only"
                      >
                        <Lock className="w-3 h-3" />
                        Admins Only
                      </button>

                      <button
                        onClick={() => handleAccessChange(m.id, 'MAINTENANCE')}
                        disabled={isSaving}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                          m.access === 'MAINTENANCE'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Show maintenance announcement to regular users"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Maintenance
                      </button>
                    </div>
                  </td>

                  {/* Sidebar Toggle */}
                  <td className="py-4 px-4 align-middle">
                    <button
                      onClick={() => handleSidebarToggle(m.id, m.isSidebarVisible)}
                      disabled={isSaving}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all border ${
                        m.isSidebarVisible
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m.isSidebarVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {m.isSidebarVisible ? 'Visible' : 'Hidden'}
                    </button>
                  </td>

                  {/* Maintenance Notice Editor */}
                  <td className="py-4 px-4 align-middle text-right">
                    {editingMessageId === m.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="text"
                          value={tempMessage}
                          onChange={(e) => setTempMessage(e.target.value)}
                          placeholder="Maintenance explanation..."
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs w-64 outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => saveMaintenanceMessage(m.id)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {m.maintenanceMessage && (
                          <span className="text-[11px] text-slate-400 italic max-w-[200px] truncate" title={m.maintenanceMessage}>
                            "{m.maintenanceMessage}"
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingMessageId(m.id);
                            setTempMessage(m.maintenanceMessage || "");
                          }}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {m.maintenanceMessage ? 'Edit Notice' : '+ Add Notice'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
