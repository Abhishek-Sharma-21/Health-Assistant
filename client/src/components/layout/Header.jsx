import React from "react";
import { Search, Bell, Sun, Moon, User, BrainCircuit, Menu, LogIn, LogOut, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../../store/useHealthStore";

export function Header() {
  const { 
    searchQuery, 
    setSearchQuery, 
    darkMode, 
    toggleDarkMode, 
    userProfile, 
    setActivePage,
    toggleMobileSidebar,
    authUser,
    openAuthModal,
    setAuthUser
  } = useHealthStore();

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setAuthUser(null);
      toast.success("Logged out successfully.");
    } catch (err) {
      toast.error("Error logging out.");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-card/70 backdrop-blur-md border-b border-border/50 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Mobile Hamburger Button & Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-all duration-200 cursor-pointer shrink-0"
            aria-label="Open Mobile Navigation Sidebar"
            title="Open Navigation"
          >
            <Menu className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symptoms, diseases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 text-xs sm:text-sm text-foreground pl-9 sm:pl-10 pr-3 py-2 rounded-xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-card transition-all placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-all duration-200"
            title="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-all duration-200"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* User Auth Profile Badge or Sign In Button */}
          {authUser ? (
            <div className="flex items-center gap-2 pl-2">
              <div 
                onClick={() => setActivePage(authUser.role === "super_admin" ? "admin" : "profile")}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  {authUser.name ? authUser.name[0].toUpperCase() : "U"}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="block text-xs font-bold leading-tight text-foreground">
                    {authUser.name}
                  </span>
                  <span className="block text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 leading-tight uppercase font-mono">
                    {authUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-colors ml-1 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
