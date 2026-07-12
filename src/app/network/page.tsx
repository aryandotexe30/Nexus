import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import NetworkTree from "@/components/NetworkTree";

export default async function NetworkMapperPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const userPlan = (session.user as any)?.plan || "FREE";
  const hasAccess = userPlan === "PRO" || userPlan === "ENTERPRISE" || (session.user as any)?.role === "ADMIN";

  if (!hasAccess) {
    return (
      <div className="w-full h-[calc(100vh-2rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Network Mapper Locked</h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
          This module requires the Professional or Enterprise tier. Upgrade your instance to map supply chains and intercept competitors.
        </p>
        <Link href="/pricing">
          <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-colors uppercase tracking-widest text-sm">
            Upgrade Instance
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-2rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Network Mapper</h1>
        <p className="text-slate-500 font-medium">
          Visually explore and expand supply chains, raw materials, and applications in a clean hierarchical view.
        </p>
      </header>
      
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner relative">
        <NetworkTree />
      </div>
    </div>
  );
}
