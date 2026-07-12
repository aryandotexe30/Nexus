"use client";

import { useState } from "react";
import { Check, Trash2, Building2, FileText, Landmark, Phone, Mail, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminVerificationQueue({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (id: string, action: "approve" | "delete") => {
    if (action === "delete" && !confirm("Are you sure you want to permanently delete this account application?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
        router.refresh();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Failed to perform action");
    } finally {
      setLoading(false);
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm mb-12">
        <UserCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Queue Empty</h3>
        <p className="text-slate-500">There are no pending user verifications right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mb-12">
      {users.map((user) => (
        <div key={user.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Company</span>
              </div>
              <p className="font-bold text-slate-900">{user.companyName}</p>
              <p className="text-sm text-slate-500">{user.industry}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Registrations</span>
              </div>
              <p className="font-medium text-slate-900 text-sm"><span className="text-slate-500">GST:</span> {user.gstNumber}</p>
              <p className="font-medium text-slate-900 text-sm"><span className="text-slate-500">CIN:</span> {user.cinNumber || "N/A"}</p>
              <p className="font-medium text-slate-900 text-sm"><span className="text-slate-500">Udyam:</span> {user.udyamNumber || "N/A"}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Emails</span>
              </div>
              <p className="font-medium text-slate-900 text-sm"><span className="text-slate-500">Work:</span> {user.email}</p>
              <p className="font-medium text-slate-900 text-sm"><span className="text-slate-500">Personal:</span> {user.personalEmail || "N/A"}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Phones</span>
              </div>
              <p className="font-medium text-slate-900 text-sm"><span className="text-slate-500">Work:</span> {user.companyPhone || "N/A"}</p>
              <p className="font-medium text-slate-900 text-sm"><span className="text-slate-500">Personal:</span> {user.personalPhone || "N/A"}</p>
            </div>

          </div>

          <div className="flex lg:flex-col justify-end gap-2 shrink-0">
            <button 
              disabled={loading}
              onClick={() => handleAction(user.id, "approve")}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Approve User
            </button>
            <button 
              disabled={loading}
              onClick={() => handleAction(user.id, "delete")}
              className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Reject & Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
