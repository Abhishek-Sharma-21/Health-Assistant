import { Loader2, Send, Sparkles, Activity, FileText, AlertCircle, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const QUICK_SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough",
  "Sore Throat",
  "Fatigue",
  "Body Aches",
  "Nausea",
  "Shortness of breath",
];

const SymptomForm = ({ onDiagnosis }) => {
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleAddQuickSymptom = (symptom) => {
    if (!symptoms.toLowerCase().includes(symptom.toLowerCase())) {
      const updated = symptoms.trim() 
        ? `${symptoms.trim()}, ${symptom.toLowerCase()}` 
        : symptom;
      setSymptoms(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms before proceeding.");
      return;
    }
    setLoading(true);

    const loadingToast = toast.loading("Analyzing symptoms & retrieving AI insights...");
    try {
      const res = await fetch(`${apiUrl}/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, medicalHistory }),
      });

      const data = await res.json();

      if (res.ok && data.result) {
        onDiagnosis(data.result);
        toast.success("Health insights generated successfully!");
      } else if (res.status === 400 && data.error) {
        toast.error(data.error);
      } else if (res.status === 500) {
        toast.error(data.error || "Service temporarily unavailable. Please try again later.");
      } else {
        toast.error("Unable to generate health insights. Please check your input and try again.");
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Connection error. Please check your network connection and try again.");
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-xl shadow-cyan-500/5 transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quick Symptom Chips Header */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Quick Symptom Presets
          </label>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {QUICK_SYMPTOMS.map((item) => {
              const isSelected = symptoms.toLowerCase().includes(item.toLowerCase());
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAddQuickSymptom(item)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1 active:scale-95 ${
                    isSelected
                      ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                      : "bg-muted/70 dark:bg-slate-800/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-foreground border-border/80 hover:border-cyan-400/50"
                  }`}
                >
                  <PlusCircle className={`w-3 h-3 ${isSelected ? "rotate-45" : ""}`} />
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Symptoms Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Describe Symptoms <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs font-medium ${
                symptoms.length > 900 ? "text-rose-500 font-bold" : "text-muted-foreground"
              }`}
            >
              {symptoms.length} / 1000
            </span>
          </div>
          <textarea
            className="w-full bg-slate-50 dark:bg-slate-900/80 text-foreground border border-border/80 rounded-xl p-3.5 h-28 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition-all duration-200 text-sm placeholder:text-muted-foreground/60 resize-none"
            placeholder="Describe what you are feeling (e.g. severe headache for 2 days, persistent fever, muscle soreness)..."
            value={symptoms}
            maxLength={1000}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        {/* Medical History Input */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Medical History & Pre-existing Conditions <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
          </label>
          <textarea
            className="w-full bg-slate-50 dark:bg-slate-900/80 text-foreground border border-border/80 rounded-xl p-3.5 h-20 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-transparent transition-all duration-200 text-sm placeholder:text-muted-foreground/60 resize-none"
            placeholder="List any ongoing health conditions, known allergies, or active medications (e.g. Asthma, Diabetes)..."
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
          />
        </div>

        {/* Scope Note Banner */}
        <div className="bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/40 rounded-xl p-3 flex gap-2.5 items-start text-xs text-cyan-900 dark:text-cyan-200">
          <AlertCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Medical Scope:</strong> This assistant is calibrated exclusively for physical symptoms and medical queries. Non-medical requests will be automatically filtered.
          </p>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={loading || !symptoms.trim()}
          className="w-full font-heading font-semibold text-sm sm:text-base bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white py-3 px-5 rounded-xl shadow-lg shadow-cyan-600/25 transition duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.99] cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Analyzing Symptoms...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              <span>Get AI Health Insights</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SymptomForm;
