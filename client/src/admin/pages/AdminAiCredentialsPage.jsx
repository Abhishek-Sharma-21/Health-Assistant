import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BrainCircuit,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const AI_TASKS = [
  { value: "CHAT", label: "AI Chat" },
  { value: "SYMPTOM_ANALYSIS", label: "Symptom Analysis" },
  { value: "HEALTH_SUMMARY", label: "Health Summary" },
  { value: "TREND_SUMMARY", label: "Trend Summary" },
  { value: "RECORD_SUMMARY", label: "Record Summary" },
  { value: "MEDICATION_INFORMATION", label: "Medication Info" },
];

const ROUTING_STRATEGIES = [
  { value: "PRIORITY", label: "Priority (highest priority first)" },
  { value: "ROUND_ROBIN", label: "Round Robin (even distribution)" },
  { value: "FAILOVER", label: "Failover (sequential fallback)" },
];

const EMPTY_CREDENTIAL = {
  name: "",
  provider: "",
  model: "",
  apiKey: "",
  baseUrl: "",
  enabled: true,
  priority: 10,
  routingStrategy: "PRIORITY",
  tasks: ["CHAT"],
};

export function AdminAiCredentialsPage() {
  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_CREDENTIAL });
  const [showApiKey, setShowApiKey] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/ai-credentials`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.credentials || []);
      }
    } catch (err) {
      console.warn("Failed to load AI credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_CREDENTIAL });
    setShowForm(true);
    setShowApiKey(false);
  };

  const handleEdit = (cred) => {
    setEditingId(cred.id);
    setForm({
      name: cred.name,
      provider: cred.provider,
      model: cred.model,
      apiKey: "",
      baseUrl: cred.baseUrl || "",
      enabled: cred.enabled,
      priority: cred.priority,
      routingStrategy: cred.routingStrategy,
      tasks: cred.tasks || ["CHAT"],
    });
    setShowForm(true);
    setShowApiKey(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this AI credential? This cannot be undone.")) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/ai-credentials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCredentials((prev) => prev.filter((c) => c.id !== id));
        toast.success("Credential deleted");
      } else {
        toast.error("Failed to delete credential");
      }
    } catch {
      toast.error("Failed to delete credential");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${apiUrl}/api/admin/ai-credentials/${editingId}`
        : `${apiUrl}/api/admin/ai-credentials`;

      const body = { ...form };
      if (editingId && !body.apiKey) delete body.apiKey;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingId) {
          setCredentials((prev) => prev.map((c) => (c.id === editingId ? data.credential : c)));
        } else {
          setCredentials((prev) => [...prev, data.credential]);
        }
        setShowForm(false);
        setEditingId(null);
        setForm({ ...EMPTY_CREDENTIAL });
        toast.success(editingId ? "Credential updated" : "Credential created");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save credential");
      }
    } catch {
      toast.error("Failed to save credential");
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = (task) => {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.includes(task)
        ? prev.tasks.filter((t) => t !== task)
        : [...prev.tasks, task],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "DISABLED":
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
      case "TEMPORARILY_UNAVAILABLE":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStrategyLabel = (strategy) => {
    return ROUTING_STRATEGIES.find((s) => s.value === strategy)?.label || strategy;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="h-6 w-6 text-cyan-500" />
            AI Credentials
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage API keys, routing strategies, and task assignments for AI providers.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Credential
        </button>
      </div>

      {/* Credential List */}
      {credentials.length === 0 && !showForm ? (
        <div className="text-center py-20 glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <BrainCircuit className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No AI credentials configured.</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Add Your First Credential
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
            >
              {/* Credential Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpandedId(expandedId === cred.id ? null : cred.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{cred.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(cred.status)}`}>
                        {cred.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{cred.provider}</span>
                      <span>{cred.model}</span>
                      <span>Priority: {cred.priority}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(cred); }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(cred.id); }}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {expandedId === cred.id ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === cred.id && (
                <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Routing</span>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{getStrategyLabel(cred.routingStrategy)}</p>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Tasks</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cred.tasks.map((t) => (
                          <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            {AI_TASKS.find((at) => at.value === t)?.label || t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Success / Failures</span>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                        {cred.successCount || 0} / {cred.failureCount || 0}
                      </p>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Last Used</span>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                        {cred.lastUsedAt ? new Date(cred.lastUsedAt).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>
                  {cred.baseUrl && (
                    <div className="text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Base URL</span>
                      <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 break-all">{cred.baseUrl}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
              <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit AI Credential" : "Add AI Credential"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. OpenRouter Flash"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Provider + Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Provider</label>
                  <input
                    type="text"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    required
                    placeholder="e.g. openrouter"
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    required
                    placeholder="e.g. google/gemini-2.5-flash-lite"
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  API Key {editingId && "(leave blank to keep current)"}
                </label>
                <div className="relative mt-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={form.apiKey}
                    onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                    required={!editingId}
                    placeholder={editingId ? "••••••••" : "sk-..."}
                    className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Base URL (optional)</label>
                <input
                  type="text"
                  value={form.baseUrl}
                  onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                  placeholder="https://openrouter.ai/api/v1"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              {/* Priority + Strategy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority (1=highest)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value, 10) || 10 })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Routing Strategy</label>
                  <select
                    value={form.routingStrategy}
                    onChange={(e) => setForm({ ...form, routingStrategy: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    {ROUTING_STRATEGIES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, enabled: !form.enabled })}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.enabled ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.enabled ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enabled</span>
              </div>

              {/* Task Assignments */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Tasks</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AI_TASKS.map((task) => (
                    <button
                      key={task.value}
                      type="button"
                      onClick={() => toggleTask(task.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        form.tasks.includes(task.value)
                          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {task.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
