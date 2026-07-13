import { NextResponse } from 'next/server';
import { requireUser } from "@/lib/auth";
import { enquirySchema } from "@/lib/validations";
import { MarketplaceService } from "@/services/marketplace.service";

export async function POST(req: Request) {
  try {
    let user;
    try {
      user = await requireUser();
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = enquirySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    try {
      const result = await MarketplaceService.createEnquiry({
        userId: user.id,
        ...validation.data
      });
      return NextResponse.json(result);
    } catch (serviceError: any) {
      return NextResponse.json({ error: serviceError.message }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Enquiry error:", error);
    return NextResponse.json({ error: 'Failed to process enquiry request' }, { status: 500 });
  }
}
