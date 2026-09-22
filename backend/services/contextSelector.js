const CONTEXT_RULES = [
  {
    categories: ["PROFILE"],
    keywords: [
      "blood group", "blood type", "height", "weight", "bmi", "gender",
      "allerg", "chronic condition", "medical history", "family history",
      "surgical", "emergency contact", "profile", "personal info",
      "date of birth", "dob", "age", "smoking", "alcohol", "activity level",
    ],
  },
  {
    categories: ["MEDICATIONS"],
    keywords: [
      "medication", "medicine", "drug", "prescription", "dosage",
      "taking", "pills", "tablet", "capsule", "supplement",
      "current medication", "active medication", "dose", "doses",
      "medication schedule", "refill", "pharmacy",
    ],
  },
  {
    categories: ["RECORDS"],
    keywords: [
      "record", "visit", "hospital", "doctor", "diagnosis", "test",
      "lab", "result", "exam", "checkup", "check-up", "history",
      "recent visit", "medical record", "health record", "report",
      "surgery", "procedure", "admission", "discharge",
    ],
  },
  {
    categories: ["MEASUREMENTS"],
    keywords: [
      "measurement", "blood pressure", "heart rate", "temperature",
      "weight", "height", "bmi", "glucose", "sugar", "cholesterol",
      "vital", "reading", "level", "latest weight", "current weight",
    ],
  },
  {
    categories: ["TRENDS"],
    keywords: [
      "trend", "change", "improve", "worsen", "progress", "over time",
      "history", "compared", "recently", "lately", "past", "average",
      "pattern", "fluctuation", "weight change",
    ],
  },
];

const GENERAL_HEALTH_PATTERNS = [
  /what (is|are) my/i,
  /show me my/i,
  /do i have/i,
  /tell me about my/i,
  /summarize my/i,
  /how (am|is) i/i,
  /what do you know about my/i,
  /give me (a )?summary/i,
];

export function selectContext(message) {
  const lower = message.toLowerCase();
  const selected = new Set();

  for (const rule of CONTEXT_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      rule.categories.forEach((c) => selected.add(c));
    }
  }

  for (const pattern of GENERAL_HEALTH_PATTERNS) {
    if (pattern.test(lower)) {
      selected.add("PROFILE");
      selected.add("RECORDS");
      selected.add("MEDICATIONS");
    }
  }

  if (selected.size === 0) {
    selected.add("PROFILE");
  }

  return selected;
}
