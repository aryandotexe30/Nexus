"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, Paperclip, Loader2, FileText, Trash2 } from "lucide-react";
import { pusherClient } from "@/lib/pusher-client";

export default function MessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialThreadId = searchParams.get("thread");

  const [threads, setThreads] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId || null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [newMessage, setNewMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch threads on load
  useEffect(() => {
    fetchThreads();
  }, []);

  // Poll for messages in active thread
  useEffect(() => {
    if (!activeThreadId) return;
    fetchMessages(activeThreadId);
    
    // Subscribe to pusher channel
    const channelName = `thread-${activeThreadId}`;
    const channel = pusherClient.subscribe(channelName);
    
    channel.bind("new-message", (newMsg: any) => {
      setMessages((prev) => {
        // Prevent duplicate messages if sender is this user
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      // Optionally re-fetch threads so latest preview is updated
      fetchThreads();
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [activeThreadId]);

  // Auto-scroll to bottom when messages change
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
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string, background = false) => {
    if (!background) setLoading(true);
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachmentUrl) return;
    
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, attachmentUrl })
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        setAttachmentUrl("");
        setMessages([...messages, data.message]);
        fetchThreads(); // Refresh thread list for latest message preview
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (thread: any) => {
    if (!thread || !session?.user?.email) return null;
    return thread.user1?.email === session.user.email ? thread.user2 : thread.user1;
  };

  const handleDeleteChat = async () => {
    if (!activeThreadId || !confirm("Are you sure you want to delete this chat permanently? This action cannot be undone.")) return;
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
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      
      {/* Left Pane - Threads List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 && !loading ? (
            <p className="text-slate-500 text-center py-8 text-sm">No active conversations.</p>
          ) : (
            threads.map(thread => {
              const otherUser = getOtherUser(thread);
              const latestMsg = thread.messages?.[0];
              const isActive = activeThreadId === thread.id;
              
              return (
                <div 
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`p-4 cursor-pointer border-b border-slate-100 transition-colors ${isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-slate-100 border-l-4 border-l-transparent"}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 truncate">{otherUser?.companyName || "Unknown Company"}</h3>
                  </div>
                  <p className="text-xs text-blue-600 font-medium truncate mb-1">RE: {thread.post?.title}</p>
                  <p className="text-sm text-slate-500 truncate">{latestMsg?.content || "No messages yet"}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane - Active Chat */}
      <div className="w-2/3 flex flex-col bg-white relative">
        {!activeThreadId ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Select a conversation to start chatting</div>
        ) : loading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {getOtherUser(threads.find(t => t.id === activeThreadId))?.companyName}
                </h3>
                <p className="text-xs text-slate-500">Secure B2B Thread</p>
              </div>
              <button
                onClick={handleDeleteChat}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-semibold"
                title="Delete Chat"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map(msg => {
                // Better approach since we didn't select email in messages GET route:
                // We know session email. Let's just visually differentiate. We will assume for now if it's not the 'otherUser', it's us.
                const otherUser = getOtherUser(threads.find(t => t.id === activeThreadId));
                const isMyMessage = msg.sender.id !== otherUser?.id;

                return (
                  <div key={msg.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMyMessage ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"}`}>
                      {!isMyMessage && <p className="text-xs font-bold mb-1 opacity-75">{msg.sender.companyName}</p>}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.attachmentUrl && (
                        <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className={`mt-2 flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${isMyMessage ? "bg-blue-700 hover:bg-blue-800" : "bg-slate-100 hover:bg-slate-200 text-blue-600"}`}>
                          <FileText className="w-4 h-4" /> View Attachment
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview */}
            {attachmentUrl && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                  <FileText className="w-4 h-4" /> {attachmentUrl}
                </div>
                <button onClick={() => setAttachmentUrl("")} className="text-slate-400 hover:text-slate-600">×</button>
              </div>
            )}

            {/* Input Box */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSend} className="flex gap-2 items-end">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex items-center px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                  <input
                    type="text"
                    className="flex-1 bg-transparent py-4 outline-none text-slate-800 placeholder:text-slate-400"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const url = prompt("Paste public URL for attachment (e.g., Google Drive, Imgur, Cloudinary):");
                      if (url) setAttachmentUrl(url);
                    }}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-2"
                    title="Add Attachment"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={sending || (!newMessage.trim() && !attachmentUrl)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-4 rounded-2xl transition-all shadow-sm flex-shrink-0"
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
