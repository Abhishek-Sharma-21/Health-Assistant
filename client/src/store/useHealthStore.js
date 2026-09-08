import { create } from "zustand";

export const useHealthStore = create((set) => ({
  // Active Navigation Page
  activePage: "home",
  setActivePage: (page) => set({ activePage: page, isMobileSidebarOpen: false }),

  // Auth User & Modal State
  authUser: null,
  isAuthModalOpen: false,
  authModalMode: "login", // 'login' | 'register'

  openAuthModal: (mode = "login") => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setAuthUser: (user) =>
    set((state) => {
      const activePage = user?.role === "super_admin" ? "admin-overview" : state.activePage.startsWith("admin") ? "home" : state.activePage;
      return {
        authUser: user,
        isAuthModalOpen: false,
        activePage: activePage,
        userProfile: user
          ? {
              fullName: user.name,
              email: user.email,
              dob: "2002-05-15",
              gender: "Male",
              location: "New Delhi, India",
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
  setSelectedArticle: (article) => set({ selectedArticle: article, activePage: "article-detail" }),

  // User Profile
  userProfile: {
    fullName: "Abhishek Sharma",
    email: "abhishek@gmail.com",
    dob: "2002-05-15",
    gender: "Male",
    location: "New Delhi, India",
    phone: "+91 98765 43210",
  },
  updateUserProfile: (updatedFields) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...updatedFields },
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
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { ...msg, id: Date.now().toString() }],
    })),

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
    set((state) => ({
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
