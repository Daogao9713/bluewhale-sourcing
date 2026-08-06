"use client";

import Link from "next/link";
import React from "react";
import { LanguageProvider, useLanguage } from "./LanguageProvider";
import translations from "@/lib/translations";

function Content() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang] || translations.zh;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e0f2fe,transparent_35%),#f8fafc]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="font-semibold tracking-tight text-slate-950">Blue Whale Sourcing</div>

        <Link href="/inquiry" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700">
          {t.submitButton}
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-cyan-200 bg-white/70 px-4 py-2 text-sm font-medium text-cyan-700">{t.trustPoints[0]} 旗下海外采购业务</p>

          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            {t.heroTitleLine1}
            <br />
            {t.heroTitleLine2}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{t.intro}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/inquiry" className="rounded-full bg-slate-950 px-7 py-4 font-medium text-white transition hover:bg-cyan-700">{t.submitButton}</Link>

            <div className="ml-2 flex items-center gap-2">
              <span className="text-sm text-slate-600">{t.languageLabel}</span>
              <button onClick={() => setLang("zh")} className={"rounded-full border px-4 py-2 text-sm font-medium " + (lang === "zh" ? "border-cyan-600 bg-cyan-50 text-cyan-700" : "border-slate-300 bg-white text-slate-700")}>中文</button>
              <button onClick={() => setLang("ja")} className={"rounded-full border px-4 py-2 text-sm font-medium " + (lang === "ja" ? "border-cyan-600 bg-cyan-50 text-cyan-700" : "border-slate-300 bg-white text-slate-700")}>日本語</button>
              <button onClick={() => setLang("en")} className={"rounded-full border px-4 py-2 text-sm font-medium " + (lang === "en" ? "border-cyan-600 bg-cyan-50 text-cyan-700" : "border-slate-300 bg-white text-slate-700")}>English</button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {t.trustPoints.map((point: string) => (
              <span key={point} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm">{point}</span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-cyan-950/5 backdrop-blur">
          <div className="rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-sm text-cyan-300">Procurement Flow</p>

            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">01</div>
                <div>
                  <p className="font-medium">提交需求</p>
                  <p className="text-sm text-slate-300">客户提交产品型号、数量和目标要求。</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">02</div>
                <div>
                  <p className="font-medium">匹配厂家</p>
                  <p className="text-sm text-slate-300">根据供应链资源匹配厂家。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        <section id="services" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <p className="mb-3 text-sm font-medium text-cyan-700">Our Services</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">面向中国客户的海外采购支持</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">关于公司</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t.aboutCompany}</p>

              <div className="mt-6">
                <a href="/inquiry" className="inline-flex items-center rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-100">联系我们 / 提交询价</a>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="grid gap-6 md:grid-cols-2">
                {t.services.map((s: any) => (
                  <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="text-md font-semibold text-slate-950">{s.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl bg-slate-950 px-8 py-12 text-white md:px-12">
          <p className="text-sm font-medium text-cyan-300">Ready to Source from China?</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">{t.readyTitle}</h2>

          <Link href="/inquiry" className="mt-8 inline-flex rounded-full bg-cyan-400 px-7 py-4 font-medium text-slate-950 transition hover:bg-cyan-300">{t.readyButton}</Link>
        </div>
      </section>
    </main>
  );
}

export default function HomeContent() {
  return (
    <LanguageProvider>
      <Content />
    </LanguageProvider>
  );
}
