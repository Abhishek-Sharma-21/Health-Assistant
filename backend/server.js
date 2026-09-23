import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
import { analyzeQuery } from "./data/validationData.js";
import { buildDiagnoseSystemPrompt, checkRefusal, detectEmergency, EMERGENCY_RESPONSE } from "./config/aiSafety.js";
import { validateAIInput, validateAIOutput, isMedicationModificationRequest, MEDICATION_SAFETY_RESPONSE, logAIMetadata } from "./ai/aiSafety.js";
import { getAIProvider } from "./ai/aiProviderFactory.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import healthRecordRoutes from "./routes/healthRecordRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import adminAiCredentialRoutes from "./routes/adminAiCredentialRoutes.js";
import { routeTask } from "./ai/taskRouter.js";
import { protect } from "./middleware/auth.js";
import {
  resolveHealthContext,
  validateContextRequest,
  toAIContextPayload,
  toConversationContext,
} from "./services/healthContextContract.js";
import { prisma } from "./lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((o) => o.trim());
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Lightweight health check (used by admin help diagnostics)
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (_) {
    res.status(503).json({ status: "degraded", database: "disconnected" });
  }
});

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai/conversations", conversationRoutes);
app.use("/api/admin/ai-credentials", adminAiCredentialRoutes);

// ─── Symptom Checker (uses provider-agnostic AI) ──────────────────────────
app.post("/diagnose", protect, async (req, res) => {
  const startTime = Date.now();
  const { symptoms, medicalHistory, useHealthContext, contextRequest } = req.body;

  // ── Step 0: Validate optional contextRequest ──
  const contextValidation = validateContextRequest(contextRequest);
  if (!contextValidation.ok) {
    return res.status(400).json({ error: contextValidation.error });
  }

  // ── Step 1: Input Validation ──
  const inputCheck = validateAIInput(symptoms);
  if (!inputCheck.valid) {
    return res.status(inputCheck.status).json({ error: inputCheck.errors[0] });
  }
  const trimmedSymptoms = inputCheck.trimmed;

  // ── Step 2: Medical Relevance Check ──
  const combinedInput = `${trimmedSymptoms} ${medicalHistory || ""}`;
  const validation = analyzeQuery(combinedInput);
  if (!validation.valid) {
    logAIMetadata({
      inputLength: combinedInput.length,
      safetyBlocked: true,
      safetyReason: "NON_MEDICAL",
      responseTimeMs: Date.now() - startTime,
    });
    return res.status(400).json({ error: validation.error });
  }

  // ── Step 3: Refusal Check ──
  if (checkRefusal(combinedInput)) {
    logAIMetadata({
      inputLength: combinedInput.length,
      safetyBlocked: true,
      safetyReason: "REFUSAL_PATTERN",
      responseTimeMs: Date.now() - startTime,
    });
    return res.status(400).json({
      error: "I'm sorry, but I cannot assist with that request. If you are in crisis, please contact emergency services or a crisis helpline immediately.",
    });
  }

  // ── Step 4: Emergency Detection ──
  if (detectEmergency(combinedInput)) {
    logAIMetadata({
      inputLength: combinedInput.length,
      safetyBlocked: true,
      safetyReason: "EMERGENCY",
      responseTimeMs: Date.now() - startTime,
    });
    return res.status(200).json({
      result: {
        diagnoses: [],
        shouldSeekProfessionalCare: true,
        advice: EMERGENCY_RESPONSE,
        medicineRecommendations: {
          recommendations: [],
          disclaimer: "This is for informational purposes only. Always consult a healthcare provider.",
        },
      },
    });
  }

  // ── Step 5: Medication Modification Check ──
  if (isMedicationModificationRequest(trimmedSymptoms)) {
    logAIMetadata({
      inputLength: trimmedSymptoms.length,
      safetyBlocked: true,
      safetyReason: "MEDICATION_MODIFICATION",
      responseTimeMs: Date.now() - startTime,
    });
    return res.status(200).json({
      result: {
        diagnoses: [],
        shouldSeekProfessionalCare: true,
        advice: MEDICATION_SAFETY_RESPONSE,
        medicineRecommendations: {
          recommendations: [],
          disclaimer: "This is for informational purposes only. Always consult a healthcare provider.",
        },
      },
    });
  }

  // ── Step 6: AI Processing via Task Router ──
  try {
    const systemPrompt = buildDiagnoseSystemPrompt(trimmedSymptoms, medicalHistory);

    // Single health-context contract (user-scoped; respects toggle + optional contextRequest)
    const { healthContext, memoryEnabled, preference } = await resolveHealthContext({
      userId: req.user.id,
      message: combinedInput,
      useHealthContext,
      contextRequest: contextRequest ?? null,
      conversationId: null,
      attachConversation: false,
    });

    const result = await routeTask("SYMPTOM_ANALYSIS", {
      message: `Symptoms: ${trimmedSymptoms}${medicalHistory ? `\nMedical History: ${medicalHistory}` : ""}`,
      context: toAIContextPayload(healthContext),
      conversationContext: toConversationContext(healthContext),
      preference: memoryEnabled ? preference : null,
      systemPrompt,
    });

    let text = result.text;
    text = text.replace(/```json/g, "");
    text = text.replace(/```/g, "");
    text = text.trim();

    try {
      const parsedResult = JSON.parse(text);

      // Enforce non-diagnostic safety constraints server-side
      if (Array.isArray(parsedResult.diagnoses)) {
        parsedResult.diagnoses = parsedResult.diagnoses.map((d) => ({
          name: String(d?.name || "").slice(0, 200),
          confidence: Math.min(Math.max(Number(d?.confidence) || 0, 0), 0.7),
        }));
      } else {
        parsedResult.diagnoses = [];
      }
      parsedResult.shouldSeekProfessionalCare = true;
      if (parsedResult.medicineRecommendations) {
        parsedResult.medicineRecommendations.recommendations = [];
      }

      // ── Step 7: Output Validation ──
      const outputCheck = validateAIOutput({ text: JSON.stringify(parsedResult), provider: result.provider });
      if (!outputCheck.valid) {
        logAIMetadata({
          inputLength: trimmedSymptoms.length,
          outputLength: 0,
          provider: result.provider,
          safetyBlocked: true,
          safetyReason: "INVALID_OUTPUT",
          responseTimeMs: Date.now() - startTime,
        });
        return res.status(500).json({
          error: "The Health Assistant is temporarily unavailable. Please try again.",
        });
      }

      logAIMetadata({
        inputLength: trimmedSymptoms.length,
        outputLength: text.length,
        provider: result.provider,
        responseTimeMs: Date.now() - startTime,
      });

      res.json({ result: parsedResult });
    } catch (parseError) {
      logAIMetadata({
        inputLength: trimmedSymptoms.length,
        provider: result.provider,
        safetyBlocked: true,
        safetyReason: "PARSE_ERROR",
        responseTimeMs: Date.now() - startTime,
      });
      console.error("Error parsing AI response as JSON:", parseError);
      res.status(500).json({ error: "Failed to parse AI response." });
    }
  } catch (err) {
    if (err?.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    logAIMetadata({
      inputLength: trimmedSymptoms.length,
      provider: err?.code || "UNKNOWN",
      safetyBlocked: true,
      safetyReason: "PROVIDER_ERROR",
      responseTimeMs: Date.now() - startTime,
    });
    console.error("AI Provider Error:", err?.message || err);
    res.status(500).json({ error: "The Health Assistant is temporarily unavailable. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Log configured provider on startup
  try {
    const provider = getAIProvider();
    console.log(`[AI] Active provider: ${provider.name} (${provider.model})`);
  } catch (_) {}
});
