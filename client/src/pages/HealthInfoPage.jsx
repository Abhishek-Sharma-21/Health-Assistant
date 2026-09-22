import React, { useState, useEffect } from "react";
import { BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { useHealthStore } from "../store/useHealthStore";

export function HealthInfoPage() {
  const { setSelectedBlogSlug } = useHealthStore();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/blogs?pageSize=100`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.blogs || []);
      }
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredArticles = activeCategory === "All"
    ? articles
    : articles.filter((a) => a.category?.name === activeCategory);

  const handleArticleClick = (slug) => {
    setSelectedBlogSlug(slug);
    useHealthStore.getState().setActivePage("blog-detail");
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          Health Information
        </h1>
        <p className="text-sm text-muted-foreground">
          Learn about diseases, wellness, nutrition, mental health and more.
        </p>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2 border-b border-border/50">
          <button
            onClick={() => setActiveCategory("All")}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
              activeCategory === "All"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.filter((c) => c._count?.blogs > 0).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                activeCategory === cat.name
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
        </div>
      )}

      {/* Articles Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleArticleClick(article.slug)}
              className="glass-card rounded-2xl overflow-hidden border border-border/70 hover:border-cyan-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3 p-4">
                <div className="h-40 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border border-cyan-200/50 dark:border-cyan-500/10 flex flex-col items-center justify-center gap-2">
                  <BookOpen className="h-8 w-8 text-cyan-400 dark:text-cyan-500" />
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                    {article.category?.name || "Article"}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-foreground group-hover:text-cyan-600 transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs text-cyan-600 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Read Full Article</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}

          {filteredArticles.length === 0 && (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No articles found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
