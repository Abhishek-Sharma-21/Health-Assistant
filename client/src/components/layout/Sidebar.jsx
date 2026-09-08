import { 
  Home, 
  MessageSquareText, 
  Stethoscope, 
  BookOpen, 
  UserCheck, 
  HeartPulse, 
  BellRing, 
  User, 
  Settings, 
  HelpCircle,
  BrainCircuit,
  LogOut,
  X,
  ShieldCheck
} from "lucide-react";
import { useHealthStore } from "../../store/useHealthStore";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "AI Chat", icon: MessageSquareText },
  { id: "symptom-checker", label: "Symptom Checker", icon: Stethoscope },
  { id: "health-info", label: "Health Information", icon: BookOpen },
  { id: "doctors", label: "Find Doctors", icon: UserCheck },
  { id: "lifestyle", label: "Healthy Lifestyle", icon: HeartPulse },
  { id: "reminders", label: "Reminders", icon: BellRing },
];

export function Sidebar() {
  const { activePage, setActivePage, isMobileSidebarOpen, closeMobileSidebar, authUser } = useHealthStore();

  const bottomItems = [
    ...(authUser?.role === "super_admin" ? [{ id: "admin", label: "Admin Control", icon: ShieldCheck }] : []),
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const renderContent = () => (
    <>
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-border/40">
        <div 
          onClick={() => setActivePage("landing")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:to-teal-300 bg-clip-text text-transparent">
              HealthWise
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block -mt-1">
              AI Assistant
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={closeMobileSidebar}
          className="md:hidden p-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Close Mobile Navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Menu Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-transparent text-cyan-700 dark:text-cyan-300 font-semibold border-l-4 border-cyan-500 dark:border-cyan-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Utility Links */}
      <div className="p-3 border-t border-border/40 space-y-1 bg-muted/20">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
        
        <button 
          onClick={() => setActivePage("landing")}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors mt-2 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit App</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/60 bg-card/60 backdrop-blur-xl h-screen sticky top-0 z-40 select-none">
        {renderContent()}
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={closeMobileSidebar} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          />
          {/* Slide-out Drawer Box */}
          <aside className="relative w-72 max-w-[80vw] bg-card text-card-foreground shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderContent()}
          </aside>
        </div>
      )}
    </>
  );
}
