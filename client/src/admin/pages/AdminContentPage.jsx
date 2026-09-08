import React, { useState } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [articles, setArticles] = useState([
    {
      id: "art-1",
      title: "Understanding Cardiovascular Risk Factors & Prevention",
      category: "Cardiology",
      status: "Published",
      author: "Dr. Sarah Jenkins",
      readTime: "5 min read",
      publishedDate: "Sep 04, 2026",
      views: 3420,
    },
    {
      id: "art-2",
      title: "Managing Chronic Tension Headaches and Migraine Triggers",
      category: "Neurology",
      status: "Published",
      author: "Dr. Alex Morgan",
      readTime: "8 min read",
      publishedDate: "Aug 28, 2026",
      views: 5120,
    },
    {
      id: "art-3",
      title: "Nutritional Strategies for Optimal Immune Resilience",
      category: "Nutrition",
      status: "Draft",
      author: "HealthWise Editorial Board",
      readTime: "6 min read",
      publishedDate: "Draft",
      views: 0,
    },
    {
      id: "art-4",
      title: "Pediatric Fever Triage Protocol for Parents",
      category: "Pediatrics",
      status: "Published",
      author: "Dr. Rachel Vance",
      readTime: "4 min read",
      publishedDate: "Aug 15, 2026",
      views: 1890,
    },
  ]);

  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "General Wellness",
    content: "",
    author: "Super Admin Medical Reviewer",
    readTime: "5 min read",
  });

  const handleCreateArticle = (e) => {
    e.preventDefault();
    const created = {
      id: `art-${Date.now()}`,
      title: newArticle.title,
      category: newArticle.category,
      status: "Published",
      author: newArticle.author,
      readTime: newArticle.readTime,
      publishedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      views: 1,
    };
    setArticles([created, ...articles]);
    toast.success("Health content article published successfully!");
    setIsAddModalOpen(false);
    setNewArticle({
      title: "",
      category: "General Wellness",
      content: "",
      author: "Super Admin Medical Reviewer",
      readTime: "5 min read",
    });
  };

  const handleToggleStatus = (id) => {
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === id) {
          const nextStatus = art.status === "Published" ? "Draft" : "Published";
          toast.success(`Article status updated to ${nextStatus}`);
          return { ...art, status: nextStatus };
        }
        return art;
      })
    );
  };

  const handleDeleteArticle = (id) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    toast.success("Article removed from system repository.");
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "all" || art.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Content Publishing Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            Health Content Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Publish verified medical guides, manage article categories, and review clinical content drafts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" /> Publish New Article
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["all", "Cardiology", "Neurology", "Nutrition", "Pediatrics"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap capitalize ${
                categoryFilter === cat
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Article Title & Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Author / Reviewer</th>
                <th className="py-4 px-6">Views</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 max-w-md">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{art.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {art.readTime} • Published {art.publishedDate}
                    </p>
                  </td>

                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
                      {art.category}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        art.status === "Published"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {art.status === "Published" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {art.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-300">{art.author}</td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {art.views.toLocaleString()}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(art.id)}
                        title="Toggle Publish Status"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.id)}
                        title="Delete Article"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Publish Health Article</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add medical guide to the user health repository.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Managing Hypertension naturally"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Wellness">General Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={newArticle.readTime}
                    onChange={(e) => setNewArticle({ ...newArticle, readTime: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Article Content (Markdown)</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Enter medical guide content..."
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
