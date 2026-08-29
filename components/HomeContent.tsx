"use client";

import Link from "next/link";
import CompanySiteLayout from "@/components/site/CompanySiteLayout";
import HomeNewsStrip from "@/components/site/HomeNewsStrip";
import { useSiteLanguage } from "@/components/site/SiteLanguageProvider";

function HomeInner() {
  const { copy } = useSiteLanguage();

  const capabilities = [
    ["01", copy.home.cap1, copy.home.cap1d, "ENERGY"],
    ["02", copy.home.cap2, copy.home.cap2d, "GLOBAL"],
    ["03", copy.home.cap3, copy.home.cap3d, "SOURCING"],
    ["04", copy.home.cap4, copy.home.cap4d, "DIGITAL"],
  ];

  const pillars = [
    [copy.home.p1v, copy.home.p1, copy.home.p1s],
    [copy.home.p2v, copy.home.p2, copy.home.p2s],
    [copy.home.p3v, copy.home.p3, copy.home.p3s],
    [copy.home.p4v, copy.home.p4, copy.home.p4s],
  ];

  const business = [
    ["A", copy.home.b1, copy.home.b1d, "/business"],
    ["B", copy.home.b2, copy.home.b2d, "/business/sourcing"],
    ["C", copy.home.b3, copy.home.b3d, "/business"],
  ];

  return (
    <main className="overflow-hidden bg-white">
      <HomeNewsStrip />

      <section className="hero-mesh relative min-h-[720px] border-b border-slate-200">
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />

        <div className="site-shell relative z-10 grid min-h-[720px] items-center gap-12 py-20 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              {copy.home.eyebrow}
            </div>

            <h1 className="mt-7 max-w-4xl text-[clamp(3rem,7.5vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-slate-950">
              {copy.home.hero1}
              <br />
              <span className="text-gradient">{copy.home.hero2}</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              {copy.home.lead}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/business" className="btn-primary btn-large">
                {copy.home.explore}
              </Link>
              <Link href="/about" className="btn-ghost btn-large">
                {copy.home.about}
              </Link>
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-950 p-7 shadow-2xl shadow-cyan-900/10 md:p-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,.16),transparent_30%)]" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
                    {copy.home.system}
                  </p>
                  <span className="status-chip">{copy.home.systemOnline}</span>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {pillars.map(([value, label, sub]) => (
                    <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                      <div className="text-3xl font-semibold tracking-[-0.04em] text-white">{value}</div>
                      <div className="mt-5 text-sm font-medium text-white">{label}</div>
                      <div className="mt-1 text-xs text-slate-400">{sub}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>BLUE WHALE / JIANGSU</span>
                    <span>CHINA · JAPAN · GLOBAL</span>
                  </div>
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-note">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <span>Energy · Global · Digital</span>
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell py-24 md:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="section-kicker">{copy.home.what}</p>
            <h2 className="section-title mt-4">{copy.home.whatTitle}</h2>
          </div>
          <div className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
            {copy.home.whatBody}
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map(([code, title, desc, tag]) => (
            <article key={code} className="capability-card group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.18em] text-slate-400">{code}</span>
                <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-500">{tag}</span>
              </div>
              <div className="mt-20">
                <h3 className="text-xl font-semibold tracking-[-0.025em] text-slate-950">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-24 text-white md:py-32">
        <div className="site-shell">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="section-kicker text-cyan-300">{copy.home.matrix}</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">
                {copy.home.matrixTitle}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400 lg:justify-self-end">
              {copy.home.matrixBody}
            </p>
          </div>

          <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
            {business.map(([index, title, desc, href]) => (
              <Link key={index} href={href} className="business-row group grid gap-5 py-8 md:grid-cols-[80px_1fr_1fr_60px] md:items-center">
                <span className="text-xs font-semibold tracking-[0.2em] text-cyan-300">{index}</span>
                <h3 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
                <p className="text-sm leading-6 text-slate-400">{desc}</p>
                <span className="text-right text-2xl text-slate-500 transition group-hover:translate-x-1 group-hover:text-white">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-shell py-24 md:py-32">
        <div className="rounded-[2.5rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_50%,#eff6ff_100%)] p-8 md:p-14">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="section-kicker">{copy.home.digital}</p>
              <h2 className="section-title mt-4">{copy.home.digitalTitle}</h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600">
                {copy.home.digitalBody}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/technology" className="btn-primary">{copy.home.tech}</Link>
                <Link href="/workspace" className="btn-ghost">{copy.nav.workspace}</Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Projects", "01"],
                ["News CMS", "02"],
                ["AI Concierge", "03"],
                ["Sourcing OS", "04"],
              ].map(([name, no]) => (
                <div key={name} className="rounded-3xl border border-white bg-white/80 p-5 shadow-sm">
                  <div className="text-xs font-semibold text-cyan-700">{no}</div>
                  <div className="mt-8 text-lg font-semibold">{name}</div>
                  <div className="mt-2 text-sm text-slate-500">Blue Whale V0.16</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-24">
        <div className="site-shell grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="section-kicker">{copy.home.work}</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 md:text-6xl">
              {copy.home.workTitle}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-ghost btn-large">{copy.home.contact}</Link>
            <Link href="/inquiry" className="btn-primary btn-large">{copy.nav.inquiry}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function HomeContent() {
  return (
    <CompanySiteLayout>
      <HomeInner />
    </CompanySiteLayout>
  );
}
