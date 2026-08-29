import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";

type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

type ModelProvider = "deepseek" | "openai";

function extractOutputText(response: any, provider: ModelProvider) {
  if (provider === "deepseek") {
    const text = response?.choices?.[0]?.message?.content;
    if (typeof text === "string") return text.trim();
    if (Array.isArray(text)) {
      return text
        .map((part) => (typeof part?.text === "string" ? part.text : ""))
        .join("")
        .trim();
    }
    return "";
  }

  if (typeof response?.output_text === "string") {
    return response.output_text;
  }

  const chunks: string[] = [];

  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (
        (content?.type === "output_text" || content?.type === "text") &&
        typeof content?.text === "string"
      ) {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

function compact(value: unknown, limit = 12000) {
  const text = JSON.stringify(value ?? [], null, 2);
  return text.length > limit ? `${text.slice(0, limit)}\n...[truncated]` : text;
}

function resolveModelConfig() {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const deepseekModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const deepseekBaseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || "gpt-5.6-luna";

  if (deepseekKey) {
    return {
      provider: "deepseek" as const,
      apiKey: deepseekKey,
      model: deepseekModel,
      baseUrl: deepseekBaseUrl,
      endpoint: "/v1/chat/completions",
      requestBody: (messages: Array<{ role: string; content: string }>) => ({
        model: deepseekModel,
        messages,
        max_tokens: 1400,
        temperature: 0.7,
      }),
    };
  }

  if (openaiKey) {
    return {
      provider: "openai" as const,
      apiKey: openaiKey,
      model: openaiModel,
      baseUrl: "https://api.openai.com/v1",
      endpoint: "/responses",
      requestBody: (messages: Array<{ role: string; content: string }>) => ({
        model: openaiModel,
        input: messages,
        reasoning: { effort: "low" },
        max_output_tokens: 1400,
      }),
    };
  }

  return null;
}

export async function POST(req: Request) {
  const auth = verifyWorkspaceKey(req);

  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const message = String(body?.message || "").trim();
    const history = (Array.isArray(body?.history) ? body.history : [])
      .filter(
        (item: AgentMessage) =>
          (item?.role === "user" || item?.role === "assistant") &&
          typeof item?.content === "string"
      )
      .slice(-8);

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required." },
        { status: 400 }
      );
    }

    const modelConfig = resolveModelConfig();

    if (!modelConfig) {
      return NextResponse.json(
        {
          success: false,
          error:
            "DEEPSEEK_API_KEY or OPENAI_API_KEY is not configured.",
        },
        { status: 503 }
      );
    }

    const [projects, suppliers, rfqs, inquiries] = await Promise.all([
      supabaseAdmin
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40),
      supabaseAdmin
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60),
      supabaseAdmin
        .from("rfqs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60),
      supabaseAdmin
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const dbError =
      projects.error || suppliers.error || rfqs.error || inquiries.error;

    if (dbError) {
      console.error("[agent:db]", dbError);
      return NextResponse.json(
        { success: false, error: "Could not load sourcing data." },
        { status: 500 }
      );
    }

    const businessContext = `
PROJECTS:
${compact(projects.data, 9000)}

SUPPLIERS:
${compact(suppliers.data, 12000)}

RFQS:
${compact(rfqs.data, 10000)}

RECENT INQUIRIES:
${compact(inquiries.data, 7000)}
`;

    const input = [
      {
        role: "system",
        content: `
You are Blue Whale Sourcing Copilot, an internal procurement analyst for a China-focused global sourcing business.

Your job is to help the operator:
- understand incoming sourcing requests,
- compare projects, suppliers and RFQs,
- identify missing specifications,
- identify commercial and supply-chain risks,
- recommend concrete next actions,
- draft RFQ structures and supplier comparison criteria.

Rules:
1. Treat the supplied database context as the only source of truth for internal records.
2. Never invent a supplier, quote, certification, lead time or price that is not in the context.
3. Clearly distinguish facts from recommendations.
4. If data is missing, say exactly what is missing.
5. Prefer concise business analysis with actionable next steps.
6. Do not expose secrets, environment variables, internal keys or implementation details.
7. Reply in the language used by the operator unless asked otherwise.

CURRENT DATABASE CONTEXT:
${businessContext}
        `.trim(),
      },
      ...history.map((item: AgentMessage) => ({
        role: item.role,
        content: item.content.slice(0, 2500),
      })),
      {
        role: "user",
        content: message.slice(0, 5000),
      },
    ];

    const response = await fetch(
      `${modelConfig.baseUrl}${modelConfig.endpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${modelConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modelConfig.requestBody(input)),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[agent:model]", result);
      return NextResponse.json(
        { success: false, error: "AI request failed." },
        { status: 502 }
      );
    }

    const reply = extractOutputText(result, modelConfig.provider);

    return NextResponse.json({
      success: true,
      reply: reply || "No response generated.",
      model: modelConfig.model,
      provider: modelConfig.provider,
    });
  } catch (error) {
    console.error("[agent]", error);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}
