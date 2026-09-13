"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, Lock, AlertTriangle, ArrowLeft, LayoutDashboard, Search } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ClientModuleFlag {
  id: string;
  name: string;
  path: string;
  access: 'ALL' | 'ADMIN_ONLY' | 'MAINTENANCE';
  isSidebarVisible: boolean;
  maintenanceMessage?: string;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [moduleFlags, setModuleFlags] = useState<ClientModuleFlag[]>([]);

  const isPublicPage = pathname === "/login" || pathname === "/signup" || pathname === "/" || pathname === "/terms-of-service" || pathname === "/privacy-policy";

  // Fetch feature flags
  useEffect(() => {
    let isMounted = true;
    const loadFlags = async () => {
      try {
        const res = await fetch("/api/features");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.modules)) {
          setModuleFlags(data.modules);
        }
      } catch {}
    };

    if (session) {
      loadFlags();
    }
    return () => { isMounted = false; };
  }, [session, pathname]);

  if (status === "loading") {
    return <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!session || isPublicPage) {
    return <>{children}</>;
  }

  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";
  const isUnverified = user?.isVerified === false && !isAdmin;

  // Check if current route is blocked by feature flags
  let routeBlockedReason: { type: 'ADMIN_ONLY' | 'MAINTENANCE'; message: string; moduleName: string } | null = null;

  if (!isAdmin) {
    // Default /products to Admin-Only
    if (pathname === "/products" || pathname.startsWith("/products/")) {
      const pFlag = moduleFlags.find(m => m.id === "products");
      if (!pFlag || pFlag.access === "ADMIN_ONLY") {
        routeBlockedReason = {
          type: "ADMIN_ONLY",
          moduleName: "Products Master",
          message: "The Products Master database is an internal platform repository restricted to system administrators."
        };
      }
    }

    if (!routeBlockedReason && moduleFlags.length > 0) {
      const activeModule = moduleFlags.find(m => {
        if (pathname === m.path) return true;
        if (m.path !== '/' && m.path !== '/dashboard' && pathname.startsWith(m.path)) return true;
        return false;
      });

      if (activeModule) {
        if (activeModule.access === "ADMIN_ONLY") {
          routeBlockedReason = {
            type: "ADMIN_ONLY",
            moduleName: activeModule.name,
            message: `Access to ${activeModule.name} is currently restricted to platform administrators.`
          };
        } else if (activeModule.access === "MAINTENANCE") {
          routeBlockedReason = {
            type: "MAINTENANCE",
            moduleName: activeModule.name,
            message: activeModule.maintenanceMessage || `${activeModule.name} is temporarily undergoing scheduled maintenance.`
          };
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-50 flex transition-colors duration-300">
      
      <Sidebar />
      <main className="flex-1 w-full max-w-[100vw] md:ml-[320px] p-4 md:p-8 pt-20 md:pt-10 overflow-x-hidden">
        {isUnverified && pathname.startsWith("/dashboard") ? (
          <div className="h-[80vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-500/10">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Account Pending Verification</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 font-medium">
              Your account is currently under review by our moderation team. To ensure the safety of our marketplace, all MSME registrations must be manually verified. Please try again later.
            </p>
          </div>
        ) : routeBlockedReason ? (
          <div className="h-[75vh] flex flex-col items-center justify-center text-center max-w-xl mx-auto p-6">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${
              routeBlockedReason.type === 'ADMIN_ONLY'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-amber-500/10'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-rose-500/10'
            }`}>
              {routeBlockedReason.type === 'ADMIN_ONLY' ? <Lock className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
            </div>

            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 border ${
              routeBlockedReason.type === 'ADMIN_ONLY'
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}>
              {routeBlockedReason.type === 'ADMIN_ONLY' ? 'Admin Access Only' : 'Module Under Maintenance'}
            </span>

            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {routeBlockedReason.moduleName} Unavailable
            </h1>

            <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {routeBlockedReason.message}
            </p>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  Return to Hub
                </button>
              </Link>
              <Link href="/agent">
                <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all flex items-center gap-2 text-sm">
                  <Search className="w-4 h-4" />
                  Open Finder
                </button>
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

