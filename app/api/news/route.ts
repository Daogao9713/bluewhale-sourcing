import { NextResponse } from "next/server";
import { listPublishedNews } from "@/lib/news/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = Number(url.searchParams.get("limit") || "20");
    const news = await listPublishedNews(Number.isFinite(parsed) ? parsed : 20);

    return NextResponse.json(
      { success: true, news, generated_at: new Date().toISOString() },
      {
        headers: {
          // During active CMS publishing, revalidate quickly instead of serving a stale list.
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[news:get]", {
      message: error instanceof Error ? error.message : String(error),
      code: typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "",
    });
    return NextResponse.json(
      { success: false, error: "Failed to load news." },
      { status: 500 }
    );
  }
}
