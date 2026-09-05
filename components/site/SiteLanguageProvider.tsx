"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { siteCopy, type SiteLang } from "@/lib/site-i18n";

type SiteLanguageContextValue = {
  lang: SiteLang;
  setLang: (lang: SiteLang) => void;
  copy: (typeof siteCopy)[SiteLang];
};

const SiteLanguageContext = createContext<SiteLanguageContextValue | null>(null);

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>("zh");

  useEffect(() => {
    const stored = window.localStorage.getItem("bluewhale_site_lang");
    if (stored === "zh" || stored === "ja" || stored === "en") {
      window.setTimeout(() => setLangState(stored), 0);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang =
      lang === "zh" ? "zh-CN" : lang === "ja" ? "ja" : "en";
  }, [lang]);

  function setLang(value: SiteLang) {
    setLangState(value);
    window.localStorage.setItem("bluewhale_site_lang", value);
  }

  const value = useMemo(
    () => ({ lang, setLang, copy: siteCopy[lang] }),
    [lang]
  );

  return (
    <SiteLanguageContext.Provider value={value}>
      {children}
    </SiteLanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  const ctx = useContext(SiteLanguageContext);
  if (!ctx) {
    throw new Error("useSiteLanguage must be used inside SiteLanguageProvider");
  }
  return ctx;
}
