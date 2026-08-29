import { NextResponse } from "next/server";
import { db } from "@/lib/database/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";

const NEWS_FIELDS = `
  id,slug,title_zh,title_ja,title_en,
  summary_zh,summary_ja,summary_en,
  content_zh,content_ja,content_en,
  cover_url,status,published_at,created_at,updated_at
`;

function deny(req: Request) {
  const auth = verifyWorkspaceKey(req);
  return auth.ok ? null : NextResponse.json(
    { success: false, error: auth.error },
    { status: auth.status }
  );
}

function text(value: unknown, max = 100000) {
  return String(value ?? "").trim().slice(0, max);
}

function slugify(value: unknown) {
  return text(value, 120).toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nullable(value: unknown, max?: number) {
  const out = text(value, max);
  return out || null;
}

function normalizePublishedAt(value: unknown, status: string) {
  if (status !== "published") return value ? new Date(String(value)).toISOString() : null;

  // If the editor sends no publish time, publishing means "now".
  if (!value) return new Date().toISOString();

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();

  // datetime-local values are converted by the browser/runtime into a concrete ISO instant.
  return parsed.toISOString();
}

function makePayload(body: any) {
  const status = ["draft", "published", "archived"].includes(body?.status)
    ? body.status
    : "draft";

  return {
    slug: slugify(body?.slug),
    title_zh: text(body?.title_zh, 240),
    title_ja: text(body?.title_ja, 240),
    title_en: text(body?.title_en, 240),
    summary_zh: nullable(body?.summary_zh, 1200),
    summary_ja: nullable(body?.summary_ja, 1200),
    summary_en: nullable(body?.summary_en, 1200),
    content_zh: nullable(body?.content_zh),
    content_ja: nullable(body?.content_ja),
    content_en: nullable(body?.content_en),
    cover_url: nullable(body?.cover_url, 2000),
    status,
    published_at: normalizePublishedAt(body?.published_at, status),
    updated_at: new Date().toISOString(),
  };
}

async function revision(newsId: string, snapshot: any) {
  const { error } = await db().from("company_news_revisions").insert({
    news_id: newsId,
    snapshot,
  });
  if (error) console.warn("[cms:revision]", error.message);
}

export async function GET(req: Request) {
  const blocked = deny(req);
  if (blocked) return blocked;

  const url = new URL(req.url);
  const q = text(url.searchParams.get("q"), 100);
  const status = text(url.searchParams.get("status"), 20);

  let query = db()
    .from("company_news")
    .select(NEWS_FIELDS)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (status && ["draft", "published", "archived"].includes(status)) query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/[%(),]/g, " ");
    query = query.or(`title_zh.ilike.%${safe}%,title_ja.ilike.%${safe}%,title_en.ilike.%${safe}%,slug.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[cms:list]", error);
    return NextResponse.json({ success: false, error: "Failed to load news." }, { status: 500 });
  }

  return NextResponse.json({ success: true, news: data || [] });
}

export async function POST(req: Request) {
  const blocked = deny(req);
  if (blocked) return blocked;

  const body = await req.json();
  const item = makePayload(body);
  if (!item.slug || !item.title_zh) {
    return NextResponse.json({ success: false, error: "Slug and Chinese title are required." }, { status: 400 });
  }

  const { data, error } = await db().from("company_news").insert(item).select(NEWS_FIELDS).single();
  if (error) {
    console.error("[cms:create]", error);
    return NextResponse.json(
      { success: false, error: error.code === "23505" ? "Slug already exists." : "Failed to create news." },
      { status: error.code === "23505" ? 409 : 500 }
    );
  }

  await revision(data.id, { event: "created", ...data });
  return NextResponse.json({ success: true, news: data });
}

export async function PATCH(req: Request) {
  const blocked = deny(req);
  if (blocked) return blocked;

  const body = await req.json();
  const id = text(body?.id, 80);
  if (!id) return NextResponse.json({ success: false, error: "News id is required." }, { status: 400 });

  const item = makePayload(body);
  const { data: before } = await db().from("company_news").select(NEWS_FIELDS).eq("id", id).maybeSingle();
  const { data, error } = await db().from("company_news").update(item).eq("id", id).select(NEWS_FIELDS).single();

  if (error) {
    console.error("[cms:update]", error);
    return NextResponse.json({ success: false, error: "Failed to update news." }, { status: 500 });
  }

  if (before) await revision(id, { event: "updated", ...before });
  return NextResponse.json({
    success: true,
    news: data,
    publication: {
      visible_now: data.status === "published" && (!data.published_at || new Date(data.published_at) <= new Date()),
      published_at: data.published_at,
      server_now: new Date().toISOString(),
    },
  });
}

export async function DELETE(req: Request) {
  const blocked = deny(req);
  if (blocked) return blocked;

  const id = text(new URL(req.url).searchParams.get("id"), 80);
  if (!id) return NextResponse.json({ success: false, error: "News id is required." }, { status: 400 });

  const { data: before } = await db().from("company_news").select(NEWS_FIELDS).eq("id", id).maybeSingle();
  if (before) await revision(id, { event: "deleted", ...before });

  const { error } = await db().from("company_news").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: "Failed to delete news." }, { status: 500 });

  return NextResponse.json({ success: true });
}
