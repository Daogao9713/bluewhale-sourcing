import { NextResponse } from "next/server";

import { chat } from "@/lib/ai/server";
import { publicProducts } from "@/lib/products/server";
import { company } from "@/lib/xingyueyang";

/* =========================================================
   X0.45 · Intelligent Site Advisor
   ---------------------------------------------------------
   Phase 1
   - Multi-turn conversation
   - CMS product grounding
   - Page awareness
   - Intent detection
   - Structured response
   - Hallucination protection
   ========================================================= */

type ConversationMessage = {
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

type StructuredAssistantResponse = {
  reply: string;
  intent: AssistantIntent;
  suggestions: string[];
  action: AssistantAction;
};

/* =========================================================
   Limits
   ========================================================= */

const MAX_MESSAGE_LENGTH = 1600;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_MESSAGE_LENGTH = 1200;

/* =========================================================
   Helpers
   ========================================================= */

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeHistory(value: unknown): ConversationMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => {
      return (
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
      );
    })
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item.role as "user" | "assistant",
      content: cleanText(
        item.content,
        MAX_HISTORY_MESSAGE_LENGTH
      ),
    }))
    .filter((item) => item.content.length > 0);
}

function normalizePathname(value: unknown) {
  const pathname = cleanText(value, 300);

  if (!pathname || !pathname.startsWith("/")) {
    return "/";
  }

  return pathname;
}

/* =========================================================
   Page context
   ========================================================= */

function describePage(pathname: string) {
  if (pathname === "/") {
    return "用户当前位于星玥阳官网首页。";
  }

  if (pathname === "/products") {
    return "用户当前位于产品中心页面。";
  }

  if (pathname.startsWith("/products/")) {
    const slug = pathname.split("/").filter(Boolean)[1];

    return [
      "用户当前正在查看产品详情页。",
      `当前产品 slug=${slug || "unknown"}。`,
      "如果用户使用“这个产品”“这套设备”“它”等指代，应优先结合当前产品理解。",
    ].join("\n");
  }

  if (pathname === "/solutions") {
    return "用户当前位于行业解决方案页面。";
  }

  if (pathname === "/technology") {
    return "用户当前位于技术平台页面。";
  }

  if (pathname === "/cases") {
    return "用户当前位于工程案例页面。";
  }

  if (pathname.startsWith("/cases/")) {
    return "用户当前正在查看某个工程案例详情页面。";
  }

  if (pathname === "/news") {
    return "用户当前位于新闻中心页面。";
  }

  if (pathname === "/about") {
    return "用户当前位于公司介绍页面。";
  }

  if (pathname === "/contact") {
    return "用户当前位于联系我们页面。";
  }

  if (pathname === "/inquiry") {
    return "用户当前位于 Technical / Project Consultation 项目咨询页面。";
  }

  return `用户当前页面路径为 ${pathname}。`;
}

/* =========================================================
   System prompt
   ========================================================= */

function buildSystemPrompt({
  cmsProducts,
  pathname,
}: {
  cmsProducts: unknown[];
  pathname: string;
}) {
  return `
你是江苏星玥阳科技有限公司（UNIVERSE TECH）官方网站的 AI 工业智能顾问。

你的职责不是普通闲聊，而是帮助官网访客：

1. 理解星玥阳的产品与技术能力
2. 根据行业场景提供初步产品方向
3. 解释工业在线监测与系统集成逻辑
4. 帮助用户梳理项目需求
5. 在需求明确时引导进入 Technical / Project Consultation

==============================
事实边界
==============================

你只能依据本提示中提供的“已确认资料”回答涉及星玥阳的事实。

严禁编造：

- 技术参数
- 测量范围
- 测量精度
- 认证
- 价格
- 客户名称
- 项目业绩
- 未提供的接口协议
- 未提供的设备性能
- 未确认的案例数据
- 未确认的交付周期

如果资料不足：

明确说明“现有公开资料中没有足够信息确认”。

然后建议用户联系星玥阳技术团队进一步确认。

不要为了让回答显得完整而推测具体参数。

==============================
对话行为
==============================

你拥有最近的对话上下文。

需要理解：

- “这个”
- “它”
- “刚才那个”
- “这种方案”
- “我们厂”
- “那如果是……”

等上下文指代。

不要机械重复上一轮已经解释过的内容。

如果用户需求不够明确，可以提出一个简短的澄清问题。

例如：

- 所属行业是什么？
- 希望监测什么对象？
- 目前是离线检测还是希望在线连续监测？
- 是否需要连接 MES / ERP / DCS 等上层系统？

一次最多询问 1 到 2 个关键问题。

==============================
产品推荐
==============================

产品推荐必须依据 CMS 产品资料中的：

- name
- model
- category
- description
- subtitle
- features
- applications
- specifications

不得因为产品型号名称而自行推断不存在的能力。

如果存在多个可能产品，应解释选择逻辑，而不是武断指定。

==============================
项目咨询判断
==============================

如果用户出现明显项目意图，例如：

- 我们厂准备建设……
- 我们需要一套……
- 想采购……
- 想做在线监测……
- 能不能接我们的系统……
- 想让你们提供方案……
- 项目怎么对接……
- 如何联系技术人员……

应将 intent 判断为：

project_consultation

并将 action 设置为：

consult_project

回复中可以建议进入 Technical / Project Consultation。

==============================
页面上下文
==============================

${describePage(pathname)}

==============================
公司资料
==============================

${JSON.stringify(company)}

==============================
CMS 当前公开产品资料
==============================

${JSON.stringify(cmsProducts)}

==============================
输出要求
==============================

你必须只输出合法 JSON。

禁止 Markdown。
禁止代码块。
禁止 JSON 之外的解释文字。

严格使用以下结构：

{
  "reply": "给用户的中文回答",
  "intent": "intent",
  "suggestions": [
    "推荐追问1",
    "推荐追问2"
  ],
  "action": "none"
}

intent 只能是：

product_selection
product_detail
technology
solution
integration
project_consultation
company
general
unknown

action 只能是：

none
view_products
view_technology
view_solutions
consult_project

suggestions：

- 最多 3 个
- 每条简短自然
- 必须与当前回答相关
- 如果没有合适追问，可以返回空数组

回答风格：

- 中文
- 专业
- 简洁
- 工业技术顾问风格
- 不夸张
- 不使用营销套话
`.trim();
}

/* =========================================================
   Structured response parser
   ========================================================= */

function parseAssistantResponse(
  text: string
): StructuredAssistantResponse {
  const fallback: StructuredAssistantResponse = {
    reply: text.trim(),
    intent: "unknown",
    suggestions: [],
    action: "none",
  };

  try {
    /*
     * Defensive cleanup:
     * some models may still wrap JSON in markdown fences.
     */
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }

    const validIntents: AssistantIntent[] = [
      "product_selection",
      "product_detail",
      "technology",
      "solution",
      "integration",
      "project_consultation",
      "company",
      "general",
      "unknown",
    ];

    const validActions: AssistantAction[] = [
      "none",
      "view_products",
      "view_technology",
      "view_solutions",
      "consult_project",
    ];

    const intent: AssistantIntent =
      validIntents.includes(parsed.intent)
        ? parsed.intent
        : "unknown";

    const action: AssistantAction =
      validActions.includes(parsed.action)
        ? parsed.action
        : "none";

    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter(
            (item: unknown) =>
              typeof item === "string" &&
              item.trim().length > 0
          )
          .slice(0, 3)
          .map((item: string) =>
            item.trim().slice(0, 120)
          )
      : [];

    const reply =
      typeof parsed.reply === "string" &&
      parsed.reply.trim()
        ? parsed.reply.trim()
        : fallback.reply;

    return {
      reply,
      intent,
      suggestions,
      action,
    };
  } catch {
    /*
     * Never break the public AI experience only because
     * the provider failed to return perfect JSON.
     */
    return fallback;
  }
}

/* =========================================================
   POST
   ========================================================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = cleanText(
      body?.message,
      MAX_MESSAGE_LENGTH
    );

    if (!message) {
      return NextResponse.json(
        {
          error: "Message required.",
        },
        {
          status: 400,
        }
      );
    }

    const history = normalizeHistory(body?.history);
    const pathname = normalizePathname(body?.pathname);

    /*
     * X0.45:
     * Products now come from the real CMS instead of the
     * legacy static product array.
     */
    let cmsProducts: unknown[] = [];

    try {
      cmsProducts = await publicProducts();
    } catch (error) {
      /*
       * Company-level questions should still work if
       * Supabase temporarily fails.
       */
      console.error(
        "[site-assistant:products]",
        error
      );
    }

    const systemPrompt = buildSystemPrompt({
      cmsProducts,
      pathname,
    });

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },

      ...history.map((item) => ({
        role: item.role,
        content: item.content,
      })),

      {
        role: "user" as const,
        content: message,
      },
    ];

    const result = await chat(messages, 800);

    const structured = parseAssistantResponse(
      result.text
    );

    return NextResponse.json({
      success: true,

      reply: structured.reply,
      intent: structured.intent,
      suggestions: structured.suggestions,
      action: structured.action,

      /*
       * Useful during X0.45 development.
       * Does not expose keys or secrets.
       */
      meta: {
        provider: result.provider,
        groundedProducts: cmsProducts.length,
        historyMessages: history.length,
        pathname,
      },
    });
  } catch (error: unknown) {
    console.error(
      "[site-assistant]",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "AI unavailable.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}