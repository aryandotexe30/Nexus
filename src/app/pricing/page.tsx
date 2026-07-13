"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Globe, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planName: string, amount: number) => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoadingPlan(planName);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName, amount }),
      });

      const data = await res.json();
      if (!data.orderId) throw new Error("Failed to create order");

      const resLoad = await loadRazorpayScript();
      if (!resLoad) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: data.amount,
        currency: "INR",
        name: "Nexus OS",
        description: `${planName} Plan Subscription`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await update({ plan: planName });
            alert("Payment Successful! Your instance has been upgraded.");
            router.push("/dashboard");
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: session.user?.name || "Company Admin",
          email: session.user?.email || "",
        },
        theme: {
          color: "#2563EB",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong during checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* Blueprint Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0" 
           style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 md:px-12 backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-white rounded-none shadow-[4px_4px_0px_0px_rgba(37,99,235,0.5)]">
            <Globe className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            Nexus
          </span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/dashboard" className="text-slate-600 font-bold hover:text-blue-600 transition-colors text-sm tracking-wider flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Terminal
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="relative z-10 pt-24 pb-16 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 mb-6">
          Deploy Your <span className="text-blue-600">Engine.</span>
        </h1>
        <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
          Scale your MSME with military-grade intel. No hidden fees. Cancel anytime.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        
        {/* FREE PLAN */}
        <div className="bg-white border-2 border-slate-900 p-8 flex flex-col shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] transition-all">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Initialize</h3>
          <p className="text-slate-500 font-medium mb-6">For testing the extraction engine.</p>
          <div className="mb-8">
            <span className="text-5xl font-black tracking-tighter">₹0</span>
            <span className="text-slate-500 font-medium">/ forever</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/> <span className="font-medium text-slate-700">3 Extraction Credits</span></li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/> <span className="font-medium text-slate-700">Basic Global Matchmaking</span></li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/> <span className="font-medium text-slate-700">Marketplace Access</span></li>
          </ul>
          <Link href="/signup">
            <button className="w-full py-4 border-2 border-slate-900 text-slate-900 font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
              Current Plan
            </button>
          </Link>
        </div>

        {/* PRO PLAN */}
        <div className="bg-slate-900 text-white border-2 border-slate-900 p-8 flex flex-col shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white font-mono text-xs font-bold uppercase tracking-widest py-1.5 px-4 border-b-2 border-l-2 border-slate-900">
            Recommended
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Professional</h3>
          <p className="text-slate-400 font-medium mb-6">For aggressive market expansion.</p>
          <div className="mb-8 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter">₹5,000</span>
            <span className="text-slate-400 font-medium">/ month</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"/> <span className="font-medium text-slate-300">500 Data Extraction Credits/mo</span></li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"/> <span className="font-medium text-slate-300">Unlimited Global Matchmaking</span></li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"/> <span className="font-medium text-slate-300">Network Mapper Unlocked</span></li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"/> <span className="font-medium text-slate-300">Priority Support</span></li>
          </ul>
          <button 
            onClick={() => handleSubscribe("PRO", 5000)}
            disabled={loadingPlan !== null}
            className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-colors border-2 border-slate-900 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loadingPlan === "PRO" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Pro"}
          </button>
        </div>

        {/* ENTERPRISE PLAN */}
        <div className="bg-white border-2 border-slate-900 p-8 flex flex-col shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] transition-all">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Enterprise</h3>
          <p className="text-slate-500 font-medium mb-6">Complete market dominance.</p>
          <div className="mb-8 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter">₹15,000</span>
            <span className="text-slate-500 font-medium">/ month</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/> <span className="font-medium text-slate-700">Unlimited Extraction Credits</span></li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/> <span className="font-medium text-slate-700">AI Strategic Advisor Unlocked</span></li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/> <span className="font-medium text-slate-700">Equity & IPO Advisor Unlocked</span></li>
            <li className="flex items-start gap-3"><Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/> <span className="font-medium text-slate-700">Custom CRM Integrations</span></li>
          </ul>
          <button 
            onClick={() => handleSubscribe("ENTERPRISE", 15000)}
            disabled={loadingPlan !== null}
            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-colors border-2 border-slate-900 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loadingPlan === "ENTERPRISE" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Enterprise"}
          </button>
        </div>

      </section>

      {/* Security Trust Badge */}
      <div className="relative z-10 mt-16 flex justify-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 border-2 border-slate-200 bg-white shadow-sm rounded-full">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span className="font-medium text-slate-600 text-sm">Secured by 256-bit encryption. RBI Compliant via Razorpay.</span>
        </div>
      </div>
    </div>
  );
}
