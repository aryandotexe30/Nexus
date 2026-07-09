"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreatePostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "REQUEST",
    budget: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/marketplace");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create a Post</h1>
        <p className="text-slate-500 mt-2">Post a new product offering or request a quotation from suppliers.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Post Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: "REQUEST"})}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.type === "REQUEST" ? "border-purple-600 bg-purple-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <h3 className={`font-bold ${formData.type === "REQUEST" ? "text-purple-900" : "text-slate-800"}`}>Problem / RFQ</h3>
              <p className="text-sm text-slate-500 mt-1">I am looking to source a product or solve a problem.</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: "OFFERING"})}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.type === "OFFERING" ? "border-emerald-600 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <h3 className={`font-bold ${formData.type === "OFFERING" ? "text-emerald-900" : "text-slate-800"}`}>Product Offering</h3>
              <p className="text-sm text-slate-500 mt-1">I have a product or material I want to sell.</p>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="e.g., Looking for 500 tons of Lithium Cobalt Oxide"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            required
            rows={5}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            placeholder="Describe your requirements or product details..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Budget / Price (Optional)</label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="e.g., $5,000 or 'Negotiable'"
            value={formData.budget}
            onChange={e => setFormData({...formData, budget: e.target.value})}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center min-w-[160px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
