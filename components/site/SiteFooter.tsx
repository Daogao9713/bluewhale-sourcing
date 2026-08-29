"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useSiteLanguage } from "./SiteLanguageProvider";

export default function SiteFooter() {
  const { copy } = useSiteLanguage();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="site-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="brand-mark brand-mark-light">BW</div>
            <div>
              <p className="font-semibold">江苏蓝鲸新能源有限公司</p>
              <p className="mt-1 text-xs tracking-[0.18em] text-slate-400">
                BLUE WHALE NEW ENERGY
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            {copy.footer.desc}
          </p>
          <div className="mt-5 inline-flex">
            <LanguageSwitcher compact />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">{copy.footer.quick}</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-400">
            <Link href="/about" className="hover:text-white">{copy.nav.about}</Link>
            <Link href="/business" className="hover:text-white">{copy.nav.business}</Link>
            <Link href="/technology" className="hover:text-white">{copy.nav.technology}</Link>
            <Link href="/news" className="hover:text-white">{copy.nav.news}</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">{copy.footer.cooperate}</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-400">
            <Link href="/inquiry" className="hover:text-white">{copy.footer.request}</Link>
            <Link href="/contact" className="hover:text-white">{copy.nav.contact}</Link>
            <Link href="/workspace" className="hover:text-white">{copy.footer.internal}</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-shell flex flex-col gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Blue Whale New Energy. All rights reserved.</span>
          <span>Website release · V0.16</span>
        </div>
      </div>
    </footer>
  );
}
