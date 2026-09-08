import React from "react";
import { Home, MessageSquareText, Stethoscope, BookOpen, User } from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";

const MOBILE_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "AI Chat", icon: MessageSquareText },
  { id: "symptom-checker", label: "Checker", icon: Stethoscope },
  { id: "health-info", label: "Library", icon: BookOpen },
  { id: "profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const { activePage, setActivePage } = useHealthStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-lg border-t border-border/60 py-2 px-3">
      <div className="flex items-center justify-around">
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-cyan-600 dark:text-cyan-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
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
