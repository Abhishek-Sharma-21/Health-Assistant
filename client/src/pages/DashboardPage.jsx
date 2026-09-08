import React from "react";
import { 
  MessageSquareText, 
  Stethoscope, 
  BookOpen, 
  HeartPulse, 
  UserCheck, 
  Pill, 
  Heart, 
  Bell, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useHealthStore } from "../store/useHealthStore";

export function DashboardPage() {
  const { userProfile, setActivePage } = useHealthStore();

  const firstName = userProfile.fullName ? userProfile.fullName.split(" ")[0] : "Abhishek";

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground flex items-center gap-2">
          Hello, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">How can I help you today?</p>
      </div>

      {/* Top 4 Core Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AI Chat */}
        <div
          onClick={() => setActivePage("chat")}
          className="glass-card rounded-2xl p-5 border border-border/60 hover:border-cyan-500/50 hover:shadow-lg transition-all cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">AI Chat</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Get instant health guidance</p>
          </div>
        </div>

        {/* Card 2: Symptom Checker */}
        <div
          onClick={() => setActivePage("symptom-checker")}
          className="glass-card rounded-2xl p-5 border border-border/60 hover:border-teal-500/50 hover:shadow-lg transition-all cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">Symptom Checker</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Check possible conditions</p>
          </div>
        </div>

        {/* Card 3: Health Information */}
        <div
          onClick={() => setActivePage("health-info")}
          className="glass-card rounded-2xl p-5 border border-border/60 hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">Health Information</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Learn about diseases & wellness</p>
          </div>
        </div>

        {/* Card 4: Healthy Lifestyle */}
        <div
          onClick={() => setActivePage("lifestyle")}
          className="glass-card rounded-2xl p-5 border border-border/60 hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">Healthy Lifestyle</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Tips for a better you</p>
          </div>
        </div>
      </div>

      {/* Green Inspirational Quote Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-xl shadow-teal-600/15 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-md text-center sm:text-left z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-200 block">Daily Wellness Quote</span>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
            Small Steps, Big Healthier Tomorrow
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 italic leading-relaxed">
            "Take care of your body. It's the only place you have to live."
          </p>
        </div>
        <button
          onClick={() => setActivePage("health-info")}
          className="z-10 px-5 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          Explore Tips
        </button>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setActivePage("doctors")}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-all text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="block text-xs font-bold text-foreground">Find Doctors</span>
          </button>

          <button
            onClick={() => setActivePage("symptom-checker")}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-all text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Pill className="h-5 w-5" />
            </div>
            <span className="block text-xs font-bold text-foreground">Medicine Info</span>
          </button>

          <button
            onClick={() => setActivePage("health-info")}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-all text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="h-5 w-5" />
            </div>
            <span className="block text-xs font-bold text-foreground">Health Tips</span>
          </button>

          <button
            onClick={() => setActivePage("reminders")}
            className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-all text-center space-y-2 group cursor-pointer"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell className="h-5 w-5" />
            </div>
            <span className="block text-xs font-bold text-foreground">My Reminders</span>
          </button>
        </div>
      </div>
    </div>
  );
}
