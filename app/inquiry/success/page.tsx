import Link from "next/link";

export default function InquirySuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
        <div className="w-full rounded-3xl border border-cyan-100 bg-white p-8 shadow-sm md:p-10">
          <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
            已收到您的询价
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
            感谢您提交采购需求
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            我们已经收到您的信息，团队会尽快根据您的产品需求与目标国家进行初步匹配，并尽快与您联系。
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-full bg-slate-950 px-6 py-3 font-medium text-white transition hover:bg-cyan-700"
            >
              返回首页
            </Link>

            <Link
              href="/inquiry"
              className="rounded-full border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:border-cyan-600 hover:text-cyan-700"
            >
              再提交一次
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
