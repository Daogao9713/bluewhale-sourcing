
"use client";

async function ensureWorkspaceCookie() {
  const existing = await fetch("/api/workspace/auth", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (existing.ok) return true;

  const legacyKey =
    typeof window !== "undefined"
      ? sessionStorage.getItem("bluewhale_admin_key")
      : null;

  if (!legacyKey) return false;

  const login = await fetch("/api/workspace/auth", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: legacyKey }),
  });

  return login.ok;
}


import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Tab = "dashboard" | "projects" | "suppliers" | "rfq" | "inquiries" | "ai";
type Row = Record<string, any>;

const nav: { id: Tab | "news"; label: string; short: string }[] = [
  { id: "dashboard", label: "Dashboard", short: "DB" },
  { id: "news", label: "Company News", short: "NW" },
  { id: "projects", label: "Projects", short: "PR" },
  { id: "suppliers", label: "Suppliers", short: "SP" },
  { id: "rfq", label: "RFQ", short: "RQ" },
  { id: "inquiries", label: "Inquiries", short: "IN" },
  { id: "ai", label: "AI Copilot", short: "AI" },
];

function value(row: Row, ...keys: string[]) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== "") return row[key];
  }
  return "—";
}

function fmtDate(input: any) {
  if (!input) return "—";
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? String(input) : date.toLocaleDateString();
}

export default function WorkspaceShell() {
  const [key, setKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<any>({ projects: [], suppliers: [], rfqs: [], inquiries: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("bluewhale_admin_key") || "";
    if (stored) setKey(stored);
  }, []);

  useEffect(() => {
    if (key) loadWorkspace();
  }, [key]);

  async function request(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("x-admin-key", key);
    if (init.body) headers.set("Content-Type", "application/json");
    const res = await fetch(path, { ...init, headers, cache: "no-store" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
    return payload;
  }

  async function loadWorkspace() {
    setLoading(true);
    setError("");
    try {
      const payload = await request("/api/workspace");
      setData({
        projects: payload.projects || [],
        suppliers: payload.suppliers || [],
        rfqs: payload.rfqs || payload.rfq || [],
        inquiries: payload.inquiries || [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workspace data.");
    } finally {
      setLoading(false);
    }
  }

  function unlock(e: FormEvent) {
    e.preventDefault();
    const next = draftKey.trim();
    if (!next) return;
    window.sessionStorage.setItem("bluewhale_admin_key", next);
    setKey(next);
  }

  function lock() {
    window.sessionStorage.removeItem("bluewhale_admin_key");
    setKey("");
    setDraftKey("");
  }

  const stats = useMemo(() => ({
    projects: data.projects.length,
    suppliers: data.suppliers.length,
    rfqs: data.rfqs.length,
    inquiries: data.inquiries.length,
  }), [data]);

  if (!key) {
    return (
      <main className="min-h-screen bg-[#f4f7f9] px-6 py-20">
        <div className="mx-auto max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
          <div className="border-b border-slate-100 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">BW</div>
            <p className="mt-8 text-[10px] font-semibold tracking-[0.22em] text-cyan-700">BLUE WHALE OS · V0.18</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Operations Console</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Internal workspace for company content, sourcing operations, inquiries and AI.
            </p>
          </div>
          <form onSubmit={unlock} className="p-8">
            <input type="password" className="field" value={draftKey} onChange={(e) => setDraftKey(e.target.value)} placeholder="Workspace admin key" />
            <button className="mt-3 w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white">Enter Workspace</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] border-r border-slate-200 bg-slate-950 text-white transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-950">BW</div>
              <div>
                <div className="text-sm font-semibold">Blue Whale OS</div>
                <div className="mt-0.5 text-[10px] tracking-[0.16em] text-slate-500">OPERATIONS · V0.18</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {nav.map((item) =>
              item.id === "news" ? (
                <Link key={item.id} href="/workspace/news" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[9px] font-bold">{item.short}</span>
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id as Tab); setMobileNav(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${tab === item.id ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-bold ${tab === item.id ? "bg-slate-100" : "bg-white/5"}`}>{item.short}</span>
                  {item.label}
                </button>
              )
            )}
          </nav>

          <div className="border-t border-white/10 p-3">
            <Link href="/" className="block rounded-xl px-3 py-2.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white">Open public website ↗</Link>
            <button onClick={lock} className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-xs text-slate-500 hover:bg-white/10 hover:text-white">Lock workspace</button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileNav(!mobileNav)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold lg:hidden">Menu</button>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Blue Whale New Energy</p>
                <h1 className="text-sm font-semibold">{nav.find((x) => x.id === tab)?.label || "Workspace"}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`hidden rounded-full px-3 py-1.5 text-[10px] font-semibold sm:inline ${error ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                {error ? "Attention" : "Systems online"}
              </span>
              <button onClick={loadWorkspace} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">Refresh</button>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8">
          {error ? (
            <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
              <div><strong>Workspace API:</strong> {error}</div>
              <button onClick={loadWorkspace} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold shadow-sm">Retry</button>
            </div>
          ) : null}

          {tab === "dashboard" ? <Dashboard stats={stats} data={data} loading={loading} /> : null}
          {tab === "projects" ? <DataSection title="Projects" subtitle="Track active business and sourcing work." rows={data.projects} kind="projects" onRefresh={loadWorkspace} request={request} /> : null}
          {tab === "suppliers" ? <DataSection title="Suppliers" subtitle="Supplier network and capability records." rows={data.suppliers} kind="suppliers" onRefresh={loadWorkspace} request={request} /> : null}
          {tab === "rfq" ? <DataSection title="RFQ" subtitle="Requests for quotation and sourcing demand." rows={data.rfqs} kind="rfqs" onRefresh={loadWorkspace} request={request} /> : null}
          {tab === "inquiries" ? <DataSection title="Inquiries" subtitle="Inbound requests from the public website." rows={data.inquiries} kind="inquiries" onRefresh={loadWorkspace} request={request} readOnly /> : null}
          {tab === "ai" ? <Copilot request={request} /> : null}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ stats, data, loading }: any) {
  const cards = [
    ["Projects", stats.projects, "Active business work"],
    ["Suppliers", stats.suppliers, "Supplier records"],
    ["RFQs", stats.rfqs, "Quotation workflows"],
    ["Inquiries", stats.inquiries, "Website leads"],
  ];

  const recent = [
    ...data.projects.map((x: Row) => ({ type: "Project", title: value(x, "name", "title", "project_name"), date: value(x, "updated_at", "created_at") })),
    ...data.inquiries.map((x: Row) => ({ type: "Inquiry", title: value(x, "product_name", "company_name", "contact_name"), date: value(x, "created_at") })),
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  return (
    <>
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.3fr_.7fr]">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-cyan-400">OPERATIONS OVERVIEW</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] lg:text-5xl">One workspace for content, sourcing and global business.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
              V0.18 reorganizes the internal system around a persistent operating console. Company News is now a first-class workspace module rather than a hidden URL.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/workspace/news" className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="text-[10px] font-semibold tracking-[0.15em] text-cyan-400">CONTENT</div>
              <div className="mt-8 text-lg font-semibold">Publish News</div>
              <div className="mt-1 text-xs text-slate-500">Open CMS →</div>
            </Link>
            <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
              <div className="text-[10px] font-semibold tracking-[0.15em] text-cyan-400">PUBLIC</div>
              <div className="mt-8 text-lg font-semibold">Website</div>
              <div className="mt-1 text-xs text-slate-500">Open site →</div>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, count, hint]) => (
          <div key={String(label)} className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{String(label)}</div>
            <div className="mt-5 text-4xl font-semibold tracking-[-0.05em]">{loading ? "…" : String(count)}</div>
            <div className="mt-2 text-xs text-slate-500">{String(hint)}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-[10px] font-semibold tracking-[0.16em] text-cyan-700">ACTIVITY</p><h3 className="mt-1 font-semibold">Recent workspace activity</h3></div>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {recent.map((item: any, i: number) => (
              <div key={`${item.type}-${i}`} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{item.type}</div>
                  <div className="mt-1 truncate text-sm font-medium">{item.title}</div>
                </div>
                <div className="shrink-0 text-xs text-slate-400">{fmtDate(item.date)}</div>
              </div>
            ))}
            {!recent.length ? <div className="py-10 text-center text-sm text-slate-400">No activity yet.</div> : null}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-cyan-700">SYSTEM</p>
          <h3 className="mt-1 font-semibold">Operating layers</h3>
          <div className="mt-6 space-y-3">
            {[
              ["Company Website", "Public identity, multilingual pages and inquiry capture"],
              ["Content CMS", "News publishing, translations and public news stream"],
              ["Sourcing OS", "Projects, suppliers, RFQ and inbound demand"],
              ["AI Layer", "Public concierge plus internal business copilot"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function DataSection({ title, subtitle, rows, kind, onRefresh, request, readOnly = false }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<any>({});
  const [message, setMessage] = useState("");

  async function create(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await request("/api/workspace", {
        method: "POST",
        body: JSON.stringify({ type: kind === "rfqs" ? "rfq" : kind.slice(0, -1), ...form }),
      });
      setForm({});
      setShowCreate(false);
      await onRefresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Create failed");
    }
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-700">OPERATIONS</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        {!readOnly ? <button onClick={() => setShowCreate(!showCreate)} className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white">{showCreate ? "Close" : `New ${title === "RFQ" ? "RFQ" : title.slice(0, -1)}`}</button> : null}
      </div>

      {showCreate ? (
        <form onSubmit={create} className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="field" placeholder={kind === "suppliers" ? "Supplier name" : kind === "rfqs" ? "RFQ title" : "Project name"} onChange={(e) => setForm({ ...form, name: e.target.value, title: e.target.value })} required />
            <input className="field" placeholder="Status / category (optional)" onChange={(e) => setForm({ ...form, status: e.target.value, category: e.target.value })} />
          </div>
          {message ? <p className="mt-3 text-xs text-rose-600">{message}</p> : null}
          <button className="mt-4 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-semibold text-white">Create</button>
        </form>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <tr><th className="px-5 py-4">Name / Subject</th><th className="px-5 py-4">Status / Type</th><th className="px-5 py-4">Contact / Detail</th><th className="px-5 py-4">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row: Row, i: number) => (
                <tr key={row.id || i} className="text-sm">
                  <td className="px-5 py-4 font-medium">{value(row, "name", "title", "project_name", "supplier_name", "product_name", "company_name")}</td>
                  <td className="px-5 py-4 text-slate-500">{value(row, "status", "category", "type", "preferred_language")}</td>
                  <td className="px-5 py-4 text-slate-500">{value(row, "email", "contact_name", "contact", "model_number", "quantity")}</td>
                  <td className="px-5 py-4 text-slate-400">{fmtDate(value(row, "updated_at", "created_at", "published_at"))}</td>
                </tr>
              ))}
              {!rows.length ? <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-400">No records yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Copilot({ request }: any) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Blue Whale Copilot is ready. Ask about projects, suppliers, RFQs or inbound inquiries." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    const history = [...messages, { role: "user" as const, content: message }];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const payload = await request("/api/agent", {
        method: "POST",
        body: JSON.stringify({ message, messages: history.slice(-8) }),
      });
      setMessages((old) => [...old, { role: "assistant", content: payload.reply || payload.message || "No response." }]);
    } catch (e) {
      setMessages((old) => [...old, { role: "assistant", content: e instanceof Error ? e.message : "Copilot request failed." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-700">INTERNAL AI</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">AI Copilot</h2>
      <p className="mt-2 text-sm text-slate-500">Internal read-only analysis for sourcing and business context.</p>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
        <div className="h-[55vh] space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "ml-auto bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}>
              {m.content}
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-4">
          <input className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Blue Whale Copilot..." />
          <button disabled={busy} className="rounded-xl bg-slate-950 px-5 text-xs font-semibold text-white disabled:opacity-40">{busy ? "…" : "Send"}</button>
        </form>
      </div>
    </section>
  );
}
