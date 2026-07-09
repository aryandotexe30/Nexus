"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles, Building2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Matchmaker() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

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
          Describe what you are looking to buy, sell, or partner with. Our AI will search globally for the perfect company matches.
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
          placeholder="e.g., 'I want to sell CRM software to mid-sized agencies in India'"
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
              <span className="text-green-500 font-extrabold">{results.length}</span> Matches Found
            </h2>

            {results.map((company, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{company.name}</h3>
                      <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                          <Sparkles className="w-3 h-3" /> {company.matchScore}% Match
                        </span>
                        {company.contact && <span>Contact: {company.contact}</span>}
                      </div>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                    View Full Profile <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
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
    </div>
  );
}
