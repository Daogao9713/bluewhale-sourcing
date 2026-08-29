"use client";

import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SiteAssistant from "./SiteAssistant";
import { SiteLanguageProvider } from "./SiteLanguageProvider";

export default function CompanySiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteLanguageProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
      <SiteAssistant />
    </SiteLanguageProvider>
  );
}
