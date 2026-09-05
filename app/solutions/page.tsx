import Link from "next/link";
import XingyueyangSiteLayout from "@/components/XingyueyangSiteLayout";
import { company } from "@/lib/xingyueyang";

export default function Page() {
  return (
    <XingyueyangSiteLayout>
      <main>
        <section className="relative overflow-hidden bg-[#07101d] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_75%_15%,rgba(245,158,11,.15),transparent_30%),linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:auto,56px_56px,56px_56px]" />

          <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <p className="text-[10px] font-bold tracking-[.22em] text-amber-400">
              INDUSTRIAL SOLUTIONS
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl lg:text-7xl">
              面向工业过程的
              <br />
              在线感知与分析。
            </h1>

            <p className="mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              以分子光谱感知、在线检测和工业系统集成为核心，为不同工业场景提供技术解决方案入口。
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {company.industries.map((industry, index) => (
              <article
                key={industry}
                className={
                  index === 0
                    ? "xy-glass-panel xy-liquid rounded-[30px] p-7 md:col-span-2 lg:p-10"
                    : "xy-glass-card rounded-[28px] p-7"
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[.18em] text-amber-600">
                    INDUSTRY
                  </span>

                  <span className="text-[10px] text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h2 className="mt-7 text-2xl font-semibold tracking-[-.03em]">
                  {industry}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                  面向实际生产过程的检测对象、在线分析与系统集成需求，
                  具体技术配置根据项目现场条件确定。
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
          <div className="relative overflow-hidden rounded-[32px] bg-[#07101d] p-7 text-white sm:p-9 lg:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:44px_44px]" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[10px] font-bold tracking-[.2em] text-amber-400">
                  PROJECT CONSULTATION
                </p>

                <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-.04em]">
                  需要针对具体工业现场进行方案判断？
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                  提供应用行业、检测对象和现场条件，我们可以进一步进行产品与技术方案沟通。
                </p>
              </div>

              <Link
                href="/inquiry"
                className="xy-liquid-edge inline-flex rounded-full bg-amber-400 px-6 py-3.5 text-sm font-semibold !text-slate-950"
              >
                提交项目需求 →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </XingyueyangSiteLayout>
  );
}