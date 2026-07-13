import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from '@google/genai';


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const whereClause: any = { isOpen: true, isApproved: true };
    if (type) whereClause.type = type;

    const posts = await prisma.marketplacePost.findMany({
      where: whereClause,
      include: {
        author: { select: { companyName: true, email: true, domain: true } },
        _count: { select: { bids: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { title, description, type, budget } = await req.json();
    if (!title || !description || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // AI Content Moderation Check
    let isApproved = true;
    let isFlagged = false;

    try {
      const moderationPrompt = `
You are a strict B2B Marketplace Trust & Safety moderator.
Determine if the following post is fraudulent, illegal, spam, or violates B2B policies (e.g., selling drugs, weapons, counterfeit goods, explicit content, scam/phishing).
Title: "${title}"
Description: "${description}"

Respond with ONLY "SAFE" or "FLAGGED".
      `;
      const aiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: moderationPrompt,
      });
      const decision = (aiRes.text || "").trim().toUpperCase();
      if (decision.includes("FLAGGED")) {
        isApproved = false;
        isFlagged = true;
      }
    } catch (aiError) {
      console.error("AI Moderation failed, defaulting to flagged for manual review", aiError);
      isApproved = false;
      isFlagged = true;
    }

    const newPost = await prisma.marketplacePost.create({
      data: {
        title,
        description,
        type,
        budget,
        authorId: user.id,
        isApproved,
        isFlagged
      }
    });

    return NextResponse.json({ 
      success: true, 
      post: newPost,
      wasFlagged: isFlagged
    });
  } catch (error: any) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
