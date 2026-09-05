"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type NewsStatus =
  | "draft"
  | "published"
  | "archived";

type News = {
  id: string;
  slug: string;

  title_zh: string;
  title_ja: string;
  title_en: string;

  summary_zh?: string | null;
  summary_ja?: string | null;
  summary_en?: string | null;

  content_zh?: string | null;
  content_ja?: string | null;
  content_en?: string | null;

  cover_url?: string | null;

  status: NewsStatus;

  published_at?: string | null;
  updated_at?: string;
};

const empty = {
  id: "",

  slug: "",

  title_zh: "",
  title_ja: "",
  title_en: "",

  summary_zh: "",
  summary_ja: "",
  summary_en: "",

  content_zh: "",
  content_ja: "",
  content_en: "",

  cover_url: "",

  status: "draft" as NewsStatus,

  published_at: "",
};

export default function NewsAdmin() {
  const [key, setKey] = useState("");
  const [draftKey, setDraftKey] = useState("");

  const [items, setItems] =
    useState<News[]>([]);

  const [form, setForm] =
    useState<any>(empty);

  const [loading, setLoading] =
    useState(false);

  const [translating, setTranslating] =
    useState<"" | "ja" | "en">("");

  const [notice, setNotice] =
    useState("");

  const [q, setQ] =
    useState("");

  const [filter, setFilter] =
    useState<"all" | NewsStatus>("all");

  const [preview, setPreview] =
    useState<"zh" | "ja" | "en">("zh");

  const [counts, setCounts] = useState({
    draft: 0,
    published: 0,
    archived: 0,
  });

  /* =======================================================
     AUTH
     ======================================================= */

  useEffect(() => {
    const stored =
      window.sessionStorage.getItem(
        "bluewhale_admin_key"
      ) || "";

    if (stored) {
      setKey(stored);
    }
  }, []);

  useEffect(() => {
    if (!key) return;

    void load();
    void loadStats();
  }, [key, filter]);

  async function api(
    path: string,
    init: RequestInit = {}
  ) {
    const headers =
      new Headers(init.headers);

    headers.set(
      "x-admin-key",
      key
    );

    if (init.body) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }

    const response = await fetch(path, {
      ...init,
      headers,
      cache: "no-store",
    });

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Request failed"
      );
    }

    return data;
  }

  async function load(search = q) {
    setLoading(true);
    setNotice("");

    try {
      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "q",
          search.trim()
        );
      }

      if (filter !== "all") {
        params.set(
          "status",
          filter
        );
      }

      const data =
        await api(
          `/api/workspace/news?${params.toString()}`
        );

      setItems(
        data.news || []
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Load failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data =
        await api(
          "/api/workspace/news/stats"
        );

      setCounts(
        data.counts || counts
      );
    } catch {}
  }

  function unlock(
    event: FormEvent
  ) {
    event.preventDefault();

    const value =
      draftKey.trim();

    if (!value) return;

    window.sessionStorage.setItem(
      "bluewhale_admin_key",
      value
    );

    setKey(value);
  }

  function logout() {
    window.sessionStorage.removeItem(
      "bluewhale_admin_key"
    );

    setKey("");
    setDraftKey("");
  }

  /* =======================================================
     EDIT
     ======================================================= */

  function edit(item: News) {
    setForm({
      ...empty,
      ...item,

      published_at:
        item.published_at
          ? item.published_at.slice(
              0,
              16
            )
          : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function save(
    event?: FormEvent
  ) {
    event?.preventDefault();

    setLoading(true);
    setNotice("");

    try {
      const data =
        await api(
          "/api/workspace/news",
          {
            method: form.id
              ? "PATCH"
              : "POST",

            body:
              JSON.stringify(
                form
              ),
          }
        );

      setNotice(
        form.id
          ? "News updated."
          : "News created."
      );

      setForm({
        ...empty,
        ...data.news,

        published_at:
          data.news?.published_at?.slice(
            0,
            16
          ) || "",
      });

      await Promise.all([
        load(),
        loadStats(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Save failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(
    status: NewsStatus
  ) {
    const next = {
      ...form,

      status,

      published_at:
        status === "published"
          ? form.published_at ||
            new Date().toISOString()
          : form.published_at,
    };

    setForm(next);

    if (!form.id) return;

    setLoading(true);

    try {
      const data =
        await api(
          "/api/workspace/news",
          {
            method: "PATCH",

            body:
              JSON.stringify(
                next
              ),
          }
        );

      setForm({
        ...next,
        ...data.news,

        published_at:
          data.news?.published_at?.slice(
            0,
            16
          ) || "",
      });

      setNotice(
        status === "published"
          ? "Published."
          : status === "archived"
          ? "Archived."
          : "Moved to draft."
      );

      await Promise.all([
        load(),
        loadStats(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Status update failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function remove(
    id: string
  ) {
    if (
      !window.confirm(
        "Permanently delete this news item? A revision snapshot will be kept."
      )
    ) {
      return;
    }

    try {
      await api(
        `/api/workspace/news?id=${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      if (form.id === id) {
        setForm(empty);
      }

      await Promise.all([
        load(),
        loadStats(),
      ]);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Delete failed"
      );
    }
  }

  /* =======================================================
     AI TRANSLATION
     ======================================================= */

  async function translate(
    target: "ja" | "en"
  ) {
    /*
      Keep the existing delimiter for API compatibility.
      It is internal only and is never shown to customers.
    */

    const source = [
      form.title_zh,
      form.summary_zh,
      form.content_zh,
    ]
      .filter(Boolean)
      .join(
        "\n\n---BLUEWHALE_FIELD---\n\n"
      );

    if (!source.trim()) {
      setNotice(
        "Write Chinese content first."
      );

      return;
    }

    setTranslating(target);
    setNotice("");

    try {
      const data =
        await api(
          "/api/workspace/news/translate",
          {
            method: "POST",

            body:
              JSON.stringify({
                source,
                target,
              }),
          }
        );

      const parts =
        String(
          data.text || ""
        ).split(
          /\s*---BLUEWHALE_FIELD---\s*/
        );

      setForm(
        (old: any) => ({
          ...old,

          [`title_${target}`]:
            parts[0] ||
            old[
              `title_${target}`
            ],

          [`summary_${target}`]:
            parts[1] ||
            old[
              `summary_${target}`
            ],

          [`content_${target}`]:
            parts
              .slice(2)
              .join("\n\n") ||
            old[
              `content_${target}`
            ],
        })
      );

      setNotice(
        `AI ${
          target === "ja"
            ? "Japanese"
            : "English"
        } draft generated. Please review before publishing.`
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Translation failed"
      );
    } finally {
      setTranslating("");
    }
  }

  const set = (
    name: string,
    value: string
  ) =>
    setForm(
      (old: any) => ({
        ...old,
        [name]: value,
      })
    );

  const previewData =
    useMemo(
      () => ({
        title:
          form[
            `title_${preview}`
          ] ||
          form.title_zh,

        summary:
          form[
            `summary_${preview}`
          ] ||
          form.summary_zh,

        content:
          form[
            `content_${preview}`
          ] ||
          form.content_zh,
      }),
      [form, preview]
    );

  function statusClass(
    status: NewsStatus
  ) {
    if (
      status === "published"
    ) {
      return "xy-status xy-status-live";
    }

    if (
      status === "draft"
    ) {
      return "xy-status xy-status-draft";
    }

    return "xy-status";
  }

  /* =======================================================
     LOGIN
     ======================================================= */

  if (!key) {
    return (
      <main className="xy-workspace relative grid min-h-screen place-items-center overflow-hidden p-5">
        <div className="pointer-events-none absolute left-[10%] top-[8%] h-72 w-72 rounded-full bg-blue-300/10 blur-[100px]" />

        <div className="pointer-events-none absolute bottom-[5%] right-[8%] h-72 w-72 rounded-full bg-amber-300/10 blur-[100px]" />

        <form
          onSubmit={unlock}
          className="xy-workspace-panel relative w-full max-w-[440px] rounded-[32px] p-7 sm:p-9"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/70 bg-white/50 text-lg font-bold text-amber-600">
              XY
            </div>

            <div>
              <div className="text-sm font-semibold">
                江苏星玥阳科技有限公司
              </div>

              <div className="mt-0.5 text-[9px] font-bold tracking-[.18em] text-slate-400">
                UNIVERSE TECH
              </div>
            </div>
          </div>

          <div className="mt-10 text-[9px] font-bold tracking-[.2em] text-amber-600">
            XINGYUEYANG CONTENT SYSTEM
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em]">
            Newsroom
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            公司新闻、多语言内容与发布状态管理。
          </p>

          <input
            className="xy-cms-field mt-8 px-4 py-3.5"
            type="password"
            value={draftKey}
            onChange={(event) =>
              setDraftKey(
                event.target.value
              )
            }
            placeholder="Workspace admin key"
          />

          <button className="xy-cms-primary xy-liquid-edge mt-3 w-full rounded-2xl py-3.5 text-sm font-semibold">
            进入内容系统
          </button>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200/50 pt-5 text-[10px] text-slate-400">
            <span>
              XINGYUEYANG INDUSTRIAL OS
            </span>

            <span>X0.44</span>
          </div>
        </form>
      </main>
    );
  }

  /* =======================================================
     CMS
     ======================================================= */

  return (
    <main className="xy-workspace min-h-screen">
      {/* Top bar */}

      <header className="sticky top-0 z-30 px-3 pt-3 lg:px-5 lg:pt-4">
        <div className="xy-workspace-topbar mx-auto flex min-h-16 max-w-[1680px] flex-wrap items-center justify-between gap-3 rounded-2xl px-4 lg:px-5">
          <div>
            <p className="text-[9px] font-bold tracking-[.18em] text-amber-600">
              XINGYUEYANG CONTENT SYSTEM
            </p>

            <h1 className="mt-1 text-sm font-semibold sm:text-base">
              Newsroom · 公司新闻管理
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/news"
              className="xy-glass-button rounded-full px-3 py-2 text-xs font-semibold"
            >
              新闻中心
            </Link>

            <Link
              href="/workspace"
              className="xy-glass-button rounded-full px-3 py-2 text-xs font-semibold"
            >
              Industrial OS
            </Link>

            <button
              type="button"
              onClick={logout}
              className="xy-glass-button rounded-full px-3 py-2 text-xs font-semibold text-slate-500"
            >
              锁定
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1680px] px-3 pb-8 pt-5 sm:px-5">
        {/* CMS title */}

        <div className="xy-cms-toolbar flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[.2em] text-amber-600">
              NEWSROOM
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
              公司新闻
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              管理中文、日文与英文内容，以及草稿、发布和归档状态。
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setForm({
                ...empty,
              })
            }
            className="xy-cms-primary xy-liquid-edge rounded-2xl px-5 py-3 text-xs font-semibold"
          >
            ＋ 新建新闻
          </button>
        </div>

        {/* Stats */}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            [
              "DRAFT",
              counts.draft,
              "draft",
            ],

            [
              "PUBLISHED",
              counts.published,
              "published",
            ],

            [
              "ARCHIVED",
              counts.archived,
              "archived",
            ],
          ].map(
            ([
              label,
              count,
              value,
            ]) => {
              const active =
                filter === value;

              return (
                <button
                  key={String(
                    value
                  )}
                  type="button"
                  onClick={() =>
                    setFilter(
                      active
                        ? "all"
                        : (value as NewsStatus)
                    )
                  }
                  className={`xy-workspace-kpi rounded-3xl p-5 text-left ${
                    active
                      ? "ring-2 ring-amber-400/35"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-bold tracking-[.16em] text-slate-400">
                      {String(
                        label
                      )}
                    </span>

                    {active ? (
                      <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,.45)]" />
                    ) : null}
                  </div>

                  <div className="mt-5 text-3xl font-semibold tracking-[-.04em]">
                    {String(
                      count
                    )}
                  </div>

                  <div className="mt-5 h-px bg-gradient-to-r from-slate-200/70 to-transparent" />

                  <div className="mt-3 text-[9px] text-slate-400">
                    {active
                      ? "FILTER ACTIVE"
                      : "CONTENT STATUS"}
                  </div>
                </button>
              );
            }
          )}
        </div>

        {/* Main workspace */}

        <div className="mt-5 grid gap-5 2xl:grid-cols-[560px_minmax(0,1fr)_420px]">
          {/* Editor */}

          <form
            onSubmit={save}
            className="xy-workspace-panel h-fit rounded-3xl p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/50 pb-5">
              <div>
                <p className="text-[9px] font-bold tracking-[.18em] text-amber-600">
                  EDITOR
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-.025em]">
                  {form.id
                    ? "编辑新闻"
                    : "新建新闻"}
                </h2>
              </div>

              {form.id ? (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...empty,
                    })
                  }
                  className="xy-glass-button rounded-full px-3 py-2 text-xs font-semibold"
                >
                  新建
                </button>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              <input
                required
                value={
                  form.slug ?? ""
                }
                onChange={(event) =>
                  set(
                    "slug",
                    event.target.value
                  )
                }
                placeholder="slug *"
                className="field"
              />

              <input
                required
                value={
                  form.title_zh ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "title_zh",
                    event.target.value
                  )
                }
                placeholder="中文标题 *"
                className="field"
              />

              <textarea
                value={
                  form.summary_zh ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "summary_zh",
                    event.target.value
                  )
                }
                rows={2}
                placeholder="中文摘要"
                className="field"
              />

              <textarea
                value={
                  form.content_zh ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "content_zh",
                    event.target.value
                  )
                }
                rows={8}
                placeholder="中文正文"
                className="field"
              />

              {/* Japanese */}

              <div className="flex items-center justify-between gap-3 border-t border-slate-200/50 pt-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[.12em] text-slate-500">
                    日本語
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    AI TRANSLATION
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    Boolean(
                      translating
                    )
                  }
                  onClick={() =>
                    void translate(
                      "ja"
                    )
                  }
                  className="xy-glass-button rounded-full px-3 py-2 text-[10px] font-semibold disabled:opacity-40"
                >
                  {translating ===
                  "ja"
                    ? "AI 翻译中..."
                    : "中文 → 日本語"}
                </button>
              </div>

              <input
                value={
                  form.title_ja ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "title_ja",
                    event.target.value
                  )
                }
                placeholder="日本語タイトル"
                className="field"
              />

              <textarea
                value={
                  form.summary_ja ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "summary_ja",
                    event.target.value
                  )
                }
                rows={2}
                placeholder="日本語要約"
                className="field"
              />

              <textarea
                value={
                  form.content_ja ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "content_ja",
                    event.target.value
                  )
                }
                rows={6}
                placeholder="日本語本文"
                className="field"
              />

              {/* English */}

              <div className="flex items-center justify-between gap-3 border-t border-slate-200/50 pt-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[.12em] text-slate-500">
                    ENGLISH
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    AI TRANSLATION
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    Boolean(
                      translating
                    )
                  }
                  onClick={() =>
                    void translate(
                      "en"
                    )
                  }
                  className="xy-glass-button rounded-full px-3 py-2 text-[10px] font-semibold disabled:opacity-40"
                >
                  {translating ===
                  "en"
                    ? "AI translating..."
                    : "中文 → EN"}
                </button>
              </div>

              <input
                value={
                  form.title_en ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "title_en",
                    event.target.value
                  )
                }
                placeholder="English title"
                className="field"
              />

              <textarea
                value={
                  form.summary_en ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "summary_en",
                    event.target.value
                  )
                }
                rows={2}
                placeholder="English summary"
                className="field"
              />

              <textarea
                value={
                  form.content_en ??
                  ""
                }
                onChange={(event) =>
                  set(
                    "content_en",
                    event.target.value
                  )
                }
                rows={6}
                placeholder="English body"
                className="field"
              />

              <div className="border-t border-slate-200/50 pt-5">
                <p className="mb-3 text-[9px] font-bold tracking-[.16em] text-slate-400">
                  MEDIA & PUBLISHING
                </p>

                <input
                  value={
                    form.cover_url ??
                    ""
                  }
                  onChange={(event) =>
                    set(
                      "cover_url",
                      event.target.value
                    )
                  }
                  placeholder="Cover image URL"
                  className="field"
                />

                <input
                  type="datetime-local"
                  value={
                    form.published_at ??
                    ""
                  }
                  onChange={(event) =>
                    set(
                      "published_at",
                      event.target.value
                    )
                  }
                  className="field mt-3"
                />
              </div>
            </div>

            {notice ? (
              <p className="mt-5 rounded-2xl border border-white/60 bg-white/40 p-3 text-xs leading-5 text-slate-600 backdrop-blur-xl">
                {notice}
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                disabled={loading}
                className="xy-cms-primary xy-liquid-edge rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : "Save"}
              </button>

              <button
                type="button"
                disabled={
                  !form.id ||
                  loading
                }
                onClick={() =>
                  void setStatus(
                    "published"
                  )
                }
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
              >
                Publish
              </button>

              <button
                type="button"
                disabled={
                  !form.id ||
                  loading
                }
                onClick={() =>
                  void setStatus(
                    "draft"
                  )
                }
                className="xy-glass-button rounded-xl px-4 py-3 text-xs font-semibold disabled:opacity-40"
              >
                Move to draft
              </button>

              <button
                type="button"
                disabled={
                  !form.id ||
                  loading
                }
                onClick={() =>
                  void setStatus(
                    "archived"
                  )
                }
                className="xy-glass-button rounded-xl px-4 py-3 text-xs font-semibold disabled:opacity-40"
              >
                Archive
              </button>
            </div>
          </form>

          {/* News library */}

          <section>
            <div className="xy-cms-toolbar mb-4 flex gap-2 rounded-2xl p-2">
              <input
                value={q}
                onChange={(event) =>
                  setQ(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    void load();
                  }
                }}
                placeholder="Search title or slug..."
                className="field"
              />

              <button
                type="button"
                onClick={() =>
                  void load()
                }
                className="xy-cms-primary rounded-xl px-4 text-xs font-semibold"
              >
                Search
              </button>
            </div>

            <div className="space-y-3">
              {items.map(
                (item) => (
                  <article
                    key={item.id}
                    className={`xy-workspace-panel rounded-3xl p-5 ${
                      form.id ===
                      item.id
                        ? "ring-2 ring-amber-400/30"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          edit(item)
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={statusClass(
                              item.status
                            )}
                          >
                            {
                              item.status
                            }
                          </span>

                          <span className="truncate text-[10px] text-slate-400">
                            {
                              item.slug
                            }
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-semibold tracking-[-.02em]">
                          {
                            item.title_zh
                          }
                        </h3>

                        <p className="mt-2 truncate text-xs text-slate-500">
                          {item.title_ja ||
                            "No Japanese title"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.title_en ||
                            "No English title"}
                        </p>
                      </button>

                      <div className="flex shrink-0 items-start gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            edit(item)
                          }
                          className="xy-glass-button rounded-full px-3 py-2 text-xs font-semibold"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void remove(
                              item.id
                            )
                          }
                          className="rounded-full border border-rose-200/70 bg-rose-50/60 px-3 py-2 text-xs font-semibold text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}

              {!items.length &&
              !loading ? (
                <div className="xy-workspace-panel rounded-3xl p-10 text-center">
                  <div className="text-sm font-semibold text-slate-500">
                    No news in this view.
                  </div>

                  <div className="mt-2 text-xs text-slate-400">
                    Try another filter or create a new article.
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* Preview */}

          <aside className="xy-workspace-panel h-fit rounded-3xl p-5 2xl:sticky 2xl:top-24 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold tracking-[.18em] text-amber-600">
                  LIVE PREVIEW
                </p>

                <h2 className="mt-2 font-semibold">
                  Article preview
                </h2>
              </div>

              <div className="flex rounded-full border border-white/60 bg-white/35 p-1">
                {(
                  [
                    "zh",
                    "ja",
                    "en",
                  ] as const
                ).map(
                  (lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() =>
                        setPreview(
                          lang
                        )
                      }
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                        preview ===
                        lang
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-400"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-6">
              <span
                className={statusClass(
                  form.status
                )}
              >
                {form.status}
              </span>
            </div>

            {form.cover_url ? (
              <div className="mt-5 overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={
                    form.cover_url
                  }
                  alt=""
                  className="aspect-[16/8] w-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-5 grid aspect-[16/8] place-items-center rounded-2xl border border-dashed border-slate-300/70 bg-white/20 text-xs text-slate-400">
                Cover preview
              </div>
            )}

            <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-[-.035em]">
              {previewData.title ||
                "Untitled article"}
            </h3>

            {previewData.summary ? (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {
                  previewData.summary
                }
              </p>
            ) : null}

            <div className="mt-6 whitespace-pre-wrap border-t border-slate-200/50 pt-6 text-sm leading-7 text-slate-700">
              {previewData.content ||
                "Article body preview will appear here."}
            </div>

            <div className="mt-8 border-t border-slate-200/50 pt-5">
              <div className="flex items-center justify-between text-[9px] tracking-[.12em] text-slate-400">
                <span>
                  XINGYUEYANG NEWSROOM
                </span>

                <span>
                  {preview.toUpperCase()}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}