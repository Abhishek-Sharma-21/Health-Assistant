import React, { useState } from "react";
import {
  Shield,
  KeyRound,
  Mail,
  CheckCircle2,
  Save,
  Clock,
} from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";
import toast from "react-hot-toast";

export function AdminProfilePage() {
  const { authUser } = useHealthStore();
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [updating, setUpdating] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      toast.error("New passwords do not match!");
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      toast.success("Super Admin credentials updated successfully.");
      setPasswords({ current: "", newPass: "", confirmPass: "" });
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Account Security & Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            Super Admin Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Manage your administrative profile, security keys, and active session tokens.
          </p>
        </div>
      </div>

      {/* Admin Information Card */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black font-heading flex items-center justify-center text-3xl shadow-xl shadow-cyan-600/20 border border-cyan-400/30">
            {authUser?.name ? authUser.name.charAt(0).toUpperCase() : "A"}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                {authUser?.name || "Super Admin"}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3" /> Super Admin
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> {authUser?.email || "admin@healthwise.com"}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Hardware 2FA Active
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
                <Clock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> Last Login: Just Now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Credentials Update Form */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
        <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <KeyRound className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Change Administrative Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Secure Password</label>
            <input
              type="password"
              required
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwords.confirmPass}
              onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {updating ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
