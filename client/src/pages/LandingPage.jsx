import React from "react";
import { 
  Stethoscope, 
  BrainCircuit, 
  MessageSquareText, 
  BookOpen, 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Clock, 
  ArrowRight,
  HelpCircle,
  UserCheck
} from "lucide-react";
import { useHealthStore } from "../store/useHealthStore";

export function LandingPage() {
  const { setActivePage } = useHealthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/40 px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage("home")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:to-teal-300 bg-clip-text text-transparent">
              HealthWise
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <button onClick={() => setActivePage("home")} className="hover:text-cyan-600 transition-colors">Home</button>
            <button onClick={() => setActivePage("symptom-checker")} className="hover:text-cyan-600 transition-colors">Features</button>
            <button onClick={() => setActivePage("health-info")} className="hover:text-cyan-600 transition-colors">Health Library</button>
            <button onClick={() => setActivePage("doctors")} className="hover:text-cyan-600 transition-colors">Find Doctors</button>
            <button onClick={() => setActivePage("help")} className="hover:text-cyan-600 transition-colors">About</button>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActivePage("profile")}
              className="text-sm font-semibold px-4 py-2 text-foreground hover:text-cyan-600 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setActivePage("home")}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-600/25 transition-all active:scale-95 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-semibold">
              <BrainCircuit className="h-4 w-4 text-cyan-600" />
              <span>Your AI Health Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-foreground leading-[1.15]">
              Smarter Guidance <br />
              <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                Healthier You
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Get reliable health information, check symptoms, learn healthy habits, and more — all in one place with the power of AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setActivePage("home")}
                className="w-full sm:w-auto text-base font-semibold px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActivePage("symptom-checker")}
                className="w-full sm:w-auto text-base font-semibold px-8 py-3.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground border border-border transition-all flex items-center justify-center cursor-pointer"
              >
                Learn More
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="font-heading font-bold text-sm text-foreground flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4 text-cyan-500" /> AI Powered
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-heading font-bold text-sm text-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Trusted Info
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-heading font-bold text-sm text-foreground flex items-center justify-center gap-1">
                  <Zap className="h-4 w-4 text-amber-500" /> Easy to Use
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-heading font-bold text-sm text-foreground flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-teal-500" /> Always Here
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Graphics */}
          <div className="relative flex items-center justify-center">
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-cyan-400/20 via-teal-300/30 to-emerald-400/20 absolute blur-3xl -z-10"></div>
            <div className="glass-card rounded-3xl p-8 border border-white/40 shadow-2xl relative max-w-md w-full space-y-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
                <Stethoscope className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xl text-foreground">Interactive Health Companion</h3>
                <p className="text-xs text-muted-foreground">AI-driven symptom analysis & verified medical insights at your fingertips.</p>
              </div>

              {/* Floating Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200">
                  ✓ Check Symptoms
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200">
                  ✓ Learn Healthy Habits
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                  ✓ Find Doctors
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200">
                  ✓ Ask Questions
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-12 bg-muted/30 border-t border-border/40 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Everything You Need for a Healthier Tomorrow
            </h2>
            <p className="text-sm text-muted-foreground">Comprehensive digital tools designed to empower your wellness journey.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div 
              onClick={() => setActivePage("chat")}
              className="glass-card rounded-2xl p-6 space-y-4 hover:border-cyan-500/50 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquareText className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">AI Chat</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Get instant guidance and interactive answers for your health questions.</p>
            </div>

            {/* Card 2 */}
            <div 
              onClick={() => setActivePage("symptom-checker")}
              className="glass-card rounded-2xl p-6 space-y-4 hover:border-teal-500/50 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Symptom Checker</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Check possible conditions with our step-by-step diagnostic wizard.</p>
            </div>

            {/* Card 3 */}
            <div 
              onClick={() => setActivePage("health-info")}
              className="glass-card rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Health Library</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Explore verified articles on diseases, wellness, nutrition & mental health.</p>
            </div>

            {/* Card 4 */}
            <div 
              onClick={() => setActivePage("lifestyle")}
              className="glass-card rounded-2xl p-6 space-y-4 hover:border-indigo-500/50 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Healthy Lifestyle</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Tips for a better you, tailored fitness habits & wellness routines.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
