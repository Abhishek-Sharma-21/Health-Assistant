import React, { useState, useEffect } from "react";
import {
  Sliders,
  Save,
  RefreshCw,
  Key,
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../../store/useHealthStore";

export function AdminSettingsPage() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const setActivePage = useHealthStore((s) => s.setActivePage);

  const [platformName, setPlatformName] = useState("HealthWise AI Assistant");
  const [rateLimit, setRateLimit] = useState(60);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/settings`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPlatformName(data.platformName || "HealthWise AI Assistant");
        setRateLimit(data.rateLimit ?? 60);
        setMaintenanceMode(data.maintenanceMode || false);
      }
    } catch (err) {
      console.warn("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ platformName, rateLimit, maintenanceMode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Settings saved successfully.");
      } else {
        toast.error(data.error || "Failed to save settings.");
      }
    } catch (err) {
      toast.error("Network error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-cyan-600 dark:text-cyan-400" />
        <span className="ml-2 text-sm text-slate-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Platform Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            Admin Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Configure platform name, rate limits, and maintenance mode.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Platform Settings */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Platform Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Platform Name
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
                Rate Limit (requests/min)
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
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Maintenance Mode</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Pause public registration and symptom checker.
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
      </form>

      {/* AI Credentials Pointer */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Key className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">AI Provider & Model</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              API keys, model selection, and task routing are managed in AI Credentials.
            </span>
          </div>
        </div>
        <button
          onClick={() => setActivePage("admin-ai-credentials")}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Open AI Credentials
        </button>
      </div>
    </div>
  );
}
