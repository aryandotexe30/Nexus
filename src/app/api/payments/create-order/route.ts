import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, amount } = await req.json();

    if (!plan || !amount) {
      return NextResponse.json({ error: "Plan and amount are required" }, { status: 400 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
    });

    // Create Razorpay Order
    // Amount in Razorpay is in paise (₹1 = 100 paise)
    const orderOptions = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${session.user.email.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`,
      notes: {
        plan,
        userEmail: session.user.email,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
