import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ShieldAlert } from "lucide-react";
import { useHealthStore } from "./store/useHealthStore";

// Layout & Auth Components
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { MobileNav } from "./components/layout/MobileNav";
import { AuthModal } from "./components/auth/AuthModal";

// Page Views
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AIChatPage } from "./pages/AIChatPage";
import { SymptomCheckerPage } from "./pages/SymptomCheckerPage";
import { HealthInfoPage } from "./pages/HealthInfoPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { FindDoctorsPage } from "./pages/FindDoctorsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";

// Isolated Admin Control Center Views
import { AdminLayout } from "./admin/AdminLayout";
import { AdminOverviewPage } from "./admin/pages/AdminOverviewPage";
import { AdminUsersPage } from "./admin/pages/AdminUsersPage";
import { AdminConversationsPage } from "./admin/pages/AdminConversationsPage";
import { AdminContentPage } from "./admin/pages/AdminContentPage";
import { AdminAnnouncementsPage } from "./admin/pages/AdminAnnouncementsPage";
import { AdminReportsPage } from "./admin/pages/AdminReportsPage";
import { AdminSettingsPage } from "./admin/pages/AdminSettingsPage";
import { AdminProfilePage } from "./admin/pages/AdminProfilePage";
import { AdminHelpPage } from "./admin/pages/AdminHelpPage";

function App() {
  const { activePage, darkMode, authUser, setAuthUser, setActivePage } = useHealthStore();

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Sync session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAuthUser(data.user);
          }
        }
      } catch (err) {
        console.log("No active session found.");
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Render standalone Landing Page
  if (activePage === "landing") {
    return (
      <>
        <AuthModal />
        <LandingPage />
      </>
    );
  }

  // Render Isolated Admin Layout & Subpages if activePage starts with 'admin'
  if (activePage.startsWith("admin")) {
    return (
      <AdminLayout>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: "dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-slate-800 shadow-xl rounded-xl text-xs font-sans",
          }} 
        />
        <AuthModal />
        {(activePage === "admin" || activePage === "admin-overview") && <AdminOverviewPage />}
        {activePage === "admin-users" && <AdminUsersPage />}
        {activePage === "admin-conversations" && <AdminConversationsPage />}
        {activePage === "admin-content" && <AdminContentPage />}
        {activePage === "admin-announcements" && <AdminAnnouncementsPage />}
        {activePage === "admin-reports" && <AdminReportsPage />}
        {activePage === "admin-settings" && <AdminSettingsPage />}
        {activePage === "admin-profile" && <AdminProfilePage />}
        {activePage === "admin-help" && <AdminHelpPage />}
      </AdminLayout>
    );
  }

  // Render Application Shell with Sidebar, Header & Page Routing for User Portal
  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: "dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-slate-800 shadow-xl rounded-xl text-xs font-sans",
        }} 
      />

      {/* Auth Login / Register Modal */}
      <AuthModal />

      {/* Desktop Sidebar Navigation */}
      <Sidebar />

      {/* Main Content View Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activePage === "home" && <DashboardPage />}
          {activePage === "chat" && <AIChatPage />}
          {activePage === "symptom-checker" && <SymptomCheckerPage />}
          {activePage === "health-info" && <HealthInfoPage />}
          {activePage === "article-detail" && <ArticleDetailPage />}
          {activePage === "doctors" && <FindDoctorsPage />}
          {activePage === "profile" && <ProfilePage />}
          {activePage === "settings" && <SettingsPage />}
          
          {/* Fallback for Lifestyle / Reminders / Help links */}
          {(activePage === "lifestyle" || activePage === "reminders" || activePage === "help") && (
            <div className="space-y-4 max-w-3xl mx-auto py-8 text-center">
              <h1 className="text-2xl font-bold font-heading capitalize text-foreground">{activePage} Guidance</h1>
              <p className="text-sm text-muted-foreground">Interactive tools and recommendations for {activePage} are active.</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
}

export default App;
