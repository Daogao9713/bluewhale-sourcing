"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";

export default function ProductAdmin() {
  type ProductDraft = {
    id?: string;
    model?: string;
    name?: string;
    slug?: string;
    category?: string;
    subtitle?: string;
    description?: string;
    image_url?: string;
    features?: string[];
    applications?: string[];
    featuresText?: string;
    applicationsText?: string;
    specifications?: Record<string, unknown>;
    featured?: boolean;
    sort_order?: number;
    status?: string;
  };
  const [rows, setRows] = useState<ProductDraft[]>([]);
  const [edit, setEdit] = useState<ProductDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const api = useCallback(async function api(path: string, init: RequestInit = {}) {
    const h = new Headers(init.headers);
    if (init.body && !(init.body instanceof FormData)) {
      h.set("Content-Type", "application/json");
    }

    const r = await fetch(path, {
      ...init,
      headers: h,
      credentials: "same-origin",
      cache: "no-store",
    });

    const p = await r.json();
    if (!r.ok) throw new Error(p.error || "Request failed");
    return p;
  }, []);

  const load = useCallback(async function load() {
    try {
      setRows((await api("/api/workspace/products")).products || []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Request failed");
    }
  }, [api]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  function blank() {
    return {
      model: "",
      name: "",
      slug: "",
      category: "",
      subtitle: "",
      description: "",
      image_url: "",
      features: [],
      applications: [],
      specifications: {},
      featured: false,
      sort_order: 0,
      status: "active",
    };
  }

  async function upload(file: File) {
    setBusy(true);
    try {
      const f = new FormData();
      f.append("file", file);
      const p = await api("/api/workspace/media", { method: "POST", body: f });
      setEdit((x) => ({ ...x, image_url: p.url }));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");

    try {
      const body = {
        ...edit,
        features: String(edit!.featuresText ?? (edit!.features || []).join("\n"))
          .split("\n")
          .map((x: string) => x.trim())
          .filter(Boolean),
        applications: String(edit!.applicationsText ?? (edit!.applications || []).join("\n"))
          .split("\n")
          .map((x: string) => x.trim())
          .filter(Boolean),
      };

      if (edit!.id) {
        await api(`/api/workspace/products/${edit!.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await api("/api/workspace/products", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      setEdit(null);
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[.18em] text-amber-600">PRODUCT CMS</p>
          <h2 className="mt-2 text-3xl font-semibold">设备与产品管理</h2>
          <p className="mt-2 text-sm text-slate-500">
            在后台维护产品文案、主图、应用方向与首页推荐。图片上传后自动进入官网。
          </p>
        </div>
        <button
          onClick={() => setEdit(blank())}
          className="xy-cms-primary xy-liquid-edge rounded-xl px-4 py-2.5 text-xs font-semibold"
        >
          新增产品
        </button>
      </div>

      {err && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm">{err}</div>}

      {edit && (
        <form
          onSubmit={save}
          className="xy-workspace-panel mt-6 grid gap-4 rounded-3xl p-6 lg:grid-cols-2"
        >
          <div className="lg:col-span-2 flex justify-between">
            <b>{edit!.id ? "编辑产品" : "新增产品"}</b>
            <button type="button" onClick={() => setEdit(null)} className="text-sm text-slate-400">
              关闭
            </button>
          </div>

          <input
            className="field"
            required
            placeholder="型号，例如 NC-300"
            value={edit!.model || ""}
            onChange={(e) => setEdit({ ...edit, model: e.target.value })}
          />
          <input
            className="field"
            required
            placeholder="产品名称"
            value={edit!.name || ""}
            onChange={(e) => setEdit({ ...edit, name: e.target.value })}
          />
          <input
            className="field"
            placeholder="分类"
            value={edit!.category || ""}
            onChange={(e) => setEdit({ ...edit, category: e.target.value })}
          />
          <input
            className="field"
            placeholder="Slug，例如 nc-300"
            value={edit!.slug || ""}
            onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
          />
          <input
            className="field lg:col-span-2"
            placeholder="一句话副标题"
            value={edit!.subtitle || ""}
            onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })}
          />
          <textarea
            className="field min-h-28 lg:col-span-2"
            placeholder="产品介绍"
            value={edit!.description || ""}
            onChange={(e) => setEdit({ ...edit, description: e.target.value })}
          />

          <div className="xy-workspace-panel rounded-2xl p-4">
            <div className="text-sm font-medium">产品主图</div>
            {edit!.image_url ? (
              <Image
                src={edit!.image_url}
                width={960}
                height={384}
                className="mt-3 h-48 w-full rounded-xl object-contain bg-slate-50"
                alt=""
              />
            ) : (
              <div className="mt-3 grid h-48 place-items-center rounded-xl bg-slate-50 text-sm text-slate-400">
                尚未上传
              </div>
            )}
            <label className="mt-3 block cursor-pointer rounded-xl border px-4 py-3 text-center text-xs">
              {busy ? "上传中…" : "上传 JPG / PNG / WEBP"}
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              />
            </label>
          </div>

          <div className="grid gap-3">
            <textarea
              className="field min-h-28"
              placeholder="核心特点，每行一条"
              value={edit!.featuresText ?? (edit!.features || []).join("\n")}
              onChange={(e) => setEdit({ ...edit, featuresText: e.target.value })}
            />
            <textarea
              className="field min-h-28"
              placeholder="应用场景，每行一条"
              value={edit!.applicationsText ?? (edit!.applications || []).join("\n")}
              onChange={(e) => setEdit({ ...edit, applicationsText: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!edit!.featured}
              onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
            />
            首页推荐
          </label>

          <input
            className="field"
            type="number"
            placeholder="排序"
            value={edit!.sort_order || 0}
            onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })}
          />

          <button
            disabled={busy}
            className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            {busy ? "处理中…" : "保存产品"}
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {rows.map((p) => (
          <article key={p.id} className="xy-workspace-panel overflow-hidden rounded-3xl">
            <div className="grid aspect-[4/3] place-items-center bg-slate-50">
              {p.image_url ? (
                <Image src={p.image_url} width={960} height={720} className="h-full w-full object-contain p-4" alt="" />
              ) : (
                <span className="text-xs text-slate-400">等待设备图片</span>
              )}
            </div>
            <div className="p-5">
              <div className="text-xs text-amber-600">
                {p.model} · {p.status}
              </div>
              <b className="mt-2 block">{p.name}</b>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.description}</p>
              <button
                onClick={() => setEdit({ ...p })}
                className="mt-4 rounded-lg border px-3 py-2 text-xs"
              >
                编辑设备
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
