import { NextResponse } from "next/server";

import { chat } from "@/lib/ai/server";

import {
  publicProduct,
  publicProducts,
} from "@/lib/products/server";

import {
  AdvisorProduct,
  buildSiteAdvisorPrompt,
  cleanText,
  normalizeHistory,
  normalizePathname,
  normalizeProjectContext,
  parseSiteAdvisorResponse,
  productSlugFromPathname,
} from "@/lib/ai/site-advisor";

/* =========================================================
   X0.45 · Intelligent Site Advisor API
   ---------------------------------------------------------
   Phase 2

   Responsibilities:
   - Validate request
   - Load CMS grounding
   - Resolve current page product
   - Call AI provider
   - Return structured advisor response

   Business logic lives in:
   lib/ai/site-advisor.ts
   ========================================================= */

const MAX_MESSAGE_LENGTH = 1600;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_MESSAGE_LENGTH = 1200;

/* =========================================================
   POST
   ========================================================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    /* -------------------------------------------------------
       Request normalization
       ------------------------------------------------------- */

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

    const history = normalizeHistory(
      body?.history,
      MAX_HISTORY_MESSAGES,
      MAX_HISTORY_MESSAGE_LENGTH
    );

    const pathname =
      normalizePathname(body?.pathname);

    /*
     * Phase 2:
     * Frontend does not send this yet.
     *
     * That is intentional.
     * normalizeProjectContext(undefined) simply creates
     * an empty context, keeping Phase 1 frontend compatible.
     */
    const projectContext =
      normalizeProjectContext(
        body?.projectContext
      );

    /* -------------------------------------------------------
       CMS grounding
       ------------------------------------------------------- */

    let cmsProducts: AdvisorProduct[] = [];

    try {
      cmsProducts =
        (await publicProducts()) as AdvisorProduct[];
    } catch (error) {
      /*
       * Company-level AI should remain available even if
       * the product CMS temporarily fails.
       */
      console.error(
        "[site-assistant:products]",
        error
      );
    }

    /* -------------------------------------------------------
       Current product grounding
       ------------------------------------------------------- */

    const currentProductSlug =
      productSlugFromPathname(pathname);

    let currentProduct:
      | AdvisorProduct
      | null = null;

    if (currentProductSlug) {
      try {
        currentProduct =
          (await publicProduct(
            currentProductSlug
          )) as AdvisorProduct | null;
      } catch (error) {
        /*
         * Failure to load the page product must not break
         * the whole assistant.
         *
         * The prompt will explicitly tell the model not
         * to guess the current product.
         */
        console.error(
          "[site-assistant:current-product]",
          error
        );
      }
    }

    /* -------------------------------------------------------
       Prompt
       ------------------------------------------------------- */

    const systemPrompt =
      buildSiteAdvisorPrompt({
        cmsProducts,
        currentProduct,
        pathname,
        projectContext,
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

    /* -------------------------------------------------------
       AI
       ------------------------------------------------------- */

    const result = await chat(
      messages,
      900
    );

    const structured =
      parseSiteAdvisorResponse(
        result.text,
        projectContext
      );

    /* -------------------------------------------------------
       Response
       ------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      reply: structured.reply,
      intent: structured.intent,
      suggestions:
        structured.suggestions,
      action: structured.action,

      /*
       * New in Phase 2.
       *
       * Phase 1 frontend will safely ignore this field
       * until we wire it in during the next step.
       */
      projectContext:
        structured.projectContext,

      /*
       * Development diagnostics.
       * No API keys or secrets are exposed here.
       */
      meta: {
        provider: result.provider,

        groundedProducts:
          cmsProducts.length,

        historyMessages:
          history.length,

        pathname,

        currentProduct:
          currentProduct
            ? {
                slug:
                  currentProduct.slug ??
                  null,

                model:
                  currentProduct.model ??
                  null,

                name:
                  currentProduct.name ??
                  null,
              }
            : null,
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