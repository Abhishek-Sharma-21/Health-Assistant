// ─── Dummy AI Provider ─────────────────────────────────────────────────────
// Development-only provider. No external API calls.
// Used for testing, CI, local development.
// ────────────────────────────────────────────────────────────────────────────

import { AI_IDENTITY, buildChatSystemPrompt } from "../../config/aiSafety.js";
import {
  checkRefusal,
  detectEmergency,
  EMERGENCY_RESPONSE,
  validateAIOutput,
  safeAIErrorResponse,
} from "../aiSafety.js";

const SAFETY_PREFIX = `[DUMMY AI — Development Only]\n\n`;

export class DummyAIProvider {
  constructor() {
    this.name = "DUMMY";
    this.isConfigured = false;
    this.model = "dummy-v1";
  }

  async generateResponse({ message, context, conversationContext, preference }) {
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

    const contextKeys = Object.keys(context || {});
    const contextCategories = contextKeys.length > 0
      ? contextKeys.map((k) => k.toUpperCase()).join(", ")
      : "NONE";

    const contextDetails = buildContextSummary(context);
    const systemPrompt = buildChatSystemPrompt(message, contextCategories);
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
  if (context.profile) {
    const p = context.profile;
    const fields = [];
    if (p.bloodGroup) fields.push(`Blood Group: ${p.bloodGroup}`);
    if (p.heightCm) fields.push(`Height: ${p.heightCm} cm`);
    if (p.weightKg) fields.push(`Weight: ${p.weightKg} kg`);
    if (p.gender) fields.push(`Gender: ${p.gender}`);
    if (p.allergies) fields.push(`Allergies: ${p.allergies}`);
    if (p.chronicConditions) fields.push(`Conditions: ${p.chronicConditions}`);
    parts.push(`Profile data: ${fields.length > 0 ? fields.join(", ") : "limited data available"}`);
  }
  if (context.recentRecords) {
    const count = context.recentRecords.length;
    const types = [...new Set(context.recentRecords.map((r) => r.recordType))];
    parts.push(`Recent records: ${count} record(s) — types: ${types.join(", ")}`);
  }
  if (context.activeMedications) {
    const meds = context.activeMedications.map((m) => `${m.name} ${m.dosage} (${m.frequency})`);
    parts.push(`Active medications: ${meds.join(", ")}`);
  }
  if (context.medicationActivity) {
    const recent = context.medicationActivity.slice(0, 5);
    const statuses = recent.map((d) => `${d.medicationName}: ${d.status}`);
    parts.push(`Medication activity (recent): ${statuses.join("; ")}`);
  }
  if (context.measurements) {
    const m = context.measurements;
    const vals = [];
    if (m.heightCm) vals.push(`Height: ${m.heightCm} cm`);
    if (m.weightKg) vals.push(`Weight: ${m.weightKg} kg`);
    if (m.bmi) vals.push(`BMI: ${m.bmi}`);
    parts.push(`Measurements: ${vals.join(", ")}`);
  }
  if (context.trends) {
    const t = context.trends;
    if (t.recordTypeSummary) {
      const summary = Object.entries(t.recordTypeSummary).map(([type, count]) => `${type}: ${count}`).join(", ");
      parts.push(`Trends: Record types — ${summary}`);
    }
  }
  return parts.length > 0
    ? `\nContext details:\n${parts.map((p) => `- ${p}`).join("\n")}`
    : "\nNo relevant health data found in your profile.";
}
