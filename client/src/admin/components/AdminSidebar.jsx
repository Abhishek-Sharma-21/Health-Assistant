import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquareText, 
  BookOpen, 
  Megaphone, 
  BarChart3, 
  Settings, 
  User, 
  HelpCircle, 
  BrainCircuit, 
  LogOut, 
  Leaf,
  X
} from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";

const ADMIN_NAV = [
  { id: "admin-overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "admin-users", label: "Users", icon: Users },
  { id: "admin-conversations", label: "AI Conversations", icon: MessageSquareText },
  { id: "admin-content", label: "Health Content", icon: BookOpen },
  { id: "admin-announcements", label: "Announcements", icon: Megaphone },
  { id: "admin-reports", label: "Reports", icon: BarChart3 },
  { id: "admin-settings", label: "Settings", icon: Settings },
];

const ADMIN_BOTTOM = [
  { id: "admin-profile", label: "Admin Profile", icon: User },
  { id: "admin-help", label: "Help & Support", icon: HelpCircle },
];

export function AdminSidebar() {
  const { activePage, setActivePage, isMobileSidebarOpen, closeMobileSidebar } = useHealthStore();

  const renderContent = () => (
    <>
      {/* Super Admin Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60">
        <div 
          onClick={() => setActivePage("admin-overview")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              HealthWise
            </span>
            <span className="text-[9px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase block -mt-1 font-mono">
              AI Health Super Admin
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={closeMobileSidebar}
          className="md:hidden p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          aria-label="Close Mobile Navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Admin Menu */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-400/80 uppercase tracking-widest font-mono">
          Admin Management
        </div>

        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-l-4 border-cyan-500 dark:border-cyan-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Decorative Wellness Leaf Graphic Card (From Mockup) */}
      <div className="mx-3 mb-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 relative overflow-hidden space-y-1">
        <div className="flex items-center gap-1.5 font-heading font-bold text-xs">
          <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Better Health</span>
        </div>
        <p className="text-[10px] text-emerald-700/80 dark:text-emerald-200/70 font-medium">Brighter Tomorrow</p>
      </div>

      {/* Bottom Utility Links */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700/60 space-y-1 bg-slate-50/50 dark:bg-slate-900/80">
        {ADMIN_BOTTOM.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button 
          onClick={() => setActivePage("home")}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors mt-2 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit Admin Panel</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Fixed Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 h-screen sticky top-0 z-40 select-none transition-colors">
        {renderContent()}
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={closeMobileSidebar} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />
          <aside className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-slate-800">
            {renderContent()}
          </aside>
        </div>
      )}
    </>
  );
}
