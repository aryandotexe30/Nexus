"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  Truck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Download, 
  ShieldCheck, 
  DollarSign, 
  Scale, 
  QrCode, 
  MessageSquare, 
  X,
  Send,
  Building2,
  ExternalLink,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGeneralProductImage } from "@/lib/productImages";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  // Product Dynamic State
  const [productData, setProductData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Product Details
  useEffect(() => {
    async function fetchProduct() {
      try {
        const decoded = decodeURIComponent(productId);
        const res = await fetch(`/api/products/list?id=${encodeURIComponent(decoded)}&limit=1`);
        const json = await res.json();
        if (json.success && json.products && json.products.length > 0) {
          setProductData(json.products[0]);
        }
      } catch (e) {
        console.error("Failed to load product details", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  // Fallback / Defaults
  const productName = productData?.name || (productId.replace(/cat-[a-z0-9]+-/i, '').replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "High-Temp Polyimide SMT Masking Tape");
  const companyName = productData?.companyName || "TarasAI Verified Factory";
  const productDescription = productData?.application || "Precision engineered industrial material coated with high-performance cross-linked adhesive. Converted for wave soldering, powder coating, and insulation with clean peel-off.";
  const priceDisplay = productData?.price || "₹145 - ₹165 / Roll";
  const specs = productData?.specs || {};

  const productImage = getGeneralProductImage(
    productData || {
      name: productName,
      application: productDescription,
      companyName: companyName,
      specs: specs
    }
  );

  // Interactive Specification Matrix State
  const [selectedThickness, setSelectedThickness] = useState("50µm (2 mil)");
  const [selectedAdhesive, setSelectedAdhesive] = useState("Silicone PSA (High-Temp)");
  const [selectedCarrier, setSelectedCarrier] = useState("Amber Polyimide (Kapton)");
  const [selectedFormat, setSelectedFormat] = useState("Precision Slit Rolls (12-50mm)");
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteQuantity, setQuoteQuantity] = useState("5,000");
  const [quotePincode, setQuotePincode] = useState("411018 (Pune MIDC)");
  const [userRole, setUserRole] = useState<"BUYER" | "CONVERTER">("BUYER");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What should I share to get a firm quote?",
      a: "Share the target caliper thickness (e.g., 50µm), required roll width (e.g., 19mm or 25mm), total length per roll (typically 33m or 66m), target temperature endurance (e.g., 260°C for wave soldering), and estimated monthly roll volume."
    },
    {
      q: "Can MSME converters request jumbo rolls with raw silicone resin supplied?",
      a: "Yes. Under the TriFlow closed-loop model, TarasAI can supply GE Momentive PSA silicone adhesive resin directly to your coating facility under a GST Job-Work agreement, and contract the entire finished tape lot back from you with zero working capital lockup."
    },
    {
      q: "What documents and test certifications accompany every shipment?",
      a: "Every dispatch batch includes an ASTM D3330 180° Peel Adhesion Test Certificate, ASTM D3654 Shear Adhesion Report, Dielectric Breakdown Voltage Certificate (kV), and a GST Tax Invoice with verified e-way bill."
    },
    {
      q: "What complementary substrates and conversion materials can be bundled?",
      a: "You can simultaneously order fluorosilicone differential release liners, corona-treated polyester backing film, solventless primers, and high-impact plastic slitting core tubes."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      
      {/* Category Sub-Navigation Bar */}
      <div className="border-b border-slate-200 bg-white/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 text-xs">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none font-bold">
            <Link href="/products?category=tapes" className="text-[#0B4FDF] py-3.5 px-1 whitespace-nowrap">
              Technical Tapes & Adhesives
            </Link>
            <Link href="/products?category=resins" className="text-slate-600 hover:text-slate-900 py-3.5 px-1 whitespace-nowrap">
              Raw Polymers & Resins
            </Link>
            <Link href="/products?category=electrical" className="text-slate-600 hover:text-slate-900 py-3.5 px-1 whitespace-nowrap">
              Transformer Dielectrics
            </Link>
            <Link href="/products?category=diecut" className="text-slate-600 hover:text-slate-900 py-3.5 px-1 whitespace-nowrap">
              Die-Cut Gaskets
            </Link>
            <Link href="/products?category=thermal" className="text-slate-600 hover:text-slate-900 py-3.5 px-1 whitespace-nowrap">
              Thermal TIM Pads
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-600 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>TarasAI TriFlow Verified Sourcing</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/products" className="hover:text-slate-900">Master Catalog</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">{companyName}</span>
          <span className="text-slate-400">/</span>
          <span className="text-[#0B4FDF] font-bold truncate max-w-xs">{productName}</span>
        </div>

        {/* HERO PRODUCT CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Product Image & Badges (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center group shadow-sm">
                <img 
                  src={productImage} 
                  alt={productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-800 font-bold border border-slate-200 shadow-2xs z-20">
                  {companyName}
                </div>
              </div>

              {/* Verified Specification Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] font-medium">Quality Standard</span>
                    <span className="font-bold text-slate-900">ASTM D3330 & UL 510</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-[#0B4FDF] flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] font-medium">Dielectric Strength</span>
                    <span className="font-bold text-slate-900">Up to 6.5 kV</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs & Interactive Matrix (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0B4FDF] border border-blue-200">
                    {companyName}
                  </span>
                  {productData?.market && (
                    <span className="text-xs font-mono text-slate-500">
                      • {productData.market}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {productName}
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-sans">
                  {productDescription}
                  {showFullDesc && (
                    <span className="text-slate-500 block mt-1.5">
                      Resistant to chemical solvent wash, fluorinated flux, and continuous heat exposure. Available in jumbo rolls (500mm x 1000m) or precision slit widths.
                    </span>
                  )}
                  <button 
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="ml-1 text-[#0B4FDF] hover:text-blue-700 font-bold cursor-pointer underline text-xs"
                  >
                    {showFullDesc ? "View less" : "View more"}
                  </button>
                </p>
              </div>

              {/* 3 Trust / Fulfillment Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <FileText className="w-3.5 h-3.5 text-[#0B4FDF]" />
                  <span>ASTM Test Certificate + GST Invoice</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pan-India Direct Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Firm Quote within 24 Hours</span>
                </div>
              </div>

              {/* REAL SPECIFICATIONS TABLE (IF PRESENT IN DB) */}
              {Object.keys(specs).length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs shadow-2xs">
                  <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-bold text-slate-900 uppercase font-mono text-[11px] flex items-center justify-between">
                    <span>Verified Manufacturer Technical Specs</span>
                    <span className="text-emerald-700 font-bold">● Active Datasheet</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {Object.entries(specs).slice(0, 8).map(([key, value]) => (
                      <div key={key} className="px-3.5 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">{key}</span>
                        <span className="text-slate-900 font-mono font-bold text-right truncate max-w-xs">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicative Price & RFQ CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/50 via-slate-50 to-white border border-slate-200 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">
                      Indicative Commercial Rate:
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-slate-900">
                      {priceDisplay}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Direct Factory Contract
                  </span>
                </div>

                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-[#FF5500] hover:bg-[#E04800] transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Request Binding Quotation / Offtake</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-center text-[10px] text-slate-500">
                  Direct Factory Gate Offtake. Includes ASTM Test Certificate & Blind e-Way Bill.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* FREQUENTLY PAIRED CONVERSION MATERIALS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Frequently Paired Industrial Sourcing Materials
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Acrylic Foam VHB Tape", spec: "1000µm Solid Core • High Shear", price: "₹380 / Roll", image: "/images/products/vhb-foam-tape.jpg" },
              { name: "Green Powder Coating Tape", spec: "220°C Bake • Clean Removal", price: "₹190 / Roll", image: "/images/products/green-masking-tape.jpg" },
              { name: "Copper Foil EMI Tape", spec: "Conductive Acrylic • 85 dB", price: "₹280 / Roll", image: "/images/products/copper-foil-tape.jpg" },
              { name: "Fiberglass Cloth Tape", spec: "Class H 200°C • Silicone PSA", price: "₹180 / Roll", image: "/images/products/fiberglass-tape.jpg" }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-[#0B4FDF]/40 hover:bg-white transition-all space-y-2 group cursor-pointer shadow-2xs"
              >
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white group-hover:scale-102 transition-transform">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0B4FDF] transition-colors">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.spec}</p>
                </div>
                <div className="text-xs font-mono font-bold text-[#0B4FDF] pt-1 border-t border-slate-200">
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQS ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl bg-slate-50/70 border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:text-[#0B4FDF] cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[#0B4FDF] text-[11px]">0{idx + 1}</span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? "rotate-180 text-[#0B4FDF]" : "text-slate-400"}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed font-sans border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RFQ MODAL */}
      <AnimatePresence>
        {isQuoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setIsQuoteModalOpen(false); setQuoteSubmitted(false); }}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-mono font-bold text-[#0B4FDF] uppercase tracking-wider">
                  Direct Factory RFQ
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Request Quotation: {productName}
                </h3>
              </div>

              {quoteSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">RFQ Successfully Logged</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Your request for <strong>{productName}</strong> ({quoteQuantity}) has been routed to our supply desk. A binding quotation with verified test certificates will be sent within 24 hours.
                  </p>
                  <button
                    onClick={() => { setIsQuoteModalOpen(false); setQuoteSubmitted(false); }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-lg text-white"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setQuoteSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <img 
                      src={productImage} 
                      alt={productName}
                      className="w-16 h-12 rounded-lg object-cover border border-slate-200 bg-white"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Brand: {companyName} • {priceDisplay}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Estimated Quantity / Batch</label>
                      <input 
                        type="text" 
                        value={quoteQuantity}
                        onChange={(e) => setQuoteQuantity(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Delivery Plant Pincode</label>
                      <input 
                        type="text" 
                        value={quotePincode}
                        onChange={(e) => setQuotePincode(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-[#0B4FDF] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0B4FDF] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Binding RFQ Inquiry</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
