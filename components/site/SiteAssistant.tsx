"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSiteLanguage } from "./SiteLanguageProvider";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function SiteAssistant() {
  const { lang, copy } = useSiteLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: copy.assistant.welcome },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 1 && current[0]?.role === "assistant") {
        return [{ role: "assistant", content: copy.assistant.welcome }];
      }
      return current;
    });
  }, [lang, copy.assistant.welcome]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    const history = messages.slice(-8);
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/site-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, lang }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "AI unavailable");

      setMessages([
        ...next,
        { role: "assistant", content: data.reply || copy.assistant.unavailable },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: copy.assistant.unavailable },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`ai-fab ${open ? "pointer-events-none opacity-0" : ""}`}
      >
        <span className="ai-fab-dot">AI</span>
        <span>{copy.assistant.open}</span>
      </button>

      {open ? (
        <div className="ai-panel">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">{copy.assistant.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{copy.assistant.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 hover:text-slate-950"
            >
              ×
            </button>
          </div>

          <div className="ai-messages">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-3 text-xs leading-5 ${
                    m.role === "user"
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="text-xs text-slate-400">AI ···</div>
            ) : null}
          </div>

          <form onSubmit={send} className="border-t border-slate-100 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1200}
                placeholder={copy.assistant.placeholder}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-cyan-600"
              />
              <button
                disabled={!input.trim() || loading}
                className="rounded-xl bg-slate-950 px-3.5 text-xs font-semibold text-white disabled:opacity-40"
              >
                {copy.assistant.send}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
