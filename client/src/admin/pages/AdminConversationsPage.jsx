import React, { useState } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Bot,
  Eye,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function AdminConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all"); // 'all' | 'high' | 'moderate' | 'low'
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Mock conversation audit logs
  const conversations = [
    {
      id: "conv-101",
      user: "Abhishek Sharma",
      email: "abhishek@gmail.com",
      chiefComplaint: "Acute Throbbing Headaches & Light Sensitivity",
      riskLevel: "moderate",
      urgencyScore: 68,
      timestamp: "Today, 10:45 AM",
      messagesCount: 8,
      aiModelUsed: "GPT-4o Medical Triage",
      transcript: [
        { sender: "user", text: "I have been experiencing a sharp, throbbing headache on one side of my head for 6 hours. Light makes it worse.", time: "10:45 AM" },
        { sender: "ai", text: "Thank you for sharing your symptoms. Are you experiencing any nausea, aura, or neck stiffness?", time: "10:45 AM" },
        { sender: "user", text: "Yes, mild nausea and bright flashes before it started.", time: "10:46 AM" },
        { sender: "ai", text: "Based on your clinical inputs, this presents characteristics of a Migraine with Aura. Recommended Action: Rest in a dark, quiet room and consider consulting a general practitioner if symptoms persist past 24h.", time: "10:47 AM" },
      ],
    },
    {
      id: "conv-102",
      user: "Dr. Sarah Jenkins",
      email: "sarah@healthwise.com",
      chiefComplaint: "Chest Tightness & Shortness of Breath",
      riskLevel: "high",
      urgencyScore: 92,
      timestamp: "Today, 09:15 AM",
      messagesCount: 12,
      aiModelUsed: "Claude 3.5 Sonnet Medical",
      transcript: [
        { sender: "user", text: "Feeling tight sensation in chest spreading to left arm after stair climb.", time: "09:15 AM" },
        { sender: "ai", text: "⚠️ CRITICAL URGENCY ALERT: Chest tightness radiating to left arm requires immediate emergency medical evaluation. Please call 911 or proceed to the nearest emergency department immediately.", time: "09:15 AM" },
      ],
    },
    {
      id: "conv-103",
      user: "Michael Vance",
      email: "mvance@gmail.com",
      chiefComplaint: "Seasonal Allergy Symptoms & Runny Nose",
      riskLevel: "low",
      urgencyScore: 18,
      timestamp: "Yesterday, 04:30 PM",
      messagesCount: 5,
      aiModelUsed: "GPT-4o Medical Triage",
      transcript: [
        { sender: "user", text: "Frequent sneezing, watery eyes, and clear nasal discharge for 3 days.", time: "04:30 PM" },
        { sender: "ai", text: "Your symptoms align with Allergic Rhinitis (Seasonal Allergies). Maintain hydration and avoid known environmental pollen triggers.", time: "04:31 PM" },
      ],
    },
    {
      id: "conv-104",
      user: "Priya Patel",
      email: "priya.p@outlook.com",
      chiefComplaint: "Persistent Dry Cough & Mild Fever (100.2°F)",
      riskLevel: "moderate",
      urgencyScore: 54,
      timestamp: "Yesterday, 02:10 PM",
      messagesCount: 7,
      aiModelUsed: "GPT-4o Medical Triage",
      transcript: [
        { sender: "user", text: "Low grade fever since yesterday with a dry ticklish cough.", time: "02:10 PM" },
        { sender: "ai", text: "Presents patterns consistent with viral upper respiratory tract irritation. Monitor body temperature closely.", time: "02:11 PM" },
      ],
    },
  ];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || c.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              AI Safety & Medical Quality Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white">
            AI Triage Conversations Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Monitor real-time patient-AI interactions, verify symptom triage accuracy, and audit high-risk alerts.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: "all", label: "All Triage Sessions", count: conversations.length },
            { id: "high", label: "High Risk 🚨", count: conversations.filter((c) => c.riskLevel === "high").length },
            { id: "moderate", label: "Moderate Risk ⚡", count: conversations.filter((c) => c.riskLevel === "moderate").length },
            { id: "low", label: "Low Risk ✅", count: conversations.filter((c) => c.riskLevel === "low").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRiskFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                riskFilter === tab.id
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
              <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Conversations Stream Table */}
      <div className="glass-card bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Patient Initiator</th>
                <th className="py-4 px-6">Chief Complaint Triage</th>
                <th className="py-4 px-6">Triage Risk Category</th>
                <th className="py-4 px-6">AI LLM Engine</th>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredConversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{conv.user}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{conv.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                    {conv.chiefComplaint}
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        conv.riskLevel === "high"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : conv.riskLevel === "moderate"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {conv.riskLevel === "high" && <AlertTriangle className="h-3 w-3" />}
                      {conv.riskLevel === "moderate" && <Clock className="h-3 w-3" />}
                      {conv.riskLevel === "low" && <CheckCircle2 className="h-3 w-3" />}
                      {conv.riskLevel} risk ({conv.urgencyScore}%)
                    </span>
                  </td>

                  <td className="py-4 px-6 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {conv.aiModelUsed}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {conv.timestamp}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedConversation(conv)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Inspection Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase border border-indigo-500/20">
                    ID: {selectedConversation.id}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedConversation.timestamp}</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mt-1">
                  Triage Transcript: {selectedConversation.user}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-2">
              {selectedConversation.transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-md p-4 rounded-2xl text-xs space-y-1 ${
                      msg.sender === "user"
                        ? "bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-600/20"
                        : "bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none"
                    }`}
                  >
                    <p className="leading-relaxed font-sans">{msg.text}</p>
                    <span className="block text-[10px] opacity-60 text-right font-mono">{msg.time}</span>
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono">
                <ShieldCheck className="h-4 w-4" /> Passed OpenRouter Clinical Guardrails
              </span>
              <button
                onClick={() => setSelectedConversation(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
