"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PostDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [bidAmount, setBidAmount] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postRes, bidsRes] = await Promise.all([
        fetch(`/api/marketplace/${params.id}`),
        fetch(`/api/marketplace/${params.id}/bids`)
      ]);
      const postData = await postRes.json();
      const bidsData = await bidsRes.json();
      
      if (postData.success) setPost(postData.post);
      if (bidsData.success) setBids(bidsData.bids);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidding(true);
    try {
      const res = await fetch(`/api/marketplace/${params.id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: bidAmount, proposal: bidProposal })
      });
      const data = await res.json();
      if (data.success) {
        setBidAmount("");
        setBidProposal("");
        fetchData(); // Refresh bids
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBidding(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!post) return <div className="text-center py-20">Post not found.</div>;

  const isAuthor = session?.user?.email && post.author?.email && session.user.email === post.author.email;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>
        
        <div className="flex items-center gap-4">
          {!isAuthor && (
            <button 
              onClick={async () => {
                if (!confirm("Are you sure you want to report this post? It will be temporarily hidden and sent for Admin review.")) return;
                try {
                  const res = await fetch(`/api/marketplace/${params.id}/report`, { method: "POST" });
                  const data = await res.json();
                  if (data.success) {
                    alert("Post reported successfully. It has been hidden pending review.");
                    router.push("/dashboard/marketplace");
                  } else {
                    alert(data.error);
                  }
                } catch (e) {
                  alert("Failed to report post.");
                }
              }}
              className="flex items-center gap-2 bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors font-bold text-sm"
            >
              Report Post
            </button>
          )}

          {isAuthor && (
            <button 
              onClick={async () => {
                if (!confirm("Are you sure you want to permanently delete this entire post and all its bids?")) return;
                try {
                  const res = await fetch(`/api/marketplace/${params.id}`, { method: "DELETE" });
                  const data = await res.json();
                  if (data.success) {
                    router.push("/dashboard/marketplace");
                  } else {
                    alert(data.error);
                  }
                } catch (e) {
                  alert("Failed to delete post.");
                }
              }}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors font-bold text-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete Post
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post Details (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              post.type === "OFFERING" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
            }`}>
              {post.type}
            </span>
            <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
              <p>Posted by <span className="font-bold text-slate-800">{post.author?.companyName || post.author?.domain}</span></p>
              <p>•</p>
              <p>{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Description</h3>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{post.description}</p>
            </div>
            
            {post.budget && (
              <div className="mt-8 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-500 font-semibold mb-1">Budget / Price</p>
                <p className="text-lg font-bold text-slate-900">{post.budget}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bidding Area (Right Column) */}
        <div className="space-y-6">
          {!isAuthor && (
            <form onSubmit={handleBid} className="bg-white border border-blue-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Submit a Proposal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g. $4,500"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                    placeholder="Explain why they should choose you..."
                    value={bidProposal}
                    onChange={e => setBidProposal(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={bidding}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {bidding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Bid</>}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Bids ({bids.length})</h3>
            {bids.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-xl">No bids yet.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {bids.map(bid => {
                  const isMyBid = session?.user?.email && bid.bidder?.email === session.user.email;
                  return (
                  <div key={bid.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{bid.bidder?.companyName || "Unknown"}</p>
                      <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{bid.amount}</p>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3">{bid.proposal}</p>
                    {isAuthor && bid.status === 'PENDING' && (
                      <button 
                        onClick={async () => {
                          const res = await fetch(`/api/marketplace/${params.id}/bids/${bid.id}/accept`, { method: "POST" });
                          const data = await res.json();
                          if (data.success) {
                            router.push(`/dashboard/messages?thread=${data.threadId}`);
                          } else {
                            alert(data.error);
                          }
                        }}
                        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                      >
                        Accept & Chat
                      </button>
                    )}
                    {bid.status === 'ACCEPTED' && (
                      <div className="w-full mt-2 bg-emerald-100 text-emerald-800 text-center text-sm font-bold py-2 rounded-lg">
                        Bid Accepted
                      </div>
                    )}
                    {(isMyBid || isAuthor) && (
                      <button
                        onClick={async () => {
                          if (!confirm("Are you sure you want to remove this bid?")) return;
                          try {
                            const res = await fetch(`/api/marketplace/${params.id}/bids/${bid.id}`, { method: "DELETE" });
                            const data = await res.json();
                            if (data.success) fetchData();
                            else alert(data.error);
                          } catch (e) {
                            alert("Failed to delete bid.");
                          }
                        }}
                        className="w-full mt-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> {isAuthor ? "Remove Bid" : "Retract Bid"}
                      </button>
                    )}
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
