import { prisma } from "../lib/db.js";
import { selectContext } from "./contextSelector.js";
import { buildSafeContext } from "./healthContextService.js";
import { routeTask } from "../ai/taskRouter.js";

const RECENT_MESSAGE_LIMIT = 20;

export async function handleChat(userId, message, conversationId = null, task = "CHAT") {
  let conversation = null;
  let recentMessages = [];
  let preference = null;

  // Load or create conversation
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation || conversation.userId !== userId) {
      conversation = null;
      conversationId = null;
    }
  }

  if (!conversationId) {
    conversation = await prisma.conversation.create({
      data: { userId, title: truncateTitle(message) },
    });
    conversationId = conversation.id;
  }

  // Load recent messages for short-term context
  recentMessages = await prisma.conversationMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: RECENT_MESSAGE_LIMIT,
    select: { role: true, content: true },
  });
  recentMessages.reverse();

  // Load AI preferences (if memory enabled)
  preference = await prisma.aIPreference.findUnique({
    where: { userId },
  });

  const memoryEnabled = preference?.memoryEnabled ?? true;

  // Select health context categories
  const categories = selectContext(message);

  // Build health context (only if memory enabled)
  const healthContext = memoryEnabled
    ? await buildSafeContext(userId, categories)
    : {};

  // Build conversation context for the AI
  const conversationContext = recentMessages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  // Route task to appropriate credential and generate response
  const result = await routeTask(task, {
    message,
    context: healthContext,
    conversationContext,
    preference: memoryEnabled ? preference : null,
  });

  // Store user message
  await prisma.conversationMessage.create({
    data: {
      conversationId,
      role: "USER",
      content: message,
      contextUsed: [...categories].join(",") || null,
    },
  });

  // Store assistant response
  await prisma.conversationMessage.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content: result.text,
      contextUsed: result.provider || null,
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Log usage if available
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
    categoriesUsed: [...categories],
    conversationId,
  };
}

function truncateTitle(text) {
  const clean = text.replace(/[^\w\s?.,!]/g, "").trim();
  if (clean.length <= 50) return clean;
  return clean.slice(0, 47) + "...";
}
