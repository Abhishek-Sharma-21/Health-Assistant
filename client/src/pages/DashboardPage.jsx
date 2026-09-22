import React, { useState, useEffect } from "react";
import {
  MessageSquareText,
  Stethoscope,
  BookOpen,
  HeartPulse,
  UserCheck,
  Pill,
  Heart,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ClipboardList,
  Activity,
  RefreshCw,
  User,
} from "lucide-react";
import { useHealthStore } from "../store/useHealthStore";

const UNIT_MAP = {
  MG: "mg", G: "g", ML: "ml", TABLET: "tablet",
  CAPSULE: "capsule", DROP: "drop", PUFF: "puff", OTHER: "",
};

const RECORD_TYPE_ICONS = {
  DOCTOR_VISIT: Stethoscope,
  DIAGNOSIS: AlertCircle,
  LAB_TEST: ClipboardList,
  VACCINATION: Heart,
  SURGERY: Activity,
  OTHER: ClipboardList,
};

const RECORD_TYPE_COLORS = {
  DOCTOR_VISIT: "cyan",
  DIAGNOSIS: "amber",
  LAB_TEST: "emerald",
  VACCINATION: "violet",
  SURGERY: "rose",
  OTHER: "slate",
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

function formatTime(d) {
  const dt = new Date(d);
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function inputClass() {
  return "w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-colors";
}

export function DashboardPage() {
  const { authUser, setActivePage } = useHealthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${apiUrl}/api/dashboard`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const firstName = authUser?.name?.split(" ")[0] || "there";

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="space-y-1">
          <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-border/70 space-y-3">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-5 border border-border/70 h-48 animate-pulse" />
          <div className="glass-card rounded-2xl p-5 border border-border/70 h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-heading font-bold text-foreground">Unable to load your health overview</p>
        <p className="text-sm text-muted-foreground">Please try again.</p>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  // Empty State (no profile, no records, no meds)
  const isEmpty =
    data &&
    data.profile.completion === 0 &&
    data.records.total === 0 &&
    data.medications.active === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6 pb-12">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">Welcome to your Health Dashboard</p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30" />
          <div>
            <p className="text-lg font-heading font-bold text-foreground">Your health information will appear here</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Complete your profile, add health records, and manage medications to see your overview.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button onClick={() => setActivePage("profile")} className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer">
              <User className="h-4 w-4" /> Complete Profile
            </button>
            <button onClick={() => setActivePage("health-records")} className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-xs font-semibold transition-all cursor-pointer">
              <ClipboardList className="h-4 w-4" /> Add Health Record
            </button>
            <button onClick={() => setActivePage("medications")} className="flex items-center gap-2 px-4 py-2.5 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-xs font-semibold transition-all cursor-pointer">
              <Pill className="h-4 w-4" /> Add Medication
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">Here's your health overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Health Profile"
          value={`${data.profile.completion}%`}
          sub={data.profile.completion === 100 ? "Complete" : "Complete your profile"}
          icon={User}
          color="cyan"
          onClick={() => setActivePage("profile")}
        />
        <SummaryCard
          label="Health Records"
          value={data.records.total}
          sub={data.records.total === 1 ? "record" : "records"}
          icon={ClipboardList}
          color="emerald"
          onClick={() => setActivePage("health-records")}
        />
        <SummaryCard
          label="Active Medications"
          value={data.medications.active}
          sub={data.medications.active === 1 ? "medication" : "medications"}
          icon={Pill}
          color="violet"
          onClick={() => setActivePage("medications")}
        />
        <SummaryCard
          label="Today's Reminders"
          value={data.reminders.today}
          sub={data.reminders.completed > 0 ? `${data.reminders.completed} completed` : "No doses yet"}
          icon={Bell}
          color="amber"
          onClick={() => setActivePage("medications")}
        />
      </div>

      {/* Profile Completion Bar (if not complete) */}
      {data.profile.completion > 0 && data.profile.completion < 100 && (
        <div
          onClick={() => setActivePage("profile")}
          className="glass-card rounded-2xl p-4 border border-border/70 cursor-pointer hover:border-cyan-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Profile Completion</span>
            <span className="text-xs font-bold text-cyan-600">{data.profile.completion}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${data.profile.completion}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Medication */}
        <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600" />
              <h2 className="text-sm font-heading font-bold text-foreground">Today's Medication</h2>
            </div>
            {data.reminders.today > 0 && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {data.reminders.completed}/{data.reminders.today}
              </span>
            )}
          </div>

          {data.reminders.doses.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No doses scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {data.reminders.doses.map((dose) => (
                <div
                  key={dose.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                    dose.status === "TAKEN"
                      ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/10"
                      : dose.status === "SKIPPED"
                      ? "bg-slate-50 dark:bg-slate-500/5 border-slate-200 dark:border-slate-500/10"
                      : dose.status === "MISSED"
                      ? "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/10"
                      : "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/10"
                  }`}
                >
                  {dose.status === "TAKEN" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : dose.status === "SKIPPED" ? (
                    <span className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
                  ) : dose.status === "MISSED" ? (
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-amber-400 shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {formatTime(dose.scheduledAt)}
                  </span>
                  <span className="text-xs font-semibold text-foreground flex-1 truncate">
                    {dose.medication.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {dose.medication.dosage} {UNIT_MAP[dose.medication.dosageUnit]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Summary */}
        <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-heading font-bold text-foreground">Health Profile</h2>
            </div>
            <button
              onClick={() => setActivePage("profile")}
              className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
            >
              View Profile
            </button>
          </div>

          {data.profile.summary ? (
            <div className="space-y-3">
              {data.profile.summary.bloodGroup && (
                <ProfileField label="Blood Group" value={data.profile.summary.bloodGroup.replace("_", " ")} />
              )}
              {data.profile.summary.height && (
                <ProfileField label="Height" value={`${data.profile.summary.height} cm`} />
              )}
              {data.profile.summary.weight && (
                <ProfileField label="Weight" value={`${data.profile.summary.weight} kg`} />
              )}
              {data.profile.summary.gender && (
                <ProfileField label="Gender" value={data.profile.summary.gender.replace("_", " ")} />
              )}
              {data.profile.summary.activityLevel && data.profile.summary.activityLevel !== "UNKNOWN" && (
                <ProfileField label="Activity" value={data.profile.summary.activityLevel.replace("_", " ")} />
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">No profile data yet.</p>
          )}
        </div>
      </div>

      {/* Recent Health Records */}
      <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-heading font-bold text-foreground">Recent Health Records</h2>
          </div>
          {data.records.total > 0 && (
            <button
              onClick={() => setActivePage("health-records")}
              className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {data.records.recent.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No health records yet.</p>
        ) : (
          <div className="space-y-2">
            {data.records.recent.map((record) => {
              const Icon = RECORD_TYPE_ICONS[record.recordType] || ClipboardList;
              const color = RECORD_TYPE_COLORS[record.recordType] || "slate";
              return (
                <div key={record.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className={`p-2 rounded-lg border ${getColorClasses(color)}`}>
                    <Icon className={`h-4 w-4 ${getIconColorClasses(color)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{record.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {record.recordType.replace("_", " ")}
                      {record.doctorName && ` · ${record.doctorName}`}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDate(record.recordDate)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction
            label="Health Profile"
            icon={User}
            color="cyan"
            onClick={() => setActivePage("profile")}
          />
          <QuickAction
            label="Health Records"
            icon={ClipboardList}
            color="emerald"
            onClick={() => setActivePage("health-records")}
          />
          <QuickAction
            label="Medications"
            icon={Pill}
            color="violet"
            onClick={() => setActivePage("medications")}
          />
          <QuickAction
            label="AI Assistant"
            icon={MessageSquareText}
            color="amber"
            onClick={() => setActivePage("chat")}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, icon: Icon, color, onClick }) {
  const colorMap = {
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <div
      onClick={onClick}
      className="glass-card rounded-2xl p-5 border border-border/70 hover:border-cyan-500/30 hover:shadow-lg transition-all cursor-pointer group space-y-3"
    >
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-heading font-black text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground capitalize">{value}</span>
    </div>
  );
}

function QuickAction({ label, icon: Icon, color, onClick }) {
  const colorMap = {
    cyan: "bg-cyan-500/10 text-cyan-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    violet: "bg-violet-500/10 text-violet-600",
    amber: "bg-amber-500/10 text-amber-600",
  };

  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-all text-center space-y-2 group cursor-pointer"
    >
      <div className={`w-10 h-10 mx-auto rounded-xl ${colorMap[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="block text-xs font-bold text-foreground">{label}</span>
    </button>
  );
}
