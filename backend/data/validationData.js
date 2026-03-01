export const medicalKeywords = [
  // General Symptoms
  "pain", "ache", "hurt", "sore", "tender", "swelling", "inflammation",
  "fever", "temperature", "hot", "cold", "chills", "sweating",
  "fatigue", "tired", "weakness", "lethargy", "exhaustion", "malaise",
  "bleeding", "bruise", "cut", "wound", "infection", "pus", "lesion",
  "lump", "tumor", "cyst", "swollen lymph node", "palpitations", "fluttering",
  
  // Head & Neck
  "headache", "migraine", "dizziness", "vertigo", "lightheaded",
  "vision", "eye", "blind", "blur", "hearing", "ear", "deaf", "tinnitus",
  "throat", "swallow", "hoarse", "neck pain", "stiffness",
  
  // Respiratory & Cardiac
  "cough", "sneeze", "runny nose", "congestion", "breathing", "shortness of breath",
  "wheezing", "chest pain", "heart", "irregular heartbeat", "tachycardia",
  "asthma", "bronchitis", "pneumonia", "tuberculosis", "pleurisy",
  
  // Gastrointestinal
  "nausea", "vomiting", "diarrhea", "constipation", "stomach", "abdomen",
  "appetite", "weight loss", "weight gain", "bloating", "gas", "indigestion",
  "ulcer", "gastritis", "acid reflux", "heartburn", "bowel", "stool",
  
  // Musculoskeletal & Skin
  "joint", "muscle", "bone", "fracture", "sprain", "strain", "cramp", "spasm",
  "arthritis", "rheumatoid", "osteoarthritis", "gout",
  "rash", "itch", "hives", "allergic", "allergy", "skin", "eczema", "acne", "psoriasis",
  
  // Neurological & Mental Health
  "insomnia", "sleep", "restless", "anxiety", "depression", "mood", "panic",
  "memory", "confusion", "disorientation", "seizure", "convulsion", "faint",
  "numbness", "tingling", "paralysis", "tremor", "nerve", "sciatica",
  
  // Urinary & Reproductive
  "thirst", "urination", "urine", "bladder", "kidney", "pelvic",
  "menstruation", "period", "pregnancy", "menopause", "prostate",
  
  // Specific Conditions & Diseases
  "cancer", "cancerous", "benign", "malignant", "oncology", "leukemia", "lymphoma", "melanoma",
  "diabetes", "hypertension", "blood pressure", "cholesterol",
  "liver", "gallbladder", "pancreas", "thyroid", "spleen",
  "hormone", "endocrine", "metabolic", "immune", "autoimmune", "lupus", "hiv", "aids",
  "virus", "bacterial", "fungal", "parasite", "viral",
  "hepatitis", "hepatitis a", "hepatitis b", "hepatitis c", "jaundice", "cirrhosis",
  "malaria", "dengue", "typhoid", "cholera", "measles", "chickenpox", "covid", "flu", "influenza",
  "alzheimer", "parkinson", "dementia", "stroke", "aneurysm", "epilepsy",
  "anemia", "sickle cell", "hemophilia", "thrombosis", "embolism",
  "asthma", "copd", "emphysema", "apnea",
  "crohn", "celiac", "ibs", "hemorrhoid", "appendicitis", "hernia",
  
  // Care & Treatment
  "medication", "medicine", "drug", "prescription", "dosage", "pill", "tablet",
  "side effect", "allergic reaction", "overdose", "withdrawal",
  "symptom", "condition", "disease", "illness", "sick", "unwell", "syndrome",
  "diagnosis", "prognosis", "treatment", "therapy", "recovery", "rehab",
  "prevention", "vaccine", "immunization", "screening", "test", "lab", "blood test", "mri", "x-ray", "ct scan", "ultrasound"
];

export const nonMedicalPatterns = [
  // Crimes & Illicit Activities
  /how to hack/i, /illegal/i, /weapon/i, /bomb/i, /explosive/i, 
  /drug dealer/i, /buy drugs/i, /sell drugs/i, /poison/i, /murder/i,
  /steal/i, /smuggle/i, /dark web/i, /black market/i,
  
  // Financial & Sensitive Info
  /password/i, /credit card/i, /bank account/i, /social security/i,
  /make money/i, /get rich/i, /lottery/i, /gambling/i, /casino/i,
  /business/i, /investment/i, /stock market/i, /crypto/i, /bitcoin/i,
  /nft/i, /trading/i, /loan/i, /mortgage/i,
  
  // Adult & Inappropriate
  /porn/i, /adult content/i, /nsfw/i, /sex/i, /prostitute/i,
  
  // Scam & Security
  /spam/i, /scam/i, /phishing/i, /malware/i, /virus computer/i, /trojan/i,
  /ransomware/i, /spyware/i,
  
  // General Non-Medical Topics
  /programming/i, /code help/i, /javascript/i, /python/i, /html/i,
  /math problem/i, /homework help/i, /essay help/i, /write for me/i,
  /translate/i, /weather/i, /sports/i, /movie/i, /music/i, 
  /recipe/i, /cooking/i, /bake/i, /ingredients/i,
  /travel/i, /vacation/i, /flight/i, /hotel/i,
  /shopping/i, /fashion/i, /clothes/i, /shoes/i,
  /politics/i, /news/i, /gossip/i, /celebrity/i, /entertainment/i,
  /video game/i, /gaming/i, /console/i,
  
  // Advice Non-Medical
  /beauty tips/i, /makeup/i, /skincare routine/i, // Skincare can overlap, but "routine" leans cosmetic
  /relationship advice/i, /dating/i, /love advice/i, /breakup/i, /marriage/i,
  /career advice/i, /job help/i, /interview/i, /resume/i
];

export function analyzeQuery(text) {
  if (!text || typeof text !== "string") return { valid: false, error: "Empty query" };

  const lowerText = text.toLowerCase();

  const hasNonMedicalPatterns = nonMedicalPatterns.some((pattern) =>
    pattern.test(lowerText)
  );

  if (hasNonMedicalPatterns) {
    return { 
      valid: false, 
      error: "This service is only for medical symptoms and health-related queries. Please ensure your request does not contain inappropriate or non-medical content." 
    };
  }

  const hasMedicalKeywords = medicalKeywords.some((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );

  if (!hasMedicalKeywords) {
    return { 
      valid: false, 
      error: "We couldn't recognize specific medical symptoms in your query. Our system might not be trained for this specific term yet. Please rephrase using common medical terms, or double-check your spelling." 
    };
  }

  return { valid: true };
}
