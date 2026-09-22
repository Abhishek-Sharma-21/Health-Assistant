import { Router } from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import {
  getAllCredentials,
  getCredentialById,
  createCredential,
  updateCredential,
  deleteCredential,
} from "../ai/credentialPool.js";
import { prisma } from "../lib/db.js";

const router = Router();

router.use(protect, requireAdmin);

// @route   GET /api/admin/ai-credentials
// @desc    List all AI credentials (masked API keys)
// @access  Admin
router.get("/", async (req, res) => {
  try {
    const credentials = await getAllCredentials();
    res.json({ credentials });
  } catch (err) {
    console.error("List AI Credentials Error:", err);
    res.status(500).json({ error: "Failed to load AI credentials." });
  }
});

// @route   GET /api/admin/ai-credentials/:id
// @desc    Get single AI credential
// @access  Admin
router.get("/:id", async (req, res) => {
  try {
    const credential = await getCredentialById(req.params.id);
    if (!credential) return res.status(404).json({ error: "Credential not found." });
    res.json({ credential });
  } catch (err) {
    console.error("Get AI Credential Error:", err);
    res.status(500).json({ error: "Failed to load credential." });
  }
});

// @route   POST /api/admin/ai-credentials
// @desc    Create AI credential
// @access  Admin
router.post("/", async (req, res) => {
  try {
    const { name, provider, model, apiKey, baseUrl, enabled, priority, routingStrategy, tasks } = req.body;

    if (!name || !provider || !model || !apiKey) {
      return res.status(400).json({ error: "name, provider, model, and apiKey are required." });
    }

    if (tasks && !Array.isArray(tasks)) {
      return res.status(400).json({ error: "tasks must be an array." });
    }

    const validTasks = ["CHAT", "SYMPTOM_ANALYSIS", "HEALTH_SUMMARY", "TREND_SUMMARY", "RECORD_SUMMARY", "MEDICATION_INFORMATION"];
    if (tasks) {
      for (const t of tasks) {
        if (!validTasks.includes(t)) {
          return res.status(400).json({ error: `Invalid task: ${t}. Valid tasks: ${validTasks.join(", ")}` });
        }
      }
    }

    const credential = await createCredential({ name, provider, model, apiKey, baseUrl, enabled, priority, routingStrategy, tasks });
    res.status(201).json({ credential });
  } catch (err) {
    console.error("Create AI Credential Error:", err);
    res.status(500).json({ error: "Failed to create credential." });
  }
});

// @route   PUT /api/admin/ai-credentials/:id
// @desc    Update AI credential
// @access  Admin
router.put("/:id", async (req, res) => {
  try {
    const { name, provider, model, apiKey, baseUrl, enabled, priority, routingStrategy, tasks } = req.body;

    if (tasks && !Array.isArray(tasks)) {
      return res.status(400).json({ error: "tasks must be an array." });
    }

    const validTasks = ["CHAT", "SYMPTOM_ANALYSIS", "HEALTH_SUMMARY", "TREND_SUMMARY", "RECORD_SUMMARY", "MEDICATION_INFORMATION"];
    if (tasks) {
      for (const t of tasks) {
        if (!validTasks.includes(t)) {
          return res.status(400).json({ error: `Invalid task: ${t}. Valid tasks: ${validTasks.join(", ")}` });
        }
      }
    }

    const credential = await updateCredential(req.params.id, { name, provider, model, apiKey, baseUrl, enabled, priority, routingStrategy, tasks });
    if (!credential) return res.status(404).json({ error: "Credential not found." });
    res.json({ credential });
  } catch (err) {
    console.error("Update AI Credential Error:", err);
    res.status(500).json({ error: "Failed to update credential." });
  }
});

// @route   DELETE /api/admin/ai-credentials/:id
// @desc    Delete AI credential
// @access  Admin
router.delete("/:id", async (req, res) => {
  try {
    const result = await deleteCredential(req.params.id);
    if (!result) return res.status(404).json({ error: "Credential not found." });
    res.json({ message: "Credential deleted." });
  } catch (err) {
    console.error("Delete AI Credential Error:", err);
    res.status(500).json({ error: "Failed to delete credential." });
  }
});

// @route   GET /api/admin/ai-usage
// @desc    Get AI usage logs (paginated)
// @access  Admin
router.get("/usage/logs", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.aIUsageLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          provider: true,
          model: true,
          task: true,
          status: true,
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          durationMs: true,
          createdAt: true,
        },
      }),
      prisma.aIUsageLog.count(),
    ]);

    res.json({ logs, total, page, limit });
  } catch (err) {
    console.error("AI Usage Logs Error:", err);
    res.status(500).json({ error: "Failed to load usage logs." });
  }
});

export default router;
