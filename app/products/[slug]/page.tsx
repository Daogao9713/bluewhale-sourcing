import Link from "next/link";
import { notFound } from "next/navigation";
import XingyueyangHeader from "@/components/XingyueyangHeader";
import { publicProduct } from "@/lib/products/server";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p: any = await publicProduct(slug);

  if (!p) notFound();

  return (
    <main className="min-h-screen bg-white">
      <XingyueyangHeader />
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Link href="/products" className="text-sm text-slate-500">← 产品中心</Link>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
          <div className="aspect-[4/3] rounded-[32px] bg-[#eef0f2]">
            {p.image_url ? (
              <img src={p.image_url} className="h-full w-full object-contain p-8" alt={p.name} />
            ) : (
              <div className="grid h-full place-items-center text-slate-400">设备图片待上传</div>
            )}
          </div>

          <div>
            <p className="text-xs tracking-[.2em] text-amber-600">{p.category || "INDUSTRIAL SYSTEM"}</p>
            <h1 className="mt-4 text-6xl font-semibold tracking-[-.055em]">{p.model}</h1>
            <h2 className="mt-3 text-2xl">{p.name}</h2>
            {p.subtitle && <p className="mt-5 text-lg text-slate-500">{p.subtitle}</p>}
            <p className="mt-7 leading-8 text-slate-600">{p.description}</p>
            <Link
             href="/contact"
             className="mt-8 inline-block rounded-full bg-[#07101d] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#162235]"
            >
              咨询技术方案
         </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-950 p-8 text-white">
            <p className="text-xs tracking-[.18em] text-amber-400">FEATURES</p>
            <h3 className="mt-3 text-2xl font-semibold">核心特点</h3>
            <div className="mt-6 space-y-3">
              {(p.features || []).length ? (
                (p.features || []).map((x: string, i: number) => (
                  <div key={i} className="border-t border-white/10 py-3 text-sm text-slate-300">
                    {String(i + 1).padStart(2, "0")} · {x}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">技术特点待企业补充。</p>
              )}
            </div>
          </div>

          <div className="xy-glass-panel rounded-[30px] p-6 lg:p-8">
            <p className="text-xs tracking-[.18em] text-amber-600">APPLICATIONS</p>
            <h3 className="mt-3 text-2xl font-semibold">应用场景</h3>
            <div className="mt-6 flex flex-wrap gap-2">
              {(p.applications || []).length ? (
                (p.applications || []).map((x: string) => (
                  <span key={x} className="rounded-full bg-slate-100 px-4 py-2 text-sm">
                    {x}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">应用资料待企业补充。</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
