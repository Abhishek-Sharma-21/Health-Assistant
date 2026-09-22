import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Star,
  StarOff,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../../store/useHealthStore";

export function AdminBlogsPage() {
  const { setActivePage, setAdminEditingBlog } = useHealthStore();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchBlogs();
  }, [debouncedSearch, statusFilter, categoryFilter, pagination.page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/categories`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);

      const res = await fetch(`${apiUrl}/api/admin/blogs?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
        setPagination(data.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      } else {
        toast.error("Failed to load blogs.");
      }
    } catch (err) {
      toast.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`${apiUrl}/api/admin/blogs/${blog.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Blog ${newStatus === "PUBLISHED" ? "published" : "unpublished"} successfully.`);
        fetchBlogs();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update status.");
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleToggleFeatured = async (blog) => {
    if (!blog.isFeatured && blog.status !== "PUBLISHED") {
      toast.error("Only published blogs can be featured.");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/api/admin/blogs/${blog.id}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isFeatured: !blog.isFeatured }),
      });
      if (res.ok) {
        toast.success(`Blog ${blog.isFeatured ? "unfeatured" : "featured"} successfully.`);
        fetchBlogs();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update featured status.");
      }
    } catch (err) {
      toast.error("Failed to update featured status.");
    }
  };

  const handleDelete = async (blog) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/blogs/${blog.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Blog deleted successfully.");
        setConfirmDelete(null);
        fetchBlogs();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete blog.");
      }
    } catch (err) {
      toast.error("Failed to delete blog.");
    }
  };

  const handleEditBlog = (blog) => {
    setAdminEditingBlog(blog);
    setActivePage("admin-blog-editor");
  };

  const handleCreateBlog = () => {
    setAdminEditingBlog(null);
    setActivePage("admin-blog-editor");
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-heading font-black tracking-tight text-slate-900 dark:text-white">
            Blog Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, edit, and publish health articles for your users.
          </p>
        </div>
        <button
          onClick={handleCreateBlog}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 hover:shadow-xl transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Blog
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button
          onClick={fetchBlogs}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Blog Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 mt-3">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No blogs found.</p>
            <button
              onClick={handleCreateBlog}
              className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
            >
              Create your first blog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-semibold">Title</th>
                  <th className="px-6 py-3 font-semibold hidden md:table-cell">Category</th>
                  <th className="px-6 py-3 font-semibold hidden lg:table-cell">Author</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold hidden lg:table-cell">Featured</th>
                  <th className="px-6 py-3 font-semibold hidden sm:table-cell">Date</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{blog.title}</p>
                      {blog.excerpt && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">{blog.excerpt}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {blog.category ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20">
                          {blog.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs text-slate-600 dark:text-slate-400">{blog.author?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(blog)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                          blog.status === "PUBLISHED"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20"
                        }`}
                      >
                        {blog.status === "PUBLISHED" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {blog.status === "PUBLISHED" ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <button
                        onClick={() => handleToggleFeatured(blog)}
                        disabled={blog.status !== "PUBLISHED"}
                        className={`cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                          blog.isFeatured
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-slate-400 hover:text-amber-500"
                        }`}
                      >
                        {blog.isFeatured ? (
                          <Star className="h-5 w-5 fill-current" />
                        ) : (
                          <StarOff className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(blog.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(blog)}
                          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} blogs
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white">Delete Blog</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete "<strong>{confirmDelete.title}</strong>"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/20 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
