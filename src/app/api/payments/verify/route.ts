import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";



export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify signature to prevent spoofing
    const secret = process.env.RAZORPAY_KEY_SECRET || "secret_placeholder";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Signature verified. Update user database record.
    const creditsToAdd = plan === "PRO" ? 500 : plan === "ENTERPRISE" ? 100000 : 0;
    const planEnum = plan === "PRO" ? "PRO" : plan === "ENTERPRISE" ? "ENTERPRISE" : "FREE";

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        plan: planEnum,
        credits: { increment: creditsToAdd },
        subscriptionStatus: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 });
  }
}
