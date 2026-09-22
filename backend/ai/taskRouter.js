// ─── AI Task Router ────────────────────────────────────────────────────────
// Routes AI tasks to credentials using configured strategies.
// Provider-agnostic: no company-specific logic.
// ────────────────────────────────────────────────────────────────────────────

import { getCredentialsForTask, recordCredentialUsage, incrementRoundRobin, getRawCredentialById } from "./credentialPool.js";
import { ConfiguredAIProvider, AIProviderError } from "./providers/configuredAIProvider.js";
import { DummyAIProvider } from "./providers/dummyAIProvider.js";

const MAX_FAILOVER_ATTEMPTS = 3;

export async function routeTask(task, request) {
  const providerMode = (process.env.AI_PROVIDER || "dummy").toLowerCase().trim();

  if (providerMode === "dummy") {
    const provider = new DummyAIProvider();
    const result = await provider.generateResponse(request);
    return { ...result, credentialId: null, task };
  }

  const credentials = await getCredentialsForTask(task);
  if (credentials.length === 0) {
    throw new AIProviderError("AI_NO_CREDENTIALS", `No AI credentials configured for task: ${task}`, 503);
  }

  // Determine strategy from the first credential (all creds for a task share strategy)
  const strategy = credentials[0].routingStrategy || "PRIORITY";

  let lastError = null;
  const attempts = Math.min(credentials.length, MAX_FAILOVER_ATTEMPTS);

  for (let i = 0; i < attempts; i++) {
    const credential = selectCredential(credentials, strategy, i);
    if (!credential) break;

    try {
      const provider = new ConfiguredAIProvider({
        apiKey: credential.apiKey,
        baseUrl: credential.baseUrl,
        model: credential.model,
      });

      const result = await provider.generateResponse(request);

      await recordCredentialUsage(credential.id, true);

      return {
        ...result,
        credentialId: credential.id,
        task,
      };
    } catch (err) {
      lastError = err;
      await recordCredentialUsage(credential.id, false);

      if (!isRetryableError(err)) break;
    }
  }

  throw lastError || new AIProviderError("AI_ALL_CREDENTIALS_FAILED", "All AI credentials failed for this task.", 503);
}

function selectCredential(credentials, strategy, attemptIndex) {
  if (strategy === "PRIORITY") {
    return credentials[attemptIndex] || null;
  }

  if (strategy === "ROUND_ROBIN") {
    const sorted = [...credentials].sort((a, b) => (a.roundRobinIndex || 0) - (b.roundRobinIndex || 0));
    const selected = sorted[0];
    if (selected) incrementRoundRobin(selected.id);
    return selected;
  }

  if (strategy === "FAILOVER") {
    return credentials[attemptIndex] || null;
  }

  return credentials[0] || null;
}

function isRetryableError(err) {
  const code = err?.code || "";
  return ["AI_RATE_LIMIT", "AI_TIMEOUT", "AI_UNAVAILABLE"].includes(code);
}
