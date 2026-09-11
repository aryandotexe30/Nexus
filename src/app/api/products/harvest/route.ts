import { harvestCompanyProducts } from '@/lib/deepProductHarvester';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const query = body.query?.trim();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Please provide a company name or URL' }), { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          try {
            const payload = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch {}
        };

        try {
          sendEvent({ type: 'log', message: `[SYSTEM] Connection established. Starting harvest for "${query}"...` });

          const result = await harvestCompanyProducts(query, (msg: string) => {
            sendEvent({ type: 'log', message: msg });
          });

          sendEvent({ type: 'done', result });
        } catch (err: any) {
          sendEvent({ type: 'error', error: err.message || 'Harvest failed' });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('[API /api/products/harvest] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to harvest products' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
