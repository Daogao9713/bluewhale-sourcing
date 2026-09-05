import XingyueyangSiteLayout from "@/components/XingyueyangSiteLayout";
import { company } from "@/lib/xingyueyang";

const capabilities = [
  {
    number: "01",
    title: "分子光谱感知",
    text: "围绕近红外、红外与拉曼光谱技术，构建面向实验室与工业现场的检测能力。",
  },
  {
    number: "02",
    title: "科学仪器研发",
    text: "覆盖台式、便携、手持及在线仪器形态，面向不同检测环境提供设备基础。",
  },
  {
    number: "03",
    title: "工业在线系统",
    text: "将光谱感知、实时分析、质量判断与工业系统集成，服务生产过程在线监测。",
  },
];

export default function Page() {
  return (
    <XingyueyangSiteLayout>
      <main>
        <section className="relative overflow-hidden bg-[#07101d] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_75%_15%,rgba(245,158,11,.15),transparent_30%),linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:auto,56px_56px,56px_56px]" />

          <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <p className="text-[10px] font-bold tracking-[.22em] text-amber-400">
              ABOUT / UNIVERSE TECH
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl lg:text-7xl">
              从光谱感知，
              <br />
              到工业现场。
            </h1>

            <p className="mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              江苏星玥阳科技有限公司专注科学仪器、分子光谱技术与智能工业在线监测系统的研发与制造。
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr]">
            <div>
              <p className="text-[10px] font-bold tracking-[.2em] text-amber-600">
                COMPANY
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] text-slate-950">
                关于星玥阳
              </h2>
            </div>

            <div className="space-y-6 text-base leading-8 text-slate-600">
              <p>
                江苏星玥阳科技有限公司是研发和制造科学仪器和智能工业在线系统的国家高新技术企业，公司总部位于苏州工业园区。
              </p>

              <p>
                公司专注分子光谱，包括近红外、红外和拉曼全息感知技术和设备的研发、制造和销售。主要产品包括台式、便携、手持和在线仪器，可以实现离线和在线检测，并为用户提供整体技术解决方案。
              </p>

              <p>
                产品应用于
                {company.industries.join("、")}
                等行业。
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/60 bg-white/35">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <div className="grid gap-4 lg:grid-cols-3">
              {capabilities.map((item) => (
                <article
                  key={item.number}
                  className="xy-glass-card rounded-[28px] p-7 lg:p-8"
                >
                  <div className="text-[10px] font-bold tracking-[.18em] text-amber-600">
                    {item.number}
                  </div>

                  <h3 className="mt-6 text-xl font-semibold tracking-[-.025em]">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
          <div className="xy-glass-panel xy-liquid rounded-[32px] p-7 sm:p-9 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
              <div>
                <p className="text-[10px] font-bold tracking-[.2em] text-amber-600">
                  R&D TEAM
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em]">
                  多学科研发体系
                </h2>
              </div>

              <div>
                <p className="text-base leading-8 text-slate-600">
                  公司专家团队由浙江大学、清华大学、东南大学教授组成，共同构建智能检测技术核心算法及精密分析仪器开发。
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {["光电", "结构", "软件", "应用", "算法"].map((item) => (
                    <span
                      key={item}
                      className="xy-glass-meta rounded-full px-4 py-2 text-xs font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </XingyueyangSiteLayout>
  );
}