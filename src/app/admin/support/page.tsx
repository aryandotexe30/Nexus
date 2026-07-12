"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AdminSupportDashboard() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pusher subscriptions map to cleanup on unmount
  const pusherRef = useRef<any>(null);
  const activeChannelRef = useRef<any>(null);

  useEffect(() => {
    fetchTickets();
    
    // Pusher notifications removed
  }, []);

  // When active ticket changes, subscribe to its chat channel
  useEffect(() => {
    if (activeTicket && activeTicket.status !== 'CLOSED' && pusherRef.current) {
      if (activeChannelRef.current) {
        pusherRef.current.unsubscribe(activeChannelRef.current.name);
      }
      
      const channelName = `support-ticket-${activeTicket.id}`;
      const channel = pusherRef.current.subscribe(channelName);
      activeChannelRef.current = channel;

      channel.bind("new-message", (newMsg: any) => {
        setMessages((prev: any[]) => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });

      channel.bind("ticket-updated", (updatedTicket: any) => {
        setActiveTicket((prev: any) => ({ ...prev, ...updatedTicket }));
        if (updatedTicket.status === 'CLOSED') {
          // Refresh list to remove it
          fetchTickets();
        }
      });
    }

    return () => {
      if (activeChannelRef.current && pusherRef.current) {
        pusherRef.current.unsubscribe(activeChannelRef.current.name);
        activeChannelRef.current = null;
      }
    };
  }, [activeTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/support", { cache: 'no-store' });
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/support/${ticketId}`);
      const data = await res.json();
      if (data.ticket) {
        setActiveTicket(data.ticket);
        setMessages(data.ticket.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const acceptTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" })
      });
      const data = await res.json();
      if (data.ticket) {
        await loadTicketDetails(ticketId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const closeTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to close this ticket? It will be removed from your active queue.")) return;
    try {
      await fetch(`/api/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" })
      });
      setActiveTicket(null);
      setMessages([]);
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeTicket || sending) return;
    
    setSending(true);
    const content = inputText;
    setInputText("");

    try {
      await fetch(`/api/support/${activeTicket.id}/messages`, {
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

  // Filter out CLOSED tickets from the list just in case
  const pendingTickets = tickets.filter(t => t.status === 'PENDING');
  const myActiveTickets = tickets.filter(t => t.status === 'ACTIVE' && t.adminId === (session?.user as any)?.id);

  return (
    <div className="flex h-[calc(100vh-64px)] font-sans mt-6">
      {/* Left Sidebar: Queue */}
      <div className={`w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col rounded-l-3xl ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Care</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage active support tickets.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Active Tickets Section */}
          {myActiveTickets.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Your Active Chats</h3>
              <div className="space-y-2">
                {myActiveTickets.map(t => (
                  <button
                    key={t.id}
                    onClick={() => loadTicketDetails(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      activeTicket?.id === t.id 
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate pr-2">
                        {t.user.companyName || t.user.email}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    </div>
                    <span className="text-xs text-slate-500 truncate block">Ticket #{t.id.slice(-6).toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pending Queue Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Pending Queue ({pendingTickets.length})</h3>
            {pendingTickets.length === 0 ? (
              <p className="text-sm text-slate-500 italic px-2">No pending tickets.</p>
            ) : (
              <div className="space-y-2">
                {pendingTickets.map(t => (
                  <div key={t.id} className="w-full text-left p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/30">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {t.user.companyName || t.user.email}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 truncate block mb-3">User requested assistance</span>
                    <button 
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        btn.disabled = true;
                        btn.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Accepting...';
                        await acceptTicket(t.id);
                      }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Area: Chat Window */}
      <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 rounded-r-3xl ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
        {!activeTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Send className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a ticket from the queue to start chatting.</p>
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-tr-3xl">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveTicket(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeTicket.user.companyName || activeTicket.user.email}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ticket #{activeTicket.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => closeTicket(activeTicket.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors text-sm"
              >
                <XCircle className="w-4 h-4" /> Close Ticket
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center p-6 text-slate-500">
                  <p>You have accepted the chat. Send a message to say hello!</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === (session?.user as any)?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-4 ${
                      isMe 
                        ? 'bg-slate-800 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-bl-sm shadow-sm'
                    }`}>
                      {!isMe && (
                        <p className="text-xs font-bold mb-1 opacity-70 text-blue-600">{msg.sender.companyName || msg.sender.email}</p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-br-3xl mb-0">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Reply to user..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-slate-300 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 rounded-xl px-4 py-3 outline-none transition-all text-slate-900 dark:text-white"
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || sending}
                  className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
