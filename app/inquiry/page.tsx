"use client";

import { useEffect, useState } from "react";
import InquiryForm from "@/components/InquiryForm";
import Link from "next/link";
import { LanguageProvider } from "@/components/LanguageProvider";
import translations from "@/lib/translations";

function InquiryContent() {
  const [lang, setLang] = useState<"zh" | "ja" | "en">("zh");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const l = params.get("lang");
      if (l === "zh" || l === "ja" || l === "en") setLang(l);
    } catch (e) {
      // ignore
    }
  }, []);

  const t = translations[lang] || translations.zh;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/" className="text-sm text-slate-500 hover:text-cyan-700">← 返回首页</Link>

        <div className="mb-8 mt-10">
          <p className="mb-3 text-sm font-medium text-cyan-700">{t.trustPoints[0]} · 海外采购支持</p>

          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{t.submitButton}</h1>

          <p className="mt-4 max-w-2xl text-slate-600">{t.intro}</p>
        </div>

        <InquiryForm />
      </div>
    </main>
  );
}

export default function InquiryPage() {
  return (
    <LanguageProvider>
      <InquiryContent />
    </LanguageProvider>
  );
}