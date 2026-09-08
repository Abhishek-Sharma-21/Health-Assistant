import React from "react";
import { LayoutDashboard, Users, MessageSquareText, BookOpen, BarChart3 } from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";

const ADMIN_MOBILE_ITEMS = [
  { id: "admin-overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "admin-users", label: "Users", icon: Users },
  { id: "admin-conversations", label: "Chats", icon: MessageSquareText },
  { id: "admin-content", label: "Content", icon: BookOpen },
  { id: "admin-reports", label: "Reports", icon: BarChart3 },
];

export function AdminMobileNav() {
  const { activePage, setActivePage } = useHealthStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-2 px-3 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="flex items-center justify-around">
        {ADMIN_MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-cyan-600 dark:text-cyan-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
