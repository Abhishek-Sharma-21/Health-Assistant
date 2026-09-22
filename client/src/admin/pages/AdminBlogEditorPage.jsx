import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../../store/useHealthStore";

export function AdminBlogEditorPage() {
  const { setActivePage, adminEditingBlog, setAdminEditingBlog } = useHealthStore();
  const isEditing = !!adminEditingBlog;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCategories();
    if (isEditing && adminEditingBlog) {
      loadBlog(adminEditingBlog.id);
    }
  }, []);

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

  const loadBlog = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/blogs/${id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const b = data.blog;
        setTitle(b.title || "");
        setContent(b.content || "");
        setExcerpt(b.excerpt || "");
        setCategoryId(b.categoryId || "");
        setStatus(b.status || "DRAFT");
        setIsFeatured(b.isFeatured || false);
      } else {
        toast.error("Failed to load blog.");
        setActivePage("admin-blogs");
      }
    } catch (err) {
      toast.error("Failed to load blog.");
      setActivePage("admin-blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publishStatus) => {
    if (!title.trim() || title.trim().length < 3) {
      toast.error("Title must be at least 3 characters.");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        categoryId: categoryId || null,
        status: publishStatus || status,
        isFeatured: isFeatured && (publishStatus || status) === "PUBLISHED",
      };

      const url = isEditing
        ? `${apiUrl}/api/admin/blogs/${adminEditingBlog.id}`
        : `${apiUrl}/api/admin/blogs`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isEditing ? "Blog updated successfully." : "Blog created successfully.");
        setAdminEditingBlog(null);
        setActivePage("admin-blogs");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save blog.");
      }
    } catch (err) {
      toast.error("Failed to save blog.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setAdminEditingBlog(null);
    setActivePage("admin-blogs");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-heading font-black tracking-tight text-slate-900 dark:text-white">
              {isEditing ? "Edit Blog" : "Create New Blog"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing ? "Update your blog post" : "Write and publish a new health article"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Clock className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 hover:shadow-xl disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isEditing ? "Update & Publish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Editor Form */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-heading font-bold text-lg"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary for blog listings (optional)..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Content * <span className="text-slate-400 dark:text-slate-500 normal-case">(supports plain text with line breaks)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here..."
            rows={20}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y min-h-[300px] leading-relaxed"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {content.length} characters
          </p>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setIsFeatured(!isFeatured)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              isFeatured ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isFeatured ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Featured Blog</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Featured blogs are highlighted on the public blog page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
