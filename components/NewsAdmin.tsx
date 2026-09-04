"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type NewsStatus = "draft" | "published" | "archived";
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
  const [items, setItems] = useState<News[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState<"" | "ja" | "en">("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | NewsStatus>("all");
  const [preview, setPreview] = useState<"zh" | "ja" | "en">("zh");
  const [counts, setCounts] = useState({ draft: 0, published: 0, archived: 0 });

  useEffect(() => {
    const stored = window.sessionStorage.getItem("bluewhale_admin_key") || "";
    if (stored) setKey(stored);
  }, []);

  useEffect(() => {
    if (key) {
      load();
      loadStats();
    }
  }, [key, filter]);

  async function api(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("x-admin-key", key);
    if (init.body) headers.set("Content-Type", "application/json");
    const res = await fetch(path, { ...init, headers, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data;
  }

  async function load(search = q) {
    setLoading(true);
    setNotice("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (filter !== "all") params.set("status", filter);
      const data = await api(`/api/workspace/news?${params.toString()}`);
      setItems(data.news || []);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await api("/api/workspace/news/stats");
      setCounts(data.counts || counts);
    } catch {}
  }

  function unlock(e: FormEvent) {
    e.preventDefault();
    const value = draftKey.trim();
    if (!value) return;
    window.sessionStorage.setItem("bluewhale_admin_key", value);
    setKey(value);
  }

  function logout() {
    window.sessionStorage.removeItem("bluewhale_admin_key");
    setKey("");
    setDraftKey("");
  }

  function edit(item: News) {
    setForm({
      ...empty,
      ...item,
      published_at: item.published_at ? item.published_at.slice(0, 16) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const data = await api("/api/workspace/news", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      setNotice(form.id ? "News updated." : "News created.");
      setForm({ ...empty, ...data.news, published_at: data.news?.published_at?.slice(0, 16) || "" });
      await Promise.all([load(), loadStats()]);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(status: NewsStatus) {
    const next = {
      ...form,
      status,
      published_at:
        status === "published"
          ? form.published_at || new Date().toISOString()
          : form.published_at,
    };
    setForm(next);
    if (!form.id) return;
    setLoading(true);
    try {
      const data = await api("/api/workspace/news", {
        method: "PATCH",
        body: JSON.stringify(next),
      });
      setForm({ ...next, ...data.news, published_at: data.news?.published_at?.slice(0, 16) || "" });
      setNotice(status === "published" ? "Published." : status === "archived" ? "Archived." : "Moved to draft.");
      await Promise.all([load(), loadStats()]);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Status update failed");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Permanently delete this news item? A revision snapshot will be kept.")) return;
    try {
      await api(`/api/workspace/news?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (form.id === id) setForm(empty);
      await Promise.all([load(), loadStats()]);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function translate(target: "ja" | "en") {
    const source = [
      form.title_zh,
      form.summary_zh,
      form.content_zh,
    ].filter(Boolean).join("\n\n---BLUEWHALE_FIELD---\n\n");

    if (!source.trim()) {
      setNotice("Write Chinese content first.");
      return;
    }

    setTranslating(target);
    setNotice("");
    try {
      const data = await api("/api/workspace/news/translate", {
        method: "POST",
        body: JSON.stringify({ source, target }),
      });
      const parts = String(data.text || "").split(/\s*---BLUEWHALE_FIELD---\s*/);
      setForm((old: any) => ({
        ...old,
        [`title_${target}`]: parts[0] || old[`title_${target}`],
        [`summary_${target}`]: parts[1] || old[`summary_${target}`],
        [`content_${target}`]: parts.slice(2).join("\n\n") || old[`content_${target}`],
      }));
      setNotice(`AI ${target === "ja" ? "Japanese" : "English"} draft generated. Please review before publishing.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslating("");
    }
  }

  const set = (name: string, value: string) =>
    setForm((old: any) => ({ ...old, [name]: value }));

  const previewData = useMemo(() => ({
    title: form[`title_${preview}`] || form.title_zh,
    summary: form[`summary_${preview}`] || form.summary_zh,
    content: form[`content_${preview}`] || form.content_zh,
  }), [form, preview]);

  if (!key) {
    return (
      <main className="xy-workspace min-h-screen px-6 py-16">
        <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700">BLUE WHALE CMS · V0.17</p>
          <h1 className="mt-4 text-3xl font-semibold">Content Console</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Admin requests are verified by the server. The Supabase service-role key is never sent to this browser.
          </p>
          <form onSubmit={unlock} className="mt-8">
            <input
              type="password"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="Workspace admin key"
              className="field"
            />
            <button className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white">
              Unlock CMS
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="xy-workspace min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-700">BLUE WHALE CMS · V0.17</p>
            <h1 className="mt-1 text-lg font-semibold">Company News Console</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/news" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold">Public news</Link>
            <Link href="/workspace" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold !text-white">Blue Whale OS</Link>
            <button onClick={logout} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500">Lock</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1680px] px-5 py-6">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Draft", counts.draft, "draft"],
            ["Published", counts.published, "published"],
            ["Archived", counts.archived, "archived"],
          ].map(([label, count, value]) => (
            <button
              key={String(value)}
              onClick={() => setFilter(filter === value ? "all" : value as NewsStatus)}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                filter === value ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="text-3xl font-semibold">{String(count)}</div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{String(label)}</div>
            </button>
          ))}
        </div>

        <div className="grid gap-6 2xl:grid-cols-[560px_minmax(0,1fr)_420px]">
          <form onSubmit={save} className="xy-workspace-panel h-fit rounded-[2rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-700">EDITOR</p>
                <h2 className="mt-1 text-xl font-semibold">{form.id ? "Edit article" : "New article"}</h2>
              </div>
              {form.id ? (
                <button type="button" onClick={() => setForm(empty)} className="text-xs font-semibold text-slate-500">New</button>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              <input required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="slug *" className="field" />
              <input required value={form.title_zh} onChange={(e) => set("title_zh", e.target.value)} placeholder="中文标题 *" className="field" />
              <textarea value={form.summary_zh} onChange={(e) => set("summary_zh", e.target.value)} rows={2} placeholder="中文摘要" className="field" />
              <textarea value={form.content_zh} onChange={(e) => set("content_zh", e.target.value)} rows={8} placeholder="中文正文" className="field" />

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500">日本語</p>
                <button type="button" disabled={!!translating} onClick={() => translate("ja")} className="rounded-full bg-cyan-50 px-3 py-1.5 text-[11px] font-semibold text-cyan-700 disabled:opacity-40">
                  {translating === "ja" ? "AI translating..." : "AI from 中文"}
                </button>
              </div>
              <input value={form.title_ja} onChange={(e) => set("title_ja", e.target.value)} placeholder="日本語タイトル" className="field" />
              <textarea value={form.summary_ja} onChange={(e) => set("summary_ja", e.target.value)} rows={2} placeholder="日本語要約" className="field" />
              <textarea value={form.content_ja} onChange={(e) => set("content_ja", e.target.value)} rows={6} placeholder="日本語本文" className="field" />

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500">ENGLISH</p>
                <button type="button" disabled={!!translating} onClick={() => translate("en")} className="rounded-full bg-cyan-50 px-3 py-1.5 text-[11px] font-semibold text-cyan-700 disabled:opacity-40">
                  {translating === "en" ? "AI translating..." : "AI from 中文"}
                </button>
              </div>
              <input value={form.title_en} onChange={(e) => set("title_en", e.target.value)} placeholder="English title" className="field" />
              <textarea value={form.summary_en} onChange={(e) => set("summary_en", e.target.value)} rows={2} placeholder="English summary" className="field" />
              <textarea value={form.content_en} onChange={(e) => set("content_en", e.target.value)} rows={6} placeholder="English body" className="field" />

              <input value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="Cover image URL (optional)" className="field" />
              <input type="datetime-local" value={form.published_at} onChange={(e) => set("published_at", e.target.value)} className="field" />
            </div>

            {notice ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{notice}</p> : null}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button disabled={loading} className="xy-cms-primary xy-liquid-edge rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                {loading ? "Saving..." : "Save"}
              </button>
              <button type="button" disabled={!form.id || loading} onClick={() => setStatus("published")} className="rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">
                Publish
              </button>
              <button type="button" disabled={!form.id || loading} onClick={() => setStatus("draft")} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold disabled:opacity-40">
                Move to draft
              </button>
              <button type="button" disabled={!form.id || loading} onClick={() => setStatus("archived")} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold disabled:opacity-40">
                Archive
              </button>
            </div>
          </form>

          <section>
            <div className="mb-4 flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="Search title or slug..."
                className="field"
              />
              <button onClick={() => load()} className="rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white">Search</button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.id} className={`xy-workspace-panel rounded-[1.5rem] p-5 ${form.id === item.id ? "border-cyan-300 ring-4 ring-cyan-50" : ""}`}>
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <button type="button" onClick={() => edit(item)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          item.status === "published" ? "bg-emerald-50 text-emerald-700" :
                          item.status === "archived" ? "bg-amber-50 text-amber-700" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {item.status}
                        </span>
                        <span className="truncate text-xs text-slate-400">{item.slug}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold">{item.title_zh}</h3>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.title_ja || "No Japanese title"}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.title_en || "No English title"}</p>
                    </button>
                    <div className="flex shrink-0 items-start gap-2">
                      <button onClick={() => edit(item)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold">Edit</button>
                      <button onClick={() => remove(item.id)} className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
              {!items.length && !loading ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">No news in this view.</div>
              ) : null}
            </div>
          </section>

          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm 2xl:sticky 2xl:top-24">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-700">PREVIEW</p>
                <h2 className="mt-1 font-semibold">Article preview</h2>
              </div>
              <div className="flex rounded-full bg-slate-100 p-1">
                {(["zh", "ja", "en"] as const).map((lang) => (
                  <button key={lang} type="button" onClick={() => setPreview(lang)} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${preview === lang ? "bg-white shadow-sm" : "text-slate-400"}`}>
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {form.cover_url ? <img src={form.cover_url} alt="" className="mt-6 aspect-[16/8] w-full rounded-2xl object-cover" /> : null}
            <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.03em]">{previewData.title || "Untitled article"}</h3>
            {previewData.summary ? <p className="mt-4 text-sm leading-6 text-slate-500">{previewData.summary}</p> : null}
            <div className="mt-6 whitespace-pre-wrap border-t border-slate-100 pt-6 text-sm leading-7 text-slate-700">
              {previewData.content || "Article body preview will appear here."}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
