import React, { useState } from "react";
import { BookOpen, Search, ArrowRight, Activity, Heart, Brain, Moon, ShieldCheck } from "lucide-react";
import { useHealthStore } from "../store/useHealthStore";

export const ARTICLES_DATA = [
  {
    id: "diabetes",
    title: "Understanding Diabetes",
    category: "Diseases",
    badge: "Chronic Disease",
    updated: "May 20, 2025",
    desc: "Learn about symptoms, causes, prevention and management of Type 1 and Type 2 diabetes.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    overview: "Diabetes is a chronic condition that affects how your body turns food into energy. When you have diabetes, your body either doesn't make enough insulin or can't use insulin properly, leading to high blood sugar levels.",
    symptoms: [
      "Increased thirst & frequent urination",
      "Extreme hunger & unexplained weight loss",
      "Fatigue and blurred vision",
      "Slow-healing sores or frequent infections",
    ],
    management: "Managing diabetes involves maintaining a balanced diet, staying physically active, monitoring blood glucose levels regularly, and taking prescribed medications or insulin therapy as advised by your healthcare provider."
  },
  {
    id: "mental-health",
    title: "Mental Health Matters",
    category: "Mental Health",
    badge: "Wellness",
    updated: "Jun 12, 2025",
    desc: "How to manage daily stress, anxiety, and cultivate mental resilience.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
    overview: "Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act as we handle stress, relate to others, and make healthy choices.",
    symptoms: [
      "Persistent feelings of sadness or anxiety",
      "Changes in sleep or appetite patterns",
      "Withdrawal from daily social activities",
      "Difficulty concentrating or decision making",
    ],
    management: "Practice mindfulness, maintain a regular sleep routine, stay physically active, and reach out to professional counseling or support networks when needed."
  },
  {
    id: "hypertension",
    title: "Hypertension (High Blood Pressure)",
    category: "Diseases",
    badge: "Cardiovascular",
    updated: "May 15, 2025",
    desc: "Symptoms, risks, and lifestyle changes to lower blood pressure.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80",
    overview: "Hypertension is a common condition in which the long-term force of blood against artery walls is high enough that it may eventually cause health problems, such as heart disease.",
    symptoms: [
      "Often asymptomatic ('silent killer')",
      "Dizziness or headaches in severe cases",
      "Shortness of breath during exertion",
    ],
    management: "Reduce sodium intake, exercise regularly, manage stress, maintain a healthy weight, and take prescribed antihypertensive medications."
  },
  {
    id: "flu",
    title: "Seasonal Flu Prevention",
    category: "Diseases",
    badge: "Infectious",
    updated: "Jul 01, 2025",
    desc: "Causes, prevention, and knowing when to see a healthcare provider.",
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&auto=format&fit=crop&q=80",
    overview: "Influenza is a contagious respiratory illness caused by flu viruses. It can cause mild to severe illness, and at times can lead to hospitalization.",
    symptoms: [
      "Sudden high fever & chills",
      "Muscle or body aches",
      "Dry cough and sore throat",
    ],
    management: "Get annual flu vaccination, wash hands frequently with soap, rest, stay hydrated, and take over-the-counter pain relievers."
  },
  {
    id: "nutrition",
    title: "Healthy Eating Habits",
    category: "Nutrition",
    badge: "Lifestyle",
    updated: "Apr 28, 2025",
    desc: "Simple, sustainable nutrition tips for a better, healthier lifestyle.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80",
    overview: "A balanced diet provides the nutrients your body needs to function correctly. Good nutrition combines whole foods, lean proteins, vegetables, and whole grains.",
    symptoms: ["Improves energy levels", "Boosts immune defense", "Supports digestive health"],
    management: "Focus on whole, unprocessed foods, drink adequate water, limit sugar intake, and practice mindful eating portions."
  },
  {
    id: "sleep",
    title: "Better Sleep Hygiene",
    category: "Wellness",
    badge: "Rest",
    updated: "May 08, 2025",
    desc: "Essential sleep tips for restful, restorative nights and morning vitality.",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80",
    overview: "Quality sleep is vital for physical health, brain function, and emotional well-being. Chronic sleep deprivation increases risk for chronic health issues.",
    symptoms: ["Daytime fatigue", "Irritability", "Poor concentration"],
    management: "Maintain a consistent sleep schedule, limit screen time before bed, keep the bedroom cool and dark, and avoid caffeine late in the day."
  }
];

const CATEGORIES = ["All", "Diseases", "Wellness", "Nutrition", "Mental Health"];

export function HealthInfoPage() {
  const { setSelectedArticle } = useHealthStore();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredArticles = activeCategory === "All" 
    ? ARTICLES_DATA 
    : ARTICLES_DATA.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground">
          Health Information
        </h1>
        <p className="text-sm text-muted-foreground">
          Learn about diseases, wellness, nutrition, mental health and more.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-border/50">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
              activeCategory === cat
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="glass-card rounded-2xl overflow-hidden border border-border/70 hover:border-cyan-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3 p-4">
              <div className="h-40 rounded-xl overflow-hidden bg-muted relative">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                  {article.badge}
                </span>
              </div>

              <div>
                <h3 className="font-heading font-bold text-base text-foreground group-hover:text-cyan-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {article.desc}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs text-cyan-600 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Read Full Article</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
