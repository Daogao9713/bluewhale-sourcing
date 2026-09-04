"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const suggestions = [
  {
    label: "煤电在线监测",
    text: "请介绍适合煤电行业的在线监测产品",
  },
  {
    label: "NC-300",
    text: "NC-300 可以解决什么问题？",
  },
  {
    label: "MES 接口",
    text: "你们的在线监测系统如何与 MES 系统连接？",
  },
];

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* -------------------------------------------------------
     Open / Close behavior
     ------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 220);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* -------------------------------------------------------
     AI request
     ------------------------------------------------------- */

  async function sendMessage(message: string) {
    const clean = message.trim();

    if (!clean || busy) return;

    setQ(clean);
    setBusy(true);
    setReply("");

    try {
      const response = await fetch("/api/site-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: clean,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error("Invalid AI response.");
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "AI request failed.");
      }

      setReply(
        payload?.reply ||
          payload?.error ||
          "暂时无法回答这个问题，请联系星玥阳技术团队进一步确认。"
      );
    } catch (error) {
      console.error("[FloatingAI]", error);

      setReply(
        "AI 服务暂时不可用。你仍可以通过官网联系方式咨询星玥阳技术团队。"
      );
    } finally {
      setBusy(false);
    }
  }

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(q);
  }

  async function askSuggestion(text: string) {
    if (busy) return;

    setQ(text);
    await sendMessage(text);
  }

  /* -------------------------------------------------------
     Keyboard send
     Cmd/Ctrl + Enter
     ------------------------------------------------------- */

  function handleTextareaKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();

      if (q.trim() && !busy) {
        void sendMessage(q);
      }
    }
  }

  function resetConversation() {
    if (busy) return;

    setQ("");
    setReply("");

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }

  return (
    <>
      {/* ===================================================
          Floating AI Orb
          =================================================== */}

      <button
        type="button"
        aria-label="打开星玥阳 AI 智能顾问"
        aria-expanded={open}
        aria-controls="xingyueyang-ai-dialog"
        onClick={() => setOpen(true)}
        className={`xy-ai-orb xy-interactive ${
          open ? "is-hidden" : ""
        }`}
      >
        <span className="xy-ai-orb-icon" aria-hidden="true">
          <span className="xy-ai-orb-star">✦</span>
        </span>

        <span className="xy-ai-orb-copy">
          <span className="xy-ai-orb-title">
            智能顾问
          </span>

          <span className="xy-ai-orb-subtitle">
            XINGYUEYANG AI
          </span>
        </span>

        <span
          className="xy-ai-orb-status"
          aria-hidden="true"
        />
      </button>

      {/* ===================================================
          Backdrop
          =================================================== */}

      <div
        className={`xy-ai-backdrop ${
          open ? "is-open" : ""
        }`}
        aria-hidden={!open}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
      >
        {/* =================================================
            AI Glass Console
            ================================================= */}

        <section
          id="xingyueyang-ai-dialog"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="xingyueyang-ai-title"
          className={`xy-ai-modal ${
            open ? "is-open" : ""
          }`}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          {/* Liquid decorative layers */}

          <div
            className="xy-ai-liquid xy-ai-liquid-one"
            aria-hidden="true"
          />

          <div
            className="xy-ai-liquid xy-ai-liquid-two"
            aria-hidden="true"
          />

          {/* ===============================================
              Header
              =============================================== */}

          <header className="xy-ai-head">
            <div className="xy-ai-brand">
              <div
                className="xy-ai-brand-icon"
                aria-hidden="true"
              >
                ✦
              </div>

              <div>
                <div className="xy-ai-brand-kicker">
                  XINGYUEYANG AI
                </div>

                <h2
                  id="xingyueyang-ai-title"
                  className="xy-ai-title"
                >
                  工业智能顾问
                </h2>
              </div>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="xy-ai-close xy-interactive"
              aria-label="关闭智能顾问"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          {/* ===============================================
              Intro
              =============================================== */}

          {!reply && !busy && (
            <div className="xy-ai-intro">
              <div className="xy-ai-intro-label">
                INDUSTRIAL INTELLIGENCE
              </div>

              <h3>
                今天想了解什么？
              </h3>

              <p>
                可以询问产品选型、工业在线监测、
                行业应用与系统连接。
              </p>
            </div>
          )}

          {/* ===============================================
              Suggestions
              =============================================== */}

          {!reply && !busy && (
            <div className="xy-ai-suggestions">
              {suggestions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void askSuggestion(item.text)
                  }
                  className="xy-ai-suggestion xy-interactive"
                >
                  <span>
                    {item.label}
                  </span>

                  <span
                    className="xy-ai-suggestion-arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ===============================================
              Thinking
              =============================================== */}

          {busy && (
            <div
              className="xy-ai-thinking"
              role="status"
              aria-live="polite"
            >
              <div className="xy-ai-thinking-icon">
                ✦
              </div>

              <div>
                <div className="xy-ai-thinking-title">
                  正在分析产品与应用资料
                </div>

                <div
                  className="xy-ai-thinking-dots"
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          {/* ===============================================
              Reply
              =============================================== */}

          {reply && !busy && (
            <div
              className="xy-ai-response"
              aria-live="polite"
            >
              <div className="xy-ai-response-head">
                <div className="xy-ai-response-brand">
                  <span aria-hidden="true">
                    ✦
                  </span>

                  <span>
                    星玥阳 AI
                  </span>
                </div>

                <button
                  type="button"
                  onClick={resetConversation}
                  className="xy-ai-reset"
                >
                  新问题
                </button>
              </div>

              <div className="xy-ai-reply">
                {reply}
              </div>
            </div>
          )}

          {/* ===============================================
              Input
              =============================================== */}

          <form
            onSubmit={ask}
            className="xy-ai-form"
          >
            <div className="xy-ai-input-shell">
              <textarea
                ref={textareaRef}
                value={q}
                onChange={(event) =>
                  setQ(event.target.value)
                }
                onKeyDown={handleTextareaKeyDown}
                disabled={busy}
                rows={3}
                maxLength={1600}
                placeholder="询问产品、技术或行业解决方案…"
                aria-label="向星玥阳 AI 提问"
              />

              <div className="xy-ai-input-footer">
                <span className="xy-ai-shortcut">
                  Ctrl / ⌘ + Enter
                </span>

                <button
                  type="submit"
                  disabled={!q.trim() || busy}
                  className="xy-ai-send xy-interactive"
                  aria-label="发送问题"
                >
                  {busy ? (
                    <span
                      className="xy-ai-send-loader"
                      aria-hidden="true"
                    />
                  ) : (
                    <span aria-hidden="true">
                      ↑
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* ===============================================
              Footer
              =============================================== */}

          <footer className="xy-ai-footer">
            <span>
              AI 内容仅基于已确认的星玥阳产品与公司资料
            </span>

            <span className="xy-ai-footer-status">
              <span aria-hidden="true" />
              ONLINE
            </span>
          </footer>
        </section>
      </div>
    </>
  );
}