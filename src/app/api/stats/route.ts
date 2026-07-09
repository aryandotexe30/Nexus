import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  const totalLeads = await prisma.company.count();
  
  const companies = await prisma.company.findMany({ select: { createdAt: true }});
  
  const activityMap = new Map();
  for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      activityMap.set(dateStr, { name: dateStr, searches: 0, credits: 0 });
  }

  companies.forEach(c => {
      const dateStr = c.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      if(activityMap.has(dateStr)) {
          activityMap.get(dateStr).searches += 1;
          activityMap.get(dateStr).credits += 2; 
      }
  });

  const activityData = Array.from(activityMap.values());

  const totalBids = await prisma.bid.count();
  const totalPosts = await prisma.marketplacePost.count();
  const totalThreads = await prisma.chatThread.count();

  const engagementData = [
    { name: 'Posts', value: totalPosts },
    { name: 'Bids', value: totalBids },
    { name: 'Threads', value: totalThreads },
  ];

  return NextResponse.json({
      credits: user?.credits || 0,
      totalLeads,
      activityData,
      engagementData
  });
}
