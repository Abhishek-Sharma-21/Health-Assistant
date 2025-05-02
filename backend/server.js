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

app.use(cors());
app.use(bodyParser.json());

app.post("/diagnose", async (req, res) => {
  const { symptoms, medicalHistory } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Based on the symptoms: "${symptoms}" and medical history: "${medicalHistory}", provide the following information in JSON format:

    {
      "diagnoses": [
        {
          "name": "Condition Name",
          "confidence": 0.XX
        },
        ...
      ],
      "shouldSeekProfessionalCare": true/false,
      "advice": "General advice about the conditions",
      "medicineRecommendations": {
        "recommendations": [
          {
            "medicineName": "Medicine Name",
            "dosageSuggestion": "Dosage details",
            "precautions": "Precautions for the medicine"
          },
          ...
        ],
        "disclaimer": "Disclaimer for medications"
      }
    }`;

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
