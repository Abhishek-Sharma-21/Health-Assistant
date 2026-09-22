// ─── AI Provider Factory ───────────────────────────────────────────────────
// Selects and returns the configured AI provider.
// Provider-agnostic: no company-specific logic here.
// ────────────────────────────────────────────────────────────────────────────

import { DummyAIProvider } from "./providers/dummyAIProvider.js";
import { ConfiguredAIProvider } from "./providers/configuredAIProvider.js";

let _instance = null;

export function getAIProvider() {
  if (_instance) return _instance;

  const providerType = (process.env.AI_PROVIDER || "dummy").toLowerCase().trim();

  if (providerType === "configured" || providerType === "production") {
    const provider = new ConfiguredAIProvider();
    if (provider.isConfigured) {
      console.log(`[AI] Provider: CONFIGURED (${provider.model})`);
      _instance = provider;
      return _instance;
    }
    console.warn("[AI] AI_PROVIDER=configured but AI_API_KEY/AI_BASE_URL not set. Falling back to DUMMY.");
  }

  console.log("[AI] Provider: DUMMY (development mode)");
  _instance = new DummyAIProvider();
  return _instance;
}

export function resetAIProvider() {
  _instance = null;
}

export function getProviderInfo() {
  const provider = getAIProvider();
  return {
    name: provider.name,
    isConfigured: provider.isConfigured ?? false,
    model: provider.model || "N/A",
  };
}
