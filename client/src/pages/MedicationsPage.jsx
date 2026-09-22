import React, { useState, useEffect } from "react";
import {
  Plus,
  Pill,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Trash2,
  X,
  Save,
  Calendar,
  Pause,
  Play,
  Bell,
  ChevronRight,
  Check,
  Minus,
} from "lucide-react";
import toast from "react-hot-toast";

const UNITS = [
  { value: "MG", label: "mg" },
  { value: "G", label: "g" },
  { value: "ML", label: "ml" },
  { value: "TABLET", label: "tablet" },
  { value: "CAPSULE", label: "capsule" },
  { value: "DROP", label: "drop" },
  { value: "PUFF", label: "puff" },
  { value: "OTHER", label: "other" },
];

const FREQUENCIES = [
  { value: "ONCE_DAILY", label: "Once daily" },
  { value: "TWICE_DAILY", label: "Twice daily" },
  { value: "THREE_TIMES_DAILY", label: "3 times daily" },
  { value: "FOUR_TIMES_DAILY", label: "4 times daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "AS_NEEDED", label: "As needed" },
  { value: "CUSTOM", label: "Custom" },
];

const FREQUENCY_MAP = Object.fromEntries(FREQUENCIES.map((f) => [f.value, f.label]));
const UNIT_MAP = Object.fromEntries(UNITS.map((u) => [u.value, u.label]));

const EMPTY_FORM = {
  name: "",
  dosage: "",
  dosageUnit: "TABLET",
  frequency: "ONCE_DAILY",
  instructions: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  status: "ACTIVE",
  schedules: [{ time: "08:00", daysOfWeek: "daily" }],
};

function formatTime(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function inputClass() {
  return "w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-colors";
}

export function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [todayDoses, setTodayDoses] = useState([]);
  const [upcomingDoses, setUpcomingDoses] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchMedications();
    fetchTodayDoses();
    fetchUpcomingDoses();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const res = await fetch(`${apiUrl}/api/medications${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMedications(data.medications || []);
      }
    } catch (err) {
      toast.error("Failed to load medications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [filter]);

  const fetchTodayDoses = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/medications/doses/today`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTodayDoses(data.doses || []);
      }
    } catch (err) {}
  };

  const fetchUpcomingDoses = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/medications/doses/upcoming`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUpcomingDoses(data.doses || []);
      }
    } catch (err) {}
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (med) => {
    setEditing(med);
    setForm({
      name: med.name,
      dosage: med.dosage ?? "",
      dosageUnit: med.dosageUnit,
      frequency: med.frequency,
      instructions: med.instructions || "",
      startDate: new Date(med.startDate).toISOString().split("T")[0],
      endDate: med.endDate ? new Date(med.endDate).toISOString().split("T")[0] : "",
      status: med.status,
      schedules: med.schedules.length > 0
        ? med.schedules.map((s) => ({ time: s.time, daysOfWeek: s.daysOfWeek }))
        : [{ time: "08:00", daysOfWeek: "daily" }],
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      name: form.name.trim(),
      dosage: form.dosage !== "" ? parseFloat(form.dosage) : null,
      dosageUnit: form.dosageUnit,
      frequency: form.frequency,
      instructions: form.instructions.trim() || null,
      startDate: form.startDate,
      endDate: form.endDate || null,
      status: form.status,
      schedules: form.schedules.map((s) => ({ time: s.time, daysOfWeek: s.daysOfWeek })),
    };

    try {
      const method = editing ? "PATCH" : "POST";
      const url = editing ? `${apiUrl}/api/medications/${editing.id}` : `${apiUrl}/api/medications`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editing ? "Medication updated." : "Medication added.");
        setShowForm(false);
        fetchMedications();
        fetchUpcomingDoses();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save medication.");
      }
    } catch (err) {
      toast.error("Failed to save medication.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (med) => {
    const newStatus = med.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`${apiUrl}/api/medications/${med.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Medication ${newStatus === "ACTIVE" ? "activated" : "deactivated"}.`);
        fetchMedications();
        fetchUpcomingDoses();
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (med) => {
    try {
      const res = await fetch(`${apiUrl}/api/medications/${med.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Medication deleted.");
        setConfirmDelete(null);
        fetchMedications();
      }
    } catch (err) {
      toast.error("Failed to delete medication.");
    }
  };

  const markDose = async (doseId, status) => {
    try {
      const res = await fetch(`${apiUrl}/api/medications/doses/${doseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Dose marked as ${status.toLowerCase()}.`);
        fetchTodayDoses();
        fetchUpcomingDoses();
      }
    } catch (err) {
      toast.error("Failed to update dose.");
    }
  };

  const addSchedule = () => {
    setForm((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { time: "12:00", daysOfWeek: "daily" }],
    }));
  };

  const removeSchedule = (idx) => {
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== idx),
    }));
  };

  const updateSchedule = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  };

  const pendingToday = todayDoses.filter((d) => d.status === "PENDING");
  const completedToday = todayDoses.filter((d) => d.status !== "PENDING");

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
            Medications
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your medications, schedules, and track doses.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 hover:shadow-xl transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Medication
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today + Upcoming */}
        <div className="space-y-6">
          {/* Today's Doses */}
          <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600" />
              <h2 className="text-sm font-heading font-bold text-foreground">Today's Medication</h2>
            </div>

            {todayDoses.length === 0 && (
              <p className="text-xs text-muted-foreground">No doses scheduled for today.</p>
            )}

            {pendingToday.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending</span>
                {pendingToday.map((dose) => (
                  <div key={dose.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10">
                    <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold shrink-0">
                      {formatTime(new Date(dose.scheduledAt).toTimeString().slice(0, 5))}
                    </span>
                    <span className="text-xs text-foreground flex-1 truncate">
                      {dose.medication.name} — {dose.medication.dosage} {UNIT_MAP[dose.medication.dosageUnit]}
                    </span>
                    <button
                      onClick={() => markDose(dose.id, "TAKEN")}
                      className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer"
                      title="Mark as taken"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => markDose(dose.id, "SKIPPED")}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-500/10 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-500/20 transition-colors cursor-pointer"
                      title="Skip dose"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {completedToday.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
                {completedToday.map((dose) => (
                  <div key={dose.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/10">
                    {dose.status === "TAKEN" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : dose.status === "SKIPPED" ? (
                      <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <span className="text-xs text-foreground flex-1 truncate">
                      {dose.medication.name} — {formatTime(new Date(dose.scheduledAt).toTimeString().slice(0, 5))}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">{dose.status.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-heading font-bold text-foreground">Upcoming</h2>
            </div>
            {upcomingDoses.length === 0 ? (
              <p className="text-xs text-muted-foreground">No upcoming reminders.</p>
            ) : (
              <div className="space-y-2">
                {upcomingDoses.slice(0, 8).map((dose) => {
                  const dt = new Date(dose.scheduledAt);
                  const isTomorrow = new Date(dt.toDateString()) > new Date(new Date().toDateString());
                  return (
                    <div key={dose.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50">
                      <span className="text-xs text-muted-foreground font-semibold shrink-0 w-16">
                        {isTomorrow ? "Tomorrow" : "Today"}
                      </span>
                      <span className="text-xs text-foreground flex-1 truncate">
                        {formatTime(dt.toTimeString().slice(0, 5))} — {dose.medication.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Medication List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {["ALL", "ACTIVE", "INACTIVE"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  filter === f
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                    : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && medications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <Pill className="h-16 w-16 text-muted-foreground/30" />
              <div>
                <p className="text-lg font-heading font-bold text-foreground">No medications added</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Keep track of your medications and set reminders to help you stay organized.
                </p>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Medication
              </button>
            </div>
          )}

          {/* Medication Cards */}
          {!loading && medications.length > 0 && (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className={`glass-card rounded-2xl p-5 border transition-all ${
                    med.status === "ACTIVE"
                      ? "border-border/70 hover:border-cyan-500/30"
                      : "border-border/40 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        med.status === "ACTIVE"
                          ? "bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20"
                          : "bg-slate-100 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20"
                      }`}>
                        <Pill className={`h-5 w-5 ${
                          med.status === "ACTIVE"
                            ? "text-cyan-600 dark:text-cyan-400"
                            : "text-slate-400"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-sm text-foreground truncate">{med.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {med.dosage} {UNIT_MAP[med.dosageUnit]} · {FREQUENCY_MAP[med.frequency]}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(med.startDate)}
                            {med.endDate && ` — ${formatDate(med.endDate)}`}
                          </span>
                        </div>
                        {med.schedules.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {med.schedules.map((s) => (
                              <span key={s.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {formatTime(s.time)}
                              </span>
                            ))}
                          </div>
                        )}
                        {med.instructions && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleStatus(med)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          med.status === "ACTIVE"
                            ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                            : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        }`}
                        title={med.status === "ACTIVE" ? "Mark inactive" : "Mark active"}
                      >
                        {med.status === "ACTIVE" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(med)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(med)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-heading font-bold text-foreground">
                {editing ? "Edit Medication" : "Add Medication"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <Field label="Medication Name *">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Paracetamol, Vitamin D"
                  className={inputClass()}
                  required
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Dosage">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="500"
                    className={inputClass()}
                  />
                </Field>
                <Field label="Unit">
                  <select value={form.dosageUnit} onChange={(e) => setForm({ ...form, dosageUnit: e.target.value })} className={inputClass()}>
                    {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </Field>
                <Field label="Frequency">
                  <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className={inputClass()}>
                    {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date *">
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass()} required />
                </Field>
                <Field label="End Date">
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass()} />
                </Field>
              </div>

              <Field label="Instructions">
                <textarea
                  rows={2}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="e.g. Take after breakfast"
                  className={`${inputClass()} resize-none`}
                />
              </Field>

              {/* Schedules */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Reminder Times</label>
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Time
                  </button>
                </div>
                {form.schedules.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={s.time}
                      onChange={(e) => updateSchedule(idx, "time", e.target.value)}
                      className={`${inputClass()} flex-1`}
                    />
                    {form.schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(idx)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 hover:shadow-xl disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : editing ? "Update" : "Add Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground">Delete Medication</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "<strong>{confirmDelete.name}</strong>"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
        <span>Medication reminders are for your personal tracking only. Always consult your healthcare provider for medical advice.</span>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}
