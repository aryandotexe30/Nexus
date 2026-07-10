import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-black uppercase tracking-tight">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-slate max-w-none prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4">
          <p className="text-sm text-slate-500 mb-8 font-medium">Last Updated: July 10, 2026</p>

          <h2>1. Introduction</h2>
          <p>Welcome to Nexus. We respect your privacy and are committed to protecting your personal data in compliance with the Digital Personal Data Protection (DPDP) Act and applicable international frameworks. This policy explains how we collect, use, and safeguard your data.</p>

          <h2>2. Data We Collect</h2>
          <p>We may collect the following data when you use our platform:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Information:</strong> Name, Email, Company Name, and Password.</li>
            <li><strong>Business Data:</strong> Information you input into our AI tools (e.g., strategic plans, RFQs, inventory).</li>
            <li><strong>Usage Data:</strong> Pages visited, queries searched, and interactions with other users.</li>
          </ul>

          <h2>3. Third-Party Sub-Processors</h2>
          <p>To provide advanced AI and real-time capabilities, we share encrypted, necessary data with trusted third-party providers:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Google (Gemini AI):</strong> Used for generating business plans, moderation, and data enrichment.</li>
            <li><strong>SignalHire:</strong> Used for extracting verified business contacts.</li>
            <li><strong>Tavily:</strong> Used for real-time web search and market intelligence.</li>
            <li><strong>Razorpay:</strong> Used for secure payment processing. We do not store raw credit card numbers.</li>
            <li><strong>Pusher:</strong> Used for real-time websocket messaging.</li>
          </ul>

          <h2>4. Your Rights</h2>
          <p>You have the right to access, correct, or request deletion of your personal data. You may contact our support team to exercise these rights.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <strong>NexusB2BAI@outlook.com</strong>.</p>
        </div>
      </div>
    </div>
  );
}
