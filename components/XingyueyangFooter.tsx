import Link from "next/link";
import Image from "next/image";
import { company } from "@/lib/xingyueyang";

const navigation = [
  { href: "/about", label: "关于我们" },
  { href: "/products", label: "产品中心" },
  { href: "/solutions", label: "行业方案" },
  { href: "/cases", label: "工程案例" },
  { href: "/news", label: "公司动态" },
];

export default function XingyueyangFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#07101d] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-amber-300/10" />

      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_.8fr_.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/50">
             <Image
  src="/xingyueyang-icon.png"
  alt=""
  width={36}
  height={36}
  className="h-9 w-9 object-contain"
/>
</div>

              <div>
                <div className="text-sm font-semibold">
                  江苏星玥阳科技有限公司
                </div>

                <div className="mt-1 text-[9px] font-semibold tracking-[.22em] text-slate-500">
                  UNIVERSE TECH
                </div>
              </div>
            </Link>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400">
              专注科学仪器、分子光谱技术与智能工业在线监测系统，
              为工业过程提供从光谱感知、实时分析到质量判断与生产决策的技术解决方案。
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["近红外", "红外光谱", "拉曼光谱", "工业在线监测"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[10px] text-slate-400"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-bold tracking-[.2em] text-amber-400">
              NAVIGATION
            </div>

            <nav className="mt-6 grid gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-400 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <div className="text-[9px] font-bold tracking-[.2em] text-amber-400">
              CONTACT
            </div>

            <div className="mt-6 space-y-3 text-sm leading-6 text-slate-400">
              <p>{company.address}</p>
              <p>{company.contact}</p>
              <p>{company.phone}</p>
              <p>QQ {company.qq}</p>
            </div>

            <div className="mt-7 flex flex-col gap-2">
              <Link
                href="/contact"
                className="xy-glass-button-dark rounded-full px-4 py-2.5 text-center text-xs font-semibold !text-white"
              >
                联系技术团队
              </Link>

              <Link
                href="/inquiry"
                className="rounded-full border border-white/10 px-4 py-2.5 text-center text-xs font-semibold !text-slate-300 transition hover:bg-white/[.06] hover:!text-white"
              >
                提交项目需求
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © 2026 江苏星玥阳科技有限公司
          </span>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>UNIVERSE TECH</span>

            <Link
              href="/workspace"
              className="transition hover:text-slate-300"
            >
              ENTERPRISE WORKSPACE
            </Link>

            <span>X0.44</span>
          </div>
        </div>
      </div>
    </footer>
  );
}