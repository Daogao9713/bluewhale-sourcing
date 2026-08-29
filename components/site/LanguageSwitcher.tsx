"use client";

import { useSiteLanguage } from "./SiteLanguageProvider";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useSiteLanguage();

  return (
    <div
      className={`flex items-center rounded-full border border-slate-200 bg-white ${
        compact ? "p-0.5" : "p-1"
      }`}
      aria-label="Language switcher"
    >
      {(["zh", "ja", "en"] as const).map((item) => (
        <button
          type="button"
          key={item}
          onClick={() => setLang(item)}
          className={`rounded-full font-semibold transition ${
            compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]"
          } ${
            lang === item
              ? "bg-slate-950 text-white"
              : "text-slate-500 hover:text-slate-950"
          }`}
        >
          {item === "zh" ? "中" : item === "ja" ? "日" : "EN"}
        </button>
      ))}
    </div>
  );
}
