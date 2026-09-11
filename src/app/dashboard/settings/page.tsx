"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { 
  User, 
  Building2, 
  Key, 
  Save, 
  ShieldCheck, 
  CreditCard, 
  Check, 
  Zap, 
  Loader2,
  Sliders
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "billing">("account");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const user = session?.user as any;
  const currentPlan = user?.plan || "FREE";
  const credits = user?.credits ?? 3;

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
        name: "TarasAI OS",
        description: `${planName} Plan Subscription`,
        order_id: data.orderId,
        handler: async function (response: any) {
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
            window.location.reload();
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.name || user?.companyName || "Company Admin",
          email: user?.email || "",
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
    <div className="max-w-5xl mx-auto font-sans pb-24">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Settings & Billing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Manage your account profile, security credentials, and enterprise subscription plans.
        </p>
      </header>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl w-fit mb-8 border border-slate-300/40 dark:border-slate-700/50">
        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "account"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" /> Account & Security
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "billing"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Billing & Subscription Plans
          {currentPlan !== "FREE" && (
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">
              {currentPlan}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "account" ? (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Account Details */}
            <section className="bg-white dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" /> Account Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input 
                    type="text" 
                    disabled 
                    value={user?.email || ""}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium opacity-70 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-2">Primary authenticated login identifier.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      defaultValue={user?.companyName || user?.name || ""}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </section>

            {/* Security */}
            <section className="bg-white dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Key className="w-5 h-5 text-purple-600" /> Security
              </h2>
              
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Account Password</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Protect your organization workspace.</p>
                </div>
                <button className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded-xl transition-colors text-sm">
                  Reset Password
                </button>
              </div>
            </section>

            {/* Legal & Compliance */}
            <section className="bg-white dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Legal & Compliance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="/privacy-policy" target="_blank" className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors block">
                  <h3 className="font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Read how we protect and encrypt MSME catalog intelligence.</p>
                </a>
                <a href="/terms-of-service" target="_blank" className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors block">
                  <h3 className="font-bold text-slate-900 dark:text-white">Terms of Service</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review contractual terms of service for TarasAI.</p>
                </a>
              </div>
            </section>

            {/* Customer Care */}
            <section className="bg-white dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Need Support?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Have technical questions or need custom catalog assistance?</p>
                </div>
                <a href="/dashboard/support" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md">
                  Open Support Ticket
                </a>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Current Subscription Status Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                    Active Plan
                  </span>
                  <span className="font-extrabold text-lg uppercase tracking-wide">
                    {currentPlan} TIER
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  {user?.companyName || "Workspace"} Enterprise Intel
                </h2>
                <p className="text-blue-100 text-sm">
                  Access deep product catalog crawling, anonymous RFQs, and live vendor intelligence.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">Extraction Credits</p>
                  <p className="text-2xl font-black">{currentPlan === "ENTERPRISE" ? "Unlimited" : credits}</p>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
              {/* Free Tier */}
              <div className={`bg-white dark:bg-slate-900 border-2 rounded-3xl p-7 flex flex-col transition-all ${
                currentPlan === "FREE" ? "border-blue-600 shadow-lg ring-2 ring-blue-600/20" : "border-slate-200 dark:border-slate-800"
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Initialize</h3>
                  {currentPlan === "FREE" && (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-6">For testing catalog search & matchmaking.</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">₹0</span>
                  <span className="text-slate-500 text-sm font-medium"> / forever</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-xs">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">3 Extraction Credits</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Master Products Catalog Search</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">B2B Marketplace & Messages</span>
                  </li>
                </ul>
                <button 
                  disabled 
                  className="w-full py-3 border border-slate-300 dark:border-slate-700 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wider cursor-default"
                >
                  {currentPlan === "FREE" ? "Active Tier" : "Default"}
                </button>
              </div>

              {/* Pro Tier */}
              <div className={`bg-slate-900 text-white border-2 rounded-3xl p-7 flex flex-col relative overflow-hidden transition-all ${
                currentPlan === "PRO" ? "border-blue-500 shadow-2xl ring-2 ring-blue-500" : "border-slate-800 hover:border-blue-500"
              }`}>
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-bl-xl">
                  Popular
                </div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-black uppercase text-white">Professional</h3>
                  {currentPlan === "PRO" && (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-blue-500/30 text-blue-300 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-6">For expanding sourcing & supplier procurement.</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">₹5,000</span>
                  <span className="text-slate-400 text-sm font-medium"> / month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-xs">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-200">500 Product Extraction Credits/mo</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-200">Autonomous Manufacturer Scraping</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-200">Deep Technical Specification Sheets</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-200">Priority Customer Care</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSubscribe("PRO", 5000)}
                  disabled={loadingPlan !== null || currentPlan === "PRO"}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loadingPlan === "PRO" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentPlan === "PRO" ? (
                    "Active Plan"
                  ) : (
                    "Upgrade to Pro"
                  )}
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className={`bg-white dark:bg-slate-900 border-2 rounded-3xl p-7 flex flex-col transition-all ${
                currentPlan === "ENTERPRISE" ? "border-purple-600 shadow-lg ring-2 ring-purple-600/20" : "border-slate-200 dark:border-slate-800"
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Enterprise</h3>
                  {currentPlan === "ENTERPRISE" && (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-6">Complete market dominance & corporate advisory.</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">₹15,000</span>
                  <span className="text-slate-500 text-sm font-medium"> / month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-xs">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Unlimited Extraction Credits</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">AI Business Plan Generator</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Equity Funding & IPO Advisor</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Dedicated Account Manager</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSubscribe("ENTERPRISE", 15000)}
                  disabled={loadingPlan !== null || currentPlan === "ENTERPRISE"}
                  className="w-full py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loadingPlan === "ENTERPRISE" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentPlan === "ENTERPRISE" ? (
                    "Active Plan"
                  ) : (
                    "Deploy Enterprise"
                  )}
                </button>
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/40 rounded-2xl flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Secured by 256-bit encryption. RBI & GST Compliant via Razorpay. Cancel or upgrade anytime.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

