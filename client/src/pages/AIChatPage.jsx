import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  ShieldAlert, 
  Loader2,
  Stethoscope,
  BookOpen,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";

export function AIChatPage() {
  const { chatMessages, addChatMessage } = useHealthStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    // Add User Message
    addChatMessage({
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: query, medicalHistory: "" }),
      });

      const data = await res.json();

      if (res.ok && data.result) {
        const { diagnoses, advice, shouldSeekProfessionalCare } = data.result;
        const mainCond = diagnoses?.[0]?.name || "Symptoms Analyzed";
        
        let responseText = `Based on your query, here are preliminary insights:\n\n` +
          `• Possible Condition: ${mainCond}\n` +
          `• Advice: ${advice || "Rest and monitor your symptoms."}\n` +
          (shouldSeekProfessionalCare ? `\n• Recommendation: Consulting a healthcare provider is recommended.` : `\n• Recommendation: Symptoms appear manageable with home care.`);

        addChatMessage({
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          diagnosisResult: data.result,
        });
      } else {
        addChatMessage({
          sender: "ai",
          text: data.error || "I was unable to analyze that query. Please describe physical symptoms (e.g. fever, headache, cough).",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (err) {
      addChatMessage({
        sender: "ai",
        text: "I encountered a connection error. Please make sure the backend server is running and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
              AI Health Assistant
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Chat Messages Scroll Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-lg rounded-2xl p-4 text-sm leading-relaxed space-y-2 shadow-sm ${
                msg.sender === "user"
                  ? "bg-cyan-600 text-white rounded-br-none"
                  : "glass-card text-foreground rounded-bl-none border border-border/70"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.sender === "ai" && (
                <div className="pt-2 border-t border-border/40 space-y-2">
                  {/* Safety Disclaimer Pill */}
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>This is general information and not a substitute for professional medical advice.</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-2">
                      <button className="hover:text-cyan-600 transition-colors" title="Helpful">
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button className="hover:text-rose-600 transition-colors" title="Not Helpful">
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
              <Bot className="h-4 w-4" />
            </div>
            <div className="glass-card rounded-2xl rounded-bl-none p-4 border border-border/70 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
              <span>Analyzing symptoms & generating AI health advice...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
        <button
          onClick={() => handleSend("Check my symptoms: fever and mild headache since yesterday")}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Stethoscope className="h-3 w-3" /> Check symptoms
        </button>
        <button
          onClick={() => handleSend("Give me top tips for boosting my immune system")}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="h-3 w-3" /> Get health tips
        </button>
        <button
          onClick={() => handleSend("What are common symptoms of seasonal flu?")}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="h-3 w-3" /> Learn about a disease
        </button>
        <button
          onClick={() => handleSend("How much water should I drink daily for good health?")}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="h-3 w-3" /> Ask anything
        </button>
      </div>

      {/* Fixed Chat Input Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="w-full bg-slate-100 dark:bg-slate-900 text-foreground border border-border/80 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
