import Link from "next/link";
import XingyueyangHeader from "@/components/XingyueyangHeader";
import FloatingAI from "@/components/FloatingAI";
import { publicCases } from "@/lib/cases/server";

export const dynamic = "force-dynamic";

export default async function Page() {
	const cases: any[] = await publicCases();

	return (
		<main className="min-h-screen bg-[#07101d] text-white">
			<XingyueyangHeader />
			<section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
				<p className="text-xs tracking-[.2em] text-amber-400">ENGINEERING APPLICATIONS</p>
				<h1 className="mt-4 text-6xl font-semibold">工程案例</h1>
				<div className="mt-12 grid gap-5 lg:grid-cols-3">
					{cases.length ? cases.map((c, i) => (
						<Link
							key={c.id}
							href={`/cases/${c.slug}`}
							className={`${i === 0 ? "lg:col-span-2" : ""} xy-glass-card group overflow-hidden rounded-[30px] text-slate-950`}
						>
							{c.image_url ? (
								<div className="aspect-[16/10] overflow-hidden bg-slate-200">
									<img src={c.image_url} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" alt={c.title} />
								</div>
							) : (
								<div className="grid aspect-[16/10] place-items-center bg-slate-200 text-slate-500">案例图片待上传</div>
							)}
							<div className="relative border-t border-white/60 bg-white/30 p-6 backdrop-blur-xl">
								<div className="text-xs text-amber-600">{c.industry || "CASE"}</div>
								<h2 className="mt-3 text-2xl font-semibold">{c.title}</h2>
								<p className="mt-3 text-sm text-slate-600">{c.summary}</p>
							</div>
						</Link>
					)) : (
						<div className="lg:col-span-3 rounded-3xl border border-dashed border-white/15 p-14 text-center text-slate-500">
							后台发布案例后自动显示。
						</div>
					)}
				</div>
			</section>
			<FloatingAI />
		</main>
	);
}