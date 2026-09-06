import { NextResponse } from "next/server";

import { db } from "@/lib/database/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";
import { chat } from "@/lib/ai/server";

import {
  RequestValidationError,
  cleanString,
  objectBody,
  readJsonBody,
} from "@/lib/security/request";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

const AGENT_BODY_LIMIT = 24_000;
const MESSAGE_LIMIT = 3_000;
const HISTORY_MESSAGE_LIMIT = 1_200;
const HISTORY_LIMIT = 6;

function intents(q: string) {
  const s = q.toLowerCase();

  const all =
    /数据库|database|全部|overview|总览/.test(s);

  return {
    projects:
      all || /项目|project/.test(s),

    suppliers:
      all || /供应商|supplier/.test(s),

    rfqs:
      all ||
      /rfq|询价|报价需求/.test(s),

    inquiries:
      all ||
      /询盘|inquir|客户/.test(s),

    documents:
      all ||
      /报价单|合同|document|contract|quotation|订单/.test(
        s
      ),

    integrations:
      /mes|erp|wms|接口|integration/.test(s),
  };
}

async function count(table: string) {
  const { count, error } = await db()
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    throw error;
  }

  return count || 0;
}

function parseHistory(
  value: unknown
): Msg[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((item): Msg[] => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        return [];
      }

      const record =
        item as Record<string, unknown>;

      if (
        record.role !== "user" &&
        record.role !== "assistant"
      ) {
        return [];
      }

      const content = cleanString(
        record.content,
        HISTORY_MESSAGE_LIMIT
      );

      if (!content) {
        return [];
      }

      return [
        {
          role: record.role,
          content,
        },
      ];
    })
    .slice(-HISTORY_LIMIT);
}

export async function POST(
  req: Request
) {
  /*
   * Workspace authentication happens before
   * database access or AI execution.
   */
  const auth =
    verifyWorkspaceKey(req);

  if (!auth.ok) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      {
        status: auth.status,
      }
    );
  }

  try {
    /*
     * X0.45 P1-B:
     * Apply the shared JSON request boundary.
     */
    const rawBody =
      await readJsonBody(
        req,
        AGENT_BODY_LIMIT
      );

    const body =
      objectBody(rawBody);

    const message =
      cleanString(
        body.message,
        MESSAGE_LIMIT
      );

    if (!message) {
      throw new RequestValidationError(
        "Message is required.",
        400
      );
    }

    /*
     * Keep compatibility with both the current
     * `history` field and older `messages`
     * clients.
     */
    const history =
      parseHistory(
        Array.isArray(body.history)
          ? body.history
          : body.messages
      );

    const i =
      intents(message);

    const counts =
      await Promise.all(
        [
          "projects",
          "suppliers",
          "rfqs",
          "inquiries",
          "business_documents",
        ].map(count)
      );

    const summary = {
      projects: counts[0],
      suppliers: counts[1],
      rfqs: counts[2],
      inquiries: counts[3],
      documents: counts[4],
    };

    const context:
      Record<string, unknown> = {
        summary,
      };

    const jobs:
      Array<PromiseLike<unknown>> = [];

    if (i.projects) {
      jobs.push(
        db()
          .from("projects")
          .select(
            "id,name,client_name,country,category,target_budget,currency,status,created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(12)
          .then((r) => {
            if (r.error) throw r.error;

            context.projects =
              r.data || [];
          })
      );
    }

    if (i.suppliers) {
      jobs.push(
        db()
          .from("suppliers")
          .select(
            "id,company_name,country,categories,rating,risk_level,created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(15)
          .then((r) => {
            if (r.error) throw r.error;

            context.suppliers =
              r.data || [];
          })
      );
    }

    if (i.rfqs) {
      jobs.push(
        db()
          .from("rfqs")
          .select(
            "id,title,quantity,target_price,currency,status,due_date,created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(15)
          .then((r) => {
            if (r.error) throw r.error;

            context.rfqs =
              r.data || [];
          })
      );
    }

    if (i.inquiries) {
      jobs.push(
        db()
          .from("inquiries")
          .select(
            "id,company_name,contact_name,country,preferred_language,product_name,model_number,quantity,status,created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(12)
          .then((r) => {
            if (r.error) throw r.error;

            context.inquiries =
              r.data || [];
          })
      );
    }

    if (i.documents) {
      jobs.push(
        db()
          .from("business_documents")
          .select(
            "id,document_no,document_type,title,status,customer_name,currency,total,valid_until,created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(15)
          .then((r) => {
            if (r.error) throw r.error;

            context.documents =
              r.data || [];
          })
      );
    }

    if (i.integrations) {
      jobs.push(
        db()
          .from(
            "integration_connections"
          )
          .select(
            "code,name,integration_type,status,last_sync_at,last_error"
          )
          .limit(20)
          .then((r) => {
            if (r.error) throw r.error;

            context.integrations =
              r.data || [];
          })
      );
    }

    await Promise.all(jobs);

    const result = await chat(
      [
        {
          role: "system",
          content: `You are the UNIVERSE TECH 星玥阳 Enterprise Copilot for 江苏星玥阳科技有限公司.

You assist authorized operators inside the company's industrial operations platform.

Answer in the operator's language.

Use DATABASE_CONTEXT as the source of truth for company operational data.

Default to concise executive summaries, counts, risks, anomalies and practical next actions instead of dumping raw database records.

Never expose personal email addresses or phone numbers unless the operator explicitly asks for a specific authorized record.

Never invent prices, customers, suppliers, certifications, instrument status, MES/ERP/WMS state, quotations, contracts or production data.

Clearly distinguish database facts from analysis or recommendations.

If requested information is not present in DATABASE_CONTEXT, say that the available data does not establish it.

If the operator asks for "the database", give a compact operational snapshot and ask which module they want to inspect.

Keep normal answers under 500 Chinese characters unless more detail is requested.

DATABASE_CONTEXT=${JSON.stringify(
            context
          )}`,
        },

        ...history,

        {
          role: "user",
          content: message,
        },
      ],
      700
    );

    return NextResponse.json({
      success: true,
      reply: result.text,

      /*
       * This is an authenticated internal endpoint.
       * Provider/context diagnostics remain available
       * for the Workspace UI in X0.45.
       */
      provider: result.provider,
      context_modules:
        Object.keys(context),
      counts: summary,
    });
  } catch (error) {
    if (
      error instanceof
      RequestValidationError
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    /*
     * Log the real failure server-side, but never
     * expose Supabase/provider/internal errors.
     */
    console.error(
      "[workspace-agent]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Enterprise Copilot temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}