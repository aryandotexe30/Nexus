"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Search, 
  Network,
  UploadCloud, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Building2,
  Store,
  MessageSquare,
  TrendingUp,
  Landmark,
  Menu,
  X,
  CreditCard,
  Lock,
  Headset,
  Database
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!session) return null;

  const isAdmin = (session.user as any)?.role === "ADMIN";
  const companyName = (session.user as any)?.companyName || "My Company";

  const routes = [
    { name: "Hub", path: "/dashboard", icon: LayoutDashboard },
    { name: "Marketplace", path: "/dashboard/marketplace", icon: Store },
    { name: "Messages", path: "/dashboard/messages", icon: MessageSquare },
    { name: "Finder", path: "/agent", icon: Search },
    { name: "Network Mapper", path: "/network", icon: Network, requiredPlan: ["PRO", "ENTERPRISE"] },
    { name: "Data Enrichment", path: "/enrich", icon: UploadCloud },
    { name: "Business Plan", path: "/dashboard/business-plan", icon: TrendingUp, requiredPlan: ["ENTERPRISE"] },
    { name: "Equity & IPO", path: "/dashboard/equity-funding", icon: Landmark, requiredPlan: ["ENTERPRISE"] },
    { name: "Billing & Plans", path: "/pricing", icon: CreditCard },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  if (isAdmin) {
    routes.push({ name: "Admin Console", path: "/admin", icon: ShieldCheck });
    routes.push({ name: "Databook", path: "/admin/databook", icon: Database });
    routes.push({ name: "Customer Care", path: "/admin/support", icon: Headset });
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[45]"
        />
      )}

      <div className={`w-72 h-[calc(100vh-32px)] m-4 rounded-[2rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 flex flex-col fixed left-0 top-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none z-50 overflow-hidden transform transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-[120%]"}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="p-8 pb-4 relative z-10">
        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-white/20">
            <Building2 className="w-5 h-5" />
          </div>
          TarasAI
        </h1>
        <div className="mt-6 px-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-white/60 dark:border-slate-700/50 backdrop-blur-md shadow-sm">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-0.5">Workspace</p>
          <p className="text-sm text-slate-800 dark:text-slate-200 font-bold truncate">{companyName}</p>
        </div>
      </div>

      <div className="flex-1 py-4 px-5 space-y-1.5 relative z-10 overflow-y-auto scrollbar-hide">
        {routes.map((route) => {
          const isActive = pathname === route.path;
          const userPlan = (session.user as any)?.plan || "FREE";
          const isAdminRole = (session.user as any)?.role === "ADMIN";
          const isLocked = !isAdminRole && route.requiredPlan && !route.requiredPlan.includes(userPlan);

          return (
            <Link key={route.path} href={isLocked ? "/pricing" : route.path}>
              <div className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${isActive ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200'} ${isLocked ? 'opacity-50' : ''}`}>
                {isActive && !isLocked && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700 shadow-sm rounded-2xl backdrop-blur-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={`absolute inset-0 bg-white/40 dark:bg-slate-800/40 rounded-2xl opacity-0 transition-opacity duration-300 ${(isActive && !isLocked) ? 'hidden' : 'group-hover:opacity-100'} ${isLocked ? 'hidden' : 'block'}`}></div>
                <route.icon className={`w-5 h-5 relative z-10 ${isActive && !isLocked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500 transition-colors'}`} />
                <span className={`relative z-10 flex-1 text-sm tracking-tight`}>{route.name}</span>
                {isLocked && <Lock className="w-4 h-4 text-slate-300 relative z-10" />}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
    </>
  );
}

