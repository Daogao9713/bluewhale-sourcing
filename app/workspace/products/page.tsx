import ProductAdmin from "@/components/ProductAdmin";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f4f7f9] p-5 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <a href="/workspace" className="text-sm text-slate-500">← 返回 Dashboard</a>
        <div className="mt-8">
          <ProductAdmin />
        </div>
      </div>
    </main>
  );
}
