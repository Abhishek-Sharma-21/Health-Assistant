import React, { useState } from "react";
import {
  Shield,
  KeyRound,
  Mail,
  CheckCircle2,
  Save,
  Clock,
  User,
  RefreshCw,
} from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";
import toast from "react-hot-toast";

export function AdminProfilePage() {
  const { authUser, setAuthUser } = useHealthStore();
  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Profile form state
  const [profileName, setProfileName] = useState(authUser?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || profileName.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: profileName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully.");
      } else {
        toast.error(data.error || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("Network error updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setUpdatingPassword(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully.");
        setPasswords({ current: "", newPass: "", confirmPass: "" });
      } else {
        toast.error(data.error || "Failed to change password.");
      }
    } catch (err) {
      toast.error("Network error changing password.");
    } finally {
      setUpdatingPassword(false);
    }
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
            Admin Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Manage your administrative profile, security keys, and password.
          </p>
        </div>
      </div>

      {/* Admin Information Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black font-heading flex items-center justify-center text-3xl shadow-xl shadow-cyan-600/20 border border-cyan-400/30">
            {authUser?.name ? authUser.name.charAt(0).toUpperCase() : "A"}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                {authUser?.name || "Admin"}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3" /> Admin
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> {authUser?.email || "admin@healthwise.com"}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Account Active
              </span>
              <span className="text-slate-400">|</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
                <Clock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> Joined {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Name */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
        <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <User className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Edit Profile
        </h3>

        <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={authUser?.email || ""}
              disabled
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed.</p>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingProfile ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Security Credentials Update Form */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
        <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <KeyRound className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Enter current password"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              placeholder="Minimum 6 characters"
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
              placeholder="Repeat new password"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {updatingPassword ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {updatingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
