"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteLanguage } from "./SiteLanguageProvider";

type News = {
  id: string;
  slug: string;
  title_zh: string;
  title_ja: string;
  title_en: string;
  summary_zh?: string | null;
  summary_ja?: string | null;
  summary_en?: string | null;
  published_at: string;
};

export default function NewsList() {
  const { lang, copy } = useSiteLanguage();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?limit=50", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setNews(d?.news || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const text = (item: News, field: "title" | "summary") => {
    const key = `${field}_${lang}` as keyof News;
    const zh = `${field}_zh` as keyof News;
    return String(item[key] || item[zh] || "");
  };

  return (
    <div className="space-y-4">
      {loading ? <div className="text-sm text-slate-400">Loading…</div> : null}
      {!loading && !news.length ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          {copy.common.noNews}
        </div>
      ) : null}
      {news.map((item) => (
        <Link
          key={item.id}
          href={`/news/${item.slug}`}
          className="news-card group grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 md:grid-cols-[160px_1fr_40px] md:items-center"
        >
          <div className="text-xs font-semibold tracking-[0.12em] text-slate-400">
            {new Date(item.published_at).toLocaleDateString(lang === "ja" ? "ja-JP" : lang === "en" ? "en-US" : "zh-CN")}
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.025em] text-slate-950">{text(item, "title")}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{text(item, "summary")}</p>
          </div>
          <span className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-700">→</span>
        </Link>
      ))}
    </div>
  );
}
