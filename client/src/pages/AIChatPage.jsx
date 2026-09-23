import React, { useState, useRef, useEffect, useCallback } from "react";
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
  HelpCircle,
  HeartPulse,
  MessageSquarePlus,
  Trash2,
  MessageSquare,
  ChevronLeft,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { useHealthStore } from "../store/useHealthStore";

export function AIChatPage() {
  const {
    chatMessages, setChatMessages, addChatMessage, clearChatMessages,
    useHealthContext, setUseHealthContext, authUser,
    conversations, setConversations, activeConversationId, setActiveConversationId,
    removeConversation, setConversationLoading, conversationLoading,
  } = useHealthStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);

  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Load conversations + context preference on mount
  useEffect(() => {
    if (!authUser) return;
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/ai/conversations`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch {
        console.error("Failed to load conversations");
      }
    };
    const fetchPreference = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/ai/conversations/preferences/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.preference && typeof data.preference.memoryEnabled === "boolean") {
            setUseHealthContext(data.preference.memoryEnabled);
          }
        }
      } catch {
        // Preference load is best-effort; request still works with local toggle
      }
    };
    fetchConversations();
    fetchPreference();
  }, [authUser]);

  const handleToggleContext = async () => {
    const next = !useHealthContext;
    setUseHealthContext(next);
    try {
      await fetch(`${apiUrl}/api/ai/conversations/preferences/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ memoryEnabled: next }),
      });
    } catch {
      // Server still receives useHealthContext on each chat request
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  // Load a conversation's messages
  const loadConversation = useCallback(async (conversationId) => {
    setConversationLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/ai/conversations/${conversationId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const msgs = data.conversation.messages.map((m) => ({
          id: m.id,
          sender: m.role === "USER" ? "user" : "ai",
          text: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          contextCategories: m.contextUsed ? m.contextUsed.split(",") : undefined,
        }));
        setChatMessages(msgs);
        setActiveConversationId(conversationId);
      }
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setConversationLoading(false);
    }
  }, []);

  // Start new conversation
  const handleNewChat = () => {
    clearChatMessages();
    setActiveConversationId(null);
    setShowSidebar(false);
  };

  // Delete a conversation
  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/ai/conversations/${conversationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        removeConversation(conversationId);
        if (activeConversationId === conversationId) {
          handleNewChat();
        }
        toast.success("Conversation deleted");
      }
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    addChatMessage({
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: query,
          conversationId: activeConversationId || undefined,
          useHealthContext: useHealthContext,
        }),
      });

      const data = await res.json();

      if (res.ok && data.text) {
        addChatMessage({
          sender: "ai",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          contextCategories: data.categoriesUsed,
        });

        // If new conversation created, update state
        if (data.conversationId && data.conversationId !== activeConversationId) {
          setActiveConversationId(data.conversationId);
          // Refresh conversation list
          try {
            const listRes = await fetch(`${apiUrl}/api/ai/conversations`, { credentials: "include" });
            if (listRes.ok) {
              const listData = await listRes.json();
              setConversations(listData.conversations || []);
            }
          } catch {
            // Refresh conversation list is best-effort
          }
        }
      } else {
        addChatMessage({
          sender: "ai",
          text: data.error || "I was unable to process that query. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch {
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

  const contextLabel = (categories) => {
    if (!categories || categories.length === 0) return null;
    const labels = categories.map((c) => {
      const map = {
        PROFILE: "Health Profile",
        RECORDS: "Health Records",
        MEDICATIONS: "Medications",
        MEASUREMENTS: "Measurements",
        TRENDS: "Trends",
      };
      return map[c] || c;
    });
    return labels.join(", ");
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-6xl mx-auto overflow-hidden rounded-2xl border border-border/50 bg-background">
      {/* Conversation Sidebar */}
      <div className={`w-72 border-r border-border/50 flex flex-col bg-background/50 shrink-0 ${showSidebar ? "flex" : "hidden"} md:flex`}>
        <div className="p-3 border-b border-border/50">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8 px-4">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No conversations yet
            </div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { loadConversation(conv.id); setShowSidebar(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all group flex items-center gap-2 cursor-pointer ${
                activeConversationId === conv.id
                  ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
                  : "hover:bg-muted/50 text-foreground"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{conv.title}</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {formatTime(conv.updatedAt)}
                  {conv._count?.messages > 0 && <span>· {conv._count.messages} msgs</span>}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-all cursor-pointer"
                title="Delete conversation"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${showSidebar ? "" : "rotate-180"}`} />
            </button>
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

          {/* Health Context Toggle */}
          {authUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleContext}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                  useHealthContext
                    ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
                title={useHealthContext ? "Health context ON" : "Health context OFF"}
              >
                <HeartPulse className="h-3 w-3" />
                {useHealthContext ? "Health Context" : "Context Off"}
              </button>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
            </div>
          ) : (
            chatMessages.map((msg) => (
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

                  {msg.sender === "ai" && msg.contextCategories && msg.contextCategories.length > 0 && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-medium border border-cyan-200 dark:border-cyan-800">
                        <HeartPulse className="h-2.5 w-2.5" />
                        Using: {contextLabel(msg.contextCategories)}
                      </span>
                    </div>
                  )}

                  {msg.sender === "ai" && (
                    <div className="pt-2 border-t border-border/40 space-y-2">
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span>This is general information and not a substitute for professional medical advice.</span>
                      </div>

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
            ))
          )}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Bot className="h-4 w-4" />
              </div>
              <div className="glass-card rounded-2xl rounded-bl-none p-4 border border-border/70 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                <span>Analyzing your health context & generating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 px-4 pt-2 border-t border-border/40">
          <button
            onClick={() => handleSend("What medications am I currently taking?")}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HeartPulse className="h-3 w-3" /> My medications
          </button>
          <button
            onClick={() => handleSend("What is my blood group and BMI?")}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-3 w-3" /> My health info
          </button>
          <button
            onClick={() => handleSend("Show me my recent health records")}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="h-3 w-3" /> Recent records
          </button>
          <button
            onClick={() => handleSend("Check my symptoms: fever and mild headache since yesterday")}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Stethoscope className="h-3 w-3" /> Check symptoms
          </button>
        </div>

        {/* Chat Input */}
        <div className="relative px-4 py-3">
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
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
