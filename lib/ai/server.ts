import "server-only";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function env(name: string) {
  return process.env[name]?.trim() || "";
}

function providerConfig() {
  const provider = (env("AI_PROVIDER") || (env("DEEPSEEK_API_KEY") ? "deepseek" : "openai")).toLowerCase();

  if (provider === "deepseek") {
    return {
      provider,
      apiKey: env("DEEPSEEK_API_KEY") || env("OPENAI_API_KEY"),
      model: env("DEEPSEEK_MODEL") || env("OPENAI_MODEL") || "deepseek-chat",
      baseUrl: (env("DEEPSEEK_BASE_URL") || "https://api.deepseek.com").replace(/\/$/, ""),
    };
  }

  return {
    provider: "openai",
    apiKey: env("OPENAI_API_KEY"),
    model: env("OPENAI_MODEL"),
    baseUrl: (env("OPENAI_BASE_URL") || "https://api.openai.com/v1").replace(/\/$/, ""),
  };
}

export async function chat(messages: ChatMessage[], maxTokens = 900) {
  const cfg = providerConfig();
  if (!cfg.apiKey || !cfg.model) {
    throw new Error(`${cfg.provider} AI is not configured.`);
  }

  // Use the OpenAI-compatible Chat Completions contract for both providers.
  // This avoids binding the application layer to a provider-specific SDK.
  const url = `${cfg.baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.35,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[ai:provider]", {
        provider: cfg.provider,
        status: response.status,
        error: payload?.error?.message || "provider request failed",
      });
      throw new Error(`AI provider request failed (${response.status}).`);
    }

    const text = payload?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("AI provider returned an empty response.");
    }

    return { text: text.trim(), provider: cfg.provider };
  } finally {
    clearTimeout(timeout);
  }
}
