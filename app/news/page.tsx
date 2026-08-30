import Link from "next/link";
import XingyueyangHeader from "@/components/XingyueyangHeader";
import FloatingAI from "@/components/FloatingAI";
import { listPublishedNews } from "@/lib/news/server";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news: any[] = await listPublishedNews(50);

  return (
    <main className="min-h-screen bg-[#f5f6f7] text-slate-950">
      <XingyueyangHeader />

      <section className="relative overflow-hidden bg-[#07101d] text-white">
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_75%_10%,rgba(245,158,11,.16),transparent_28%),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:auto,56px_56px,56px_56px]" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <p className="text-xs font-semibold tracking-[.22em] text-amber-400">XINGYUEYANG · COMPANY NEWS</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-.05em] md:text-7xl">公司动态</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            研发进展、产品动态、行业应用与企业信息。这里由星玥阳企业工作台统一发布和维护。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        {news.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {news.map((n, i) => (
              <Link
                href={`/news/${n.slug}`}
                key={n.id}
                className={`${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""} group overflow-hidden rounded-[28px] border bg-white`}
              >
                <div className={`${i === 0 ? "aspect-[16/7]" : "aspect-[16/8]"} relative overflow-hidden bg-[#e9ecef]`}>
                  {n.cover_image_url ? (
                    <img
                      src={n.cover_image_url}
                      alt=""
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="absolute inset-0 [background-image:linear-gradient(120deg,rgba(245,158,11,.14),transparent_40%),linear-gradient(rgba(15,23,42,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.05)_1px,transparent_1px)] [background-size:auto,32px_32px,32px_32px]" />
                  )}
                </div>

                <div className="p-6">
                  <div className="text-xs font-semibold tracking-[.14em] text-amber-600">
                    {n.published_at ? new Date(n.published_at).toLocaleDateString("zh-CN") : "NEWS"}
                  </div>
                  <h2 className={`${i === 0 ? "text-3xl" : "text-xl"} mt-3 font-semibold leading-tight`}>
                    {n.title}
                  </h2>
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                    {n.summary || n.excerpt || ""}
                  </p>
                  <div className="mt-6 text-sm font-semibold">阅读全文 →</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed bg-white p-16 text-center text-slate-400">
            暂无已发布新闻。请从企业工作台发布第一条公司动态。
          </div>
        )}
      </section>

      <FloatingAI />
    </main>
  );
}

