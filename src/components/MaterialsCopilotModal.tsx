"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Scale, 
  Layers, 
  Cpu, 
  Zap, 
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { TarasAlternateMatch } from "@/lib/alternateMatcherEngine";

interface Message {
  role: "user" | "assistant";
  content: string;
  matchedAlternates?: TarasAlternateMatch[];
}

interface MaterialsCopilotModalProps {
  onOpenTds?: (sku: string) => void;
}

export default function MaterialsCopilotModal({ onOpenTds }: MaterialsCopilotModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am the **TarasAI Materials Engineering Copilot**.\n\nI can help you find direct domestic private-label alternatives to imported products (3M, Nitto, Kapton, Bergquist, Loctite), calculate thermal/dielectric requirements, or configure custom die-cut parts with 25–40% cost savings.\n\nWhat material or application challenge are you working on?"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
        })
      });

      const data = await res.json();

      if (data.message) {
        setMessages([...newMessages, data.message]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.fallbackReply || "I have received your specification. You can search directly in our catalog or launch an RFQ for our manufacturing consortium."
          }
        ]);
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I apologize, but our Materials Science Engine is experiencing high load. You can directly search for our private-label equivalents in the search bar or request an immediate quote via the Buyer RFQ portal."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Find Indian alternate for 3M 4910 VHB tape",
    "Need 6 W/m-K thermal gap pad for EV battery module",
    "Looking for 260°C polyimide wave solder masking tape",
    "Class H Mica insulation tape for 33kV transformer"
  ];

  return (
    <>
      {/* Floating Bottom-Right Launcher Trigger */}
      <div className="fixed bottom-5 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-3 bg-[#0B4FDF] hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-white/20 transition-all font-bold text-xs"
          aria-label="Open Materials Science Copilot"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-[#FF9E00] animate-pulse" />
          </div>
          <span>Materials AI Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </motion.button>
      </div>

      {/* Floating Copilot Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[94vw] sm:w-[480px] max-h-[85vh] h-[640px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans"
          >
            {/* Copilot Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B4FDF] flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>TarasAI Materials Copilot</span>
                    <span className="px-1.5 py-0.5 bg-[#FF5500] text-white text-[9px] rounded font-mono">AI v2.5</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Autonomous Sourcing & Engineering Rationale</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-[#0B4FDF] text-white flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    msg.role === "user" 
                      ? "bg-[#0B4FDF] text-white rounded-br-none shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs space-y-3"
                  }`}>
                    {/* Message Text */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Matched Alternates Structured Cards */}
                    {msg.matchedAlternates && msg.matchedAlternates.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="text-[10px] font-black uppercase text-[#0B4FDF] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Recommended TarasAI Private-Label Match
                        </div>

                        {msg.matchedAlternates.map((alt, aIdx) => (
                          <div key={aIdx} className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-slate-900">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[#0B4FDF] text-[11px]">{alt.tarasSku}</span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded">
                                {alt.costSavingsPercent}% Lower Cost
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 text-xs">{alt.tarasName}</div>
                            <div className="text-[11px] text-slate-600 font-mono">
                              Thickness: {alt.totalThickness} • Temp: {alt.operatingTemp}
                            </div>
                            
                            <div className="flex items-center gap-2 pt-1">
                              {onOpenTds && (
                                <button
                                  type="button"
                                  onClick={() => onOpenTds(alt.tarasSku)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[10px] font-bold text-slate-700 flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3 text-[#0B4FDF]" />
                                  <span>View Official TDS</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  window.location.href = `/signup?role=buyer&search=${encodeURIComponent(alt.tarasSku)}`;
                                }}
                                className="px-2.5 py-1 bg-[#FF5500] hover:bg-[#E04800] text-white rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <span>Request Sample</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white rounded-xl border border-slate-200 w-fit">
                  <span className="w-3.5 h-3.5 border-2 border-[#0B4FDF] border-t-transparent rounded-full animate-spin" />
                  <span>Materials Copilot is analyzing specs & cross-referencing catalog...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex flex-wrap gap-1.5 shrink-0">
                {samplePrompts.map((sp, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleSend(sp)}
                    className="text-[10px] bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#0B4FDF] text-slate-700 p-1.5 rounded-lg text-left transition-colors font-medium"
                  >
                    {sp}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a technical question or enter part number..."
                  className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#0B4FDF] transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 bg-[#0B4FDF] hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
