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

    const queryKey = `v16-${action}-${nodeLabel}-${context || ''}`.toLowerCase().trim();

    // Determine target node type based on action
    let targetType = "Company";
    let searchQuery = "";
    
    const contextStr = context ? ` (in the context of the company ${context})` : "";

    switch (action) {
      case "Find Products":
        targetType = "Product";
        searchQuery = `"${nodeLabel}" specific product models, technical specifications, detailed catalog list`;
        break;
      case "Find Raw Materials":
        targetType = "Raw Material";
        searchQuery = `What industrial raw materials and components are required to manufacture ${nodeLabel}?${contextStr}`;
        break;
      case "Find Other Applications":
      case "Find Alternative Uses":
        targetType = "Application";
        searchQuery = `What are the industrial or commercial applications and use cases for ${nodeLabel}?${contextStr}`;
        break;
      case "Find Suppliers":
      case "Find Manufacturers":
        targetType = "Supplier";
        searchQuery = `Top global suppliers, manufacturers, and companies that produce ${nodeLabel}${contextStr}`;
        break;
      case "Find Competitors":
        targetType = "Company";
        searchQuery = `Top competitors and alternative companies to ${nodeLabel}`;
        break;
    }

    // Execute intelligent expansion via TarasAI Brain Engine
    console.log(`[TarasAI Brain] Expanding node "${nodeLabel}" [${nodeType}] -> Action: ${action}`);
    
    const brainResult = await BrainEngine.query(nodeLabel, nodeType, action, context);
    let items = brainResult.items || [];


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
