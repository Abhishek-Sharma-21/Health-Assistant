// ─── AI Credential Pool Manager ────────────────────────────────────────────
// Loads, caches, and manages AI credentials from the database.
// Provider-agnostic: no company-specific logic.
// ────────────────────────────────────────────────────────────────────────────

import { prisma } from "../lib/db.js";

const CACHE_TTL_MS = 60_000;
let _cache = null;
let _cacheTime = 0;

export async function loadCredentials() {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL_MS) return _cache;

  const credentials = await prisma.aICredential.findMany({
    where: { enabled: true, status: "ACTIVE" },
    include: { tasks: { select: { task: true } } },
    orderBy: { priority: "asc" },
  });

  _cache = credentials.map((c) => ({
    id: c.id,
    name: c.name,
    provider: c.provider,
    model: c.model,
    apiKey: c.apiKey,
    baseUrl: c.baseUrl,
    priority: c.priority,
    status: c.status,
    routingStrategy: c.routingStrategy,
    tasks: c.tasks.map((t) => t.task),
    lastUsedAt: c.lastUsedAt,
    lastErrorAt: c.lastErrorAt,
    failureCount: c.failureCount,
    successCount: c.successCount,
    roundRobinIndex: c.roundRobinIndex,
  }));

  _cacheTime = now;
  return _cache;
}

export function invalidateCache() {
  _cache = null;
  _cacheTime = 0;
}

export async function getCredentialsForTask(task) {
  const all = await loadCredentials();
  return all.filter((c) => c.tasks.includes(task));
}

export async function recordCredentialUsage(credentialId, success) {
  try {
    const data = success
      ? { lastUsedAt: new Date(), $inc: { successCount: 1 }, failureCount: 0 }
      : { lastErrorAt: new Date(), $inc: { failureCount: 1 } };

    if (success) {
      await prisma.aICredential.update({
        where: { id: credentialId },
        data: { lastUsedAt: new Date(), successCount: { increment: 1 }, failureCount: 0 },
      });
    } else {
      await prisma.aICredential.update({
        where: { id: credentialId },
        data: { lastErrorAt: new Date(), failureCount: { increment: 1 } },
      });
    }
    invalidateCache();
  } catch (_) {}
}

export async function incrementRoundRobin(credentialId) {
  try {
    await prisma.aICredential.update({
      where: { id: credentialId },
      data: { roundRobinIndex: { increment: 1 }, lastUsedAt: new Date() },
    });
    invalidateCache();
  } catch (_) {}
}

export function maskApiKey(key) {
  if (!key || key.length < 8) return "********";
  return "********" + key.slice(-4);
}

export async function getAllCredentials() {
  const credentials = await prisma.aICredential.findMany({
    include: { tasks: { select: { task: true } } },
    orderBy: { priority: "asc" },
  });
  return credentials.map((c) => ({
    ...c,
    apiKey: maskApiKey(c.apiKey),
    tasks: c.tasks.map((t) => t.task),
  }));
}

export async function getCredentialById(id) {
  const c = await prisma.aICredential.findUnique({
    where: { id },
    include: { tasks: { select: { task: true } } },
  });
  if (!c) return null;
  return { ...c, apiKey: maskApiKey(c.apiKey), tasks: c.tasks.map((t) => t.task) };
}

export async function createCredential(data) {
  const { name, provider, model, apiKey, baseUrl, enabled, priority, routingStrategy, tasks } = data;
  const credential = await prisma.aICredential.create({
    data: {
      name,
      provider,
      model,
      apiKey,
      baseUrl: baseUrl || null,
      enabled: enabled ?? true,
      priority: priority ?? 10,
      routingStrategy: routingStrategy || "PRIORITY",
      tasks: {
        create: (tasks || []).map((t) => ({ task: t })),
      },
    },
    include: { tasks: { select: { task: true } } },
  });
  invalidateCache();
  return { ...credential, apiKey: maskApiKey(credential.apiKey), tasks: credential.tasks.map((t) => t.task) };
}

export async function updateCredential(id, data) {
  const existing = await prisma.aICredential.findUnique({ where: { id } });
  if (!existing) return null;

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.provider !== undefined) updateData.provider = data.provider;
  if (data.model !== undefined) updateData.model = data.model;
  if (data.apiKey !== undefined && data.apiKey !== maskApiKey(existing.apiKey)) {
    updateData.apiKey = data.apiKey;
  }
  if (data.baseUrl !== undefined) updateData.baseUrl = data.baseUrl || null;
  if (data.enabled !== undefined) updateData.enabled = data.enabled;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.routingStrategy !== undefined) updateData.routingStrategy = data.routingStrategy;

  // Update tasks if provided
  if (data.tasks !== undefined) {
    await prisma.aICredentialTask.deleteMany({ where: { credentialId: id } });
    if (data.tasks.length > 0) {
      await prisma.aICredentialTask.createMany({
        data: data.tasks.map((t) => ({ credentialId: id, task: t })),
      });
    }
  }

  const credential = await prisma.aICredential.update({
    where: { id },
    data: updateData,
    include: { tasks: { select: { task: true } } },
  });
  invalidateCache();
  return { ...credential, apiKey: maskApiKey(credential.apiKey), tasks: credential.tasks.map((t) => t.task) };
}

export async function deleteCredential(id) {
  const existing = await prisma.aICredential.findUnique({ where: { id } });
  if (!existing) return null;
  await prisma.aICredential.delete({ where: { id } });
  invalidateCache();
  return true;
}

export async function getRawCredentialById(id) {
  return prisma.aICredential.findUnique({ where: { id } });
}
