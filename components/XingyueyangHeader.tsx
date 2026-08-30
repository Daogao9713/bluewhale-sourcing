"use client";
import Link from "next/link";

export default function XingyueyangHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white">
            <img
              src="/xingyueyang-logo.png"
              alt=""
              className="absolute left-1/2 top-0 h-[82px] w-auto max-w-none -translate-x-1/2"
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold tracking-[.02em] text-slate-950">
              江苏星玥阳科技有限公司
            </div>
            <div className="mt-0.5 text-[9px] font-semibold tracking-[.22em] text-slate-400">
              UNIVERSE TECH
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] text-slate-600 lg:flex">
          <Link className="transition hover:text-slate-950" href="/about">关于我们</Link>
          <Link className="transition hover:text-slate-950" href="/products">产品中心</Link>
          <Link className="transition hover:text-slate-950" href="/solutions">行业方案</Link>
          <Link className="transition hover:text-slate-950" href="/cases">工程案例</Link>
          <Link className="transition hover:text-slate-950" href="/contact">联系我们</Link>
        </nav>

        <Link
          href="/workspace"
          className="shrink-0 rounded-full bg-slate-950 px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-slate-800"
        >
          企业工作台
        </Link>
      </div>
    </header>
  );
}
