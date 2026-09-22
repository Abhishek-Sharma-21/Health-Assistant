import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  Loader2,
  Heart,
  Activity,
  Droplets,
  Ruler,
  Weight,
  Cigarette,
  Wine,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Pill,
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";

const GENDER_OPTIONS = [
  { value: "", label: "Select gender" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const BLOOD_GROUP_OPTIONS = [
  { value: "", label: "Select blood group" },
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
  { value: "UNKNOWN", label: "Unknown" },
];

const SMOKING_OPTIONS = [
  { value: "NEVER", label: "Never" },
  { value: "FORMER", label: "Former" },
  { value: "CURRENT", label: "Current" },
  { value: "UNKNOWN", label: "Unknown" },
];

const ALCOHOL_OPTIONS = [
  { value: "NEVER", label: "Never" },
  { value: "FORMER", label: "Former" },
  { value: "CURRENT", label: "Current" },
  { value: "UNKNOWN", label: "Unknown" },
];

const ACTIVITY_OPTIONS = [
  { value: "SEDENTARY", label: "Sedentary" },
  { value: "LIGHT", label: "Light" },
  { value: "MODERATE", label: "Moderate" },
  { value: "ACTIVE", label: "Active" },
  { value: "VERY_ACTIVE", label: "Very Active" },
  { value: "UNKNOWN", label: "Unknown" },
];

const EMPTY_FORM = {
  dateOfBirth: "",
  gender: "",
  height: "",
  weight: "",
  bloodGroup: "",
  allergies: "",
  medicalConditions: "",
  currentMedications: "",
  smokingStatus: "UNKNOWN",
  alcoholStatus: "UNKNOWN",
  activityLevel: "UNKNOWN",
};

function calcCompletion(form) {
  const fields = [
    form.dateOfBirth,
    form.gender,
    form.height,
    form.weight,
    form.bloodGroup,
    form.allergies,
    form.medicalConditions,
    form.currentMedications,
    form.smokingStatus !== "UNKNOWN",
    form.alcoholStatus !== "UNKNOWN",
    form.activityLevel !== "UNKNOWN",
  ];
  const filled = fields.filter((f) => f && f !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export function ProfilePage() {
  const { authUser } = useHealthStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/profile`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setHasProfile(true);
          setForm({
            dateOfBirth: formatDateForInput(data.profile.dateOfBirth),
            gender: data.profile.gender || "",
            height: data.profile.height ?? "",
            weight: data.profile.weight ?? "",
            bloodGroup: data.profile.bloodGroup || "",
            allergies: data.profile.allergies || "",
            medicalConditions: data.profile.medicalConditions || "",
            currentMedications: data.profile.currentMedications || "",
            smokingStatus: data.profile.smokingStatus || "UNKNOWN",
            alcoholStatus: data.profile.alcoholStatus || "UNKNOWN",
            activityLevel: data.profile.activityLevel || "UNKNOWN",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      height: form.height !== "" ? parseFloat(form.height) : null,
      weight: form.weight !== "" ? parseFloat(form.weight) : null,
      bloodGroup: form.bloodGroup || null,
      allergies: form.allergies || null,
      medicalConditions: form.medicalConditions || null,
      currentMedications: form.currentMedications || null,
      smokingStatus: form.smokingStatus,
      alcoholStatus: form.alcoholStatus,
      activityLevel: form.activityLevel,
    };

    try {
      const method = hasProfile ? "PATCH" : "POST";
      const res = await fetch(`${apiUrl}/api/profile`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setHasProfile(true);
        toast.success("Health profile saved successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save profile.");
      }
    } catch (err) {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const completion = calcCompletion(form);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          Health Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Your personal health information used to personalize your experience.
        </p>
      </div>

      {/* Completion Bar */}
      <div className="glass-card rounded-2xl p-5 border border-border/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-cyan-600" />
            <span className="text-sm font-bold text-foreground">
              {hasProfile ? "Health Profile" : "Complete Your Profile"}
            </span>
          </div>
          <span className={`text-xs font-bold ${completion === 100 ? "text-emerald-600" : "text-cyan-600"}`}>
            {completion}% complete
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completion === 100 ? "bg-emerald-500" : "bg-cyan-500"
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        {!hasProfile && completion === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Adding your basic health information will help personalize future Health Assistant features.
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Information */}
        <Section title="Personal Information" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className={inputClass()}
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Blood Group">
              <select
                value={form.bloodGroup}
                onChange={(e) => update("bloodGroup", e.target.value)}
                className={inputClass()}
              >
                {BLOOD_GROUP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* Body Measurements */}
        <Section title="Body Measurements" icon={Ruler}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Height (cm)">
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="300"
                  placeholder="e.g. 170"
                  value={form.height}
                  onChange={(e) => update("height", e.target.value)}
                  className={`${inputClass()} pl-10`}
                />
              </div>
            </Field>
            <Field label="Weight (kg)">
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="500"
                  placeholder="e.g. 70"
                  value={form.weight}
                  onChange={(e) => update("weight", e.target.value)}
                  className={`${inputClass()} pl-10`}
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Health Information */}
        <Section title="Health Information" icon={Stethoscope}>
          <div className="space-y-4">
            <Field label="Allergies">
              <textarea
                rows={2}
                placeholder="e.g. Penicillin, Peanuts, Dust (separate with commas)"
                value={form.allergies}
                onChange={(e) => update("allergies", e.target.value)}
                className={`${inputClass()} resize-none`}
              />
            </Field>
            <Field label="Existing Medical Conditions">
              <textarea
                rows={2}
                placeholder="e.g. Diabetes, Hypertension, Asthma (separate with commas)"
                value={form.medicalConditions}
                onChange={(e) => update("medicalConditions", e.target.value)}
                className={`${inputClass()} resize-none`}
              />
            </Field>
            <Field label="Current Medications">
              <textarea
                rows={2}
                placeholder="e.g. Metformin 500mg, Lisinopril 10mg (separate with commas)"
                value={form.currentMedications}
                onChange={(e) => update("currentMedications", e.target.value)}
                className={`${inputClass()} resize-none`}
              />
            </Field>
          </div>
        </Section>

        {/* Lifestyle */}
        <Section title="Lifestyle" icon={Activity}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Smoking Status">
              <div className="relative">
                <Cigarette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={form.smokingStatus}
                  onChange={(e) => update("smokingStatus", e.target.value)}
                  className={`${inputClass()} pl-10`}
                >
                  {SMOKING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Alcohol Status">
              <div className="relative">
                <Wine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={form.alcoholStatus}
                  onChange={(e) => update("alcoholStatus", e.target.value)}
                  className={`${inputClass()} pl-10`}
                >
                  {ALCOHOL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Activity Level">
              <div className="relative">
                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={form.activityLevel}
                  onChange={(e) => update("activityLevel", e.target.value)}
                  className={`${inputClass()} pl-10`}
                >
                  {ACTIVITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </Field>
          </div>
        </Section>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 hover:shadow-xl disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
        <span>Your health information is private and only visible to you. It is not shared with admins or other users.</span>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-border/70 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <Icon className="h-4 w-4 text-cyan-600" />
        <h2 className="text-sm font-heading font-bold text-foreground">{title}</h2>
      </div>
      {children}
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

function inputClass() {
  return "w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-colors";
}
