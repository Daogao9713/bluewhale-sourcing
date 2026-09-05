import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";
import {
  RequestValidationError,
  objectBody,
  readJsonBody,
} from "@/lib/security/request";

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
      needsEms,
      message,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // 1. 先保存到 Supabase
    const { data, error: insertError } = await supabaseAdmin
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
        needs_ems: needsEms,
        message,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to save inquiry",
          detail: insertError.message,
        },
        { status: 500 }
      );
    }

    // 2. 邮件通知：即使邮件失败，也不影响表单提交成功
    try {
      const emailResult = await resend.emails.send({
        from: "Blue Whale Sourcing <onboarding@resend.dev>",
        to: process.env.NOTIFICATION_EMAIL!,
        subject: "新的海外采购询价",
        html: `
          <h2>收到新的海外采购询价</h2>

          <p><strong>公司：</strong>${companyName || "-"}</p>
          <p><strong>联系人：</strong>${contactName || "-"}</p>
          <p><strong>邮箱：</strong>${email}</p>
          <p><strong>电话：</strong>${phone || "-"}</p>
          <p><strong>国家：</strong>${country || "-"}</p>
          <p><strong>希望语言：</strong>${preferredLanguage || "-"}</p>

          <hr />

          <p><strong>产品名称：</strong>${productName || "-"}</p>
          <p><strong>产品型号：</strong>${modelNumber || "-"}</p>
          <p><strong>采购数量：</strong>${quantity || "-"}</p>
          <p><strong>是否需要 EMS：</strong>${needsEms ? "是" : "否"}</p>

          <p><strong>详细需求：</strong></p>
          <p>${message || "-"}</p>
        `,
      });

      console.log("Resend email result:", emailResult);
    } catch (emailError) {
      console.error("Resend email error:", emailError);
    }

    // 3. 只要 Supabase 保存成功，就返回成功
    return NextResponse.json(
      {
        success: true,
        inquiry: data,
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

    console.error("Inquiry API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 }
    );
  }
}