import { NextResponse } from "next/server";
import { db } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let database = "unknown";

  try {
    const { error } = await db().from("company_news").select("id", { head: true, count: "exact" });
    database = error ? "error" : "ok";
  } catch {
    database = "error";
  }

  const aiProvider = (process.env.AI_PROVIDER || (process.env.DEEPSEEK_API_KEY ? "deepseek" : "openai")).toLowerCase();
  const aiConfigured =
    aiProvider === "deepseek"
      ? Boolean(process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY)
      : Boolean(process.env.OPENAI_API_KEY);

  return NextResponse.json({
    status: database === "ok" ? "ok" : "degraded",
    database,
    ai: { provider: aiProvider, configured: aiConfigured },
    latency_ms: Date.now() - started,
    time: new Date().toISOString(),
  });
}
