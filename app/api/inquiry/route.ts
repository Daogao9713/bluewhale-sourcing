import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";
import {
  RequestValidationError,
  cleanString,
  objectBody,
  readJsonBody,
} from "@/lib/security/request";

import { checkRateLimit } from "@/lib/security/rate-limit";



const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_LANGUAGES = new Set([
  "zh",
  "en",
  "ja",
]);

function optionalString(
  value: unknown,
  maxLength: number
) {
  return cleanString(value, maxLength);
}

function requiredEmail(value: unknown) {
  if (typeof value !== "string") {
    throw new RequestValidationError(
      "Valid email is required.",
      400
    );
  }

  const email = value
    .trim()
    .toLowerCase();

  if (
    !email ||
    email.length > 254 ||
    !EMAIL_PATTERN.test(email)
  ) {
    throw new RequestValidationError(
      "Valid email is required.",
      400
    );
  }

  return email;
}

function normalizeLanguage(
  value: unknown
) {
  const language =
    cleanString(value, 8).toLowerCase();

  return ALLOWED_LANGUAGES.has(language)
    ? language
    : "";
}

function normalizeBoolean(
  value: unknown
) {
  return value === true;
}

function validateInquiry(
  body: Record<string, unknown>
) {
  return {
    companyName: optionalString(
      body.companyName,
      200
    ),
    contactName: optionalString(
      body.contactName,
      120
    ),
    email: requiredEmail(body.email),
    phone: optionalString(
      body.phone,
      80
    ),
    country: optionalString(
      body.country,
      120
    ),
    preferredLanguage:
      normalizeLanguage(
        body.preferredLanguage
      ),
    productName: optionalString(
      body.productName,
      240
    ),
    modelNumber: optionalString(
      body.modelNumber,
      160
    ),
    quantity: optionalString(
      body.quantity,
      80
    ),

    message: optionalString(
      body.message,
      5000
    ),
  };
}

function escapeHtml(
  value: unknown
) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailValue(
  value: unknown
) {
  const text = String(value ?? "").trim();

  return text
    ? escapeHtml(text)
    : "-";
}

function emailMultilineValue(
  value: unknown
) {
  const text = String(value ?? "").trim();

  return text
    ? escapeHtml(text).replace(
        /\r?\n/g,
        "<br />"
      )
    : "-";
}

export async function POST(req: Request) {
  try {
    const body = objectBody(
      await readJsonBody(req, 20_000)
    );

    const {
  companyName,
  contactName,
  email,
  phone,
  country,
  preferredLanguage,
  productName,
  modelNumber,
  quantity,
  message,
} = validateInquiry(body);



const rateLimit =
  await checkRateLimit(req, {
    scope: "inquiry",
    limit: 5,
    windowSeconds: 60 * 60,
  });

if (!rateLimit.allowed) {
  return NextResponse.json(
    {
      success: false,
      error:
        "Too many inquiries. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": "3600",
      },
    }
  );
}







    // 1. 先保存到 Supabase
    const { error: insertError } = await supabaseAdmin
      .from("inquiries")
      .insert({
        company_name: companyName,
        contact_name: contactName,
        email,
        phone,
        country,
        preferred_language: preferredLanguage,
        product_name: productName,
        model_number: modelNumber,
        quantity,
        needs_ems: false,
        message,
      });

    if (insertError) {
      console.error(
        "[inquiry:database]",
        insertError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to save inquiry",
        },
        { status: 500 }
      );
    }

    // 2. 邮件通知：即使邮件失败，也不影响表单提交成功
    try {
      const emailResult = await resend.emails.send({
        from:
  "UNIVERSE TECH 星玥阳 <onboarding@resend.dev>",

to:
  process.env.NOTIFICATION_EMAIL!,

subject:
  "星玥阳官网 · 新的项目咨询",

html: `
  <h2>星玥阳官网收到新的项目咨询</h2>

  <p><strong>公司：</strong>${emailValue(companyName)}</p>
  <p><strong>联系人：</strong>${emailValue(contactName)}</p>
  <p><strong>邮箱：</strong>${emailValue(email)}</p>
  <p><strong>电话：</strong>${emailValue(phone)}</p>
  <p><strong>地区：</strong>${emailValue(country)}</p>
  <p><strong>沟通语言：</strong>${emailValue(preferredLanguage)}</p>

  <hr />

  <p><strong>产品 / 项目：</strong>${emailValue(productName)}</p>
  <p><strong>型号 / 系统类型：</strong>${emailValue(modelNumber)}</p>
  <p><strong>项目规模 / 数量：</strong>${emailValue(quantity)}</p>

  <p><strong>项目需求：</strong></p>
  <p>${emailMultilineValue(message)}</p>
`,
      });

      console.log("Resend email result:", emailResult);
    } catch (emailError) {
      console.error("[inquiry:email]", emailError);
    }

    // 3. 只要 Supabase 保存成功，就返回成功
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
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

    console.error("[inquiry:api]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 }
    );
  }
}