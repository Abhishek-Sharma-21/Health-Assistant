import { prisma } from "../lib/db.js";
import {
  resolveHealthContext,
  toAIContextPayload,
  toConversationContext,
} from "./healthContextContract.js";
import { routeTask } from "../ai/taskRouter.js";

const RECENT_MESSAGE_LIMIT = 20;

export async function handleChat(userId, message, conversationId = null, task = "CHAT", options = {}) {
  if (!userId) {
    throw new Error("handleChat requires an authenticated userId");
  }

  let conversation = null;

  // Load conversation — always scoped to authenticated user
  if (conversationId) {
    conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      // Explicit ownership failure — never silently create a replacement thread
      const err = new Error("Access denied.");
      err.status = 403;
      throw err;
    }
  }

  if (!conversationId) {
    conversation = await prisma.conversation.create({
      data: { userId, title: truncateTitle(message) },
    });
    conversationId = conversation.id;
  }

  // Single health-context contract (selection + isolation + preference toggle)
  const {
    healthContext,
    categories,
    memoryEnabled,
    preference,
  } = await resolveHealthContext({
    userId,
    message,
    useHealthContext: options.useHealthContext,
    contextRequest: options.contextRequest ?? null,
    conversationId,
    attachConversation: true,
  });

  const aiContext = toAIContextPayload(healthContext);
  const conversationContext = toConversationContext(healthContext);

  const result = await routeTask(task, {
    message,
    context: aiContext,
    conversationContext,
    preference: memoryEnabled ? preference : null,
  });

  const categoriesUsed = [...categories].filter((c) => {
    if (c === "PROFILE") return !!healthContext.profile;
    if (c === "RECORDS") return healthContext.recentRecords.length > 0;
    if (c === "MEDICATIONS") {
      return healthContext.activeMedications.length > 0 || healthContext.medicationActivity.length > 0;
    }
    if (c === "MEASUREMENTS") return !!healthContext.measurements;
    if (c === "TRENDS") return !!healthContext.trends;
    if (c === "CONVERSATION") return !!healthContext.conversation;
    return false;
  });

  const storedAt = Date.now();

  await prisma.conversationMessage.create({
    data: {
      conversationId,
      role: "USER",
      content: message,
      contextUsed: categoriesUsed.join(",") || null,
      createdAt: new Date(storedAt),
    },
  });

  await prisma.conversationMessage.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content: result.text,
      contextUsed: result.provider || null,
      createdAt: new Date(storedAt + 1),
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  if (result.usage) {
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId,
          conversationId,
          credentialId: result.credentialId || null,
          task: task || null,
          provider: result.provider || "UNKNOWN",
          model: result.model || null,
          inputTokens: result.usage.inputTokens || null,
          outputTokens: result.usage.outputTokens || null,
          totalTokens: result.usage.totalTokens || null,
          durationMs: result.durationMs || null,
          status: "SUCCESS",
        },
      });
    } catch (_) {}
  }

  return {
    text: result.text,
    provider: result.provider,
    credentialId: result.credentialId || null,
    task,
    categoriesUsed,
    conversationId,
    // Expose resolved context meta for debugging/tests (not sent to client unless needed)
    contextEnabled: memoryEnabled,
  };
}

// Re-export for routes that need conversation message paging helpers
export async function getRecentMessages(conversationId) {
  const recentMessages = await prisma.conversationMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: RECENT_MESSAGE_LIMIT,
    select: { role: true, content: true },
  });
  return recentMessages.reverse();
}

function truncateTitle(text) {
  const clean = text.replace(/[^\w\s?.,!]/g, "").trim();
  if (clean.length <= 50) return clean;
  return clean.slice(0, 47) + "...";
}
