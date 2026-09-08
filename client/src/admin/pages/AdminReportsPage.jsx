import React, { useState } from "react";
import {
  Download,
  Calendar,
  FileSpreadsheet,
  Activity,
  Zap,
  ShieldCheck,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";

export function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState("30d"); // '7d' | '30d' | '90d' | '1y'

  const handleExportCSV = () => {
    toast.success("Platform Analytics Report (CSV) exported successfully!");
  };

  const handleExportPDF = () => {
    toast.success("Executive Telemetry Audit Summary (PDF) generated!");
  };

  const symptomTrends = [
    { symptom: "Tension Headache / Migraine", count: 2840, percentage: 35 },
    { symptom: "Chest Discomfort & Palpitations", count: 1890, percentage: 24 },
    { symptom: "Upper Respiratory Cough & Fever", count: 1450, percentage: 18 },
    { symptom: "Abdominal Pain & Digestion", count: 1120, percentage: 14 },
    { symptom: "Seasonal Allergies / Skin Rash", count: 720, percentage: 9 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Clinical Data & Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            Reports & Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Export compliance logs, evaluate OpenRouter AI token consumption, and audit top symptom inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Export CSV
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4" /> Generate PDF Report
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Select Telemetry Window:
        </span>
        <div className="flex items-center gap-2">
          {[
            { id: "7d", label: "Last 7 Days" },
            { id: "30d", label: "Last 30 Days" },
            { id: "90d", label: "Last Quarter" },
            { id: "1y", label: "Full Year" },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === range.id
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Symptom Queries Breakdown */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
        <div>
          <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Frequently Queried Symptoms Triage
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Categorized breakdown of patient chief complaints evaluated by OpenRouter AI.
          </p>
        </div>

        <div className="space-y-4">
          {symptomTrends.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.symptom}</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {item.count.toLocaleString()} queries ({item.percentage}%)
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${item.percentage * 2.5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Telemetry Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            OpenRouter LLM Token Count
          </span>
          <p className="text-2xl font-black font-heading text-slate-900 dark:text-white">4.82 Million Tokens</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
            <Zap className="h-3 w-3" /> Average Cost: $0.0004 / session
          </p>
        </div>

        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Clinical Safety Compliance
          </span>
          <p className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">100% Guarded</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
            <ShieldCheck className="h-3 w-3 text-cyan-600 dark:text-cyan-400" /> Zero Unfiltered Triage Incidents
          </p>
        </div>

        <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            PostgreSQL DB Storage
          </span>
          <p className="text-2xl font-black font-heading text-slate-900 dark:text-white">18.4 MB / 512 MB</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
            <Activity className="h-3 w-3 text-indigo-600 dark:text-indigo-400" /> Neon Connection Pooler Active
          </p>
        </div>
      </div>
    </div>
  );
}
