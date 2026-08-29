import { notFound } from "next/navigation";
import CompanySiteLayout from "@/components/site/CompanySiteLayout";
import NewsArticle from "@/components/site/NewsArticle";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("company_news")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .single();

  if (error || !data) notFound();

  return (
    <CompanySiteLayout>
      <NewsArticle article={data} />
    </CompanySiteLayout>
  );
}
