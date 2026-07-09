"use client";

import { useState } from "react";
import { UserPlus, Mail, Building, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminInvitePanel() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    companyName: "Nexus Admin"
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to invite admin");
      }

      setSuccess("Admin invitation sent successfully!");
      setFormData({ email: "", name: "", companyName: "Nexus Admin" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Invite New Admin</h2>
          <p className="text-sm text-slate-500">Create an admin account and email them their temporary password.</p>
        </div>
      </div>

      <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Admin Name</label>
          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              placeholder="john@nexus.com"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-[42px] bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invitation"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium flex items-center gap-2">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 text-sm text-green-600 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </p>
      )}
    </div>
  );
}
