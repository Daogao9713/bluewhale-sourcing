import "server-only";

import { company } from "@/lib/xingyueyang";

/* =========================================================
   X0.45 · Intelligent Site Advisor Core
   ---------------------------------------------------------
   Phase 2
   - Shared advisor types
   - Project Context
   - Page Context
   - Current Product Grounding
   - Prompt builder
   - Structured response parser
   ========================================================= */

/* =========================================================
   Conversation
   ========================================================= */

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

/* =========================================================
   Intent / Action
   ========================================================= */

export type AssistantIntent =
  | "product_selection"
  | "product_detail"
  | "technology"
  | "solution"
  | "integration"
  | "project_consultation"
  | "company"
  | "general"
  | "unknown";

export type AssistantAction =
  | "none"
  | "view_products"
  | "view_technology"
  | "view_solutions"
  | "consult_project";

/* =========================================================
   Project Context
   ---------------------------------------------------------
   Machine-readable memory of the user's industrial project.

   Keep this deliberately small.
   It is not a CRM record and must never invent missing data.
   ========================================================= */

export type ProjectContext = {
  industry: string | null;
  target: string | null;
  product: string | null;
  model: string | null;
  integration: string | null;
  requirement: string | null;
  projectIntent: boolean;
};

/* =========================================================
   Structured AI response
   ========================================================= */

export type StructuredAssistantResponse = {
  reply: string;
  intent: AssistantIntent;
  suggestions: string[];
  action: AssistantAction;
  projectContext: ProjectContext;
};

/* =========================================================
   Grounded product
   ========================================================= */

export type AdvisorProduct = {
  id?: unknown;
  model?: unknown;
  name?: unknown;
  slug?: unknown;
  category?: unknown;
  description?: unknown;
  subtitle?: unknown;
  features?: unknown;
  applications?: unknown;
  specifications?: unknown;
  featured?: unknown;
  sort_order?: unknown;
  status?: unknown;
  [key: string]: unknown;
};

/* =========================================================
   Defaults
   ========================================================= */

export function emptyProjectContext(): ProjectContext {
  return {
    industry: null,
    target: null,
    product: null,
    model: null,
    integration: null,
    requirement: null,
    projectIntent: false,
  };
}

/* =========================================================
   Text helpers
   ========================================================= */

export function cleanText(
  value: unknown,
  maxLength: number
) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

function cleanNullableText(
  value: unknown,
  maxLength = 300
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim().slice(0, maxLength);

  return cleaned || null;
}

/* =========================================================
   History normalization
   ========================================================= */

export function normalizeHistory(
  value: unknown,
  maxMessages = 8,
  maxMessageLength = 1200
): ConversationMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => {
      return (
        item &&
        typeof item === "object" &&
        (item.role === "user" ||
          item.role === "assistant") &&
        typeof item.content === "string"
      );
    })
    .slice(-maxMessages)
    .map((item) => ({
      role: item.role as "user" | "assistant",

      content: cleanText(
        item.content,
        maxMessageLength
      ),
    }))
    .filter((item) => item.content.length > 0);
}

/* =========================================================
   Pathname
   ========================================================= */

export function normalizePathname(
  value: unknown
) {
  const pathname = cleanText(value, 300);

  if (
    !pathname ||
    !pathname.startsWith("/")
  ) {
    return "/";
  }

  /*
   * Do not allow arbitrary URL-like strings to become
   * prompt context.
   */
  if (
    pathname.includes("://") ||
    pathname.includes("\n") ||
    pathname.includes("\r")
  ) {
    return "/";
  }

  return pathname;
}

/* =========================================================
   Product slug
   ========================================================= */

export function productSlugFromPathname(
  pathname: string
): string | null {
  if (!pathname.startsWith("/products/")) {
    return null;
  }

  const parts = pathname
    .split("/")
    .filter(Boolean);

  if (
    parts.length !== 2 ||
    parts[0] !== "products"
  ) {
    return null;
  }

  try {
    const slug = decodeURIComponent(
      parts[1]
    ).trim();

    if (!slug) {
      return null;
    }

    /*
     * Keep slug conservative because it is later used
     * for a database lookup.
     */
    if (
      !/^[a-zA-Z0-9._~-]+$/.test(slug)
    ) {
      return null;
    }

    return slug.slice(0, 160);
  } catch {
    return null;
  }
}

/* =========================================================
   Project Context normalization
   ========================================================= */

export function normalizeProjectContext(
  value: unknown
): ProjectContext {
  const empty = emptyProjectContext();

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return empty;
  }

  const source = value as Record<
    string,
    unknown
  >;

  return {
    industry: cleanNullableText(
      source.industry,
      160
    ),

    target: cleanNullableText(
      source.target,
      200
    ),

    product: cleanNullableText(
      source.product,
      240
    ),

    model: cleanNullableText(
      source.model,
      160
    ),

    integration: cleanNullableText(
      source.integration,
      240
    ),

    requirement: cleanNullableText(
      source.requirement,
      600
    ),

    projectIntent:
      source.projectIntent === true,
  };
}

/* =========================================================
   Page Context
   ========================================================= */

export function describePage({
  pathname,
  currentProduct,
}: {
  pathname: string;
  currentProduct: AdvisorProduct | null;
}) {
  if (pathname === "/") {
    return "用户当前位于星玥阳官网首页。";
  }

  if (pathname === "/products") {
    return "用户当前位于产品中心页面。";
  }

  if (pathname.startsWith("/products/")) {
    if (currentProduct) {
      return [
        "用户当前正在查看产品详情页。",
        "以下 CURRENT_PAGE_PRODUCT 是当前页面产品。",
        "如果用户说“这个产品”“这个设备”“它”等，应优先指向 CURRENT_PAGE_PRODUCT。",
      ].join("\n");
    }

    return [
      "用户当前正在查看产品详情页。",
      "但当前产品没有从 CMS 成功解析。",
      "不要根据 URL 或型号名称自行推断产品能力。",
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

  return "用户当前位于星玥阳官方网站的其他页面。";
}

/* =========================================================
   Prompt
   ========================================================= */

export function buildSiteAdvisorPrompt({
  cmsProducts,
  currentProduct,
  pathname,
  projectContext,
}: {
  cmsProducts: AdvisorProduct[];
  currentProduct: AdvisorProduct | null;
  pathname: string;
  projectContext: ProjectContext;
}) {
  const pageDescription = describePage({
    pathname,
    currentProduct,
  });

  return `
你是江苏星玥阳科技有限公司（UNIVERSE TECH）官方网站的 AI 工业智能顾问。

你的任务不是普通闲聊。

你需要帮助官网访客：

1. 理解星玥阳产品与技术能力
2. 根据行业和检测对象提供初步产品方向
3. 解释工业在线监测与系统集成逻辑
4. 逐步梳理用户的项目需求
5. 在需求明确时引导进入 Technical / Project Consultation

==============================
事实边界
==============================

涉及江苏星玥阳科技有限公司、产品、技术和项目的信息，只能依据本提示提供的已确认资料。

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

不得因为型号、产品名称、行业名称或常识，自行推断星玥阳产品具备某项能力。

==============================
多轮对话
==============================

你拥有最近的对话历史。

需要正确理解：

- 这个
- 它
- 刚才那个
- 这个设备
- 这种方案
- 我们厂
- 那如果是……
- 这个能接吗

等上下文指代。

不要机械重复已经解释过的内容。

如果信息不足，可以提出澄清问题。

每次最多询问 1 到 2 个最关键的问题。

==============================
PROJECT_CONTEXT
==============================

下面是从之前对话中保留下来的结构化项目上下文：

${JSON.stringify(projectContext)}

PROJECT_CONTEXT 是机器可读记忆。

你需要根据当前用户的新消息更新它。

规则：

1. 已确认的信息应该保留。
2. 新信息可以补充或替换旧信息。
3. 用户明确纠正之前的信息时，以最新信息为准。
4. 不得因为推测而填充字段。
5. 不确定的字段保持 null。
6. 不要仅因为推荐了某个产品，就自动认为用户已经选择该产品。
7. projectIntent 只有在用户表现出真实项目、采购、建设、改造、技术对接、方案咨询等意图时才设为 true。

字段定义：

industry:
用户所属或项目应用行业。
例如煤电、水泥、钢铁。
没有明确说明则为 null。

target:
需要检测、监测或分析的对象。
例如入炉煤。
没有明确说明则为 null。

product:
用户明确讨论、选择或正在查看的产品名称。
不要凭空生成。

model:
用户明确讨论的产品型号。
不要根据产品名称猜测型号。

integration:
用户明确提到的系统集成需求。
例如 MES、ERP、DCS。
可以保留简短组合，例如 "MES / DCS"。

requirement:
用一句简洁中文概括已经明确的核心项目需求。
只总结用户已经表达的信息。

projectIntent:
用户是否已经表现出明确的真实项目咨询意图。

==============================
页面上下文
==============================

${pageDescription}

==============================
CURRENT_PAGE_PRODUCT
==============================

${
  currentProduct
    ? JSON.stringify(currentProduct)
    : "null"
}

如果 CURRENT_PAGE_PRODUCT 不为 null：

它是通过当前页面 slug 从 CMS 精确读取的产品。

当用户使用“这个产品”“它”等指代时，应优先使用这里的产品资料。

如果 CURRENT_PAGE_PRODUCT 为 null：

不得自行猜测当前产品。

==============================
公司资料
==============================

${JSON.stringify(company)}

==============================
CMS 当前公开产品资料
==============================

${JSON.stringify(cmsProducts)}

产品推荐必须依据 CMS 资料中的：

- name
- model
- category
- description
- subtitle
- features
- applications
- specifications

如果多个产品都可能符合，应解释选择逻辑。

不得武断指定。

==============================
Intent
==============================

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

如果用户只是询问 MES、DCS 等连接能力，但尚未表现出真实项目需求，可以使用：

integration

如果用户明确表达：

- 我们厂准备建设
- 我们有一个项目
- 我们需要一套
- 准备采购
- 准备改造
- 想做在线监测项目
- 想让你们提供方案
- 项目怎么对接
- 希望技术人员联系
- 需要进行实际系统集成

则使用：

project_consultation

==============================
Action
==============================

action 只能是：

none
view_products
view_technology
view_solutions
consult_project

不要每次回答都给 action。

只有存在明确下一步价值时才设置。

当真实项目需求已经形成时：

action = consult_project

==============================
Suggestions
==============================

最多提供 3 个。

要求：

- 与当前回答直接相关
- 简短自然
- 能帮助用户继续梳理需求
- 不重复当前已经回答的问题

没有合适建议时返回空数组。

==============================
输出格式
==============================

你必须只输出合法 JSON。

禁止 Markdown。
禁止代码块。
禁止 JSON 外的任何文字。

严格使用：

{
  "reply": "给用户的中文回答",
  "intent": "unknown",
  "suggestions": [],
  "action": "none",
  "projectContext": {
    "industry": null,
    "target": null,
    "product": null,
    "model": null,
    "integration": null,
    "requirement": null,
    "projectIntent": false
  }
}

==============================
回答风格
==============================

- 中文
- 专业
- 简洁
- 工业技术顾问风格
- 不夸张
- 不使用营销套话
`.trim();
}

/* =========================================================
   Response parser
   ========================================================= */

const VALID_INTENTS: AssistantIntent[] = [
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

const VALID_ACTIONS: AssistantAction[] = [
  "none",
  "view_products",
  "view_technology",
  "view_solutions",
  "consult_project",
];

export function parseSiteAdvisorResponse(
  text: string,
  previousProjectContext: ProjectContext
): StructuredAssistantResponse {
  const fallback: StructuredAssistantResponse = {
    reply:
      text.trim() ||
      "暂时无法生成回答，请联系星玥阳技术团队进一步确认。",

    intent: "unknown",
    suggestions: [],
    action: "none",

    /*
     * A malformed model response must not erase
     * previously known project context.
     */
    projectContext: previousProjectContext,
  };

  try {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    const parsed: unknown =
      JSON.parse(cleaned);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return fallback;
    }

    const source = parsed as Record<
      string,
      unknown
    >;

    const intent: AssistantIntent =
      typeof source.intent === "string" &&
      VALID_INTENTS.includes(
        source.intent as AssistantIntent
      )
        ? (source.intent as AssistantIntent)
        : "unknown";

    const action: AssistantAction =
      typeof source.action === "string" &&
      VALID_ACTIONS.includes(
        source.action as AssistantAction
      )
        ? (source.action as AssistantAction)
        : "none";

    const suggestions =
      Array.isArray(source.suggestions)
        ? source.suggestions
            .filter(
              (
                item
              ): item is string =>
                typeof item === "string" &&
                item.trim().length > 0
            )
            .slice(0, 3)
            .map((item) =>
              item.trim().slice(0, 120)
            )
        : [];

    const reply =
      typeof source.reply === "string" &&
      source.reply.trim()
        ? source.reply
            .trim()
            .slice(0, 6000)
        : fallback.reply;

    /*
     * Important:
     * normalize the model output before it ever reaches
     * the client.
     */
    const returnedProjectContext =
      normalizeProjectContext(
        source.projectContext
      );

    /*
     * Defensive merge.
     *
     * The model is expected to return the complete
     * ProjectContext, but if it accidentally omits a
     * previously known text field, preserve the old value.
     *
     * Explicit replacement still works when the model
     * returns a new non-null value.
     */
    const projectContext: ProjectContext = {
      industry:
        returnedProjectContext.industry ??
        previousProjectContext.industry,

      target:
        returnedProjectContext.target ??
        previousProjectContext.target,

      product:
        returnedProjectContext.product ??
        previousProjectContext.product,

      model:
        returnedProjectContext.model ??
        previousProjectContext.model,

      integration:
        returnedProjectContext.integration ??
        previousProjectContext.integration,

      requirement:
        returnedProjectContext.requirement ??
        previousProjectContext.requirement,

      projectIntent:
        returnedProjectContext.projectIntent ||
        previousProjectContext.projectIntent,
    };

    /*
     * Once the structured project state says that a real
     * project exists, make the handoff deterministic.
     */
    const resolvedIntent: AssistantIntent =
      projectContext.projectIntent
        ? "project_consultation"
        : intent;

    const resolvedAction: AssistantAction =
      projectContext.projectIntent
        ? "consult_project"
        : action;

    return {
      reply,
      intent: resolvedIntent,
      suggestions,
      action: resolvedAction,
      projectContext,
    };
  } catch {
    return fallback;
  }
}