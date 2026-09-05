import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import XingyueyangHeader from "@/components/XingyueyangHeader";
import { getPublishedNewsBySlug } from "@/lib/news/server";

export const dynamic = "force-dynamic";

type NewsData = {
  title_zh?: string | null;
  title_en?: string | null;
  title_ja?: string | null;
  summary_zh?: string | null;
  summary_en?: string | null;
  summary_ja?: string | null;
  content_zh?: string | null;
  content_en?: string | null;
  content_ja?: string | null;
  cover_url?: string | null;
  published_at?: string | null;
};

function pickTitle(n: NewsData) {
  return n?.title_zh || n?.title_en || n?.title_ja || "公司动态";
}

function pickSummary(n: NewsData) {
  return n?.summary_zh || n?.summary_en || n?.summary_ja || "";
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const n = await getPublishedNewsBySlug(slug) as NewsData | null;

  if (!n) notFound();

  return (
    <main className="min-h-screen bg-white">
      <XingyueyangHeader />
      <article className="mx-auto max-w-4xl px-5 py-16">
        <Link href="/news" className="text-sm text-slate-500">← 公司动态</Link>
        <div className="xy-glass-soft mt-12 inline-flex rounded-full px-4 py-2 text-xs font-semibold tracking-[.15em] text-amber-600">
          {n.published_at ? new Date(n.published_at).toLocaleDateString("zh-CN") : "XINGYUEYANG NEWS"}
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.04em] md:text-6xl">{pickTitle(n)}</h1>
        {(pickSummary(n) || n.content_zh || n.content_en || n.content_ja) && (
          <p className="mt-7 text-xl leading-9 text-slate-500">{pickSummary(n)}</p>
        )}
        {n.cover_url && <Image src={n.cover_url} width={1200} height={600} className="mt-10 max-h-[560px] w-full rounded-[30px] object-cover" alt="" />}
        <div className="mt-12 whitespace-pre-wrap text-[16px] leading-9 text-slate-700">
          {n.content_zh || n.content_en || n.content_ja || pickSummary(n)}
        </div>
      </article>
    </main>
  );
}
