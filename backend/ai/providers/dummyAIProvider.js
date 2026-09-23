// ─── Dummy AI Provider ─────────────────────────────────────────────────────
// Development-only provider. No external API calls.
// Used for testing, CI, local development.
// ────────────────────────────────────────────────────────────────────────────

import { AI_IDENTITY } from "../../config/aiSafety.js";
import {
  checkRefusal,
  detectEmergency,
  EMERGENCY_RESPONSE,
  validateAIOutput,
  safeAIErrorResponse,
} from "../aiSafety.js";

const SAFETY_PREFIX = `[DUMMY AI — Development Only]\n\n`;

function hasContextData(context, key) {
  const value = context?.[key];
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

export class DummyAIProvider {
  constructor() {
    this.name = "DUMMY";
    this.isConfigured = false;
    this.model = "dummy-v1";
  }

  async generateResponse({ message, context, conversationContext, preference, systemPrompt, task }) {
    if (task === "SYMPTOM_ANALYSIS" || systemPrompt) {
      return this._generateDiagnosisResponse(message, context);
    }

    if (checkRefusal(message)) {
      return {
        text: `I'm sorry, but I cannot assist with that request. If you are in crisis, please contact emergency services or a crisis helpline immediately.\n\n🚨 US: 988 Suicide & Crisis Lifeline | 🇬🇧 Samaritans: 116 123 | 🇮🇳 Vandrevala Foundation: 1860-2662-345`,
        provider: "DUMMY",
        model: this.model,
        usage: null,
        durationMs: 0,
      };
    }

    if (detectEmergency(message)) {
      return {
        text: EMERGENCY_RESPONSE,
        provider: "DUMMY",
        model: this.model,
        usage: null,
        durationMs: 0,
      };
    }

    const contextKeys = Object.keys(context || {}).filter((k) => hasContextData(context, k));
    const contextCategories = contextKeys.length > 0
      ? contextKeys.map((k) => k.toUpperCase()).join(", ")
      : "NONE";

    const contextDetails = buildContextSummary(context);
    const conversationSummary = buildConversationSummary(conversationContext);
    const preferenceSummary = buildPreferenceSummary(preference);

    const rawResponse = [
      SAFETY_PREFIX,
      `Question received:\n${message}`,
      `\nConversation context loaded: ${conversationContext?.length > 0 ? "YES" : "NO"}`,
      conversationSummary,
      `\nHealth context loaded: ${contextCategories}`,
      contextDetails,
      preferenceSummary,
      `\nSystem rules applied:\n- No diagnosis\n- No prescription\n- No fabrication of missing data\n- Emergency detection active\n- Medication safety active\n- Professional referral always recommended\n- Conversation memory injection protected`,
      `\n${AI_IDENTITY}`,
      `\nIn production, the above system prompt would be sent to the real AI provider with the health context.`,
    ].join("\n");

    const result = { text: rawResponse, provider: "DUMMY", model: this.model, usage: null, durationMs: 0 };

    const outputCheck = validateAIOutput(result);
    if (!outputCheck.valid) {
      return safeAIErrorResponse(new Error(outputCheck.error));
    }

    return outputCheck.sanitized;
  }

  _generateDiagnosisResponse(message, context) {
    const contextKeys = Object.keys(context || {}).filter((k) => hasContextData(context, k));
    const contextNote = contextKeys.length > 0
      ? `Available health context categories: ${contextKeys.join(", ")}. Use only this data; do not invent findings.`
      : "No stored health context was attached for this analysis.";

    const advice = [
      `Reported input: ${message}`,
      contextNote,
      "This is preliminary general health information, not a confirmed medical diagnosis.",
      "Symptoms can overlap many conditions. A qualified healthcare professional should evaluate you in person when needed.",
      "Seek urgent care or call emergency services if symptoms are severe or rapidly worsening.",
    ].join(" ");

    const payload = {
      diagnoses: [],
      shouldSeekProfessionalCare: true,
      advice,
      medicineRecommendations: {
        recommendations: [],
        disclaimer: "This is for informational purposes only. Always consult a healthcare provider before taking any medication.",
      },
    };

    return {
      text: JSON.stringify(payload),
      provider: "DUMMY",
      model: this.model,
      usage: null,
      durationMs: 0,
    };
  }
}

function buildConversationSummary(conversationContext) {
  if (!conversationContext || conversationContext.length === 0) {
    return "No previous messages in this conversation.";
  }
  const count = conversationContext.length;
  const recent = conversationContext.slice(-5);
  const lines = recent.map((m) => `  ${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 80)}${m.content.length > 80 ? "..." : ""}`);
  return `Recent messages (${count} total, showing last ${recent.length}):\n${lines.join("\n")}`;
}

function buildPreferenceSummary(preference) {
  if (!preference) return "\nPersonalization: OFF (memory disabled)";
  const parts = [];
  if (preference.responseStyle) parts.push(`style=${preference.responseStyle}`);
  if (preference.preferredUnit) parts.push(`units=${preference.preferredUnit}`);
  if (preference.preferredLanguage) parts.push(`lang=${preference.preferredLanguage}`);
  return `\nPersonalization loaded: ${parts.length > 0 ? parts.join(", ") : "defaults"}`;
}

function buildContextSummary(context) {
  const parts = [];
  if (hasContextData(context, "profile")) {
    const p = context.profile;
    const fields = [];
    if (p.bloodGroup) fields.push(`Blood Group: ${p.bloodGroup}`);
    if (p.height) fields.push(`Height: ${p.height} cm`);
    if (p.weight) fields.push(`Weight: ${p.weight} kg`);
    if (p.gender) fields.push(`Gender: ${p.gender}`);
    if (p.allergies) fields.push(`Allergies: ${p.allergies}`);
    if (p.medicalConditions) fields.push(`Conditions: ${p.medicalConditions}`);
    parts.push(`Profile data: ${fields.length > 0 ? fields.join(", ") : "limited data available"}`);
  }
  if (hasContextData(context, "recentRecords")) {
    const count = context.recentRecords.length;
    const types = [...new Set(context.recentRecords.map((r) => r.recordType))];
    parts.push(`Recent records: ${count} record(s) — types: ${types.join(", ")}`);
  }
  if (hasContextData(context, "activeMedications")) {
    const meds = context.activeMedications.map((m) => `${m.name} ${m.dosage} (${m.frequency})`);
    parts.push(`Active medications: ${meds.join(", ")}`);
  }
  if (hasContextData(context, "medicationActivity")) {
    const recent = context.medicationActivity.slice(0, 5);
    const statuses = recent.map((d) => `${d.medicationName}: ${d.status}`);
    parts.push(`Medication activity (recent): ${statuses.join("; ")}`);
  }
  if (hasContextData(context, "measurements")) {
    const m = context.measurements;
    const vals = [];
    if (m.height) vals.push(`Height: ${m.height} cm`);
    if (m.weight) vals.push(`Weight: ${m.weight} kg`);
    if (m.bmi) vals.push(`BMI: ${m.bmi}`);
    parts.push(`Measurements: ${vals.join(", ")}`);
  }
  if (hasContextData(context, "trends")) {
    const t = context.trends;
    if (t.recordTypeSummary) {
      const summary = Object.entries(t.recordTypeSummary).map(([type, count]) => `${type}: ${count}`).join(", ");
      parts.push(`Trends: Record types — ${summary}`);
    }
  }
  if (hasContextData(context, "conversation")) {
    const n = context.conversation.recentMessages?.length || 0;
    parts.push(`Conversation memory: ${n} recent message(s) loaded`);
  }
  return parts.length > 0
    ? `\nContext details:\n${parts.map((p) => `- ${p}`).join("\n")}`
    : "\nNo relevant health data found in your profile.";
}
