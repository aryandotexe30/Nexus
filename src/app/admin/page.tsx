import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Database, Activity, ShieldAlert, Flag, UserCheck, Sliders } from "lucide-react";
import AdminUserTable from "@/components/AdminUserTable";
import AdminInvitePanel from "@/components/AdminInvitePanel";
import AdminModerationTable from "@/components/AdminModerationTable";
import AdminVerificationQueue from "@/components/AdminVerificationQueue";
import AdminFeatureControls from "@/components/AdminFeatureControls";
import { getModuleConfigurations } from "@/lib/featureFlags";

export const dynamic = 'force-dynamic';

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

  const moduleConfigs = await getModuleConfigurations();

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
    <div className="max-w-6xl mx-auto font-sans space-y-12 pb-24">
      <header>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
          Admin Console
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Manage system users, navigation permissions, module access levels, and moderation queues.
        </p>
      </header>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Companies Indexed</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalCompanies}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Flagged Posts</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{flaggedPosts.length}</h3>
          </div>
        </div>
      </div>

      {/* Dynamic Module & Sidebar Access Matrix */}
      <div>
        <AdminFeatureControls initialModules={moduleConfigs} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-emerald-500" /> Pending KYC Approvals
        </h2>
        <AdminVerificationQueue initialUsers={serializedUnverifiedUsers} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500" /> Moderation Queue
        </h2>
        <AdminModerationTable initialPosts={flaggedPosts} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Registered Users</h2>
        <AdminUserTable initialUsers={serializedUsers} />
      </div>

    </div>
  );
}
