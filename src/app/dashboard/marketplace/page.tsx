"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Briefcase, Package, ArrowRight } from "lucide-react";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OFFERING" | "REQUEST">("ALL");

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">B2B Marketplace</h1>
          <p className="text-slate-500 mt-2">Trade products, source materials, and bid on industrial requests.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/marketplace/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          All Posts
        </button>
        <button
          onClick={() => setFilter("OFFERING")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === "OFFERING" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          <Package className="w-4 h-4" /> Products Offered
        </button>
        <button
          onClick={() => setFilter("REQUEST")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === "REQUEST" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          <Briefcase className="w-4 h-4" /> Requests (RFQs)
        </button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
          <p className="text-slate-500 text-lg">No posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div 
              key={post.id} 
              onClick={() => router.push(`/dashboard/marketplace/${post.id}`)}
              className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  post.type === "OFFERING" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                }`}>
                  {post.type}
                </span>
                <span className="text-sm text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">{post.description}</p>
              
              <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Posted by</p>
                  <p className="text-sm font-bold text-slate-800">{post.author?.companyName || "Unknown"}</p>
                </div>
                <div className="flex items-center gap-1 text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-lg">
                  {post._count.bids} Bids <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
