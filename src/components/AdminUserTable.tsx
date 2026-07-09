"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Edit2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  companyName: string | null;
  domain: string;
  role: string;
  plan: string;
  credits: number;
};

export default function AdminUserTable({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [editRole, setEditRole] = useState("USER");
  const [editPlan, setEditPlan] = useState("FREE");
  const [editCredits, setEditCredits] = useState(0);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditPlan(user.plan || "FREE");
    setEditCredits(user.credits);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          role: editRole,
          plan: editPlan,
          credits: editCredits,
        }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, role: editRole, plan: editPlan, credits: editCredits } : u)));
        setEditingUser(null);
        router.refresh();
      } else {
        alert("Failed to update user");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to completely delete ${email}? This cannot be undone.`)) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        router.refresh();
      } else {
        alert("Failed to delete user");
      }
    } catch (e) {
      alert("An error occurred");
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Credits</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.companyName || u.domain}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    u.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-800' : u.plan === 'PRO' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {u.plan || 'FREE'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{u.credits}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(u)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id, u.email)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">User Email</label>
                <input type="text" disabled value={editingUser.email} className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl py-2 px-3" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full border border-slate-200 text-slate-900 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
                <select 
                  value={editPlan} 
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full border border-slate-200 text-slate-900 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Credit Balance</label>
                <input 
                  type="number" 
                  value={editCredits} 
                  onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-200 text-slate-900 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
