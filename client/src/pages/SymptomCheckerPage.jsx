import React from "react";
import { 
  Thermometer, 
  Wind, 
  Brain, 
  Flame, 
  Activity, 
  User, 
  BatteryLow, 
  AlertCircle, 
  RefreshCw, 
  HeartPulse, 
  Droplet, 
  MoreHorizontal,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";
import DiagnosisDisplay from "../components/DiagnosisDisplay";

const SYMPTOMS_GRID = [
  { id: "Fever", label: "Fever", icon: Thermometer },
  { id: "Cough", label: "Cough", icon: Wind },
  { id: "Headache", label: "Headache", icon: Brain },
  { id: "Sore Throat", label: "Sore Throat", icon: Flame },
  { id: "Stomach Pain", label: "Stomach Pain", icon: Activity },
  { id: "Body Pain", label: "Body Pain", icon: User },
  { id: "Fatigue", label: "Fatigue", icon: BatteryLow },
  { id: "Nausea", label: "Nausea", icon: AlertCircle },
  { id: "Dizziness", label: "Dizziness", icon: RefreshCw },
  { id: "Shortness of Breath", label: "Shortness of Breath", icon: HeartPulse },
  { id: "Runny Nose", label: "Runny Nose", icon: Droplet },
  { id: "Other", label: "Other", icon: MoreHorizontal },
];

export function SymptomCheckerPage() {
  const { 
    symptomWizard, 
    setSymptomStep, 
    toggleSymptom, 
    setSymptomMedicalHistory,
    setSymptomExtraDetails,
    setSymptomDiagnosisResult,
    setSymptomLoading,
    resetSymptomWizard
  } = useHealthStore();

  const { step, selectedSymptoms, medicalHistory, extraDetails, diagnosisResult, loading } = symptomWizard;

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleNextToDetails = () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom to continue.");
      return;
    }
    setSymptomStep(2);
  };

  const handleRunDiagnosis = async () => {
    setSymptomLoading(true);
    const loadingToast = toast.loading("Analyzing symptom selection with AI...");

    const combinedSymptoms = [...selectedSymptoms, extraDetails].filter(Boolean).join(", ");

    try {
      const res = await fetch(`${apiUrl}/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: combinedSymptoms, medicalHistory: medicalHistory }),
      });

      const data = await res.json();

      if (res.ok && data.result) {
        setSymptomDiagnosisResult(data.result);
        toast.success("Analysis complete!");
      } else {
        toast.error(data.error || "Failed to analyze symptoms. Please try again.");
        setSymptomLoading(false);
      }
    } catch (err) {
      toast.error("Connection error. Ensure backend server is running.");
      setSymptomLoading(false);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          Symptom Checker
        </h1>
        <p className="text-sm text-muted-foreground">
          Select the symptoms you are experiencing for an instant preliminary triage.
        </p>
      </div>

      {/* 3-Step Wizard Indicator */}
      <div className="flex items-center justify-between max-w-md mx-auto py-2">
        {/* Step 1 */}
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setSymptomStep(1)}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step === 1 ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/30" : "bg-muted text-muted-foreground"
          }`}>
            1
          </div>
          <span className={`text-xs font-medium ${step === 1 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
            Symptoms
          </span>
        </div>

        <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? "bg-cyan-500" : "bg-border"}`} />

        {/* Step 2 */}
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => selectedSymptoms.length > 0 && setSymptomStep(2)}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step === 2 ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/30" : "bg-muted text-muted-foreground"
          }`}>
            2
          </div>
          <span className={`text-xs font-medium ${step === 2 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
            Details
          </span>
        </div>

        <div className={`flex-1 h-0.5 mx-2 ${step > 2 ? "bg-cyan-500" : "bg-border"}`} />

        {/* Step 3 */}
        <div className="flex flex-col items-center gap-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step === 3 ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/30" : "bg-muted text-muted-foreground"
          }`}>
            3
          </div>
          <span className={`text-xs font-medium ${step === 3 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
            Results
          </span>
        </div>
      </div>

      {/* Step 1 View: Symptom Grid */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SYMPTOMS_GRID.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedSymptoms.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSymptom(item.id)}
                  className={`glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-md shadow-cyan-500/10"
                      : "border-border/60 hover:border-cyan-500/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-cyan-500 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-center">{item.label}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleNextToDetails}
            className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next: Add Details</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2 View: Additional Details */}
      {step === 2 && (
        <div className="glass-card rounded-2xl p-6 border border-border/70 space-y-5 max-w-xl mx-auto">
          <h3 className="font-heading font-bold text-lg text-foreground">Step 2: Additional Symptom Details</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Selected Symptoms:</label>
            <div className="flex flex-wrap gap-1.5">
              {selectedSymptoms.map((s) => (
                <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Describe Symptom Duration / Severity:</label>
            <textarea
              value={extraDetails}
              onChange={(e) => setSymptomExtraDetails(e.target.value)}
              placeholder="e.g. Mild fever since yesterday morning, headache gets worse when bending over..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary h-20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Medical History (Optional):</label>
            <textarea
              value={medicalHistory}
              onChange={(e) => setSymptomMedicalHistory(e.target.value)}
              placeholder="e.g. High blood pressure, Asthma, penicillin allergy..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary h-20"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => setSymptomStep(1)}
              className="px-4 py-2.5 rounded-xl border border-border bg-muted text-xs font-semibold hover:bg-muted/80 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            <button
              onClick={handleRunDiagnosis}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Analyze & Get Results</span>}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 View: Diagnostic Results */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => resetSymptomWizard()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-muted text-foreground flex items-center gap-1.5 hover:bg-muted/80 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Start New Assessment
            </button>
          </div>

          {diagnosisResult ? (
            <DiagnosisDisplay diagnosis={diagnosisResult} />
          ) : (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No results available. Please run an assessment.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
