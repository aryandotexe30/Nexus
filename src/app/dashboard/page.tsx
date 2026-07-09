"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, UploadCloud, Database, Zap, Activity, TrendingUp, Users, ArrowUpRight, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState, useEffect } from "react";

export default function HubDashboard() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    credits: 0,
    totalLeads: 0,
    activityData: [],
    engagementData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        if(!data.error) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!mounted) return null;
  const user = session?.user as any;

  return (
    <div className="max-w-7xl mx-auto font-sans pb-24 space-y-8">
      <header className="mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight mb-2 transition-colors">
            Welcome back, {user?.companyName || "Explorer"}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            Your centralized B2B Intelligence Hub.
          </p>
        </motion.div>
      </header>

      {/* Stats Grid (Liquid Glass) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Remaining Credits</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : stats.credits}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Total Leads</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : stats.totalLeads}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">System Status</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.8)]"></span>
                Online
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/40 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Platform Activity (Last 7 Days)</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Credits consumed vs AI searches performed</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {!loading && stats.activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                  />
                  <Area type="monotone" dataKey="credits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCredits)" />
                  <Area type="monotone" dataKey="searches" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSearches)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Loading data...</div>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/40 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Marketplace Engagement</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">B2B Platform Metrics</p>
          </div>
          <div className="flex-1 w-full relative">
            {!loading && stats.engagementData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.engagementData} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none' }}/>
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Loading data...</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/dashboard/matchmaker">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative h-full overflow-hidden rounded-[2rem] p-10 bg-slate-900 border border-slate-800 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-500"></div>
            
            <Search className="w-14 h-14 mb-8 text-blue-400 group-hover:text-white transition-colors duration-300" />
            <h2 className="text-3xl font-bold mb-4 text-white">Global Matchmaker</h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm mb-12">
              Find exactly who you are looking for. Describe your ideal buyer or seller in plain English, and our AI will search the entire global internet.
            </p>
            <div className="absolute bottom-10 left-10 flex items-center gap-2 font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
              Launch Matchmaker <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </motion.div>
        </Link>

        <Link href="/dashboard/enrich">
          <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
            className="group relative h-full overflow-hidden rounded-[2rem] p-10 bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
            
            <UploadCloud className="w-14 h-14 mb-8 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Data Enrichment</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-sm mb-12">
              Upload an Excel list of companies and watch as our autonomous AI agents scour the web to gather financial, personnel, and deep insights instantly.
            </p>
            <div className="absolute bottom-10 left-10 flex items-center gap-2 font-bold text-indigo-500 group-hover:text-indigo-600 transition-colors">
              Start Enrichment <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
