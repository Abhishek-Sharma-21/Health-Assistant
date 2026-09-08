import React from "react";
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, BookOpen } from "lucide-react";
import { useHealthStore } from "../store/useHealthStore";
import { ARTICLES_DATA } from "./HealthInfoPage";

export function ArticleDetailPage() {
  const { selectedArticle, setActivePage } = useHealthStore();

  const article = selectedArticle || ARTICLES_DATA[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back Button Breadcrumb */}
      <button
        onClick={() => setActivePage("health-info")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Health Information</span>
      </button>

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
            {article.badge || "Health Article"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Updated: {article.updated || "May 20, 2025"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-foreground">
          {article.title}
        </h1>
      </div>

      {/* Cover Image */}
      <div className="h-64 sm:h-80 rounded-2xl overflow-hidden bg-muted shadow-lg">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overview Section */}
      <div className="glass-card rounded-2xl p-6 border border-border/70 space-y-4">
        <h2 className="text-lg font-heading font-bold text-foreground">Overview</h2>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {article.overview}
        </p>
      </div>

      {/* Symptoms Section */}
      {article.symptoms && (
        <div className="glass-card rounded-2xl p-6 border border-border/70 space-y-4">
          <h2 className="text-lg font-heading font-bold text-foreground">Common Symptoms</h2>
          <ul className="space-y-2.5">
            {article.symptoms.map((sym, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <span>{sym}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Management Section */}
      {article.management && (
        <div className="glass-card rounded-2xl p-6 border border-border/70 space-y-4">
          <h2 className="text-lg font-heading font-bold text-foreground">Prevention & Management</h2>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {article.management}
          </p>
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
        <span>Educational content reviewed by HealthWise Clinical Board. Not a substitute for medical advice.</span>
      </div>
    </div>
  );
}
