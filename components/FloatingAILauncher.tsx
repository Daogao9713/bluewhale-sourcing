"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const FloatingAI = dynamic(() => import("./FloatingAI"), {
  ssr: false,
  loading: () => <div className="xy-ai-orb" role="status">正在打开智能顾问…</div>,
});

export default function FloatingAILauncher() {
  const [activated, setActivated] = useState(false);

  // Keep the mounted conversation after closing so reopening preserves its state.
  if (activated) return <FloatingAI initiallyOpen />;

  return (
    <button
      type="button"
      aria-label="打开星玥阳 AI 智能顾问"
      aria-expanded={false}
      onClick={() => setActivated(true)}
      className="xy-ai-orb xy-interactive"
    >
      <span className="xy-ai-orb-icon" aria-hidden="true">
        <span className="xy-ai-orb-star">✦</span>
      </span>
      <span className="xy-ai-orb-copy">
        <span className="xy-ai-orb-title">智能顾问</span>
        <span className="xy-ai-orb-subtitle">XINGYUEYANG AI</span>
      </span>
      <span className="xy-ai-orb-status" aria-hidden="true" />
    </button>
  );
}
