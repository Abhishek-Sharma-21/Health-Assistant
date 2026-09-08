import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Database, 
  RefreshCw, 
  UserX, 
  Trash2, 
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";

export function AdminDashboardPage() {
  const { authUser } = useHealthStore();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/dashboard`, { credentials: "include" }),
        fetch(`${apiUrl}/api/admin/users`, { credentials: "include" }),
      ]);

      if (dashRes.ok && usersRes.ok) {
        const dashData = await dashRes.json();
        const usersData = await usersRes.json();
        setMetrics(dashData.metrics);
        setUsers(usersData.users || []);
      } else {
        toast.error("Failed to fetch admin statistics. Access denied.");
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error("Error connecting to admin APIs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to update status.");
      }
    } catch (err) {
      toast.error("Network error updating user status.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.email}?`)) return;

    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchAdminData();
      } else {
        toast.error(data.error || "Failed to delete user.");
      }
    } catch (err) {
      toast.error("Network error deleting user.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
              Super Admin Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold font-mono">
              SUPER_ADMIN
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            System administration, database user management, and security audit log.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registered</span>
            <Users className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground">
            {metrics?.totalUsers ?? users.length}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Accounts</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {metrics?.activeUsers ?? users.filter(u => u.isActive).length}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Super Admins</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-rose-600 dark:text-rose-400">
            {metrics?.superAdmins ?? users.filter(u => u.role === "super_admin").length}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Database Engine</span>
            <Database className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-sm font-bold font-heading text-foreground">
            Neon PostgreSQL
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-card rounded-2xl border border-border/70 overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground">PostgreSQL User Directory</h2>
            <p className="text-xs text-muted-foreground">Manage user roles, access statuses, and account terminations.</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter users by name, email..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 text-xs text-foreground pl-9 pr-3 py-2 rounded-xl border border-border/80 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">User Details</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Registered Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{u.name}</div>
                      <div className="text-muted-foreground text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        u.role === "super_admin"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                          : "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        u.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                      }`}>
                        {u.isActive ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.id === authUser?.id}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-30 cursor-pointer"
                        title={u.isActive ? "Deactivate User" : "Activate User"}
                      >
                        {u.isActive ? <UserX className="h-3.5 w-3.5 text-amber-500" /> : <UserCheck className="h-3.5 w-3.5 text-emerald-500" />}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={u.id === authUser?.id}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-colors disabled:opacity-30 cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground italic">
                    {loading ? "Loading users directory..." : "No users found matching query."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
