"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useSiteLanguage } from "./SiteLanguageProvider";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { copy } = useSiteLanguage();

  const nav = [
    { href: "/", label: copy.nav.home },
    { href: "/about", label: copy.nav.about },
    { href: "/business", label: copy.nav.business },
    { href: "/technology", label: copy.nav.technology },
    { href: "/news", label: copy.nav.news },
    { href: "/contact", label: copy.nav.contact },
  ];

  return (
    <header className="site-header">
      <div className="site-shell flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="brand-mark">BW</div>
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-slate-950">
              BLUE WHALE
            </div>
            <div className="text-[10px] font-medium tracking-[0.18em] text-slate-500">
              NEW ENERGY
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`site-nav-link ${active ? "site-nav-link-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher compact />
          <Link href="/workspace" className="btn-ghost">
            {copy.nav.workspace}
          </Link>
          <Link href="/inquiry" className="btn-primary">
            {copy.nav.inquiry}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white lg:hidden"
        >
          <span className="text-xl">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="site-shell space-y-1 py-4">
            <div className="mb-3 flex justify-end">
              <LanguageSwitcher />
            </div>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Link href="/workspace" onClick={() => setOpen(false)} className="btn-ghost justify-center">
                {copy.nav.workspace}
              </Link>
              <Link href="/inquiry" onClick={() => setOpen(false)} className="btn-primary justify-center">
                {copy.nav.inquiry}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
