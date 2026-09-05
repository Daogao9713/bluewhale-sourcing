"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname, useRouter } from "next/navigation";

/* =========================================================
   X0.45 · Intelligent Site Advisor
   ---------------------------------------------------------
   - Multi-turn conversation
   - Page awareness
   - Dynamic AI suggestions
   - Structured AI actions
   - Project consultation handoff
   ========================================================= */

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantIntent =
  | "product_selection"
  | "product_detail"
  | "technology"
  | "solution"
  | "integration"
  | "project_consultation"
  | "company"
  | "general"
  | "unknown";

type AssistantAction =
  | "none"
  | "view_products"
  | "view_technology"
  | "view_solutions"
  | "consult_project";

type AssistantPayload = {
  success?: boolean;
  reply?: string;
  intent?: AssistantIntent;
  suggestions?: string[];
  action?: AssistantAction;
  error?: string;
};

const initialSuggestions = [
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

/* =========================================================
   Component
   ========================================================= */

export default function FloatingAI() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [intent, setIntent] =
    useState<AssistantIntent>("unknown");
  const [action, setAction] =
    useState<AssistantAction>("none");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     Open / Close behavior
     ========================================================= */

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 220);

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function onKeyDown(
      event: globalThis.KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      window.clearTimeout(timer);

      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [open]);

  /* =========================================================
     Auto scroll conversation
     ========================================================= */

  useEffect(() => {
    if (!conversationRef.current) return;

    conversationRef.current.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  /* =========================================================
     AI request
     ========================================================= */

  async function sendMessage(message: string) {
    const clean = message.trim();

    if (!clean || busy) return;

    /*
     * Important:
     * history must be captured BEFORE adding the new
     * user message because the API adds current message
     * separately.
     */
    const history = messages.slice(-8);

    const userMessage: ChatMessage = {
      role: "user",
      content: clean,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQ("");
    setBusy(true);

    /*
     * Previous suggestions/actions should not remain
     * active while a new answer is being generated.
     */
    setSuggestions([]);
    setAction("none");

    try {
      const response = await fetch(
        "/api/site-assistant",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: clean,
            history,
            pathname,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "Invalid AI response."
        );
      }

      const payload: AssistantPayload =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "AI request failed."
        );
      }

      const reply =
        payload.reply ||
        "暂时无法回答这个问题，请联系星玥阳技术团队进一步确认。";

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: reply,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setIntent(
        payload.intent || "unknown"
      );

      setAction(
        payload.action || "none"
      );

      setSuggestions(
        Array.isArray(payload.suggestions)
          ? payload.suggestions.slice(0, 3)
          : []
      );
    } catch (error) {
      console.error(
        "[FloatingAI]",
        error
      );

      const fallback: ChatMessage = {
        role: "assistant",
        content:
          "AI 服务暂时不可用。你仍可以通过官网联系方式咨询星玥阳技术团队。",
      };

      setMessages((current) => [
        ...current,
        fallback,
      ]);

      setIntent("unknown");
      setAction("none");
      setSuggestions([]);
    } finally {
      setBusy(false);
    }
  }

  /* =========================================================
     Form submit
     ========================================================= */

  async function ask(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await sendMessage(q);
  }

  /* =========================================================
     Suggestion
     ========================================================= */

  async function askSuggestion(
    text: string
  ) {
    if (busy) return;

    await sendMessage(text);
  }

  /* =========================================================
     Keyboard send
     Cmd/Ctrl + Enter
     ========================================================= */

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

  /* =========================================================
     Reset conversation
     ========================================================= */

  function resetConversation() {
    if (busy) return;

    setQ("");
    setMessages([]);
    setSuggestions([]);
    setIntent("unknown");
    setAction("none");

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }

  /* =========================================================
     Structured action
     ========================================================= */

  function handleAction() {
    switch (action) {
      case "view_products":
        setOpen(false);
        router.push("/products");
        break;

      case "view_technology":
        setOpen(false);
        router.push("/technology");
        break;

      case "view_solutions":
        setOpen(false);
        router.push("/solutions");
        break;

      case "consult_project":
        setOpen(false);
        router.push("/inquiry");
        break;

      default:
        break;
    }
  }

  function actionLabel() {
    switch (action) {
      case "view_products":
        return "查看产品中心";

      case "view_technology":
        return "了解技术平台";

      case "view_solutions":
        return "查看行业方案";

      case "consult_project":
        return "进入项目咨询";

      default:
        return "";
    }
  }

  const hasConversation =
    messages.length > 0;

  /* =========================================================
     Render
     ========================================================= */

  return (
    <>
      {/* =====================================================
          Floating AI Orb
          ===================================================== */}

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
        <span
          className="xy-ai-orb-icon"
          aria-hidden="true"
        >
          <span className="xy-ai-orb-star">
            ✦
          </span>
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

      {/* =====================================================
          Backdrop
          ===================================================== */}

      <div
        className={`xy-ai-backdrop ${
          open ? "is-open" : ""
        }`}
        aria-hidden={!open}
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            setOpen(false);
          }
        }}
      >
        {/* ===================================================
            AI Glass Console
            =================================================== */}

        <section
          id="xingyueyang-ai-dialog"
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

          {/* =================================================
              Header
              ================================================= */}

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
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="xy-ai-close xy-interactive"
              aria-label="关闭智能顾问"
            >
              <span aria-hidden="true">
                ×
              </span>
            </button>
          </header>

          {/* =================================================
              Conversation / Intro
              ================================================= */}

          <div
            ref={conversationRef}
            className="xy-ai-conversation"
            aria-live="polite"
          >
            {!hasConversation &&
              !busy && (
                <>
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

                  <div className="xy-ai-suggestions">
                    {initialSuggestions.map(
                      (item) => (
                        <button
                          key={item.label}
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void askSuggestion(
                              item.text
                            )
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
                      )
                    )}
                  </div>
                </>
              )}

            {/* ===============================================
                Messages
                =============================================== */}

            {messages.map(
              (message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`xy-ai-message ${
                    message.role === "user"
                      ? "is-user"
                      : "is-assistant"
                  }`}
                >
                  <div className="xy-ai-message-meta">
                    {message.role === "user"
                      ? "YOU"
                      : "星玥阳 AI"}
                  </div>

                  <div className="xy-ai-message-content">
                    {message.content}
                  </div>
                </div>
              )
            )}

            {/* ===============================================
                Thinking
                =============================================== */}

            {busy && (
              <div
                className="xy-ai-thinking"
                role="status"
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
                Dynamic suggestions
                =============================================== */}

            {!busy &&
              hasConversation &&
              suggestions.length > 0 && (
                <div className="xy-ai-followups">
                  <div className="xy-ai-followups-label">
                    继续了解
                  </div>

                  <div className="xy-ai-suggestions">
                    {suggestions.map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() =>
                            void askSuggestion(
                              suggestion
                            )
                          }
                          className="xy-ai-suggestion xy-interactive"
                        >
                          <span>
                            {suggestion}
                          </span>

                          <span
                            className="xy-ai-suggestion-arrow"
                            aria-hidden="true"
                          >
                            ↗
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* ===============================================
                Structured action
                =============================================== */}

            {!busy &&
              hasConversation &&
              action !== "none" && (
                <div className="xy-ai-action">
                  <button
                    type="button"
                    onClick={handleAction}
                    className="xy-ai-action-button xy-interactive"
                  >
                    <span>
                      {actionLabel()}
                    </span>

                    <span aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              )}
          </div>

          {/* =================================================
              Conversation toolbar
              ================================================= */}

          {hasConversation && (
            <div className="xy-ai-conversation-toolbar">
              <div className="xy-ai-context">
                <span
                  className="xy-ai-context-dot"
                  aria-hidden="true"
                />

                <span>
                  CONTEXT ACTIVE
                </span>
              </div>

              <button
                type="button"
                onClick={resetConversation}
                disabled={busy}
                className="xy-ai-reset"
              >
                新对话
              </button>
            </div>
          )}

          {/* =================================================
              Input
              ================================================= */}

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
                onKeyDown={
                  handleTextareaKeyDown
                }
                disabled={busy}
                rows={3}
                maxLength={1600}
                placeholder={
                  hasConversation
                    ? "继续询问…"
                    : "询问产品、技术或行业解决方案…"
                }
                aria-label="向星玥阳 AI 提问"
              />

              <div className="xy-ai-input-footer">
                <span className="xy-ai-shortcut">
                  Ctrl / ⌘ + Enter
                </span>

                <button
                  type="submit"
                  disabled={
                    !q.trim() || busy
                  }
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

          {/* =================================================
              Footer
              ================================================= */}

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