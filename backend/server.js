import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 5000;

// Your Gemini API Key
const genAI = new GoogleGenerativeAI(process.env.GEMNI_API_KEY);

// Medical keywords for validation
const medicalKeywords = [
  'pain', 'ache', 'hurt', 'sore', 'tender', 'swelling', 'inflammation',
  'fever', 'temperature', 'hot', 'cold', 'chills', 'sweating',
  'headache', 'migraine', 'dizziness', 'vertigo', 'lightheaded',
  'nausea', 'vomiting', 'diarrhea', 'constipation', 'stomach', 'abdomen',
  'cough', 'sneeze', 'runny nose', 'congestion', 'breathing', 'shortness of breath',
  'chest pain', 'heart', 'palpitations', 'irregular heartbeat',
  'rash', 'itch', 'hives', 'allergic', 'allergy', 'skin',
  'joint', 'muscle', 'bone', 'fracture', 'sprain', 'strain',
  'fatigue', 'tired', 'weakness', 'lethargy', 'exhaustion',
  'insomnia', 'sleep', 'restless', 'anxiety', 'depression', 'mood',
  'appetite', 'weight', 'loss', 'gain', 'thirst', 'urination',
  'vision', 'eye', 'blind', 'blur', 'hearing', 'ear', 'deaf',
  'memory', 'confusion', 'disorientation', 'seizure', 'convulsion',
  'numbness', 'tingling', 'paralysis', 'weakness', 'tremor',
  'bleeding', 'bruise', 'cut', 'wound', 'infection', 'pus',
  'lump', 'tumor', 'cancer', 'cancerous', 'benign', 'malignant',
  'diabetes', 'hypertension', 'blood pressure', 'cholesterol',
  'asthma', 'bronchitis', 'pneumonia', 'tuberculosis',
  'arthritis', 'rheumatoid', 'osteoarthritis', 'gout',
  'ulcer', 'gastritis', 'acid reflux', 'heartburn',
  'kidney', 'liver', 'gallbladder', 'pancreas', 'thyroid',
  'hormone', 'endocrine', 'metabolic', 'immune', 'autoimmune',
  'virus', 'bacterial', 'fungal', 'parasite', 'infection',
  'medication', 'medicine', 'drug', 'prescription', 'dosage',
  'side effect', 'allergic reaction', 'overdose', 'withdrawal',
  'symptom', 'condition', 'disease', 'illness', 'sick', 'unwell',
  'diagnosis', 'prognosis', 'treatment', 'therapy', 'recovery',
  'prevention', 'vaccine', 'immunization', 'screening', 'test'
];

// Function to check if input contains medical content
function isMedicalQuery(text) {
  if (!text || typeof text !== 'string') return false;
  
  const lowerText = text.toLowerCase();
  
  // Check for medical keywords
  const hasMedicalKeywords = medicalKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  // Check for common non-medical patterns that should be rejected
  const nonMedicalPatterns = [
    /how to hack/i,
    /password/i,
    /credit card/i,
    /bank account/i,
    /social security/i,
    /make money/i,
    /get rich/i,
    /lottery/i,
    /gambling/i,
    /illegal/i,
    /weapon/i,
    /bomb/i,
    /explosive/i,
    /drug dealer/i,
    /buy drugs/i,
    /sell drugs/i,
    /porn/i,
    /adult content/i,
    /spam/i,
    /scam/i,
    /phishing/i,
    /malware/i,
    /virus computer/i,
    /programming/i,
    /code help/i,
    /math problem/i,
    /homework help/i,
    /essay help/i,
    /write for me/i,
    /translate/i,
    /weather/i,
    /sports/i,
    /movie/i,
    /music/i,
    /recipe/i,
    /cooking/i,
    /travel/i,
    /vacation/i,
    /shopping/i,
    /fashion/i,
    /beauty tips/i,
    /relationship advice/i,
    /dating/i,
    /love advice/i,
    /career advice/i,
    /job help/i,
    /business/i,
    /investment/i,
    /stock market/i,
    /crypto/i,
    /bitcoin/i,
    /politics/i,
    /news/i,
    /gossip/i,
    /celebrity/i,
    /entertainment/i
  ];
  
  const hasNonMedicalPatterns = nonMedicalPatterns.some(pattern => 
    pattern.test(lowerText)
  );
  
  // Must have medical keywords and not contain non-medical patterns
  return hasMedicalKeywords && !hasNonMedicalPatterns;
}

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(bodyParser.json());

app.post("/diagnose", async (req, res) => {
  const { symptoms, medicalHistory } = req.body;

  // Input validation
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
    return res.status(400).json({ 
      error: "Symptoms are required and must be a non-empty string." 
    });
  }

  // Check if the query is medical-related
  const combinedInput = `${symptoms} ${medicalHistory || ''}`;
  if (!isMedicalQuery(combinedInput)) {
    return res.status(400).json({ 
      error: "This service is only for medical symptoms and health-related queries. Please provide valid medical symptoms or health concerns." 
    });
  }

  // Additional safety checks
  if (symptoms.length > 1000) {
    return res.status(400).json({ 
      error: "Symptoms description is too long. Please keep it under 1000 characters." 
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a medical AI assistant. Analyze the following symptoms and medical history to provide health insights.

Symptoms: "${symptoms}"
Medical History: "${medicalHistory || 'None provided'}"

Provide your analysis in the following JSON format ONLY (no other text):

{
  "diagnoses": [
    {
      "name": "Condition Name",
      "confidence": 0.XX
    }
  ],
  "shouldSeekProfessionalCare": true/false,
  "advice": "General advice about the conditions",
  "medicineRecommendations": {
    "recommendations": [
      {
        "medicineName": "Medicine Name",
        "dosageSuggestion": "Dosage details",
        "precautions": "Precautions for the medicine"
      }
    ],
    "disclaimer": "This is for informational purposes only. Always consult a healthcare provider before taking any medication."
  }
}

IMPORTANT: Respond ONLY with the JSON object above. Do not include any other text, explanations, or confirmations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Remove the ```json and ``` if present
    text = text.replace(/```json/g, "");
    text = text.replace(/```/g, "");
    text = text.trim(); // Trim any leading/trailing whitespace

    try {
      // Attempt to parse the cleaned AI response as JSON
      const parsedResult = JSON.parse(text);
      res.json({ result: parsedResult });
    } catch (parseError) {
      console.error("Error parsing AI response as JSON:", parseError);
      console.error("Cleaned AI Response:", text); // Log the cleaned response for debugging
      res.status(500).json({ error: "Failed to parse cleaned AI response." });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
