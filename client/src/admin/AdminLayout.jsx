import React from "react";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { useHealthStore } from "../store/useHealthStore";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { AdminMobileNav } from "./components/AdminMobileNav";

export function AdminLayout({ children }) {
  const { authUser, setActivePage, openAuthModal } = useHealthStore();

  // Strict Role Protection Check
  if (!authUser || authUser.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-rose-500 dark:text-rose-400 uppercase font-mono bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              403 Forbidden Access
            </span>
            <h1 className="text-2xl font-heading font-black text-slate-900 dark:text-white">
              Super Admin Authorization Required
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You must be logged in with verified Super Admin credentials to access the HealthWise Control Center.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActivePage("home")}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Home
            </button>
            
            <button
              onClick={() => openAuthModal("login")}
              className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="h-4 w-4" /> Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Admin View Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <AdminHeader />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Admin Navigation Bar */}
      <AdminMobileNav />
    </div>
  );
}
