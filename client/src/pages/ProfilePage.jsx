import React, { useState } from "react";
import { User, Mail, Calendar, MapPin, FileText, MessageSquareText, BellRing, Save, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";

export function ProfilePage() {
  const { userProfile, updateUserProfile, setActivePage } = useHealthStore();
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    fullName: userProfile.fullName || "Abhishek Sharma",
    email: userProfile.email || "abhishek@gmail.com",
    dob: userProfile.dob || "2002-05-15",
    gender: userProfile.gender || "Male",
    location: userProfile.location || "New Delhi, India",
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    toast.success("Profile changes saved successfully!");
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and health preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Summary Card */}
        <div className="glass-card rounded-2xl p-6 border border-border/70 text-center space-y-4 h-fit">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            {formData.fullName ? formData.fullName[0] : "A"}
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg text-foreground">{formData.fullName}</h3>
            <p className="text-xs text-muted-foreground">{formData.email}</p>
          </div>

          <div className="pt-2 border-t border-border/50 space-y-2">
            <button
              onClick={() => setActivePage("chat")}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors flex items-center gap-2 text-foreground cursor-pointer"
            >
              <MessageSquareText className="h-4 w-4 text-cyan-600" />
              <span>My Chats</span>
            </button>
            <button
              onClick={() => setActivePage("symptom-checker")}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors flex items-center gap-2 text-foreground cursor-pointer"
            >
              <FileText className="h-4 w-4 text-teal-600" />
              <span>My Health Notes</span>
            </button>
            <button
              onClick={() => setActivePage("reminders")}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors flex items-center gap-2 text-foreground cursor-pointer"
            >
              <BellRing className="h-4 w-4 text-amber-600" />
              <span>Reminders</span>
            </button>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-border/70 space-y-6">
          {/* Tabs Header */}
          <div className="flex border-b border-border/60">
            <button
              onClick={() => setActiveTab("personal")}
              className={`pb-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "personal"
                  ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`pb-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "preferences"
                  ? "border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Health Preferences
            </button>
          </div>

          {activeTab === "personal" ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Date of Birth</label>
                  <input
                    type="text"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-border/80 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs text-muted-foreground">
              <p>Health preference settings allow tailoring the AI model responses based on dietary, allergy, and medical restriction profiles.</p>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-foreground space-y-2">
                <span className="font-semibold block text-sm">Active Restrictions:</span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-mono mr-2">No Penicillin</span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 font-mono">Asthma Sensitivity</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
