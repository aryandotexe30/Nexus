import { NextResponse } from 'next/server';
import { runAIForensicAudit } from '@/lib/triflow/sentinelEngine';
import { TriFlowDeal } from '@/lib/triflow/types';

export async function POST(req: Request) {
  try {
    const { deal } = await req.json();

    if (!deal || !deal.id) {
      return NextResponse.json({ error: 'Valid deal object required' }, { status: 400 });
    }

    const aiAuditResult = await runAIForensicAudit(deal as TriFlowDeal);

    return NextResponse.json({
      success: true,
      dealId: deal.id,
      audit: aiAuditResult,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[TriFlow Audit API] Error:', error);
    return NextResponse.json({ error: 'Audit generation failed', details: error.message }, { status: 500 });
  }
}
