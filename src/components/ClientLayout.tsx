"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isPublicPage = pathname === "/login" || pathname === "/signup" || pathname === "/";

  if (status === "loading") {
    return <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!session || isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 w-full max-w-[100vw] md:ml-[280px] lg:ml-[320px] p-4 md:p-8 pt-20 md:pt-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
