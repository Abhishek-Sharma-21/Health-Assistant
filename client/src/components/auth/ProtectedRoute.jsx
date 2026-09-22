import React from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";

export function ProtectedRoute({ children, requiredRole }) {
  const { authUser, openAuthModal, setActivePage } = useHealthStore();

  if (!authUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-heading font-bold text-foreground">Authentication Required</h2>
          <p className="text-xs text-muted-foreground">Please sign in to access this page.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setActivePage("home")}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </button>
            <button
              onClick={() => openAuthModal("login")}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && authUser.role !== requiredRole) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-heading font-bold text-foreground">Access Denied</h2>
          <p className="text-xs text-muted-foreground">
            You don't have permission to access this page. Required role: {requiredRole}.
          </p>
          <button
            onClick={() => setActivePage("home")}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5 cursor-pointer mx-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return Home
          </button>
        </div>
      </div>
    );
  }

  return children;
}
