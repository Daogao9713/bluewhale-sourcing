"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteLanguage } from "./SiteLanguageProvider";

type NewsItem = {
  id: string;
  slug: string;
  title_zh: string;
  title_ja: string;
  title_en: string;
  published_at: string;
};

export default function HomeNewsStrip() {
  const { lang, copy } = useSiteLanguage();
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch("/api/news?limit=6", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setItems(data?.news || []))
      .catch(() => setItems([]));
  }, []);

  function title(item: NewsItem) {
    return lang === "ja"
      ? item.title_ja || item.title_zh
      : lang === "en"
      ? item.title_en || item.title_zh
      : item.title_zh;
  }

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="site-shell flex min-h-[62px] items-center gap-4 overflow-hidden">
        <Link
          href="/news"
          className="shrink-0 text-[11px] font-bold tracking-[0.18em] text-cyan-700"
        >
          {copy.common.latestNews}
        </Link>
        <div className="h-5 w-px shrink-0 bg-slate-200" />
        <div className="news-marquee min-w-0 flex-1">
          <div className="news-marquee-track">
            {items.length ? (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="news-marquee-item"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <span className="max-w-[520px] truncate">{title(item)}</span>
                  <span className="text-slate-300">→</span>
                </Link>
              ))
            ) : (
              <span className="text-sm text-slate-400">{copy.common.noNews}</span>
            )}
          </div>
        </div>
        <Link href="/news" className="hidden shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-950 sm:block">
          {copy.common.allNews} →
        </Link>
      </div>
    </section>
  );
}
