"use client";

import { useState } from "react";
import { Check, Trash2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminModerationTable({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const router = useRouter();

  const handleAction = async (id: string, action: "approve" | "delete") => {
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter(p => p.id !== id));
        router.refresh();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Failed to perform action");
    }
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
        <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Flagged Posts</h3>
        <p className="text-slate-500">The marketplace is currently clear of flagged content.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-12">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500">
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Author</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-900">{post.title}</p>
                  <p className="text-sm text-slate-500 max-w-md truncate">{post.description}</p>
                </td>
                <td className="p-4">
                  <p className="text-slate-900 font-medium">{post.author.companyName}</p>
                  <p className="text-sm text-slate-500">{post.author.email}</p>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(post.id, "approve")}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleAction(post.id, "delete")}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
