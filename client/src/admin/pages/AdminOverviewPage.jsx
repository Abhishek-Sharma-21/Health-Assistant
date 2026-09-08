import React, { useState, useEffect } from "react";
import {
  Users,
  Bot,
  FileText,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";

export function AdminOverviewPage() {
  const { setActivePage } = useHealthStore();
  const [metrics, setMetrics] = useState({
    totalUsers: 1420,
    activeUsers: 1380,
    superAdmins: 3,
    aiTriages: 8942,
    contentArticles: 148,
    systemStatus: "Healthy",
    databaseProvider: "Neon PostgreSQL",
  });
  const [loading, setLoading] = useState(true);
  const [activitySearch, setActivitySearch] = useState("");

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/dashboard`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) {
          setMetrics((prev) => ({ ...prev, ...data.metrics }));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live admin metrics, using fallback metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Activity logs mock data
  const recentActivities = [
    {
      id: "act-1",
      user: "Super Admin",
      action: "Updated OpenRouter AI Model Configuration",
      target: "GPT-4o / Claude 3.5 Triage Engine",
      timestamp: "10 mins ago",
      status: "success",
      type: "config",
    },
    {
      id: "act-2",
      user: "Dr. Sarah Jenkins",
      action: "Published New Health Article",
      target: "Understanding Cardiovascular Risk Factors",
      timestamp: "35 mins ago",
      status: "success",
      type: "content",
    },
    {
      id: "act-3",
      user: "System Security Triage",
      action: "Blocked Suspicious IP Range",
      target: "Rate Limit Violation (192.168.1.102)",
      timestamp: "2 hours ago",
      status: "warning",
      type: "security",
    },
    {
      id: "act-4",
      user: "Abhishek Sharma",
      action: "Completed Symptom Checker Triage",
      target: "Migraine & Tension Headache Assessment",
      timestamp: "3 hours ago",
      status: "success",
      type: "triage",
    },
    {
      id: "act-5",
      user: "Neon PostgreSQL Sync",
      action: "Database Schema Migration",
      target: "Prisma v5.22.0 Production Sync",
      timestamp: "5 hours ago",
      status: "success",
      type: "system",
    },
  ];

  const filteredActivities = recentActivities.filter(
    (item) =>
      item.user.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.target.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-100 via-slate-50 to-cyan-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Control Center v2.4
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Live Neon DB Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Real-time platform telemetries, user growth insights, and AI model health monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={fetchDashboardMetrics}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-600 active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-cyan-600 dark:text-cyan-400" : ""}`} />
            Refresh Telemetries
          </button>

          <button
            onClick={() => setActivePage("admin-users")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Users className="h-4 w-4" /> Manage Users
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Users */}
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              Total Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
              {metrics.totalUsers.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" /> +14.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
            {metrics.activeUsers} active user accounts
          </p>
        </div>

        {/* Stat 2: AI Triages */}
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              AI Triage Sessions
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Bot className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
              {metrics.aiTriages.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="h-3 w-3" /> +28.6%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500 dark:text-amber-400" /> OpenRouter LLM Active
          </p>
        </div>

        {/* Stat 3: Health Articles */}
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              Verified Content
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
              {metrics.contentArticles}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +8 Published
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-cyan-600 dark:text-cyan-400" /> 100% Medical Review
          </p>
        </div>

        {/* Stat 4: System Health */}
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              System Telemetries
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400">
              99.98%
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Healthy
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3 text-cyan-600 dark:text-cyan-400" /> Avg Latency: 124ms
          </p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Registration Growth Line Chart (2 Cols) */}
        <div className="lg:col-span-2 glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> User Registration & Engagement Growth
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly trends of registered platform members and active triage sessions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Active Users
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> AI Triage Calls
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-64 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[30, 80, 130, 180].map((y, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={y}
                  x2="500"
                  y2={y}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeOpacity="0.3"
                />
              ))}

              {/* Area 1: Cyan (Active Users) */}
              <path
                d="M 0 160 Q 80 140 160 90 T 320 60 T 500 20 L 500 180 L 0 180 Z"
                fill="url(#cyanGradient)"
              />
              <path
                d="M 0 160 Q 80 140 160 90 T 320 60 T 500 20"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Area 2: Indigo (AI Triages) */}
              <path
                d="M 0 175 Q 80 160 160 120 T 320 95 T 500 45 L 500 180 L 0 180 Z"
                fill="url(#indigoGradient)"
              />
              <path
                d="M 0 175 Q 80 160 160 120 T 320 95 T 500 45"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeDasharray="6 3"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {[
                { x: 0, y: 160 },
                { x: 100, y: 130 },
                { x: 200, y: 75 },
                { x: 300, y: 65 },
                { x: 400, y: 40 },
                { x: 500, y: 20 },
              ].map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-3">
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep (Now)</span>
            </div>
          </div>
        </div>

        {/* Role Distribution Donut Chart (1 Col) */}
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white">
              User Role Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Breakdown of registered account access levels.
            </p>
          </div>

          <div className="flex justify-center my-4 relative">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background ring */}
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Regular Users slice (75%) */}
              <path
                className="text-cyan-500"
                strokeDasharray="75, 100"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Verified Doctors slice (20%) */}
              <path
                className="text-indigo-500"
                strokeDasharray="20, 100"
                strokeDashoffset="-75"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Super Admin slice (5%) */}
              <path
                className="text-amber-500"
                strokeDasharray="5, 100"
                strokeDashoffset="-95"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                1,420
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Total Roles
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800/80 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Regular Users
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400 font-bold">1,065 (75%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Verified Doctors
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400 font-bold">284 (20%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Super Admins
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400 font-bold">71 (5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Activity Table */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Live Audit Trail & System Events
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Security events, AI model modifications, and user state transitions.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/70 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">User Initiator</th>
                <th className="py-3 px-4">Action Summary</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
              {filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    {act.user}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{act.action}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">{act.target}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        act.type === "security"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : act.type === "config"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : act.type === "triage"
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {act.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                    {act.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
