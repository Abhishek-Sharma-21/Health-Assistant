import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { prisma } from "../lib/db.js";
import { validateConversationOwnership } from "../ai/aiSafety.js";

const router = Router();

// GET /api/ai/conversations — list user's conversations
router.get("/", protect, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
    res.json({ conversations });
  } catch (err) {
    console.error("List conversations error:", err);
    res.status(500).json({ error: "Failed to load conversations." });
  }
});

// GET /api/ai/conversations/:id — get one conversation with messages
router.get("/:id", protect, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            contextUsed: true,
            createdAt: true,
          },
        },
      },
    });

    const ownership = validateConversationOwnership(conversation, req.user.id);
    if (!ownership.authorized) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    res.json({ conversation });
  } catch (err) {
    console.error("Get conversation error:", err);
    res.status(500).json({ error: "Failed to load conversation." });
  }
});

// POST /api/ai/conversations — create a new conversation
router.post("/", protect, async (req, res) => {
  const { title } = req.body;
  try {
    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user.id,
        title: (title || "New Conversation").trim().slice(0, 100),
      },
    });
    res.status(201).json({ conversation });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Failed to create conversation." });
  }
});

// PATCH /api/ai/conversations/:id — rename a conversation
router.patch("/:id", protect, async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "Title is required." });
  }
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });

    const ownership = validateConversationOwnership(conversation, req.user.id);
    if (!ownership.authorized) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    const updated = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { title: title.trim().slice(0, 100) },
    });
    res.json({ conversation: updated });
  } catch (err) {
    console.error("Rename conversation error:", err);
    res.status(500).json({ error: "Failed to rename conversation." });
  }
});

// DELETE /api/ai/conversations/:id — delete a conversation + messages
router.delete("/:id", protect, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });

    const ownership = validateConversationOwnership(conversation, req.user.id);
    if (!ownership.authorized) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    // Messages cascade-deleted via onDelete: Cascade
    await prisma.conversation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete conversation error:", err);
    res.status(500).json({ error: "Failed to delete conversation." });
  }
});

// ─── AI Preferences ────────────────────────────────────────────────────────

// GET /api/ai/conversations/preferences/me — get user's AI preferences
router.get("/preferences/me", protect, async (req, res) => {
  try {
    let pref = await prisma.aIPreference.findUnique({
      where: { userId: req.user.id },
    });
    if (!pref) {
      pref = await prisma.aIPreference.create({
        data: { userId: req.user.id },
      });
    }
    res.json({ preference: pref });
  } catch (err) {
    console.error("Get preferences error:", err);
    res.status(500).json({ error: "Failed to load preferences." });
  }
});

// PATCH /api/ai/conversations/preferences/me — update user's AI preferences
router.patch("/preferences/me", protect, async (req, res) => {
  const { preferredLanguage, responseStyle, preferredUnit, memoryEnabled } = req.body;
  try {
    const data = {};
    if (preferredLanguage !== undefined) data.preferredLanguage = String(preferredLanguage).slice(0, 10);
    if (responseStyle !== undefined && ["CONCISE", "BALANCED", "DETAILED"].includes(responseStyle)) {
      data.responseStyle = responseStyle;
    }
    if (preferredUnit !== undefined && ["METRIC", "IMPERIAL"].includes(preferredUnit)) {
      data.preferredUnit = preferredUnit;
    }
    if (memoryEnabled !== undefined) data.memoryEnabled = Boolean(memoryEnabled);

    const pref = await prisma.aIPreference.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    });
    res.json({ preference: pref });
  } catch (err) {
    console.error("Update preferences error:", err);
    res.status(500).json({ error: "Failed to update preferences." });
  }
});

export default router;
