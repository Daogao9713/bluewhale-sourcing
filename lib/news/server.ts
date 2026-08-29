import "server-only";
import { db } from "@/lib/database/server";

export const NEWS_LIST_FIELDS =
  "id,slug,title_zh,title_ja,title_en,summary_zh,summary_ja,summary_en,cover_url,published_at,created_at,updated_at";

export const NEWS_DETAIL_FIELDS =
  `${NEWS_LIST_FIELDS},content_zh,content_ja,content_en,status`;

export async function listPublishedNews(limit = 20) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const now = new Date().toISOString();

  const { data, error } = await db()
    .from("company_news")
    .select(NEWS_LIST_FIELDS)
    .eq("status", "published")
    .or(`published_at.is.null,published_at.lte.${now}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw error;
  return data || [];
}

export async function getPublishedNewsBySlug(slug: string) {
  const now = new Date().toISOString();
  const { data, error } = await db()
    .from("company_news")
    .select(NEWS_DETAIL_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .or(`published_at.is.null,published_at.lte.${now}`)
    .maybeSingle();

  if (error) throw error;
  return data;
}
