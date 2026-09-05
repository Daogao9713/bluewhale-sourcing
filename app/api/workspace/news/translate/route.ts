import { NextResponse } from "next/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";
import { chat } from "@/lib/ai/server";

export async function POST(req: Request) {
  const auth = verifyWorkspaceKey(req);
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const source = String(body?.source || "").trim().slice(0, 30000);
    const target = body?.target === "ja" ? "Japanese" : body?.target === "en" ? "English" : "";

    if (!source || !target) {
      return NextResponse.json({ success: false, error: "Source and target are required." }, { status: 400 });
    }

    const result = await chat([
      {
        role: "system",
        content: `Translate corporate news from Chinese into ${target}. Preserve facts, names, numbers and the exact marker ---BLUEWHALE_FIELD---. Use natural professional corporate language. Do not add facts or markdown fences. Return translation only.`,
      },
      { role: "user", content: source },
    ], 5000);

    return NextResponse.json({ success: true, text: result.text, provider: result.provider });
  } catch (error: unknown) {
    console.error(
      "[cms:translate]",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Translation failed.",
    }, { status: 500 });
  }
}
