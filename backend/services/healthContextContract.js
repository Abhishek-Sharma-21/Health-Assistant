// ─── Health Context Contract ───────────────────────────────────────────────
// Single mechanism for obtaining AI-ready health context.
// All AI features (chat, diagnose, future tasks) must use resolveHealthContext.
//
// HealthContext shape (stable keys — always present):
//   categories: string[]          sections actually included
//   profile: object | null
//   recentRecords: object[]
//   activeMedications: object[]
//   medicationActivity: object[]
//   measurements: object | null
//   trends: object | null
//   conversation: { id, title, recentMessages } | null
//
// Isolation: userId is always provided by the server (auth), never trusted
// from the client. Every query is scoped to that userId.
// ────────────────────────────────────────────────────────────────────────────

import { prisma } from "../lib/db.js";
import { selectContext } from "./contextSelector.js";
import {
  getProfile,
  getRecentRecords,
  getActiveMedications,
  getMedicationActivity,
  getMeasurements,
  getTrends,
} from "./healthContextService.js";

export const CONTEXT_CATEGORIES = Object.freeze([
  "PROFILE",
  "RECORDS",
  "MEDICATIONS",
  "MEASUREMENTS",
  "TRENDS",
  "CONVERSATION",
]);

const CATEGORY_SET = new Set(CONTEXT_CATEGORIES);

/** include* flags → category names (backend-validated whitelist) */
export const CONTEXT_INCLUDE_FLAGS = Object.freeze({
  includeProfile: "PROFILE",
  includeHealthRecords: "RECORDS",
  includeMedications: "MEDICATIONS",
  includeMeasurements: "MEASUREMENTS",
  includeTrends: "TRENDS",
  includeConversation: "CONVERSATION",
});

const CONVERSATION_MESSAGE_LIMIT = 20;

export function emptyHealthContext() {
  return {
    categories: [],
    profile: null,
    recentRecords: [],
    activeMedications: [],
    medicationActivity: [],
    measurements: null,
    trends: null,
    conversation: null,
  };
}

/**
 * Validate a client contextRequest. Returns a Set of allowed categories.
 * Unknown flags/keys are ignored. Never accepts userId or other identity fields.
 * @returns {{ ok: true, categories: Set<string> } | { ok: false, error: string }}
 */
export function validateContextRequest(raw) {
  if (raw === undefined || raw === null) {
    return { ok: true, categories: null }; // absent → auto-select from message
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "contextRequest must be an object." };
  }

  const categories = new Set();

  for (const [flag, category] of Object.entries(CONTEXT_INCLUDE_FLAGS)) {
    if (raw[flag] === true) categories.add(category);
  }

  if (raw.categories !== undefined) {
    if (!Array.isArray(raw.categories)) {
      return { ok: false, error: "contextRequest.categories must be an array." };
    }
    for (const c of raw.categories) {
      if (typeof c !== "string") {
        return { ok: false, error: "contextRequest.categories must contain strings." };
      }
      const upper = c.toUpperCase();
      if (CATEGORY_SET.has(upper)) categories.add(upper);
      // unknown category strings are dropped (whitelist)
    }
  }

  // Reject attempts to smuggle identity overrides
  if ("userId" in raw || "user_id" in raw) {
    return { ok: false, error: "contextRequest cannot specify userId." };
  }

  return { ok: true, categories };
}

/**
 * Resolve which categories to load for this request.
 * Explicit contextRequest wins over message auto-selection.
 * memoryEnabled (preference / useHealthContext) is the master switch for health data.
 * Conversation may still attach for chat continuity when attachConversation is true.
 */
export function resolveCategories({
  message,
  memoryEnabled,
  explicitCategories, // Set | null
  conversationId,
  attachConversation,
}) {
  let categories;

  if (explicitCategories) {
    categories = new Set(explicitCategories);
  } else if (memoryEnabled) {
    categories = selectContext(message || "");
  } else {
    categories = new Set();
  }

  if (!memoryEnabled) {
    // Master switch off: no health data sections.
    // Keep CONVERSATION only if explicitly requested (rare) — attachConversation below re-adds for chat.
    const keepConversation = explicitCategories?.has("CONVERSATION");
    categories = keepConversation ? new Set(["CONVERSATION"]) : new Set();
  }

  if (attachConversation && conversationId) {
    categories.add("CONVERSATION");
  }

  // Final whitelist pass
  for (const c of [...categories]) {
    if (!CATEGORY_SET.has(c)) categories.delete(c);
  }

  return categories;
}

/**
 * Single entry point: build user-scoped HealthContext for AI features.
 *
 * @param {object} opts
 * @param {string} opts.userId              — from authenticated user only
 * @param {string} [opts.message]           — used for auto context selection
 * @param {boolean} [opts.useHealthContext] — per-request toggle (overrides preference)
 * @param {object|null} [opts.contextRequest] — validated via validateContextRequest
 * @param {string|null} [opts.conversationId]
 * @param {boolean} [opts.attachConversation] — attach conversation history (chat)
 * @returns {Promise<{ healthContext: object, categories: Set<string>, memoryEnabled: boolean, preference: object|null }>}
 */
export async function resolveHealthContext({
  userId,
  message = "",
  useHealthContext,
  contextRequest = null,
  conversationId = null,
  attachConversation = false,
}) {
  if (!userId || typeof userId !== "string") {
    throw new Error("resolveHealthContext requires an authenticated userId");
  }

  const validation = validateContextRequest(contextRequest);
  if (!validation.ok) {
    const err = new Error(validation.error);
    err.status = 400;
    throw err;
  }
  const explicitCategories = validation.categories; // Set | null

  // Preference + per-request toggle (persist when request provides a boolean)
  let preference = await prisma.aIPreference.findUnique({ where: { userId } });

  const requestToggle = typeof useHealthContext === "boolean" ? useHealthContext : null;
  const memoryEnabled = requestToggle !== null
    ? requestToggle
    : (preference?.memoryEnabled ?? true);

  if (requestToggle !== null) {
    preference = await prisma.aIPreference.upsert({
      where: { userId },
      update: { memoryEnabled: requestToggle },
      create: { userId, memoryEnabled: requestToggle },
    });
  }

  const categories = resolveCategories({
    message,
    memoryEnabled,
    explicitCategories,
    conversationId,
    attachConversation,
  });

  const healthContext = await buildHealthContext(userId, categories, conversationId);

  return {
    healthContext,
    categories,
    memoryEnabled,
    preference,
  };
}

/**
 * Load sections for the given categories. All queries scoped to userId.
 */
export async function buildHealthContext(userId, categories, conversationId = null) {
  const context = emptyHealthContext();
  const wanted = categories instanceof Set ? categories : new Set(categories || []);
  const fetches = [];

  if (wanted.has("PROFILE")) {
    fetches.push(
      getProfile(userId).then((p) => {
        if (p) {
          context.profile = p;
          context.categories.push("PROFILE");
        }
      })
    );
  }

  if (wanted.has("RECORDS")) {
    fetches.push(
      getRecentRecords(userId).then((r) => {
        if (r.length > 0) {
          context.recentRecords = r;
          context.categories.push("RECORDS");
        }
      })
    );
  }

  if (wanted.has("MEDICATIONS")) {
    fetches.push(
      Promise.all([getActiveMedications(userId), getMedicationActivity(userId)]).then(
        ([meds, activity]) => {
          if (meds.length > 0) {
            context.activeMedications = meds;
            context.categories.push("MEDICATIONS");
          }
          if (activity.length > 0) {
            context.medicationActivity = activity;
            if (!context.categories.includes("MEDICATIONS")) {
              context.categories.push("MEDICATIONS");
            }
          }
        }
      )
    );
  }

  if (wanted.has("MEASUREMENTS")) {
    fetches.push(
      getMeasurements(userId).then((m) => {
        if (m) {
          context.measurements = m;
          context.categories.push("MEASUREMENTS");
        }
      })
    );
  }

  if (wanted.has("TRENDS")) {
    fetches.push(
      getTrends(userId).then((t) => {
        if (t) {
          context.trends = t;
          context.categories.push("TRENDS");
        }
      })
    );
  }

  if (wanted.has("CONVERSATION") && conversationId) {
    fetches.push(loadConversationSlice(userId, conversationId).then((conv) => {
      if (conv) {
        context.conversation = conv;
        context.categories.push("CONVERSATION");
      }
    }));
  }

  await Promise.all(fetches);
  return context;
}

/**
 * Load conversation + recent messages scoped to userId.
 * Uses findFirst({ id, userId }) so another user's id never loads.
 */
async function loadConversationSlice(userId, conversationId) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    select: {
      id: true,
      title: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: CONVERSATION_MESSAGE_LIMIT,
        select: { role: true, content: true, createdAt: true },
      },
    },
  });

  if (!conversation) return null;

  const recentMessages = conversation.messages
    .slice()
    .reverse()
    .map((m) => ({
      role: m.role === "USER" ? "user" : "assistant",
      content: m.content,
    }));

  return {
    id: conversation.id,
    title: conversation.title,
    recentMessages,
  };
}

/**
 * Strip empty/meta sections for provider prompts while keeping data only.
 * (Providers must not treat category metadata as health data.)
 */
export function toAIContextPayload(healthContext) {
  if (!healthContext) return {};
  const payload = {};
  if (healthContext.profile) payload.profile = healthContext.profile;
  if (healthContext.recentRecords?.length) payload.recentRecords = healthContext.recentRecords;
  if (healthContext.activeMedications?.length) payload.activeMedications = healthContext.activeMedications;
  if (healthContext.medicationActivity?.length) payload.medicationActivity = healthContext.medicationActivity;
  if (healthContext.measurements) payload.measurements = healthContext.measurements;
  if (healthContext.trends) payload.trends = healthContext.trends;
  if (healthContext.conversation) {
    payload.conversation = {
      id: healthContext.conversation.id,
      title: healthContext.conversation.title,
      recentMessages: healthContext.conversation.recentMessages,
    };
  }
  return payload;
}

/** conversationContext array for providers (role/content only) */
export function toConversationContext(healthContext) {
  return healthContext?.conversation?.recentMessages || [];
}
