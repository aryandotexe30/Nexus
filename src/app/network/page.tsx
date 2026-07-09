import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NetworkTree from "@/components/NetworkTree";

export default async function NetworkMapperPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
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
