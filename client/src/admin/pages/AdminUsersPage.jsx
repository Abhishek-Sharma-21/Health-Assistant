import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
  UserCheck,
  UserX,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Detail modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Confirmation modal
  const [confirmAction, setConfirmAction] = useState(null);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter, statusFilter, pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`${apiUrl}/api/admin/users?${params}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setPagination(data.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      } else {
        toast.error("Failed to load users list.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Network error while loading users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data.user);
      } else {
        toast.error("Failed to load user details.");
      }
    } catch (err) {
      toast.error("Network error loading user details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = (user) => {
    setConfirmAction({
      type: user.isActive ? "block" : "unblock",
      user,
    });
  };

  const executeStatusToggle = async () => {
    if (!confirmAction) return;
    const { user } = confirmAction;
    setConfirmAction(null);

    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "User status updated.");
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to update user status.");
      }
    } catch (err) {
      toast.error("Error connecting to server.");
    }
  };

  const goToPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Access Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            Users Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Manage system roles, account statuses, and user access permissions.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-cyan-600 dark:text-cyan-400" : ""}`} />
          Sync Users
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: "all", label: "All Users" },
            { id: "admin", label: "Admins" },
            { id: "user", label: "Users" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setRoleFilter(tab.id); setPagination((prev) => ({ ...prev, page: 1 })); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === tab.id
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <span className="text-slate-300 dark:text-slate-600 mx-1">|</span>

          {["all", "active", "blocked"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPagination((prev) => ({ ...prev, page: 1 })); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap capitalize ${
                statusFilter === s
                  ? "bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-900/20 dark:border-white/20 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">User Profile</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Created</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 font-mono">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 font-mono italic">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* User Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold font-heading flex items-center justify-center text-sm shadow-md">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{u.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {u.isActive ? (
                          <><CheckCircle2 className="h-3 w-3" /> Active</>
                        ) : (
                          <><XCircle className="h-3 w-3" /> Blocked</>
                        )}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => fetchUserDetail(u.id)}
                          title="View Details"
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/30 transition-all cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.isActive ? "Block User" : "Unblock User"}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            u.isActive
                              ? "bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border-slate-200 dark:border-slate-700 hover:border-rose-500/30"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1}-
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-8 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
                <p className="text-xs text-slate-500">Loading user details...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold font-heading flex items-center justify-center text-xl shadow-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedUser.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Role</span>
                    <p className={`text-xs font-bold capitalize ${
                      selectedUser.role === "admin" ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
                    }`}>
                      {selectedUser.role}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Status</span>
                    <p className={`text-xs font-bold ${
                      selectedUser.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {selectedUser.isActive ? "Active" : "Blocked"}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Created
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Updated
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {new Date(selectedUser.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedUser(null); handleToggleStatus(selectedUser); }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedUser.isActive
                      ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {selectedUser.isActive ? "Block User" : "Unblock User"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border ${
                confirmAction.type === "block"
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }`}>
                {confirmAction.type === "block" ? <UserX className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                {confirmAction.type === "block" ? "Block User?" : "Unblock User?"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {confirmAction.user.name} ({confirmAction.user.email})
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {confirmAction.type === "block"
                  ? "This will prevent the user from accessing the application."
                  : "This will restore the user's access to the application."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeStatusToggle}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                  confirmAction.type === "block"
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
                }`}
              >
                {confirmAction.type === "block" ? "Block User" : "Unblock User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
