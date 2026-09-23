import { create } from "zustand";

export const useHealthStore = create((set) => ({
  // Active Navigation Page
  activePage: "landing",
  setActivePage: (page) => set((state) => {
    // Pages that require authentication
    const protectedPages = ["home", "chat", "symptom-checker", "health-info", "doctors", "profile", "settings", "lifestyle", "reminders", "help", "blog-detail", "health-records", "medications"];
    const isAdminPage = page.startsWith("admin");

    // If user is not authenticated and trying to access a protected page, open auth modal instead
    if (!state.authUser && (protectedPages.includes(page) || isAdminPage)) {
      return { isAuthModalOpen: true, authModalMode: "login", isMobileSidebarOpen: false };
    }

    return { activePage: page, isMobileSidebarOpen: false };
  }),

  // Auth User & Modal State
  authUser: null,
  isAuthModalOpen: false,
  authModalMode: "login", // 'login' | 'register'

  openAuthModal: (mode = "login") => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setAuthUser: (user) =>
    set((state) => {
      const activePage = user?.role === "admin" ? "admin-overview" : state.activePage.startsWith("admin") ? "home" : state.activePage;
      return {
        authUser: user,
        isAuthModalOpen: false,
        activePage: activePage,
        userProfile: user
          ? {
              fullName: user.name || "",
              email: user.email || "",
              dob: "",
              gender: "",
              location: "",
              phone: "",
            }
          : state.userProfile,
      };
    }),

  // Mobile Sidebar Drawer Open/Close State
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),

  // Theme State
  darkMode: (() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("healthwise_theme");
      if (saved !== null) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  })(),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("healthwise_theme", next ? "dark" : "light");
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return { darkMode: next };
    }),

  // Search Bar Query
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Selected Article for Detail View
  selectedArticle: null,
  setSelectedArticle: (article) => set({ selectedArticle: article }),

  // Admin Blog Editor State
  adminEditingBlog: null,
  setAdminEditingBlog: (blog) => set({ adminEditingBlog: blog }),

  // Public Blog Detail State
  selectedBlogSlug: null,
  setSelectedBlogSlug: (slug) => set({ selectedBlogSlug: slug }),

  // User Profile
  userProfile: {
    fullName: "",
    email: "",
    dob: "",
    gender: "",
    location: "",
    phone: "",
  },
  updateUserProfile: (updatedFields) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...updatedFields },
    })),

  // Health Context Toggle for AI Chat
  useHealthContext: true,
  setUseHealthContext: (enabled) => set({ useHealthContext: Boolean(enabled) }),
  toggleHealthContext: () => set((state) => ({ useHealthContext: !state.useHealthContext })),

  // AI Conversation State
  conversations: [],
  activeConversationId: null,
  conversationLoading: false,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setConversationLoading: (loading) => set({ conversationLoading: loading }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: conversation.id,
    })),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
    })),

  renameConversation: (id, title) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
    })),

  // AI Chat Conversation Stream State
  chatMessages: [
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hi! I'm your AI Health Assistant. How can I help you today?",
      timestamp: "10:00 AM",
    },
  ],
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { ...msg, id: Date.now().toString() }],
    })),
  clearChatMessages: () =>
    set({
      chatMessages: [
        {
          id: "welcome-" + Date.now(),
          sender: "ai",
          text: "Hi! I'm your AI Health Assistant. How can I help you today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }),

  // Symptom Checker 3-Step Wizard State
  symptomWizard: {
    step: 1, // 1: Symptoms, 2: Details, 3: Results
    selectedSymptoms: ["Headache"],
    medicalHistory: "",
    extraDetails: "",
    diagnosisResult: null,
    loading: false,
  },
  setSymptomStep: (step) =>
    set((state) => ({
      symptomWizard: { ...state.symptomWizard, step },
    })),
  toggleSymptom: (symptom) =>
    set((state) => {
      const current = state.symptomWizard.selectedSymptoms;
      const exists = current.includes(symptom);
      const updated = exists
        ? current.filter((s) => s !== symptom)
        : [...current, symptom];
      return {
        symptomWizard: { ...state.symptomWizard, selectedSymptoms: updated },
      };
    }),
  setSymptomMedicalHistory: (medicalHistory) =>
    set((state) => ({
      symptomWizard: { ...state.symptomWizard, medicalHistory },
    })),
  setSymptomExtraDetails: (extraDetails) =>
    set((state) => ({
      symptomWizard: { ...state.symptomWizard, extraDetails },
    })),
  setSymptomDiagnosisResult: (result) =>
    set((state) => ({
      symptomWizard: {
        ...state.symptomWizard,
        diagnosisResult: result,
        step: 3,
        loading: false,
      },
    })),
  setSymptomLoading: (loading) =>
    set((state) => ({
      symptomWizard: { ...state.symptomWizard, loading },
    })),
  resetSymptomWizard: () =>
    set(() => ({
      symptomWizard: {
        step: 1,
        selectedSymptoms: [],
        medicalHistory: "",
        extraDetails: "",
        diagnosisResult: null,
        loading: false,
      },
    })),
}));
