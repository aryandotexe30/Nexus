"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Search, 
  Briefcase, 
  Package, 
  ArrowRight, 
  MessageSquare, 
  Store, 
  Send, 
  Paperclip, 
  Loader2, 
  FileText, 
  Trash2,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pusherClient } from "@/lib/pusher-client";

interface Post {
  id: string;
  title: string;
  description: string;
  type: string;
  budget?: string;
  author: { companyName: string; domain: string };
  _count: { bids: number };
  createdAt: string;
}

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<"posts" | "messages">(
    searchParams.get("tab") === "messages" || searchParams.get("thread") ? "messages" : "posts"
  );

  // Marketplace Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OFFERING" | "REQUEST">("ALL");

  // Messages state
  const initialThreadId = searchParams.get("thread");
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const url = filter === "ALL" ? "/api/marketplace" : `/api/marketplace?type=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch threads when messages tab is opened
  useEffect(() => {
    if (activeTab === "messages") {
      fetchThreads();
    }
  }, [activeTab]);

  // Subscribe to active thread messages
  useEffect(() => {
    if (!activeThreadId || activeTab !== "messages") return;
    fetchMessages(activeThreadId);

    if (!pusherClient) {
      return;
    }

    const channelName = `thread-${activeThreadId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMsg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      fetchThreads();
    });

    return () => {
      pusherClient?.unsubscribe(channelName);
    };
  }, [activeThreadId, activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data.success) {
        setThreads(data.threads);
        if (!activeThreadId && data.threads.length > 0) {
          setActiveThreadId(data.threads[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachmentUrl) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, attachmentUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        setAttachmentUrl("");
        setMessages([...messages, data.message]);
        fetchThreads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const getOtherUser = (thread: any) => {
    if (!thread || !session?.user?.email) return null;
    return thread.user1?.email === session.user.email ? thread.user2 : thread.user1;
  };

  const handleDeleteChat = async () => {
    if (!activeThreadId || !confirm("Are you sure you want to delete this chat thread permanently?")) return;
    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setActiveThreadId(null);
        setMessages([]);
        fetchThreads();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete chat.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            B2B Marketplace & Deals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Discover verified industrial listings, post custom RFQs, and negotiate directly with suppliers.
          </p>
        </div>

        {activeTab === "posts" && (
          <button
            onClick={() => router.push("/dashboard/marketplace/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-md self-start md:self-auto active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create Listing
          </button>
        )}
      </div>

      {/* Primary Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl w-fit border border-slate-300/40 dark:border-slate-700/50">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "posts"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Store className="w-4 h-4" /> Marketplace Listings
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "messages"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Direct Messages & Inquiries
          {threads.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {threads.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "posts" ? (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Sub-Filters */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === "ALL"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All Listings
              </button>
              <button
                onClick={() => setFilter("OFFERING")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filter === "OFFERING"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Products Offered
              </button>
              <button
                onClick={() => setFilter("REQUEST")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filter === "REQUEST"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> Buying RFQs
              </button>
            </div>

            {/* Posts Grid */}
            {loadingPosts ? (
              <div className="flex justify-center py-24">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <p className="text-slate-500 dark:text-slate-400 text-base font-medium">No marketplace listings found.</p>
                <button
                  onClick={() => router.push("/dashboard/marketplace/create")}
                  className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  Create First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/dashboard/marketplace/${post.id}`)}
                    className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          post.type === "OFFERING"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        }`}
                      >
                        {post.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 line-clamp-3 flex-grow leading-relaxed">
                      {post.description}
                    </p>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Poster</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {post.author?.companyName || "Verified Company"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-bold text-xs bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl">
                        {post._count.bids} Inquiries <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="messages"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-[600px] flex bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
          >
            {/* Left Pane - Threads */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Active Discussions
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {threads.length === 0 ? (
                  <p className="text-slate-400 text-center py-12 text-xs">No active direct conversations.</p>
                ) : (
                  threads.map((thread) => {
                    const otherUser = getOtherUser(thread);
                    const latestMsg = thread.messages?.[0];
                    const isActive = activeThreadId === thread.id;

                    return (
                      <div
                        key={thread.id}
                        onClick={() => setActiveThreadId(thread.id)}
                        className={`p-4 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600"
                            : "hover:bg-slate-100/50 dark:hover:bg-slate-800/40 border-l-4 border-l-transparent"
                        }`}
                      >
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {otherUser?.companyName || "Vendor Contact"}
                        </h3>
                        {thread.post?.title && (
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate my-0.5">
                            RE: {thread.post.title}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 truncate">{latestMsg?.content || "Started conversation"}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Pane - Chat */}
            <div className="w-2/3 flex flex-col bg-white dark:bg-slate-900 relative">
              {!activeThreadId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-blue-600" />
                  Select a supplier conversation on the left to start negotiating.
                </div>
              ) : loadingMessages && messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {getOtherUser(threads.find((t) => t.id === activeThreadId))?.companyName || "Supplier Thread"}
                      </h3>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified B2B Channel
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteChat}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                    {messages.map((msg) => {
                      const otherUser = getOtherUser(threads.find((t) => t.id === activeThreadId));
                      const isMyMessage = msg.sender?.id !== otherUser?.id;

                      return (
                        <div key={msg.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs ${
                              isMyMessage
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none"
                            }`}
                          >
                            {!isMyMessage && (
                              <p className="text-[10px] font-bold mb-1 opacity-70">
                                {msg.sender?.companyName || "Partner"}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-2 flex items-center gap-1.5 p-2 rounded-lg text-xs font-semibold ${
                                  isMyMessage ? "bg-blue-700 text-white" : "bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" /> View Attached Document
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attachment URL preview */}
                  {attachmentUrl && (
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-t border-blue-100 dark:border-blue-800 flex items-center justify-between text-xs">
                      <span className="text-blue-700 dark:text-blue-300 truncate">Attachment: {attachmentUrl}</span>
                      <button onClick={() => setAttachmentUrl("")} className="text-slate-400 hover:text-slate-600">×</button>
                    </div>
                  )}

                  {/* Send Input */}
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center px-3 focus-within:ring-2 focus-within:ring-blue-500">
                        <input
                          type="text"
                          className="flex-1 bg-transparent py-2.5 text-xs outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                          placeholder="Type inquiry details or quotation terms..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt("Paste public link to TDS document or quotation attachment:");
                            if (url) setAttachmentUrl(url);
                          }}
                          className="text-slate-400 hover:text-blue-600 p-1.5"
                          title="Attach Document"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={sendingMessage || (!newMessage.trim() && !attachmentUrl)}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-sm transition-all"
                      >
                        {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
