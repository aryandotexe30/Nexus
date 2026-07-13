"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function CopilotPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    {
      role: 'ai',
      text: "Hello! I am your AI Sourcing Copilot. What kind of industrial products or raw materials are you looking for today? Tell me a little about your application or budget to get started."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, text: m.text })) 
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Network error connecting to the AI." }]);
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-lg font-bold text-slate-900">AI Sourcing Copilot</h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Nexus Intelligence</p>
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
              className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}
            >
              <div className={\`flex gap-3 max-w-[85%] \${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}\`}>
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${
                  msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
                }\`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={\`p-4 rounded-2xl \${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                }\`}>
                  {msg.role === 'ai' ? (
                    <div className="prose prose-sm max-w-none prose-slate">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-[15px] whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
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
          Copilot acts as an anonymous middleman. Supplier identities are protected.
        </p>
      </div>

    </div>
  );
}
