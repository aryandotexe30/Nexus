import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Database, Activity, ShieldAlert, Flag, UserCheck } from "lucide-react";
import AdminUserTable from "@/components/AdminUserTable";
import AdminInvitePanel from "@/components/AdminInvitePanel";
import AdminModerationTable from "@/components/AdminModerationTable";
import AdminVerificationQueue from "@/components/AdminVerificationQueue";



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

  // Fetch flagged posts
  const flaggedPosts = await prisma.marketplacePost.findMany({
    where: { isFlagged: true },
    include: { author: { select: { companyName: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch unverified users for KYC queue
  const unverifiedUsers = await prisma.user.findMany({
    where: { isVerified: false },
    orderBy: { createdAt: 'desc' }
  });

  // Convert dates to string so they can be passed to Client Component
  const serializedUsers = users.map(u => ({
    id: u.id,
    email: u.email,
    companyName: u.companyName,
    domain: u.domain,
    role: u.role,
    plan: u.plan,
    credits: u.credits
  }));

  const serializedUnverifiedUsers = unverifiedUsers.map(u => ({
    id: u.id,
    email: u.email,
    companyName: u.companyName,
    gstNumber: u.gstNumber,
    cinNumber: u.cinNumber,
    udyamNumber: u.udyamNumber,
    industry: u.industry,
    personalEmail: u.personalEmail,
    companyPhone: u.companyPhone,
    personalPhone: u.personalPhone
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
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Companies Indexed</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalCompanies}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Flagged Posts</p>
            <h3 className="text-2xl font-bold text-slate-900">{flaggedPosts.length}</h3>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <UserCheck className="w-6 h-6 text-emerald-500" /> Pending KYC Approvals
      </h2>
      <AdminVerificationQueue initialUsers={serializedUnverifiedUsers} />

      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 mt-12">
        <ShieldAlert className="w-6 h-6 text-red-500" /> Moderation Queue
      </h2>
      <AdminModerationTable initialPosts={flaggedPosts} />

      <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">Registered Users</h2>
      
      <AdminUserTable initialUsers={serializedUsers} />

    </div>
  );
}
