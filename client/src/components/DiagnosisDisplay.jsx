import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Pill, 
  Copy, 
  Check, 
  ShieldAlert, 
  Stethoscope,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

function DiagnosisDisplay({ diagnosis }) {
  const [copied, setCopied] = useState(false);

  const {
    diagnoses = [],
    shouldSeekProfessionalCare,
    advice,
    medicineRecommendations,
  } = diagnosis || {};

  const handleCopySummary = () => {
    const textToCopy = `HealthWise Assistant Summary:\n\n` +
      `Potential Conditions:\n` +
      diagnoses.map(d => `- ${d.name} (${(d.confidence * 100).toFixed(0)}% confidence)`).join('\n') +
      `\n\nRecommendation:\n${shouldSeekProfessionalCare ? "Seek Professional Medical Care" : "Monitor Symptoms"}\n\n` +
      `Advice:\n${advice || 'N/A'}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Health summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Card className="glass-card rounded-2xl shadow-xl shadow-cyan-500/5 border border-border/80 overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-transparent border-b border-border/60 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-heading font-bold text-foreground">
                Health Assessment Insights
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                AI-assisted preliminary condition probabilities & care suggestions
              </CardDescription>
            </div>
          </div>

          <button
            onClick={handleCopySummary}
            className="self-start sm:self-center text-xs font-medium px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border/80 transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Copy health summary text"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Triage Recommendation Alert */}
        <div>
          <Alert
            variant={shouldSeekProfessionalCare ? "destructive" : "default"}
            className={`rounded-xl p-4 transition-all duration-200 ${
              shouldSeekProfessionalCare
                ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
            }`}
          >
            {shouldSeekProfessionalCare ? (
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            )}
            <div className="ml-2">
              <AlertTitle className="font-heading font-bold text-sm tracking-wide">
                {shouldSeekProfessionalCare
                  ? "Care Advice: Seek Professional Medical Care"
                  : "Care Advice: Monitor Symptoms at Home"}
              </AlertTitle>
              <AlertDescription className="text-xs mt-1 leading-relaxed opacity-90">
                {shouldSeekProfessionalCare
                  ? "Based on your symptom intensity or risk profile, consulting a qualified physician or healthcare provider is strongly advised."
                  : "Your symptoms currently appear manageable with home care. Track changes closely and consult a doctor if symptoms persist."}
              </AlertDescription>
            </div>
          </Alert>
        </div>

        <Separator className="bg-border/60" />

        {/* Potential Conditions List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Potential Conditions Identified
          </h3>

          <div className="space-y-3">
            {diagnoses && diagnoses.length > 0 ? (
              diagnoses.map((diag, index) => {
                const confidencePct = Math.round((diag.confidence || 0) * 100);
                const isHighConfidence = confidencePct >= 70;
                
                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-border/70 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 transition-all hover:border-cyan-500/30"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground">
                        {diag.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 font-mono ${
                          isHighConfidence
                            ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                            : "bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {confidencePct}% Confidence
                      </Badge>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHighConfidence
                            ? "bg-gradient-to-r from-cyan-500 to-teal-500"
                            : "bg-gradient-to-r from-slate-400 to-slate-500"
                        }`}
                        style={{ width: `${Math.max(confidencePct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground italic">No specific condition breakdown provided.</p>
            )}
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Clinical Advice */}
        {advice && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              General Clinical Guidance
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed p-3.5 rounded-xl bg-muted/40 border border-border/50">
              {advice}
            </p>
          </div>
        )}

        <Separator className="bg-border/60" />

        {/* Medication Recommendations */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Pill className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            Over-the-Counter Medication Suggestions
          </h3>

          {medicineRecommendations?.recommendations && medicineRecommendations.recommendations.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {medicineRecommendations.recommendations.map((med, index) => (
                <AccordionItem
                  value={`item-${index}`}
                  key={index}
                  className="border border-border/70 rounded-xl px-3.5 bg-slate-50/40 dark:bg-slate-900/30 overflow-hidden"
                >
                  <AccordionTrigger className="font-semibold text-sm text-foreground hover:no-underline py-3">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      {med.medicineName}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2.5 text-xs text-muted-foreground pb-3 pt-1">
                    {med.dosageSuggestion && (
                      <div className="p-2.5 rounded-lg bg-muted/60 border border-border/40">
                        <span className="font-semibold text-foreground block mb-0.5">Dosage Suggestion:</span>
                        <span>{med.dosageSuggestion}</span>
                      </div>
                    )}
                    {med.precautions && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                        <span className="font-semibold block mb-0.5">Precautions & Warnings:</span>
                        <span>{med.precautions}</span>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No specific OTC medications suggested for this symptom query.
            </p>
          )}

          {medicineRecommendations?.disclaimer && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2 mt-3">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Medication Disclaimer:</strong> {medicineRecommendations.disclaimer}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 border-t border-border/50 py-3.5 px-6">
        <p className="text-[11px] text-muted-foreground/80 leading-normal italic">
          Disclaimer: AI diagnosis suggestions are generated algorithmically for informational reference and do not constitute an official prescription or doctor consultation.
        </p>
      </CardFooter>
    </Card>
  );
}

export default DiagnosisDisplay;
