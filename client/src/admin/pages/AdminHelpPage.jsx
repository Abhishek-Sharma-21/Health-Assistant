import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Search,
  Activity,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export function AdminHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handlePingTest = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const res = await fetch(`${apiUrl}/api/health`);
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        setPingResult({ status: "Online", latency: `${latency}ms`, provider: "Neon PostgreSQL" });
        toast.success(`Server ping test successful (${latency}ms latency)`);
      } else {
        setPingResult({ status: "Error", latency: `${latency}ms`, provider: "Server issue" });
      }
    } catch (err) {
      setPingResult({ status: "Offline", latency: "N/A", provider: "Unreachable" });
      toast.error("Failed to connect to backend server.");
    } finally {
      setPinging(false);
    }
  };

  const faqs = [
    {
      q: "How do I promote a user account to Super Admin or Doctor role?",
      a: "Navigate to Users Management screen, locate the target user account, click the edit or role dropdown, and update their access role level. Changes sync immediately to Neon PostgreSQL.",
    },
    {
      q: "Where can I monitor OpenRouter AI triage responses for safety compliance?",
      a: "Use the AI Conversations Inspector tab to view real-time chat streams, urgency risk scores, and clinical safety guardrail outputs.",
    },
    {
      q: "What happens if a regular user tries to open an admin dashboard page URL?",
      a: "The Admin Security Guard component automatically intercepts unverified requests, evaluates the user's JWT role claims, and blocks access with a 403 Forbidden alert screen.",
    },
    {
      q: "How do I broadcast maintenance notifications to logged-in patients?",
      a: "Open System Announcements, click 'Create System Broadcast', enter your headline and notice body, and select 'All Users' or 'Patients Only'.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Control Center Guide & Diagnostics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            Help & Developer Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Search administrative documentation, test API node latency, or open technical support requests.
          </p>
        </div>

        <button
          onClick={handlePingTest}
          disabled={pinging}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Activity className={`h-4 w-4 ${pinging ? "animate-spin text-cyan-600 dark:text-cyan-400" : "text-emerald-600 dark:text-emerald-400"}`} />
          Run Server Diagnostic Ping
        </button>
      </div>

      {/* Ping Diagnostics Result Card if executed */}
      {pingResult && (
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">API Gateway Status: {pingResult.status}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Latency: {pingResult.latency} | Provider: {pingResult.provider}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
            200 OK
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documentation or administrative FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="space-y-3">
        <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Administrative Knowledge Base
        </h2>

        {filteredFaqs.map((faq, index) => (
          <div
            key={index}
            className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
          >
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                  openFaq === index ? "transform rotate-180 text-cyan-600 dark:text-cyan-400" : ""
                }`}
              />
            </button>

            {openFaq === index && (
              <div className="p-5 pt-0 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
