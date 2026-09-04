"use client";

import Link from "next/link";
import { useSiteLanguage } from "./SiteLanguageProvider";

export function AboutContent() {
  const { copy } = useSiteLanguage();
  const cards = [
    [copy.about.c1, copy.about.c1t, copy.about.c1d],
    [copy.about.c2, copy.about.c2t, copy.about.c2d],
    [copy.about.c3, copy.about.c3t, copy.about.c3d],
  ];
  return (
    <main>
      <section className="page-hero">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="site-shell relative z-10 py-24 md:py-32">
          <p className="section-kicker">{copy.about.kicker}</p>
          <h1 className="page-title mt-5">{copy.about.title}</h1>
          <p className="page-lead">{copy.about.lead}</p>
        </div>
      </section>
      <section className="site-shell py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map(([k, title, desc]) => (
            <article key={k} className="rounded-[2rem] border border-slate-200 bg-white p-7">
              <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700">{k}</p>
              <h2 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-20 grid gap-10 border-t border-slate-200 pt-16 lg:grid-cols-2">
          <h2 className="section-title">{copy.about.title2}</h2>
          <div className="space-y-6 text-sm leading-8 text-slate-600">
            <p>{copy.about.p1}</p>
            <p>{copy.about.p2}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function BusinessContent() {
  const { copy } = useSiteLanguage();
  const items = [
    [copy.business.e, copy.business.ed, "ENERGY", ""],
    [copy.business.s, copy.business.sd, "SOURCING", "/business/sourcing"],
    [copy.business.g, copy.business.gd, "GLOBAL", ""],
    [copy.business.d, copy.business.dd, "DIGITAL", "/technology"],
  ];
  return (
    <main>
      <section className="page-hero">
        <div className="site-shell py-24 md:py-32">
          <p className="section-kicker">{copy.business.kicker}</p>
          <h1 className="page-title mt-5">{copy.business.title}</h1>
          <p className="page-lead">{copy.business.lead}</p>
        </div>
      </section>
      <section className="site-shell py-24">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map(([title, desc, badge, href], index) => {
            const card = (
              <article className="group h-full rounded-[2rem] border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.18em] text-slate-400">0{index + 1}</span>
                  <span className="xy-glass-button rounded-full px-3 py-1 text-[10px] font-semibold">{badge}</span>
                </div>
                <h2 className="mt-16 text-3xl font-semibold tracking-[-0.04em]">{title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{desc}</p>
                <div className="mt-8 text-sm font-semibold text-cyan-700">
                  {href ? `${copy.common.learnMore} →` : copy.business.building}
                </div>
              </article>
            );
            return href ? <Link key={title} href={href}>{card}</Link> : <div key={title}>{card}</div>;
          })}
        </div>
      </section>
    </main>
  );
}

export function SourcingContent() {
  const { copy } = useSiteLanguage();
  const steps = [
    ["01", copy.sourcing.s1, copy.sourcing.s1d],
    ["02", copy.sourcing.s2, copy.sourcing.s2d],
    ["03", copy.sourcing.s3, copy.sourcing.s3d],
    ["04", copy.sourcing.s4, copy.sourcing.s4d],
  ];
  return (
    <main>
      <section className="page-hero">
        <div className="site-shell py-24 md:py-32">
          <p className="section-kicker">{copy.sourcing.kicker}</p>
          <h1 className="page-title mt-5">{copy.sourcing.title}</h1>
          <p className="page-lead">{copy.sourcing.lead}</p>
          <div className="mt-8"><Link href="/inquiry" className="btn-primary btn-large">{copy.sourcing.submit}</Link></div>
        </div>
      </section>
      <section className="site-shell py-24">
        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map(([no, title, desc]) => (
            <article key={no} className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold text-cyan-700">{no}</p>
              <h2 className="mt-12 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-16 rounded-[2.5rem] bg-slate-950 p-8 text-white md:p-12">
          <p className="section-kicker text-cyan-300">{copy.sourcing.digital}</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">{copy.sourcing.digitalTitle}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">{copy.sourcing.digitalBody}</p>
            </div>
            <Link href="/inquiry" className="btn-light">{copy.sourcing.start}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export function TechnologyContent() {
  const { copy } = useSiteLanguage();
  const cards = [
    ["DATA", copy.technology.data, copy.technology.datad],
    ["AI", copy.technology.ai, copy.technology.aid],
    ["API", copy.technology.api, copy.technology.apid],
  ];
  return (
    <main className="xy-glass-canvas relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-32 h-[420px] w-[420px] rounded-full bg-blue-300/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 top-[40%] h-[420px] w-[420px] rounded-full bg-amber-300/10 blur-[110px]" />
      <section className="page-hero">
        <div className="site-shell py-24 md:py-32">
          <p className="section-kicker">{copy.technology.kicker}</p>
          <h1 className="page-title mt-5">{copy.technology.title}</h1>
          <p className="page-lead">{copy.technology.lead}</p>
        </div>
      </section>
      <section className="site-shell py-24">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="xy-glass-dark xy-liquid rounded-[32px] p-7 text-white lg:p-10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300">SOURCING OS</p>
              <span className="status-chip">V0.16</span>
            </div>
            <h2 className="mt-16 text-4xl font-semibold tracking-[-0.04em]">{copy.technology.os}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">{copy.technology.osd}</p>
            <Link href="/workspace" className="btn-light mt-8">{copy.technology.enter}</Link>
          </div>
          <div className="grid gap-4">
            {cards.map(([code, title, desc]) => (
              <div key={code} className="xy-glass-panel rounded-[32px] p-7 lg:p-10">
                <p className="text-xs font-semibold text-cyan-700">{code}</p>
                <h3 className="mt-8 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function ContactContent() {
  const { copy } = useSiteLanguage();
  return (
    <main>
      <section className="page-hero">
        <div className="site-shell py-24 md:py-32">
          <p className="section-kicker">{copy.contact.kicker}</p>
          <h1 className="page-title mt-5">{copy.contact.title}</h1>
          <p className="page-lead">{copy.contact.lead}</p>
        </div>
      </section>
      <section className="site-shell py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/inquiry" className="rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white transition hover:-translate-y-1">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300">BUSINESS REQUEST</p>
            <h2 className="mt-16 text-3xl font-semibold tracking-[-0.04em]">{copy.contact.req}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">{copy.contact.reqd}</p>
            <div className="mt-8 font-semibold">{copy.contact.enter} →</div>
          </Link>
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700">GENERAL CONTACT</p>
            <h2 className="mt-16 text-3xl font-semibold tracking-[-0.04em]">{copy.contact.general}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{copy.contact.generald}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
