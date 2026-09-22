import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Star,
  User,
  Tag,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";

export function BlogDetailPage() {
  const { setActivePage, selectedBlogSlug } = useHealthStore();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (selectedBlogSlug) {
      fetchBlog(selectedBlogSlug);
    } else {
      setActivePage("blogs");
    }
  }, [selectedBlogSlug]);

  const fetchBlog = async (slug) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/blogs/${slug}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBlog(data.blog);
      } else {
        toast.error("Blog not found.");
        setActivePage("blogs");
      }
    } catch (err) {
      toast.error("Failed to load blog.");
      setActivePage("blogs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back Button */}
      <button
        onClick={() => setActivePage("blogs")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Blog</span>
      </button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {blog.isFeatured && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
          {blog.category && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
              {blog.category.name}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-foreground">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {blog.author?.name || "Admin"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(blog.createdAt)}
          </span>
        </div>
      </div>

      {/* Excerpt */}
      {blog.excerpt && (
        <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-500/5 border border-cyan-200/50 dark:border-cyan-500/10">
          <p className="text-sm text-cyan-800 dark:text-cyan-200 leading-relaxed italic">
            {blog.excerpt}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border/70 space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {blog.content.split("\n").map((paragraph, i) => {
            if (paragraph.trim() === "") return <br key={i} />;
            return (
              <p key={i} className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4">
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
        <span>Educational content reviewed by HealthWise Clinical Board. Not a substitute for medical advice.</span>
      </div>
    </div>
  );
}
