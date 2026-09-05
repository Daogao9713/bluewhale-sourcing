"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "zh" | "ja" | "en";

const LanguageContext = createContext({
  lang: "zh" as Lang,
  setLang: (l: Lang) => { void l; },
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [lang, setLangState] = useState<Lang>((typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang) || "zh" : "zh"));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const p = params.get("lang") as Lang | null;
        if (p && p !== lang) setLangState(p);
      } catch {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
    // update URL param
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", l);
      router.replace(url.pathname + url.search);
    }
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
