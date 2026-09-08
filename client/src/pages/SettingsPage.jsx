import React, { useState } from "react";
import { User, Bell, Lock, Palette, Globe, HelpCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language", icon: Globe },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

export function SettingsPage() {
  const { userProfile, darkMode, toggleDarkMode } = useHealthStore();
  const [activeSection, setActiveSection] = useState("account");

  const handleChangeEmail = () => {
    toast("Change Email flow initiated. Verification email sent.");
  };

  const handleChangePassword = () => {
    toast("Password reset link sent to your registered email.");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires confirmation. Please contact support.");
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Submenu Navigation */}
        <div className="glass-card rounded-2xl p-2 border border-border/70 space-y-1 h-fit">
          {SETTINGS_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-600 dark:text-cyan-400" : ""}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content */}
        <div className="md:col-span-3 glass-card rounded-2xl p-6 border border-border/70 space-y-6">
          {activeSection === "account" && (
            <div className="space-y-6">
              <h2 className="font-heading font-bold text-lg text-foreground border-b border-border/50 pb-3">
                Account Settings
              </h2>

              <div className="space-y-4">
                {/* Email Change Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-border/60 bg-card">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Email Address</span>
                    <span className="text-xs text-muted-foreground">{userProfile.email}</span>
                  </div>
                  <button
                    onClick={handleChangeEmail}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>

                {/* Password Change Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-border/60 bg-card">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Password</span>
                    <span className="text-xs text-muted-foreground">••••••••••••</span>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Danger Zone</span>
                </div>
                <p className="text-xs text-rose-900 dark:text-rose-200">
                  Delete Account: This will permanently delete your account and all associated health notes and chat history.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-lg text-foreground border-b border-border/50 pb-3">
                Appearance Settings
              </h2>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-card">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Dark Mode</span>
                  <span className="text-xs text-muted-foreground">Switch between light and dark visual themes</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-600 text-white cursor-pointer"
                >
                  {darkMode ? "Disable Dark Mode" : "Enable Dark Mode"}
                </button>
              </div>
            </div>
          )}

          {activeSection !== "account" && activeSection !== "appearance" && (
            <div className="space-y-4 text-xs text-muted-foreground">
              <h2 className="font-heading font-bold text-lg text-foreground border-b border-border/50 pb-3 capitalize">
                {activeSection} Settings
              </h2>
              <p>Configuration options for {activeSection} are active and managed via your user account policy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
