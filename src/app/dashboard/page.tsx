"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, UploadCloud, Database, Zap, ArrowUpRight, Bell, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function HubDashboard() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  const [stats, setStats] = useState({
    credits: 0,
    totalLeads: 0
  });

  const user = session?.user as any;

  useEffect(() => {
    setMounted(true);
    // Fetch stats
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        if(!data.error) setStats(data);
      });

    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to real-time feed updates removed
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFeed(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch(type) {
      case 'SYSTEM': return <AlertCircle className="w-5 h-5 text-emerald-500" />;
      case 'MATCH': return <Search className="w-5 h-5 text-blue-500" />;
      case 'BID': return <Database className="w-5 h-5 text-purple-500" />;
      case 'MESSAGE': return <MessageSquare className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgForType = (type: string) => {
    switch(type) {
      case 'SYSTEM': return 'bg-emerald-100 dark:bg-emerald-900/30';
      case 'MATCH': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'BID': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'MESSAGE': return 'bg-amber-100 dark:bg-amber-900/30';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

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

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed Column */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-500" />
              Activity Feed
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                  {unreadCount} New
                </span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark all as read
              </button>
            )}
          </div>

          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[500px]">
            {loadingFeed ? (
              <div className="h-full w-full flex items-center justify-center text-slate-500">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 py-20">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 opacity-50" />
                </div>
                <p>No activity yet. Start connecting!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative flex gap-4 p-5 rounded-2xl border transition-all ${
                        !notif.isRead 
                          ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50' 
                          : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {!notif.isRead && (
                        <div className="absolute top-5 left-2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      )}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getBgForType(notif.type)}`}>
                        {getIconForType(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                          <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.link && (
                          <Link href={notif.link} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            View Details &rarr;
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:w-[350px] space-y-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/40 dark:border-slate-700/50 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Remaining Credits</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {stats.credits}
                </h3>
              </div>
            </div>
          </motion.div>

          <Link href="/matchmaker" className="block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-3xl p-8 bg-slate-900 border border-slate-800 shadow-xl"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors"></div>
              <Search className="w-10 h-10 mb-6 text-blue-400 group-hover:text-white transition-colors" />
              <h2 className="text-xl font-bold mb-2 text-white">Matchmaker</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Find exactly who you are looking for globally using AI.
              </p>
              <div className="flex items-center gap-2 font-bold text-sm text-blue-400 group-hover:text-blue-300">
                Launch <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.div>
          </Link>

          <Link href="/enrich" className="block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-3xl p-8 bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors"></div>
              <UploadCloud className="w-10 h-10 mb-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
              <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Data Enrichment</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Upload lists and watch AI gather insights instantly.
              </p>
              <div className="flex items-center gap-2 font-bold text-sm text-indigo-500 group-hover:text-indigo-600">
                Start <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.div>
          </Link>
        </div>

      </div>
    </div>
  );
}
