import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  Clock,
  Stethoscope,
  FileText,
  Syringe,
  Scissors,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Calendar,
  User,
  Building2,
  ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";

const RECORD_TYPES = [
  { value: "", label: "All Types" },
  { value: "DOCTOR_VISIT", label: "Doctor Visit", icon: Stethoscope, color: "cyan" },
  { value: "DIAGNOSIS", label: "Diagnosis", icon: AlertCircle, color: "amber" },
  { value: "LAB_TEST", label: "Lab Test", icon: FileText, color: "emerald" },
  { value: "VACCINATION", label: "Vaccination", icon: Syringe, color: "violet" },
  { value: "SURGERY", label: "Surgery", icon: Scissors, color: "rose" },
  { value: "OTHER", label: "Other", icon: ClipboardList, color: "slate" },
];

const TYPE_MAP = Object.fromEntries(RECORD_TYPES.map((t) => [t.value, t]));

const EMPTY_FORM = {
  recordType: "DOCTOR_VISIT",
  title: "",
  recordDate: new Date().toISOString().split("T")[0],
  doctorName: "",
  hospitalName: "",
  diagnosis: "",
  description: "",
  notes: "",
};

function getColorClasses(color) {
  const map = {
    cyan: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/20",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20",
    violet: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/20",
    rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20",
    slate: "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/20",
  };
  return map[color] || map.slate;
}

function getIconColorClasses(color) {
  const map = {
    cyan: "text-cyan-600 dark:text-cyan-400",
    amber: "text-amber-600 dark:text-amber-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    rose: "text-rose-600 dark:text-rose-400",
    slate: "text-slate-600 dark:text-slate-400",
  };
  return map[color] || map.slate;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function groupByMonth(records) {
  const groups = {};
  records.forEach((r) => {
    const key = new Date(r.recordDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  return groups;
}

function inputClass() {
  return "w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-colors";
}

export function HealthRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchRecords();
  }, [debouncedSearch, typeFilter, pagination.page]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (typeFilter) params.set("recordType", typeFilter);

      const res = await fetch(`${apiUrl}/api/health-records?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setPagination(data.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      } else {
        toast.error("Failed to load health records.");
      }
    } catch (err) {
      toast.error("Failed to load health records.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setForm({
      recordType: record.recordType,
      title: record.title,
      recordDate: new Date(record.recordDate).toISOString().split("T")[0],
      doctorName: record.doctorName || "",
      hospitalName: record.hospitalName || "",
      diagnosis: record.diagnosis || "",
      description: record.description || "",
      notes: record.notes || "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      recordType: form.recordType,
      title: form.title.trim(),
      recordDate: form.recordDate,
      doctorName: form.doctorName.trim() || null,
      hospitalName: form.hospitalName.trim() || null,
      diagnosis: form.diagnosis.trim() || null,
      description: form.description.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      const method = editingRecord ? "PATCH" : "POST";
      const url = editingRecord
        ? `${apiUrl}/api/health-records/${editingRecord.id}`
        : `${apiUrl}/api/health-records`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingRecord ? "Record updated." : "Record created.");
        setShowForm(false);
        fetchRecords();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save record.");
      }
    } catch (err) {
      toast.error("Failed to save record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      const res = await fetch(`${apiUrl}/api/health-records/${record.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Record deleted.");
        setConfirmDelete(null);
        fetchRecords();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete record.");
      }
    } catch (err) {
      toast.error("Failed to delete record.");
    }
  };

  const grouped = groupByMonth(records);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
            Health Records
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep track of doctor visits, diagnoses, lab tests, and more.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 hover:shadow-xl transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-border/70 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, doctor, hospital, diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RECORD_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                typeFilter === t.value
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30" />
          <div>
            <p className="text-lg font-heading font-bold text-foreground">No health records yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Keep important health events in one place so you can easily review your health history later.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Health Record
          </button>
        </div>
      )}

      {/* Timeline */}
      {!loading && records.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                {month}
              </h3>
              <div className="space-y-3">
                {items.map((record) => {
                  const typeInfo = TYPE_MAP[record.recordType] || TYPE_MAP.OTHER;
                  const Icon = typeInfo.icon;
                  const color = typeInfo.color;
                  return (
                    <div
                      key={record.id}
                      className="glass-card rounded-2xl p-4 sm:p-5 border border-border/70 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl border ${getColorClasses(color)} shrink-0`}>
                          <Icon className={`h-5 w-5 ${getIconColorClasses(color)}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-heading font-bold text-sm text-foreground truncate">
                                  {record.title}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getColorClasses(color)}`}>
                                  {typeInfo.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(record.recordDate)}
                                </span>
                                {record.doctorName && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {record.doctorName}
                                  </span>
                                )}
                                {record.hospitalName && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {record.hospitalName}
                                  </span>
                                )}
                              </div>
                              {record.diagnosis && (
                                <p className="text-xs text-foreground/80 mt-1.5 line-clamp-1">
                                  <span className="font-semibold">Diagnosis:</span> {record.diagnosis}
                                </p>
                              )}
                              {record.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                  {record.description}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEdit(record)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(record)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {record.notes && (
                            <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
                              <span className="font-semibold">Notes:</span> {record.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-foreground">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-heading font-bold text-foreground">
                {editingRecord ? "Edit Health Record" : "New Health Record"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <Field label="Record Type *">
                <select
                  value={form.recordType}
                  onChange={(e) => setForm({ ...form, recordType: e.target.value })}
                  className={inputClass()}
                  required
                >
                  {RECORD_TYPES.filter((t) => t.value).map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Title *">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Checkup, Blood Test"
                  className={inputClass()}
                  required
                />
              </Field>

              <Field label="Record Date *">
                <input
                  type="date"
                  value={form.recordDate}
                  onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
                  className={inputClass()}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Doctor Name">
                  <input
                    type="text"
                    value={form.doctorName}
                    onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Smith"
                    className={inputClass()}
                  />
                </Field>
                <Field label="Hospital / Clinic">
                  <input
                    type="text"
                    value={form.hospitalName}
                    onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                    placeholder="e.g. City Hospital"
                    className={inputClass()}
                  />
                </Field>
              </div>

              <Field label="Diagnosis">
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="e.g. Common Cold, Vitamin D Deficiency"
                  className={inputClass()}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details about the visit or record..."
                  className={`${inputClass()} resize-none`}
                />
              </Field>

              <Field label="Notes">
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className={`${inputClass()} resize-none`}
                />
              </Field>

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
                  {saving ? "Saving..." : editingRecord ? "Update Record" : "Create Record"}
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
                <h3 className="font-heading font-bold text-foreground">Delete Record</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "<strong>{confirmDelete.title}</strong>"?
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
