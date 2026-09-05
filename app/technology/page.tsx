import Link from "next/link";
import XingyueyangSiteLayout from "@/components/XingyueyangSiteLayout";

const technologies = [
  {
    code: "NIR",
    title: "近红外光谱",
    text: "面向快速、非破坏性检测及工业过程分析场景，构建从光谱采集到分析判断的技术基础。",
  },
  {
    code: "IR",
    title: "红外光谱",
    text: "围绕分子光谱信息获取与分析，为实验室检测及工业现场应用提供技术支撑。",
  },
  {
    code: "RAMAN",
    title: "拉曼光谱",
    text: "结合光谱感知、算法分析与仪器系统，为不同检测对象提供分子层面的信息获取能力。",
  },
];

const flow = [
  ["01", "光谱感知", "SPECTRAL SENSING"],
  ["02", "实时分析", "REAL-TIME ANALYSIS"],
  ["03", "质量判断", "QUALITY DECISION"],
  ["04", "系统连接", "MES / ERP"],
  ["05", "生产决策", "PROCESS DECISION"],
];

export default function Page() {
  return (
    <XingyueyangSiteLayout>
      <main>
        <section className="relative overflow-hidden bg-[#07101d] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_75%_18%,rgba(245,158,11,.15),transparent_30%),linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:auto,56px_56px,56px_56px]" />

          <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <p className="text-[10px] font-bold tracking-[.22em] text-amber-400">
              TECHNOLOGY / UNIVERSE TECH
            </p>

            <h1 className="mt-5 max-w-5xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl lg:text-7xl">
              让分子光谱，
              <br />
              进入工业过程。
            </h1>

            <p className="mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              围绕近红外、红外、拉曼光谱与全息感知技术，
              构建从科学仪器到工业在线监测系统的技术体系。
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="text-[10px] font-bold tracking-[.2em] text-amber-600">
              SPECTROSCOPY PLATFORM
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] text-slate-950 sm:text-4xl">
              分子光谱技术平台
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              将光学、电气、机械、软件、应用与算法能力整合到仪器和工业在线系统中。
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {technologies.map((item) => (
              <article
                key={item.code}
                className="xy-glass-card xy-liquid rounded-[30px] p-7 lg:p-9"
              >
                <p className="text-[10px] font-bold tracking-[.2em] text-amber-600">
                  {item.code}
                </p>

                <h3 className="mt-8 text-2xl font-semibold tracking-[-.03em]">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200/60 bg-white/35">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr]">
              <div>
                <p className="text-[10px] font-bold tracking-[.2em] text-amber-600">
                  DATA TO DECISION
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em]">
                  从感知到生产决策
                </h2>
              </div>

              <div className="grid gap-3">
                {flow.map(([number, title, english]) => (
                  <div
                    key={number}
                    className="xy-glass-panel flex items-center gap-5 rounded-[24px] p-5 sm:p-6"
                  >
                    <span className="text-[10px] font-bold text-amber-600">
                      {number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">
                        {title}
                      </div>

                      <div className="mt-1 text-[9px] tracking-[.16em] text-slate-400">
                        {english}
                      </div>
                    </div>

                    <span className="text-slate-300">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-24">
          <div className="relative overflow-hidden rounded-[32px] bg-[#07101d] p-7 text-white sm:p-9 lg:p-12">
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[10px] font-bold tracking-[.2em] text-amber-400">
                  INDUSTRIAL APPLICATION
                </p>

                <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-.04em]">
                  技术最终需要进入真实工业现场。
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                  根据检测对象、工艺条件和系统接口需求，
                  进一步确定仪器配置与在线监测方案。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="xy-glass-button-dark rounded-full px-5 py-3 text-sm font-semibold !text-white"
                >
                  查看产品
                </Link>

                <Link
                  href="/inquiry"
                  className="xy-liquid-edge rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold !text-slate-950"
                >
                  技术咨询 →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </XingyueyangSiteLayout>
  );
}