"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type CaseStatus = "draft" | "published" | "archived";

type CaseItem = {
  id?: string;
  title: string;
  slug: string;
  industry: string;
  location: string;
  related_product: string;
  summary: string;
  content: string;
  image_url: string;
  featured: boolean;
  sort_order: number;
  status: CaseStatus;
};

const blank: CaseItem = {
  title: "",
  slug: "",
  industry: "",
  location: "",
  related_product: "",
  summary: "",
  content: "",
  image_url: "",
  featured: false,
  sort_order: 0,
  status: "draft",
};

export default function CaseAdmin() {
  const [rows, setRows] = useState<CaseItem[]>([]);
  const [edit, setEdit] = useState<CaseItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const api = useCallback(async function api(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);

    headers.set(
      "x-admin-key",
      sessionStorage.getItem("bluewhale_admin_key") || ""
    );

    if (init.body && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(path, {
      ...init,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();

      console.error("[CaseAdmin API]", {
        path,
        status: response.status,
        contentType,
        response: text.slice(0, 300),
      });

      throw new Error(
        `API ${path} 返回了非 JSON 响应（HTTP ${response.status}）`
      );
    }

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload.error || `Request failed (${response.status})`
      );
    }

    return payload;
  }, []);

  const load = useCallback(async function load() {
    try {
      setErr("");
      const data = await api("/api/workspace/cases");
      setRows(data.cases || []);
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Request failed");
    }
  }, [api]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function upload(file: File) {
    setBusy(true);
    setErr("");

    try {
      const body = new FormData();

      body.append("file", file);
      body.append("folder", "cases");

      const payload = await api("/api/workspace/media", {
        method: "POST",
        body,
      });

      setEdit((current) =>
        current
          ? {
              ...current,
              image_url: payload.url || "",
            }
          : current
      );
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();

    if (!edit) return;

    setBusy(true);
    setErr("");

    try {
      await api("/api/workspace/cases", {
        method: edit.id ? "PATCH" : "POST",
        body: JSON.stringify(edit),
      });

      setEdit(null);
      await load();
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const counts = useMemo(
    () => ({
      total: rows.length,
      published: rows.filter((item) => item.status === "published").length,
      featured: rows.filter((item) => item.featured).length,
    }),
    [rows]
  );

  function statusClass(status: CaseStatus) {
    if (status === "published") {
      return "xy-status xy-status-live";
    }

    if (status === "draft") {
      return "xy-status xy-status-draft";
    }

    return "xy-status";
  }

  return (
    <section>
      {/* ===================================================
          CMS HEADER
          =================================================== */}

      <div className="xy-cms-toolbar flex flex-col gap-5 rounded-3xl p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.2em] text-amber-600">
            ENGINEERING CASES
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-slate-950">
            工程案例管理
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            维护工业现场案例、行业、地区、关联设备、项目图片与公开状态。
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErr("");
            setEdit({ ...blank });
          }}
          className="xy-cms-primary xy-liquid-edge shrink-0 rounded-2xl px-5 py-3 text-xs font-semibold"
        >
          ＋ 新增案例
        </button>
      </div>

      {/* ===================================================
          STATS
          =================================================== */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["TOTAL CASES", counts.total],
          ["PUBLISHED", counts.published],
          ["FEATURED", counts.featured],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="xy-workspace-kpi rounded-3xl p-5"
          >
            <div className="text-[9px] font-bold tracking-[.16em] text-slate-400">
              {label}
            </div>

            <div className="mt-5 text-3xl font-semibold tracking-[-.04em] text-slate-950">
              {value}
            </div>

            <div className="mt-5 h-px bg-gradient-to-r from-slate-200/70 to-transparent" />

            <div className="mt-3 text-[9px] font-semibold tracking-[.12em] text-slate-400">
              LIVE DATA
            </div>
          </div>
        ))}
      </div>

      {/* ===================================================
          ERROR
          =================================================== */}

      {err ? (
        <div className="mt-5 rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-sm leading-6 text-amber-800 backdrop-blur-xl">
          {err}
        </div>
      ) : null}

      {/* ===================================================
          EDITOR
          =================================================== */}

      {edit ? (
        <form
          onSubmit={save}
          className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
        >
          {/* Main editor */}

          <div className="xy-workspace-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/50 pb-5">
              <div>
                <p className="text-[9px] font-bold tracking-[.18em] text-amber-600">
                  CASE EDITOR
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-.025em]">
                  {edit.id ? "编辑工程案例" : "创建工程案例"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEdit(null)}
                className="xy-glass-button rounded-full px-3 py-2 text-xs text-slate-500"
              >
                关闭
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  案例标题 *
                </span>

                <input
                  className="field"
                  required
                  placeholder="例如：某煤电企业入炉煤在线监测项目"
                  value={edit.title ?? ""}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      title: event.target.value,
                    })
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  SLUG
                </span>

                <input
                  className="field"
                  placeholder="英文路径，例如 coal-monitoring"
                  value={edit.slug ?? ""}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      slug: event.target.value,
                    })
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  行业
                </span>

                <input
                  className="field"
                  placeholder="煤电 / 化工 / 制药..."
                  value={edit.industry ?? ""}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      industry: event.target.value,
                    })
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  地区
                </span>

                <input
                  className="field"
                  placeholder="项目所在地区"
                  value={edit.location ?? ""}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      location: event.target.value,
                    })
                  }
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  关联设备
                </span>

                <input
                  className="field"
                  placeholder="例如 NC-300"
                  value={edit.related_product ?? ""}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      related_product: event.target.value,
                    })
                  }
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  项目摘要
                </span>

                <textarea
                  className="field min-h-28"
                  placeholder="简要说明项目背景、应用场景与方案价值"
                  value={edit.summary ?? ""}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      summary: event.target.value,
                    })
                  }
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  案例正文
                </span>

                <textarea
                  className="field min-h-56"
                  placeholder="工程背景、实施方式、系统结构与项目说明"
                  value={edit.content ?? ""}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      content: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          </div>

          {/* Settings */}

          <aside className="space-y-5">
            <div className="xy-workspace-panel rounded-3xl p-5">
              <p className="text-[9px] font-bold tracking-[.18em] text-slate-400">
                MEDIA
              </p>

              <h3 className="mt-2 font-semibold">
                案例主图
              </h3>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/70 bg-slate-100/70">
                {edit.image_url ? (
                  <Image
                    src={edit.image_url}
                    width={960}
                    height={540}
                    className="aspect-video w-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="grid aspect-video place-items-center text-xs text-slate-400">
                    暂无案例图片
                  </div>
                )}
              </div>

              <label className="xy-glass-button mt-3 block cursor-pointer rounded-xl px-4 py-3 text-center text-xs font-semibold">
                {busy ? "处理中..." : "上传案例图片"}

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      void upload(file);
                    }
                  }}
                />
              </label>

              {edit.image_url ? (
                <input
                  className="field mt-3"
                  value={edit.image_url ?? ""}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      image_url: event.target.value,
                    })
                  }
                  placeholder="Image URL"
                />
              ) : null}
            </div>

            <div className="xy-workspace-panel rounded-3xl p-5">
              <p className="text-[9px] font-bold tracking-[.18em] text-slate-400">
                PUBLISHING
              </p>

              <div className="mt-5">
                <div className={statusClass(edit.status)}>
                  {edit.status.toUpperCase()}
                </div>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  发布状态
                </span>

                <select
                  className="field"
                  value={edit.status}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      status: event.target.value as CaseStatus,
                    })
                  }
                >
                  <option value="draft">草稿</option>
                  <option value="published">发布</option>
                  <option value="archived">归档</option>
                </select>
              </label>

              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-white/60 bg-white/35 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">
                    首页推荐
                  </div>

                  <div className="mt-1 text-[10px] text-slate-400">
                    Featured engineering case
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={Boolean(edit.featured)}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      featured: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-amber-500"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-[10px] font-semibold tracking-[.1em] text-slate-500">
                  排序
                </span>

                <input
                  className="field"
                  type="number"
                  value={edit.sort_order ?? 0}
                  onChange={(event) =>
                    setEdit({
                      ...edit,
                      sort_order: Number(event.target.value) || 0,
                    })
                  }
                />
              </label>

              <button
                disabled={busy}
                className="xy-cms-primary xy-liquid-edge mt-5 w-full rounded-2xl px-4 py-3.5 text-sm font-semibold disabled:opacity-40"
              >
                {busy ? "正在保存..." : "保存案例"}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => setEdit(null)}
                className="mt-2 w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:text-slate-900"
              >
                取消
              </button>
            </div>
          </aside>
        </form>
      ) : null}

      {/* ===================================================
          CASE LIBRARY
          =================================================== */}

      <div className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold tracking-[.18em] text-slate-400">
              CASE LIBRARY
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              已有案例
            </h2>
          </div>

          <span className="text-xs text-slate-400">
            {rows.length} ITEMS
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => (
            <article
              key={item.id}
              className="xy-workspace-panel group overflow-hidden rounded-3xl"
            >
              <div className="relative overflow-hidden bg-slate-100">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    width={960}
                    height={540}
                    className="aspect-video w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                    alt=""
                  />
                ) : (
                  <div className="grid aspect-video place-items-center text-xs text-slate-400">
                    暂无图片
                  </div>
                )}

                <div className="absolute left-4 top-4">
                  <span className={statusClass(item.status)}>
                    {item.status}
                  </span>
                </div>

                {item.featured ? (
                  <span className="absolute right-4 top-4 rounded-full border border-white/60 bg-white/75 px-2.5 py-1 text-[9px] font-bold tracking-[.1em] text-amber-700 backdrop-blur-xl">
                    FEATURED
                  </span>
                ) : null}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-[.12em] text-amber-600">
                    {item.industry || "ENGINEERING"}
                  </span>

                  <span className="truncate text-[10px] text-slate-400">
                    {item.location || "LOCATION N/A"}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-semibold tracking-[-.02em]">
                  {item.title}
                </h3>

                {item.summary ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">
                    {item.summary}
                  </p>
                ) : null}

                <div className="mt-5 flex items-center justify-between border-t border-slate-200/50 pt-4">
                  <span className="text-[10px] text-slate-400">
                    {item.related_product || "NO PRODUCT LINK"}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setErr("");
                      setEdit({
                        ...blank,
                        ...item,
                      });

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="xy-glass-button rounded-full px-3 py-2 text-xs font-semibold"
                  >
                    编辑
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!rows.length ? (
          <div className="xy-workspace-panel mt-5 rounded-3xl p-12 text-center">
            <div className="text-sm font-semibold text-slate-500">
              暂无工程案例
            </div>

            <div className="mt-2 text-xs text-slate-400">
              创建案例后会在这里形成案例库。
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}