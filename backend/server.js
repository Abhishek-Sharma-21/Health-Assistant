import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { analyzeQuery } from "./data/validationData.js";
dotenv.config();

const app = express();
const PORT = 5000;

// OpenAI Client pointing to OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000", // Optional, for including your app on openrouter.ai rankings.
    "X-Title": "Health Assistant", // Optional. Shows in rankings on openrouter.ai.
  },
});

// Validation logic now imported from ./data/validationData.js

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(bodyParser.json());

app.post("/diagnose", async (req, res) => {
  const { symptoms, medicalHistory } = req.body;

  // Input validation
  if (
    !symptoms ||
    typeof symptoms !== "string" ||
    symptoms.trim().length === 0
  ) {
    return res.status(400).json({
      error: "Symptoms are required and must be a non-empty string.",
    });
  }

  // Check if the query is medical-related
  const combinedInput = `${symptoms} ${medicalHistory || ""}`;
  const validation = analyzeQuery(combinedInput);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Additional safety checks
  if (symptoms.length > 1000) {
    return res.status(400).json({
      error:
        "Symptoms description is too long. Please keep it under 1000 characters.",
    });
  }

  try {
    const prompt = `You are a medical AI assistant. Analyze the following symptoms and medical history to provide health insights.

Symptoms: "${symptoms}"
Medical History: "${medicalHistory || "None provided"}"

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

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
    });

    let text = completion.choices[0].message.content;

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
