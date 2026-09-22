import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Activity,
  TrendingUp,
  RefreshCw,
  Search,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";

export function AdminOverviewPage() {
  const { setActivePage } = useHealthStore();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalAdmins: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitySearch, setActivitySearch] = useState("");

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, logsRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/dashboard`, { credentials: "include" }),
        fetch(`${apiUrl}/api/admin/audit-logs?pageSize=10`, { credentials: "include" }),
      ]);

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setMetrics(dashData);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setRecentLogs(logsData.logs || []);
      }
    } catch (err) {
      console.warn("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = recentLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.adminUser?.name?.toLowerCase().includes(activitySearch.toLowerCase())
  );

  const formatAction = (action) => {
    const map = {
      USER_BLOCKED: "Blocked User",
      USER_UNBLOCKED: "Unblocked User",
      USER_DELETED: "Deleted User",
      ROLE_CHANGED: "Changed User Role",
    };
    return map[action] || action;
  };

  const statCards = [
    {
      label: "Total Users",
      value: metrics.totalUsers,
      icon: Users,
      color: "cyan",
      subtitle: `${metrics.activeUsers} active accounts`,
    },
    {
      label: "Active Users",
      value: metrics.activeUsers,
      icon: UserCheck,
      color: "emerald",
      subtitle: "Currently active",
    },
    {
      label: "Blocked Users",
      value: metrics.blockedUsers,
      icon: UserX,
      color: "rose",
      subtitle: "Suspended accounts",
    },
    {
      label: "Administrators",
      value: metrics.totalAdmins,
      icon: ShieldCheck,
      color: "amber",
      subtitle: "Admin accounts",
    },
  ];

  const colorClasses = {
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-100 via-slate-50 to-cyan-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Admin Dashboard
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Platform statistics, user management, and system health monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-cyan-600 dark:text-cyan-400" : ""}`} />
            Refresh
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
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const colors = colorClasses[card.color];
          return (
            <div
              key={idx}
              className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                  {card.label}
                </span>
                <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : (
                    card.value.toLocaleString()
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Audit Trail */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Recent Admin Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit trail of admin actions on user accounts.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search activity..."
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
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-500 font-mono">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
                    Loading activity...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-500 font-mono italic">
                    No admin activity recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      {log.adminUser?.name || "Unknown"}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {formatAction(log.action)}
                      {log.metadata?.targetEmail && (
                        <span className="text-slate-500 dark:text-slate-400 ml-1">
                          ({log.metadata.targetEmail})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px] flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
