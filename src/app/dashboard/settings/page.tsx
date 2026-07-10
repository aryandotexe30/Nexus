"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, User, Building2, Key, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const user = session?.user as any;

  return (
    <div className="max-w-4xl mx-auto font-sans pb-24">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 transition-colors">
          Settings
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium transition-colors">
          Manage your account preferences and application appearance.
        </p>
      </header>

      <div className="space-y-8">


        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none transition-all"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-indigo-500" /> Account Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input 
                type="text" 
                disabled 
                value={user?.email || ""}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium opacity-70 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  defaultValue={user?.name || ""}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
              <Save className="w-5 h-5" /> Save Changes
            </button>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none transition-all"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Key className="w-6 h-6 text-purple-500" /> Security
          </h2>
          
          <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Password</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last changed never.</p>
            </div>
            <button className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded-lg transition-colors">
              Reset Password
            </button>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none transition-all"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
             <ShieldCheck className="w-6 h-6 text-emerald-500" /> Legal & Compliance
          </h2>
          
          <div className="space-y-4">
             <a href="/privacy-policy" target="_blank" className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 transition-colors">
               <div>
                 <h3 className="font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Read how we handle and protect your data.</p>
               </div>
             </a>
             <a href="/terms-of-service" target="_blank" className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 transition-colors">
               <div>
                 <h3 className="font-bold text-slate-900 dark:text-white">Terms of Service</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Read the terms and conditions for using Nexus.</p>
               </div>
             </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
