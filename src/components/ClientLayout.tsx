"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isPublicPage = pathname === "/login" || pathname === "/signup" || pathname === "/" || pathname === "/terms-of-service" || pathname === "/privacy-policy";

  if (status === "loading") {
    return <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!session || isPublicPage) {
    return <>{children}</>;
  }

  const user = session?.user as any;
  const isUnverified = user?.isVerified === false && user?.role !== "ADMIN";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex transition-colors duration-300">
      
      <Sidebar />
      <main className="flex-1 w-full max-w-[100vw] md:ml-[288px] p-4 md:p-8 pt-20 md:pt-10 overflow-x-hidden">
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
        ) : (
          children
        )}
      </main>
    </div>
  );
}
