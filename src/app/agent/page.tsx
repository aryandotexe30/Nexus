"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare, ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function CopilotPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, isFinalPitch?: boolean, productData?: any, options?: string[] }[]>([
    {
      role: 'ai',
      text: "Hello! I am Nexus. What kind of industrial products or raw materials are you looking for today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [formQty, setFormQty] = useState("");
  const [formUnit, setFormUnit] = useState("Pieces");
  const [formPurpose, setFormPurpose] = useState("Reselling");
  const [formDetails, setFormDetails] = useState("");

  const openEnquiryModal = (productName: string, vendorAlias: string) => {
    setSelectedProduct(productName);
    setSelectedVendor(vendorAlias);
    setFormDetails(`I am interested in ${productName}. Kindly send the quotation for the same.`);
    setIsEnquiryModalOpen(true);
  };

  const closeEnquiryModal = () => {
    if (isSending) return;
    setIsEnquiryModalOpen(false);
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetToken: selectedVendor,
          productName: selectedProduct,
          quantity: formQty,
          unit: formUnit,
          purpose: formPurpose,
          details: formDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Enquiry sent successfully! Support Ticket Ref: ENQ-${data.token}`);
        closeEnquiryModal();
      } else {
        alert("Failed to send enquiry: " + data.error);
      }
    } catch (err) {
      alert("Network error while sending enquiry.");
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Optimistic UI update
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, text: m.text })) 
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: data.text,
          isFinalPitch: data.isFinalPitch,
          productData: data.productData,
          options: data.options
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Network error connecting to the AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const safeRender = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) return val.map(v => safeRender(v)).join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col font-sans bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Nexus</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Online
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[95%] lg:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.role === 'ai' ? (
                    <div className="flex flex-col gap-4">
                      <div className="prose prose-sm max-w-none prose-slate">
                        <ReactMarkdown>{typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}</ReactMarkdown>
                      </div>
                      
                      {msg.options && msg.options.length > 0 && idx === messages.length - 1 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (opt.toLowerCase() === "other") {
                                  document.querySelector("input")?.focus();
                                } else {
                                  setInput(opt);
                                  // We need to trigger submit, but setInput is async.
                                  // Easiest is to create a synthetic event or extract the logic.
                                  // For simplicity, we can just call a direct send function.
                                  setTimeout(() => {
                                    document.querySelector("form")?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                  }, 0);
                                }
                              }}
                              className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors shadow-sm"
                            >
                              {safeRender(opt)}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {msg.isFinalPitch && msg.productData && (
                        <div className="mt-4 space-y-4">
                          {msg.productData.vendors.map((vendor: any, vIdx: number) => (
                            <div key={vIdx} className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-bold text-slate-900 text-lg">{safeRender(vendor.alias)}</h3>
                                  <p className="text-sm font-medium text-slate-500">{safeRender(vendor.location)} • {safeRender(vendor.specialty)}</p>
                                </div>
                                <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Verified MSME</div>
                              </div>
                              
                              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-slate-700"><strong>Why it's a match:</strong> {safeRender(vendor.matchReason)}</p>
                              </div>

                              <div className="mb-5">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Specifications</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {vendor.specs && typeof vendor.specs === 'object' && Object.entries(vendor.specs).map(([key, value], i) => (
                                    <div key={i} className="text-sm border-l-2 border-blue-200 pl-2">
                                      <span className="text-slate-500">{safeRender(key)}:</span> <span className="font-semibold text-slate-900">{safeRender(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <button 
                                onClick={() => openEnquiryModal(msg.productData.productName, vendor.alias)}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
                              >
                                <Send className="w-4 h-4" /> Send Enquiry Anonymously
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[15px] whitespace-pre-wrap">{safeRender(msg.text)}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-3 max-w-[95%] lg:max-w-[85%]">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-slate-500">Analyzing...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you need..."
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send className="w-5 h-5 -ml-0.5" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-3 font-medium">
          Nexus acts as an anonymous middleman. Supplier identities are protected.
        </p>
      </div>

      {/* Enquiry Modal */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Enquire: {selectedVendor}</h2>
              <button onClick={closeEnquiryModal} disabled={isSending} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="enquiryForm" onSubmit={handleSendEnquiry} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                    <div className="flex gap-2">
                      <input type="number" required value={formQty} onChange={(e)=>setFormQty(e.target.value)} placeholder="Estimated Qty" className="w-2/3 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input type="text" required value={formUnit} onChange={(e)=>setFormUnit(e.target.value)} placeholder="Units" className="w-1/3 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Purpose</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="purpose" value="Reselling" checked={formPurpose === 'Reselling'} onChange={(e)=>setFormPurpose(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                        <span className="text-sm text-slate-700">Reselling</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="purpose" value="End Use" checked={formPurpose === 'End Use'} onChange={(e)=>setFormPurpose(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                        <span className="text-sm text-slate-700">End Use</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Requirement Details</label>
                  <textarea 
                    required
                    rows={4} 
                    value={formDetails}
                    onChange={(e)=>setFormDetails(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={closeEnquiryModal} 
                disabled={isSending}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="enquiryForm"
                disabled={isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Enquiry Anonymously"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
