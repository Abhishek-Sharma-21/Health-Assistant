import React, { useState } from "react";
import {
  Megaphone,
  Search,
  AlertTriangle,
  Info,
  Wrench,
  CheckCircle2,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export function AdminAnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [announcements, setAnnouncements] = useState([
    {
      id: "anc-1",
      title: "Scheduled Database Maintenance & Prisma Update",
      message: "The platform will undergo brief maintenance on Sunday at 02:00 AM UTC for Neon PostgreSQL optimization.",
      target: "All Users",
      priority: "Maintenance",
      status: "Active",
      createdAt: "Today, 08:00 AM",
    },
    {
      id: "anc-2",
      title: "New AI Symptom Checker LLM Model Upgrade",
      message: "We've integrated OpenRouter GPT-4o with enhanced clinical safety guardrails for instant symptom triage.",
      target: "Patients Only",
      priority: "Informational",
      status: "Active",
      createdAt: "Yesterday, 11:30 AM",
    },
    {
      id: "anc-3",
      title: "Critical Security Advisory: Password Policy Update",
      message: "All administrative accounts must enable 2FA authentication and update secret credentials.",
      target: "Super Admins",
      priority: "Urgent",
      status: "Active",
      createdAt: "Sep 02, 2026",
    },
  ]);

  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    message: "",
    target: "All Users",
    priority: "Informational",
  });

  const handleCreateBroadcast = (e) => {
    e.preventDefault();
    const created = {
      id: `anc-${Date.now()}`,
      title: newBroadcast.title,
      message: newBroadcast.message,
      target: newBroadcast.target,
      priority: newBroadcast.priority,
      status: "Active",
      createdAt: "Just Now",
    };

    setAnnouncements([created, ...announcements]);
    toast.success("System announcement broadcasted live to users!");
    setIsAddModalOpen(false);
    setNewBroadcast({
      title: "",
      message: "",
      target: "All Users",
      priority: "Informational",
    });
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Broadcast announcement removed.");
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Platform Broadcast System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            System Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Broadcast emergency alerts, maintenance windows, and feature releases across user dashboards.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Megaphone className="h-4 w-4" /> Create System Broadcast
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Announcements List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAnnouncements.map((anc) => (
          <div
            key={anc.id}
            className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`p-2 rounded-xl border ${
                    anc.priority === "Urgent"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : anc.priority === "Maintenance"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                  }`}
                >
                  {anc.priority === "Urgent" && <AlertTriangle className="h-4 w-4" />}
                  {anc.priority === "Maintenance" && <Wrench className="h-4 w-4" />}
                  {anc.priority === "Informational" && <Info className="h-4 w-4" />}
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                    Target: {anc.target}
                  </span>
                  <p className="text-xs text-slate-400 font-mono">{anc.createdAt}</p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteAnnouncement(anc.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-1.5">{anc.title}</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{anc.message}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Live Broadcast Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                {anc.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Announcement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Broadcast Announcement</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Push notification banner to targeted user groups.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled System Upgrade"
                  value={newBroadcast.title}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Group</label>
                  <select
                    value={newBroadcast.target}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, target: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Patients Only">Patients Only</option>
                    <option value="Super Admins">Super Admins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={newBroadcast.priority}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, priority: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Informational">Informational</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Enter detailed notice..."
                  value={newBroadcast.message}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-xs font-bold text-white shadow-lg shadow-amber-600/25 cursor-pointer"
                >
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
