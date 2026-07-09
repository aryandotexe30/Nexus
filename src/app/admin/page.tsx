import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { Users, Database, Activity, ShieldAlert } from "lucide-react";
import AdminUserTable from "@/components/AdminUserTable";
import AdminInvitePanel from "@/components/AdminInvitePanel";

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! }
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Access Denied</h1>
        <p className="text-xl text-slate-500">You do not have administrative privileges to view this console.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const totalCompanies = await prisma.company.count();

  // Convert dates to string so they can be passed to Client Component
  const serializedUsers = users.map(u => ({
    id: u.id,
    email: u.email,
    companyName: u.companyName,
    domain: u.domain,
    role: u.role,
    credits: u.credits
  }));

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
          Admin Console
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Manage system users, view global usage, and adjust quotas.
        </p>
      </header>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Total Companies</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalCompanies}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">API Health</p>
            <h3 className="text-2xl font-bold text-slate-900">Excellent</h3>
          </div>
        </div>
      </div>

      <AdminInvitePanel />

      <h2 className="text-2xl font-bold text-slate-900 mb-6">Registered Users</h2>
      
      <AdminUserTable initialUsers={serializedUsers} />

    </div>
  );
}
