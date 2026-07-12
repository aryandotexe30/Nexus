"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, ArrowLeft, Loader2, Info } from "lucide-react";
import Link from "next/link";
import Pusher from "pusher-js";

export default function UserSupportPage() {
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchActiveTicket();
  }, []);

  useEffect(() => {
    if (ticket && ticket.status !== 'CLOSED') {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      const channel = pusher.subscribe(`support-ticket-${ticket.id}`);
      
      channel.bind("new-message", (newMsg: any) => {
        setMessages((prev: any[]) => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });

      channel.bind("ticket-updated", (updatedTicket: any) => {
        setTicket((prev: any) => ({ ...prev, ...updatedTicket }));
      });

      return () => {
        pusher.unsubscribe(`support-ticket-${ticket.id}`);
        pusher.disconnect();
      };
    }
  }, [ticket?.id, ticket?.status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchActiveTicket = async () => {
    try {
      const res = await fetch("/api/support");
      const data = await res.json();
      
      if (data.tickets && data.tickets.length > 0) {
        // Get the most recent non-closed ticket, or just the most recent
        const active = data.tickets.find((t: any) => t.status !== 'CLOSED');
        if (active) {
          await loadTicketDetails(active.id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/support/${ticketId}`);
      const data = await res.json();
      if (data.ticket) {
        setTicket(data.ticket);
        setMessages(data.ticket.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support", { method: "POST" });
      const data = await res.json();
      if (data.ticket) {
        setTicket(data.ticket);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !ticket || sending) return;
    
    setSending(true);
    const content = inputText;
    setInputText("");

    try {
      await fetch(`/api/support/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!ticket || ticket.status === 'CLOSED') {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 shadow-sm">
          <Info className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Customer Care</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {ticket?.status === 'CLOSED' 
              ? "Your previous support ticket was closed. Do you need further assistance?"
              : "Need help? Open a live chat ticket with our support team."}
          </p>
          <button 
            onClick={createTicket}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
          >
            Start New Support Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col font-sans">
      <header className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-3xl mt-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Support Ticket #{ticket.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              Status: 
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                ticket.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {ticket.status}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 space-y-6">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Created</p>
        </div>

        {ticket.status === 'PENDING' && messages.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
            <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Waiting for an Administrator</h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm">We've notified our support team. An admin will join this chat shortly.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === (session?.user as any)?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-4 ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
              }`}>
                {!isMe && (
                  <p className="text-xs font-bold mb-1 opacity-70">Admin ({msg.sender.companyName})</p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-3xl mb-6">
        <form onSubmit={sendMessage} className="flex items-center gap-3 relative">
          <input
            type="text"
            placeholder={ticket.status === 'PENDING' ? "Type a message..." : "Reply to admin..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 rounded-xl px-4 py-3 outline-none transition-all text-slate-900 dark:text-white"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || sending}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
