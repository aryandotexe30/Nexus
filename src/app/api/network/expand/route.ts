import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { BrainEngine } from "@/lib/brainEngine";
import { isCacheExpired } from "@/lib/searchProtocol";



export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nodeLabel, nodeType, action, context } = await req.json();

    if (!nodeLabel || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your account.' }, { status: 403 });
    }

    // Execute intelligent expansion via TarasAI Brain Engine
    console.log(`[TarasAI Brain] Expanding node "${nodeLabel}" [${nodeType}] -> Action: ${action}`);
    
    let items: string[] = [];
    let targetType = "Company";

    switch (action) {
      case "Find Products":
        targetType = "Product";
        break;
      case "Find Raw Materials":
        targetType = "Raw Material";
        break;
      case "Find Other Applications":
      case "Find Alternative Uses":
        targetType = "Application";
        break;
      case "Find Suppliers":
      case "Find Manufacturers":
        targetType = "Supplier";
        break;
      case "Find Competitors":
        targetType = "Company";
        break;
    }

    // Check if we have extracted products in our database for this company
    if (action === "Find Products") {
      try {
        const storedProducts = await prisma.extractedProduct.findMany({
          where: {
            companyName: { contains: nodeLabel.trim(), mode: 'insensitive' }
          },
          take: 30
        });

        if (storedProducts.length > 0) {
          console.log(`[TarasAI Brain] Found ${storedProducts.length} verified products in ExtractedProduct database for "${nodeLabel}"`);
          items = storedProducts.map(p => {
            const specStr = p.specs && typeof p.specs === 'object' 
              ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join(', ') 
              : 'Specs: Industrial Grade';
            return `${p.name} | Category: ${p.market || 'Industrial'} | Description: ${p.application || 'Industrial application'} | Specs: ${specStr}`;
          });
        }
      } catch (dbFindErr) {
        console.warn("[Network Expand] Notice checking extracted products:", dbFindErr);
      }
    }

    // If not in database or other actions (Raw Materials, Suppliers, etc.), run Brain Engine
    if (items.length === 0) {
      try {
        const brainResult = await BrainEngine.query(nodeLabel, nodeType, action, context);
        items = brainResult.items || [];
      } catch (brainErr: any) {
        console.error("[Network Expand] BrainEngine query error:", brainErr);
      }
    }


    // STEALTH AUTO-ENRICHMENT: Automatically store ALL extracted entities to Databook
    if (items.length > 0) {
      try {
        console.log(`[Auto-Enrichment] Saving ${items.length} items to Databook for ${nodeLabel} (${action})`);
        
        // Parse items into structured Databook entries
        const records = items.map(item => {
          const parts = item.split('|').map(s => s.trim()).filter(Boolean);
          const entityName = parts[0] || "Unknown Entity";
          let description = "";
          const specs: Record<string, string> = { entityType: targetType, sourceAction: action };
          
          parts.slice(1).forEach(part => {
            if (part.includes(':')) {
              const [k, ...v] = part.split(':');
              const key = k.trim();
              const val = v.join(':').trim();
              if (key.toLowerCase() === 'description') {
                description = val;
              } else {
                specs[key] = val;
              }
            }
          });
          
          return {
            query: nodeLabel,
            productName: entityName, // Using productName field generically to store the entity name
            description,
            specs
          };
        });
        
        // Bulk insert into ProductKnowledge (Acting as Databook)
        if (records.length > 0) {
          await prisma.productKnowledge.createMany({
            data: records,
            skipDuplicates: true // Prevent crashing on re-exploration
          });
        }
      } catch (enrichError) {
        console.error("[Auto-Enrichment] Failed to save items to Databook:", enrichError);
      }
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } }
    });

    return NextResponse.json({ 
      success: true, 
      items,
      targetType,
      remainingCredits: user.role === 'ADMIN' ? 'Unlimited' : user.credits - 1
    });

  } catch (error: any) {
    console.error("Network expand error:", error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred. Please try again.' 
    }, { status: 500 });
  }
}
