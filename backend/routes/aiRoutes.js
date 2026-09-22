import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { handleChat } from "../services/aiService.js";
import { analyzeQuery } from "../data/validationData.js";
import {
  validateAIInput,
  validateAIOutput,
  checkRefusal,
  detectEmergency,
  EMERGENCY_RESPONSE,
  isMedicationModificationRequest,
  MEDICATION_SAFETY_RESPONSE,
  logAIMetadata,
  safeAIErrorResponse,
} from "../ai/aiSafety.js";

const router = Router();

router.post("/chat", protect, async (req, res) => {
  const startTime = Date.now();
  const { message, conversationId, task } = req.body;
  const aiTask = task || "CHAT";

  // ── Step 1: Input Validation ──
  const inputCheck = validateAIInput(message, conversationId);
  if (!inputCheck.valid) {
    return res.status(inputCheck.status).json({ error: inputCheck.errors[0] });
  }
  const trimmedMessage = inputCheck.trimmed;

  // ── Step 2: Medical Relevance Check ──
  const validation = analyzeQuery(trimmedMessage);
  if (!validation.valid) {
    logAIMetadata({
      userId: req.user.id,
      inputLength: trimmedMessage.length,
      safetyBlocked: true,
      safetyReason: "NON_MEDICAL",
      responseTimeMs: Date.now() - startTime,
    });
    return res.status(400).json({ error: validation.error });
  }

  // ── Step 3: Refusal Check ──
  if (checkRefusal(trimmedMessage)) {
    logAIMetadata({
      userId: req.user.id,
      inputLength: trimmedMessage.length,
      safetyBlocked: true,
      safetyReason: "REFUSAL_PATTERN",
      responseTimeMs: Date.now() - startTime,
    });
    return res.status(400).json({
      error: "I'm sorry, but I cannot assist with that request. If you are in crisis, please contact emergency services or a crisis helpline immediately.",
    });
  }

  // ── Step 4: Emergency Detection ──
  if (detectEmergency(trimmedMessage)) {
    logAIMetadata({
      userId: req.user.id,
      inputLength: trimmedMessage.length,
      safetyBlocked: true,
      safetyReason: "EMERGENCY",
      responseTimeMs: Date.now() - startTime,
    });
    return res.status(200).json({
      text: EMERGENCY_RESPONSE,
      provider: "SAFETY",
      categoriesUsed: [],
      conversationId: conversationId || null,
    });
  }

  // ── Step 5: Medication Modification Check ──
  if (isMedicationModificationRequest(trimmedMessage)) {
    logAIMetadata({
      userId: req.user.id,
      inputLength: trimmedMessage.length,
      safetyBlocked: true,
      safetyReason: "MEDICATION_MODIFICATION",
      responseTimeMs: Date.now() - startTime,
    });
    return res.status(200).json({
      text: MEDICATION_SAFETY_RESPONSE,
      provider: "SAFETY",
      categoriesUsed: [],
      conversationId: conversationId || null,
    });
  }

  // ── Step 6: AI Processing ──
  try {
    const result = await handleChat(req.user.id, trimmedMessage, conversationId || null, aiTask);

    // ── Step 7: Output Validation ──
    const outputCheck = validateAIOutput(result);
    if (!outputCheck.valid) {
      logAIMetadata({
        userId: req.user.id,
        conversationId: result.conversationId,
        inputLength: trimmedMessage.length,
        outputLength: 0,
        provider: result.provider,
        safetyBlocked: true,
        safetyReason: "INVALID_OUTPUT",
        responseTimeMs: Date.now() - startTime,
      });
      const safeFallback = safeAIErrorResponse(new Error(outputCheck.error));
      return res.json({
        text: safeFallback.text,
        provider: "SAFETY_FALLBACK",
        categoriesUsed: result.categoriesUsed || [],
        conversationId: result.conversationId || null,
      });
    }

    // ── Step 8: Safe Response + Metadata Logging ──
    logAIMetadata({
      userId: req.user.id,
      conversationId: result.conversationId,
      inputLength: trimmedMessage.length,
      outputLength: outputCheck.sanitized.text.length,
      categoriesUsed: result.categoriesUsed,
      provider: result.provider,
      responseTimeMs: Date.now() - startTime,
    });

    res.json({
      text: outputCheck.sanitized.text,
      provider: result.provider,
      categoriesUsed: result.categoriesUsed,
      conversationId: result.conversationId,
    });
  } catch (err) {
    logAIMetadata({
      userId: req.user.id,
      inputLength: trimmedMessage.length,
      safetyBlocked: true,
      safetyReason: "PROVIDER_ERROR",
      responseTimeMs: Date.now() - startTime,
    });
    const safeFallback = safeAIErrorResponse(err);
    res.json({
      text: safeFallback.text,
      provider: "SAFETY_FALLBACK",
      categoriesUsed: [],
      conversationId: conversationId || null,
    });
  }
});

export default router;
