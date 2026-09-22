// ─── Centralized AI Safety Layer ───────────────────────────────────────────
// Input validation, output validation, response sanitization, and safety logging.
// All AI providers and routes should use these functions.
// ────────────────────────────────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 8000;
const MAX_RESPONSE_LENGTH = 10000;

// ─── Input Validation ──────────────────────────────────────────────────────

export function validateAIInput(message, conversationId = null) {
  const errors = [];

  if (!message || typeof message !== "string") {
    errors.push("Message is required and must be a string.");
    return { valid: false, errors, status: 400 };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    errors.push("Message cannot be empty or whitespace-only.");
    return { valid: false, errors, status: 400 };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message is too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`);
    return { valid: false, errors, status: 400 };
  }

  if (conversationId !== null && conversationId !== undefined) {
    if (typeof conversationId !== "string") {
      errors.push("Conversation ID must be a string.");
      return { valid: false, errors, status: 400 };
    }
    if (conversationId.length > 100) {
      errors.push("Invalid conversation ID format.");
      return { valid: false, errors, status: 400 };
    }
  }

  return { valid: true, errors: [], trimmed };
}

export function validateConversationOwnership(conversation, userId) {
  if (!conversation) {
    return { authorized: false, status: 404, error: "Conversation not found." };
  }
  if (conversation.userId !== userId) {
    return { authorized: false, status: 403, error: "Access denied." };
  }
  return { authorized: true };
}

// ─── Output Validation ─────────────────────────────────────────────────────

export function validateAIOutput(result) {
  if (!result || typeof result !== "object") {
    return { valid: false, error: "AI provider returned an invalid response." };
  }

  if (!result.text || typeof result.text !== "string") {
    return { valid: false, error: "AI provider did not return a valid response text." };
  }

  if (result.text.trim().length === 0) {
    return { valid: false, error: "AI provider returned an empty response." };
  }

  if (result.text.length > MAX_RESPONSE_LENGTH) {
    result.text = result.text.slice(0, MAX_RESPONSE_LENGTH);
  }

  const secretsDetected = detectSecrets(result.text);
  if (secretsDetected.length > 0) {
    result.text = sanitizeSecrets(result.text, secretsDetected);
  }

  if (containsInternalDetails(result.text)) {
    result.text = stripInternalDetails(result.text);
  }

  return { valid: true, sanitized: result };
}

// ─── Response Sanitization ─────────────────────────────────────────────────

function detectSecrets(text) {
  const patterns = [
    { pattern: /sk-[a-zA-Z0-9]{20,}/g, type: "API_KEY" },
    { pattern: /OPENROUTER_API_KEY\s*[=:]\s*\S+/gi, type: "ENV_VAR" },
    { pattern: /OPENAI_API_KEY\s*[=:]\s*\S+/gi, type: "ENV_VAR" },
    { pattern: /password\s*[:=]\s*\S+/gi, type: "PASSWORD" },
    { pattern: /postgresql:\/\/[^\s]+/gi, type: "DATABASE_URL" },
    { pattern: /mongodb:\/\/[^\s]+/gi, type: "DATABASE_URL" },
  ];

  const detected = [];
  for (const { pattern, type } of patterns) {
    if (pattern.test(text)) {
      detected.push(type);
    }
  }
  return detected;
}

function sanitizeSecrets(text, types) {
  let sanitized = text;
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/g, "[REDACTED]");
  sanitized = sanitized.replace(/OPENROUTER_API_KEY\s*[=:]\s*\S+/gi, "OPENROUTER_API_KEY=[REDACTED]");
  sanitized = sanitized.replace(/OPENAI_API_KEY\s*[=:]\s*\S+/gi, "OPENAI_API_KEY=[REDACTED]");
  sanitized = sanitized.replace(/password\s*[:=]\s*\S+/gi, "password=[REDACTED]");
  sanitized = sanitized.replace(/postgresql:\/\/[^\s]+/gi, "[DATABASE_URL_REDACTED]");
  sanitized = sanitized.replace(/mongodb:\/\/[^\s]+/gi, "[DATABASE_URL_REDACTED]");
  return sanitized;
}

function containsInternalDetails(text) {
  const lower = text.toLowerCase();
  return (
    lower.includes("system prompt") ||
    lower.includes("api key") ||
    lower.includes("apikey") ||
    lower.includes("internal server") ||
    lower.includes("stack trace") ||
    lower.includes("prisma") ||
    lower.includes("@prisma") ||
    lower.includes("node_modules") ||
    lower.includes("backend/") ||
    lower.includes("config/")
  );
}

function stripInternalDetails(text) {
  let sanitized = text;
  const lines = sanitized.split("\n");
  const filtered = lines.filter((line) => {
    const lower = line.toLowerCase();
    return !(
      lower.includes("system prompt") ||
      lower.includes("api key") ||
      lower.includes("apikey") ||
      lower.includes("internal server") ||
      lower.includes("stack trace") ||
      lower.includes("prisma") ||
      lower.includes("@prisma") ||
      lower.includes("node_modules") ||
      lower.includes("backend/") ||
      lower.includes("config/")
    );
  });
  return filtered.join("\n");
}

// ─── Medication Safety ─────────────────────────────────────────────────────

const MEDICATION_SAFETY_PATTERNS = [
  /increase.{0,30}dosage/i,
  /decrease.{0,30}dosage/i,
  /stop.{0,20}taking/i,
  /double.{0,20}dose/i,
  /skip.{0,20}dose/i,
  /change.{0,30}prescription/i,
  /replace.{0,30}medication/i,
  /start.{0,30}prescription/i,
  /take.{0,20}instead/i,
  /adjust.{0,30}dosage/i,
  /higher.{0,20}dose/i,
  /lower.{0,20}dose/i,
  /twice.{0,20}dose/i,
  /half.{0,20}dose/i,
  /quarter.{0,20}dose/i,
];

export function isMedicationModificationRequest(message) {
  const lower = message.toLowerCase();
  return MEDICATION_SAFETY_PATTERNS.some((p) => p.test(lower));
}

export const MEDICATION_SAFETY_RESPONSE = `I can help you understand the medications recorded in your health profile, but I cannot recommend changes to your medication dosage or schedule.

For any medication adjustments, please:
• Consult your prescribing healthcare provider
• Contact your pharmacist for medication questions
• Call your doctor's office before making any changes

Never stop, start, or change medication dosages without professional medical guidance.`;

// ─── Diagnosis Safety ──────────────────────────────────────────────────────

const DIAGNOSIS_PATTERNS = [
  /you have\s+(cancer|diabetes|hiv|aids|tuberculosis|pneumonia|hepatitis|leukemia|lymphoma)/i,
  /you are diagnosed with/i,
  /you definitely have/i,
  /you are suffering from/i,
  /confirmed diagnosis/i,
  /without a doubt.*i am certain you have/i,
  /i (can confirm|am sure|know) you have/i,
];

export function containsDefinitiveDiagnosis(text) {
  return DIAGNOSIS_PATTERNS.some((p) => p.test(text));
}

// ─── Emergency Detection ───────────────────────────────────────────────────

const EMERGENCY_PATTERNS = [
  /chest pain/i,
  /difficulty breathing|can'?t breathe|can'?t breath|not breathing/i,
  /severe bleeding|uncontrolled bleeding|heavy bleeding/i,
  /stroke|face drooping|arm weakness|speech difficulty/i,
  /anaphylaxis|severe allergic reaction|throat closing|tongue swelling/i,
  /overdose|poisoning|took too many/i,
  /suicid|want to die|kill myself|end my life/i,
  /seizure|convulsion|unconscious|not responding/i,
  /choking|can'?t swallow/i,
  /heart attack/i,
];

export function detectEmergency(message) {
  const lower = message.toLowerCase();
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(lower));
}

export const EMERGENCY_RESPONSE = `This may be a medical emergency. Please take immediate action:

🚨 Call your local emergency number NOW:
   • United States: 911
   • United Kingdom: 999
   • India: 108
   • Europe: 112
   • Or your local emergency number

🏥 Go to the nearest emergency room immediately.

⏱ Do not wait for an online response. Time matters in emergencies.

If you are in emotional distress or having thoughts of self-harm:
   • US: 988 Suicide & Crisis Lifeline (call or text 988)
   • UK: Samaritans 116 123
   • India: Vandrevala Foundation 1860-2662-345
   • International: https://findahelpline.com`;

// ─── Refusal Patterns ──────────────────────────────────────────────────────

const REFUSAL_PATTERNS = [
  /how to (commit suicide|kill myself|end my life|overdose|hurt myself)/i,
  /ways to (die|suicide|self[- ]?harm)/i,
  /want to (die|kill|end)/i,
  /(i'?m? going to|planning to) (kill|end|die|hurt)/i,
  /how to (make|cook|manufacture|synthesize) (drugs|meth|cocaine|lsd|ecstasy|heroin|fentanyl)/i,
  /(recipe|formula|synthesis) for (illegal |controlled )?drugs/i,
  /how to (make|build|obtain|buy) (a )?(weapon|bomb|gun|explosive|firearm)/i,
  /(kill|murder|harm|assault) (someone|people|person)/i,
  /(steal|forge|fake|hack) (identity|ssn|credit card|passport|license)/i,
  /(how to|steps to) (commit fraud|launder money|evade tax)/i,
  /(give me|prescribe|recommend) (a )?(specific )?(dosage of |prescription for )?(opioid|fentanyl|oxycontin|percocet|adderall|xanax|valium|ambien)/i,
];

export function checkRefusal(message) {
  const lower = message.toLowerCase();
  return REFUSAL_PATTERNS.some((pattern) => pattern.test(lower));
}

// ─── AI Metadata Logging (safe, non-sensitive) ─────────────────────────────

export function logAIMetadata(entry) {
  const safe = {
    timestamp: new Date().toISOString(),
    userId: entry.userId ? "[PRESENT]" : "[MISSING]",
    conversationId: entry.conversationId ? "[PRESENT]" : "[MISSING]",
    inputLength: entry.inputLength || 0,
    categoriesUsed: entry.categoriesUsed || [],
    provider: entry.provider || "UNKNOWN",
    outputLength: entry.outputLength || 0,
    safetyBlocked: entry.safetyBlocked || false,
    safetyReason: entry.safetyReason || null,
    responseTimeMs: entry.responseTimeMs || 0,
  };

  if (entry.safetyBlocked) {
    console.log("[AI_SAFETY_BLOCKED]", JSON.stringify(safe));
  } else {
    console.log("[AI_REQUEST]", JSON.stringify(safe));
  }
}

// ─── Safe Error Response ───────────────────────────────────────────────────

export function safeAIErrorResponse(err) {
  console.error("[AI_ERROR]", err?.message || "Unknown error");
  return {
    text: "I'm sorry, but the Health Assistant encountered an issue processing your request. Please try again or contact support if the problem persists.",
    provider: "ERROR",
    categoriesUsed: [],
  };
}
