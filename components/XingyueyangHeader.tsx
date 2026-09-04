"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { number: "01", label: "关于我们", href: "/about" },
  { number: "02", label: "产品中心", href: "/products" },
  { number: "03", label: "行业方案", href: "/solutions" },
  { number: "04", label: "工程案例", href: "/cases" },
  { number: "05", label: "联系我们", href: "/contact" },
];

export default function XingyueyangHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // 路由变化后自动关闭手机菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // 打开菜单时锁定页面滚动
  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ESC 关闭菜单
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-white/50 bg-white/62 shadow-[0_1px_0_rgba(255,255,255,.75)_inset,0_10px_35px_rgba(15,23,42,.045)] backdrop-blur-[22px] backdrop-saturate-[150%]">
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[68px] sm:px-5 lg:h-[72px] lg:gap-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 lg:flex-none"
            onClick={() => setMenuOpen(false)}
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white sm:h-11 sm:w-11">
              <img
                src="/xingyueyang-logo.png"
                alt="江苏星玥阳科技有限公司"
                className="absolute left-1/2 top-0 h-[76px] w-auto max-w-none -translate-x-1/2 sm:h-[82px]"
              />
            </div>

            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold tracking-[.01em] text-slate-950 sm:text-[14px]">
                江苏星玥阳科技有限公司
              </div>

              <div className="mt-0.5 hidden text-[8px] font-semibold tracking-[.2em] text-slate-400 min-[390px]:block sm:text-[9px] sm:tracking-[.22em]">
                UNIVERSE TECH
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 text-[13px] text-slate-600 lg:flex">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3.5 py-2 transition-all duration-300 ${
                  active
                  ? "xy-nav-active-glass font-semibold text-slate-950"
                   : "text-slate-600 hover:bg-white/35 hover:text-slate-950"
                   }`}
                >
                  {item.label}

                </Link>
              );
            })}
          </nav>

          {/* Desktop Workspace */}
          <Link
            href="/workspace"
            className="xy-glass-button-dark hidden shrink-0 rounded-full px-5 py-2.5 text-[12px] font-semibold !text-white lg:inline-flex"
          >
            企业工作台
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"}
            aria-expanded={menuOpen}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-[11px] font-bold tracking-[.12em] text-slate-900 transition active:scale-[.97] lg:hidden"
          >
            <span>{menuOpen ? "CLOSE" : "MENU"}</span>

            <span className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 top-[3px] h-[1.5px] w-4 bg-slate-900 transition-all duration-300 ${
                  menuOpen
                    ? "translate-y-[4px] rotate-45"
                    : ""
                }`}
              />

              <span
                className={`absolute bottom-[3px] left-0 h-[1.5px] w-4 bg-slate-900 transition-all duration-300 ${
                  menuOpen
                    ? "-translate-y-[3px] -rotate-45"
                    : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`xy-mobile-glass-menu fixed inset-x-0 bottom-0 top-[64px] z-[90] overflow-y-auto transition-all duration-300 sm:top-[68px] lg:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-3 opacity-0 pointer-events-none"
        }`}
      >
        {/* Grid background */}
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:42px_42px]" />

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full border border-amber-300/10" />
        <div className="pointer-events-none absolute -right-8 top-28 h-40 w-40 rounded-full border border-cyan-200/10" />

        <div className="relative mx-auto flex min-h-full max-w-7xl flex-col px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-5 sm:px-6">
          <div className="text-[9px] font-bold tracking-[.24em] text-amber-400">
            NAVIGATION / UNIVERSE TECH
          </div>

          {/* Links */}
          <nav className="mt-5 border-t border-white/10">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`xy-mobile-nav-item ${active ? "xy-mobile-nav-item-active" : ""}`}
                >
                  <div>
                    <div className="text-[9px] font-bold tracking-[.18em] text-slate-500">
                      {item.number}
                    </div>
                    <div className="mt-1 text-lg font-semibold">{item.label}</div>
                  </div>
                  <span className="text-xs">↗</span>
                </Link>
              );
            })}
          </nav>

          {/* Workspace */}
          <Link
            href="/workspace"
            onClick={() => setMenuOpen(false)}
            className="mt-7 flex items-center justify-between rounded-[20px] bg-amber-400 px-5 py-4 font-semibold !text-slate-950"
          >
            <div>
              <div className="text-[9px] font-bold tracking-[.18em] opacity-60">
                ENTERPRISE SYSTEM
              </div>

              <div className="mt-1 text-[15px]">
                进入企业工作台
              </div>
            </div>

            <span className="text-xl">→</span>
          </Link>

          {/* Footer */}
          <div className="mt-auto pt-10">
            <div className="border-t border-white/10 pt-5">
              <div className="text-[10px] font-bold tracking-[.2em] text-slate-500">
                JIANGSU UNIVERSE TECHNOLOGY
              </div>

              <div className="mt-2 text-xs leading-6 text-slate-600">
                科学仪器 · 分子光谱 · 工业在线监测
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}