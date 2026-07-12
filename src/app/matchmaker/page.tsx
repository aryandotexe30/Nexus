"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles, Building2, Send, X, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Matchmaker() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  // Enquiry Modal State
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  
  // Form State
  const [formQty, setFormQty] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formProduct, setFormProduct] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/matchmaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.matches);
      } else {
        alert("Failed to find matches: " + data.error);
        setResults([]);
      }
    } catch (err) {
      alert("Error connecting to Matchmaker AI.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const openEnquiryModal = (match: any) => {
    setSelectedMatch(match);
    setFormProduct(match.prefillProduct || query);
    setFormQty(match.prefillQuantity || "");
    setFormUnit(match.prefillUnit || "Pieces");
    setFormPurpose("Reselling"); // Default
    setFormDetails(match.prefillDetails || `I am interested in ${match.prefillProduct || query}. Kindly send the quotation for the same.`);
  };

  const closeModal = () => {
    if (isSending) return;
    setSelectedMatch(null);
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;
    
    setIsSending(true);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetToken: selectedMatch.targetToken,
          productName: formProduct,
          quantity: formQty,
          unit: formUnit,
          purpose: formPurpose,
          details: formDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Enquiry sent successfully! Support Ticket Ref: ENQ-${data.token}`);
        closeModal();
      } else {
        alert("Failed to send enquiry: " + data.error);
      }
    } catch (err) {
      alert("Network error while sending enquiry.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-sans relative">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          AI Global Matchmaker
        </h1>
        <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
          Describe what you are looking to buy, sell, or partner with. Our AI will securely find matches and help you enquire anonymously.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto mb-16">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'Looking for Double Sided Foam Tapes in bulk'"
          className="w-full pl-16 pr-32 py-6 bg-white border-2 border-slate-200 rounded-full text-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-900"
          disabled={isSearching}
        />
        <div className="absolute inset-y-2 right-2">
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="h-full px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Match"}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {results && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-green-500 font-extrabold">{results.length}</span> Anonymous Matches Found
            </h2>

            {results.map((company, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{company.alias || "Supplier"}</h3>
                      <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                          <Sparkles className="w-3 h-3" /> {company.matchScore}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => openEnquiryModal(company)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    Generate Enquiry <Send className="w-4 h-4" />
                  </button>
                </div>
                
                {company.properties && company.properties.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {company.properties.map((prop: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {prop}
                      </span>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    <span className="font-bold text-slate-900">Why it's a match: </span>
                    {company.reason}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enquiry Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Looking for "{formProduct || query}" ?</h2>
              <button onClick={closeModal} disabled={isSending} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="enquiryForm" onSubmit={handleSendEnquiry} className="space-y-6">
                
                {/* Contact info has been removed per user request */}                {/* Editable Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                    <div className="flex gap-2">
                      <input type="number" required value={formQty} onChange={(e)=>setFormQty(e.target.value)} placeholder="Estimated Quantity" className="w-2/3 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input type="text" required value={formUnit} onChange={(e)=>setFormUnit(e.target.value)} placeholder="Piece" className="w-1/3 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Purpose of Requirement</label>
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
                    placeholder="I am interested. Kindly send the quotation for the same."
                  ></textarea>
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={closeModal} 
                disabled={isSending}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="enquiryForm"
                disabled={isSending}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Enquiry"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

