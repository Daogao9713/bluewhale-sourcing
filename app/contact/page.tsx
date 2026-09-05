import Link from "next/link";
import XingyueyangSiteLayout from "@/components/XingyueyangSiteLayout";
import { company } from "@/lib/xingyueyang";

export default function Page() {
  return (
    <XingyueyangSiteLayout>
      <main>
        <section className="relative overflow-hidden bg-[#07101d] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_75%_20%,rgba(245,158,11,.16),transparent_30%),linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:auto,56px_56px,56px_56px]" />

          <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <p className="text-[10px] font-bold tracking-[.22em] text-amber-400">
              CONTACT / UNIVERSE TECH
            </p>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-.045em] sm:text-5xl lg:text-6xl">
              联系技术团队
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              面向科学仪器、工业在线监测、过程分析与系统集成需求，
              欢迎联系我们进行产品选型与项目技术沟通。
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="xy-glass-panel xy-liquid rounded-[32px] p-7 sm:p-8 lg:p-10">
              <p className="text-[10px] font-bold tracking-[.18em] text-amber-600">
                LOCATION
              </p>

              <h2 className="mt-5 text-2xl font-semibold tracking-[-.03em]">
                公司地址
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600">
                {company.address}
              </p>

              <div className="mt-8 border-t border-slate-200/60 pt-6 text-xs leading-6 text-slate-400">
                SUZHOU INDUSTRIAL PARK
              </div>
            </article>

            <article className="xy-glass-panel xy-liquid rounded-[32px] p-7 sm:p-8 lg:p-10">
              <p className="text-[10px] font-bold tracking-[.18em] text-amber-600">
                BUSINESS CONTACT
              </p>

              <h2 className="mt-5 text-2xl font-semibold tracking-[-.03em]">
                业务联系
              </h2>

              <div className="mt-5 space-y-3 text-base text-slate-600">
                <p>{company.contact}</p>
                <p>{company.phone}</p>
                <p>QQ {company.qq}</p>
              </div>

              <Link
                href="/inquiry"
                className="xy-cms-primary xy-liquid-edge mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold"
              >
                提交项目需求 →
              </Link>
            </article>
          </div>
        </section>
      </main>
    </XingyueyangSiteLayout>
  );
}