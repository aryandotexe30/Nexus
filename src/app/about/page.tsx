"use client";

import Link from "next/link";
import { ArrowLeft, Globe, ShieldCheck, Cpu, Building2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Industrial Blueprint Grid Overlay */}
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
          <Link href="/" className="text-slate-600 font-bold hover:text-blue-600 transition-colors text-sm tracking-wider flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Terminal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 mb-8">
          Built For The <span className="text-blue-600">Builders.</span>
        </h1>
        <p className="text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
          Indian MSMEs are the backbone of the economy, yet they are forced to rely on outdated, static B2B directories filled with dead contacts and middlemen taking aggressive cuts. We built Nexus to arm MSMEs with the same military-grade data infrastructure used by enterprise corporations.
        </p>
      </section>

      {/* Core Values / Architecture */}
      <section className="relative z-10 py-16 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <ShieldCheck className="w-12 h-12 text-blue-600 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Zero Middlemen</h3>
            <p className="text-slate-600 font-medium">
              We do not broker deals or take a percentage of your hard-earned revenue. We provide the encrypted infrastructure for you to connect, negotiate, and close deals directly with verified partners.
            </p>
          </div>

          <div className="bg-slate-900 border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] text-white">
            <Cpu className="w-12 h-12 text-blue-400 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">100% Verified Intel</h3>
            <p className="text-slate-300 font-medium">
              We actively scrub dummy data. Our engine cross-references live SEC filings, GST databases, and corporate signals to ensure every node on our network is a real, active business capable of transacting.
            </p>
          </div>

          <div className="bg-white border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <Building2 className="w-12 h-12 text-indigo-600 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Automated Scale</h3>
            <p className="text-slate-600 font-medium">
              You should be focusing on manufacturing and product quality, not scrolling through Google for leads. Nexus automates your business development, acting as an autonomous sales and strategy division.
            </p>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-32 px-6 text-center">
        <Link href="/signup">
          <button className="px-12 py-6 bg-slate-900 text-white font-black tracking-widest text-xl shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all border-2 border-slate-900 inline-flex items-center gap-4">
            Initialize Your Instance
          </button>
        </Link>
      </section>

    </div>
  );
}
