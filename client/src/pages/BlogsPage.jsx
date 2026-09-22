import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  Star,
  Filter,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";

export function BlogsPage() {
  const { setActivePage, setSelectedBlogSlug } = useHealthStore();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 1 });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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
  }, [debouncedSearch, selectedCategory, pagination.page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/blogs/categories`, { credentials: "include" });
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
      if (selectedCategory) params.set("categoryId", selectedCategory);

      const res = await fetch(`${apiUrl}/api/blogs?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
        setPagination(data.pagination || { page: 1, pageSize: 12, total: 0, totalPages: 1 });
      } else {
        toast.error("Failed to load blogs.");
      }
    } catch (err) {
      toast.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (slug) => {
    setSelectedBlogSlug(slug);
    setActivePage("blog-detail");
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getReadTime = (content) => {
    if (!content) return "1 min read";
    const words = content.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          Health Blog
        </h1>
        <p className="text-sm text-muted-foreground">
          Expert articles on diseases, wellness, nutrition, and healthy living.
        </p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
            showFilters || selectedCategory
              ? "bg-cyan-600 text-white border-cyan-600"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Category Chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
              !selectedCategory
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
              {cat._count?.blogs > 0 && (
                <span className="ml-1 opacity-60">({cat._count.blogs})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Blogs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground/40" />
          <p className="text-lg font-heading font-bold text-muted-foreground">No articles found</p>
          <p className="text-sm text-muted-foreground/70">
            {searchQuery || selectedCategory
              ? "Try adjusting your search or filters."
              : "Check back later for new health articles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => handleBlogClick(blog.slug)}
              className="glass-card rounded-2xl overflow-hidden border border-border/70 hover:border-cyan-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3 p-5">
                {blog.isFeatured && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                )}

                <div>
                  <h3 className="font-heading font-bold text-base text-foreground group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {blog.category && (
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                      {blog.category.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(blog.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
            className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-foreground px-3">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
