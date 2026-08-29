"use client";

import NewsList from "./NewsList";
import { useSiteLanguage } from "./SiteLanguageProvider";

export default function NewsIndexContent() {
  const { copy } = useSiteLanguage();

  return (
    <main>
      <section className="page-hero">
        <div className="site-shell py-24 md:py-32">
          <p className="section-kicker">{copy.news.kicker}</p>
          <h1 className="page-title mt-5">{copy.news.title}</h1>
          <p className="page-lead">{copy.news.lead}</p>
        </div>
      </section>
      <section className="site-shell py-20">
        <NewsList />
      </section>
    </main>
  );
}
