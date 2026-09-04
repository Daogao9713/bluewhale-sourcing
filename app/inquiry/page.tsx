"use client";

import InquiryForm from "@/components/InquiryForm";
import CompanySiteLayout from "@/components/site/CompanySiteLayout";
import { useSiteLanguage } from "@/components/site/SiteLanguageProvider";

function InquiryInner() {
  const { lang } = useSiteLanguage();

  const text = {
    zh: {
      kicker: "BUSINESS REQUEST",
      title: "提交业务与采购需求",
      lead: "请尽量提供产品、数量、规格、目标市场与交付要求。表单继续使用现有 Supabase 与邮件通知链路。",
      side: "信息越明确，后续推进越高效。",
    },
    ja: {
      kicker: "BUSINESS REQUEST",
      title: "事業・調達の相談を送る",
      lead: "製品、数量、仕様、対象市場、納品条件をできるだけ具体的にご記入ください。既存の Supabase・メール通知をそのまま利用します。",
      side: "情報が明確なほど、その後の進行がスムーズです。",
    },
    en: {
      kicker: "BUSINESS REQUEST",
      title: "Submit a business or sourcing request",
      lead: "Please include product, quantity, specification, target market and delivery requirements where possible. The existing Supabase and email workflow remains unchanged.",
      side: "Clearer input creates a faster next step.",
    },
  }[lang];

  return (
    <main className="xy-glass-canvas min-h-screen">
      <section className="page-hero">
        <div className="site-shell py-16 md:py-24">
          <p className="section-kicker">{text.kicker}</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 md:text-6xl">
            {text.title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">{text.lead}</p>
        </div>
      </section>

      <section className="site-shell grid gap-8 py-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <aside className="xy-glass-panel xy-liquid rounded-[32px] p-7 lg:sticky lg:top-28 lg:p-10">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300">BEFORE SUBMITTING</p>
          <h2 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">{text.side}</h2>
          <div className="mt-8 space-y-5 text-sm leading-6 text-slate-400">
            <p>01 · Product / Model / Specification</p>
            <p>02 · Quantity / Market / Delivery</p>
            <p>03 · Budget / Target Price / Terms</p>
            <p>04 · Certification / Sample / Logistics</p>
          </div>
        </aside>
        <div><InquiryForm /></div>
      </section>
    </main>
  );
}

export default function InquiryPage() {
  return (
    <CompanySiteLayout>
      <InquiryInner />
    </CompanySiteLayout>
  );
}
