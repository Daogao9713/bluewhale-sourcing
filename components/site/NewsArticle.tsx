"use client";

import Link from "next/link";
import Image from "next/image";
import { useSiteLanguage } from "./SiteLanguageProvider";

type NewsArticleData = {
  published_at: string;
  cover_url?: string | null;
  [key: string]: string | null | undefined;
};

export default function NewsArticle({ article }: { article: NewsArticleData }) {
  const { lang, copy } = useSiteLanguage();

  const pick = (field: string) =>
    article?.[`${field}_${lang}`] || article?.[`${field}_zh`] || "";

  return (
    <main>
      <section className="page-hero">
        <div className="site-shell max-w-5xl py-20 md:py-28">
          <Link href="/news" className="text-xs font-semibold text-cyan-700">
            ← {copy.common.backNews}
          </Link>
          <div className="mt-10 text-xs font-semibold tracking-[0.14em] text-slate-400">
            {new Date(article.published_at).toLocaleDateString(
              lang === "ja" ? "ja-JP" : lang === "en" ? "en-US" : "zh-CN"
            )}
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.045em] text-slate-950 md:text-6xl">
            {pick("title")}
          </h1>
          {pick("summary") ? (
            <p className="mt-7 max-w-3xl text-base leading-8 text-slate-600">
              {pick("summary")}
            </p>
          ) : null}
        </div>
      </section>

      <article className="site-shell max-w-5xl py-16 md:py-20">
        {article.cover_url ? (
          <Image
            src={article.cover_url}
            alt=""
            width={1200}
            height={600}
            className="mb-12 aspect-[16/8] w-full rounded-[2rem] object-cover"
          />
        ) : null}
        <div className="news-prose whitespace-pre-wrap text-[15px] leading-8 text-slate-700">
          {pick("content") || pick("summary")}
        </div>
      </article>
    </main>
  );
}
