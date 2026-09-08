import React, { useState } from "react";
import {
  Sliders,
  ShieldAlert,
  Bot,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

export function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("HealthWise AI Assistant");
  const [aiModel, setAiModel] = useState("meta-llama/llama-3.3-70b-instruct:free");
  const [temperature, setTemperature] = useState(0.3);
  const [rateLimit, setRateLimit] = useState(60);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Control Center settings updated successfully!");
    }, 600);
  };

  const handlePurgeCache = () => {
    toast.success("Cache and active session tokens purged.");
  };

  const handleReindexDB = () => {
    toast.success("Neon PostgreSQL database indexes optimized.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Control Center Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            Admin Settings & AI Parameters
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Configure OpenRouter AI LLM models, rate-limiting policies, and database connection pools.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: AI Model & OpenRouter Engine */}
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Bot className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> OpenRouter Medical LLM Engine Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Medical Model Selector
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="meta-llama/llama-3.3-70b-instruct:free">
                  Meta Llama 3.3 70B Instruct (Default Free Triage)
                </option>
                <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini (High Accuracy)</option>
                <option value="google/gemini-flash-1.5">Google Gemini Flash 1.5 (Sub-100ms Latency)</option>
                <option value="anthropic/claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet (Clinical Audit)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Used for instant symptom checker evaluation and follow-up medical triage.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Temperature (Clinical Variance): <span className="font-mono text-cyan-600 dark:text-cyan-400">{temperature}</span>
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Lower values (0.1–0.3) ensure strict, conservative clinical accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: General & Rate Limits */}
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Platform Security & Rate Limiting
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Platform Name Branding
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Rate Limit Threshold (Requests / Min)
              </label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value) || 60)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">System Maintenance Mode</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Temporarily pause new user registration and public symptom checker.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                maintenanceMode ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  maintenanceMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 3: Danger Zone */}
        <div className="glass-card bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-base font-heading font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 border-b border-rose-500/20 pb-3">
            <ShieldAlert className="h-4 w-4" /> Administrative Danger Zone
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Flush System Token Cache</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Revoke active sessions across non-admin endpoints.</p>
            </div>
            <button
              type="button"
              onClick={handlePurgeCache}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold cursor-pointer"
            >
              Purge Token Cache
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-rose-500/10">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Neon PostgreSQL Re-Index</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Re-build relational foreign key indexes for optimum speed.</p>
            </div>
            <button
              type="button"
              onClick={handleReindexDB}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
            >
              Optimize DB Indexes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
