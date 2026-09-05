"use client";

import InquiryForm from "@/components/InquiryForm";
import XingyueyangSiteLayout from "@/components/XingyueyangSiteLayout";
import {
  SiteLanguageProvider,
  useSiteLanguage,
} from "@/components/site/SiteLanguageProvider";

function InquiryInner() {
  const { lang } = useSiteLanguage();

  const text = {
    zh: {
      kicker: "PROJECT CONSULTATION",
      title: "提交技术与项目需求",
      lead:
        "请提供应用行业、检测对象、设备需求、项目规模及现场条件等信息，我们将据此进行产品与技术方案沟通。",
      side: "更完整的现场信息，有助于更准确地进行方案判断。",
    },

    ja: {
      kicker: "PROJECT CONSULTATION",
      title: "技術・プロジェクトのご相談",
      lead:
        "対象業界、測定対象、必要な装置、プロジェクト規模、現場条件などをご記入ください。",
      side:
        "現場情報が具体的であるほど、より適切な技術提案につながります。",
    },

    en: {
      kicker: "PROJECT CONSULTATION",
      title: "Submit a technical or project request",
      lead:
        "Please provide the application industry, measurement target, equipment requirements, project scale and site conditions where possible.",
      side:
        "More complete site information helps us evaluate the appropriate technical approach.",
    },
  }[lang];

  return (
    <main>
      <section className="relative overflow-hidden bg-[#07101d] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_75%_20%,rgba(245,158,11,.14),transparent_30%),linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:auto,56px_56px,56px_56px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <p className="text-[10px] font-bold tracking-[.22em] text-amber-400">
            {text.kicker}
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-.045em] sm:text-5xl lg:text-6xl">
            {text.title}
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            {text.lead}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-14 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:px-8 lg:py-20">
        <aside className="xy-glass-panel xy-liquid rounded-[32px] p-7 lg:sticky lg:top-28 lg:p-9">
          <p className="text-[10px] font-bold tracking-[.18em] text-amber-600">
            PROJECT INFORMATION
          </p>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-.03em]">
            {text.side}
          </h2>

          <div className="mt-8 space-y-5 text-sm leading-6 text-slate-500">
            <p>01 · 应用行业 / Application</p>
            <p>02 · 检测对象 / Measurement target</p>
            <p>03 · 设备型号 / System requirement</p>
            <p>04 · 现场条件 / Project conditions</p>
          </div>
        </aside>

        <InquiryForm />
      </section>
    </main>
  );
}

export default function InquiryPage() {
  return (
    <SiteLanguageProvider>
      <XingyueyangSiteLayout>
        <InquiryInner />
      </XingyueyangSiteLayout>
    </SiteLanguageProvider>
  );
}