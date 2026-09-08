import React from "react";
import { Search, Bell, Sun, Moon, ShieldCheck, Menu } from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";

export function AdminHeader() {
  const { 
    searchQuery, 
    setSearchQuery, 
    darkMode, 
    toggleDarkMode, 
    authUser, 
    setActivePage,
    toggleMobileSidebar 
  } = useHealthStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Mobile Hamburger & Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Open Mobile Navigation"
          >
            <Menu className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, content, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-100 pl-9 sm:pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Admin Notifications"
          >
            <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Admin User Badge */}
          <div 
            onClick={() => setActivePage("admin-profile")}
            className="flex items-center gap-2.5 pl-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              {authUser?.name ? authUser.name[0].toUpperCase() : "A"}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold leading-tight text-slate-900 dark:text-white">
                {authUser?.name || "Admin"}
              </span>
              <span className="block text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold leading-tight font-mono">
                Super Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
