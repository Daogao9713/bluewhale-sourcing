import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";

type CreatePayload =
  | {
      entity: "project";
      data: {
        name?: string;
        client_name?: string;
        country?: string;
        category?: string;
        target_budget?: number | null;
        currency?: string;
        status?: string;
        notes?: string;
      };
    }
  | {
      entity: "supplier";
      data: {
        company_name?: string;
        country?: string;
        categories?: string[];
        contact_name?: string;
        email?: string;
        phone?: string;
        rating?: number | null;
        risk_level?: string;
        notes?: string;
      };
    }
  | {
      entity: "rfq";
      data: {
        project_id?: string | null;
        title?: string;
        specification?: string;
        quantity?: string;
        target_price?: number | null;
        currency?: string;
        status?: string;
        due_date?: string | null;
      };
    };

function unauthorized(req: Request) {
  const auth = verifyWorkspaceKey(req);
  if (auth.ok) return null;

  return NextResponse.json(
    { success: false, error: auth.error },
    { status: auth.status }
  );
}

export async function GET(req: Request) {
  const blocked = unauthorized(req);
  if (blocked) return blocked;

  try {
    const [
      projectsResult,
      suppliersResult,
      rfqsResult,
      inquiriesResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("rfqs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const firstError =
      projectsResult.error ||
      suppliersResult.error ||
      rfqsResult.error ||
      inquiriesResult.error;

    if (firstError) {
      console.error("[workspace:get]", firstError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to load workspace data.",
          detail: firstError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      projects: projectsResult.data || [],
      suppliers: suppliersResult.data || [],
      rfqs: rfqsResult.data || [],
      inquiries: inquiriesResult.data || [],
    });
  } catch (error) {
    console.error("[workspace:get]", error);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const blocked = unauthorized(req);
  if (blocked) return blocked;

  try {
    const payload = (await req.json()) as CreatePayload;

    if (!payload?.entity || !payload?.data) {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 }
      );
    }

    let table = "";
    let data: Record<string, unknown> = {};

    if (payload.entity === "project") {
      if (!payload.data.name?.trim()) {
        return NextResponse.json(
          { success: false, error: "Project name is required." },
          { status: 400 }
        );
      }

      table = "projects";
      data = {
        name: payload.data.name.trim(),
        client_name: payload.data.client_name?.trim() || null,
        country: payload.data.country?.trim() || null,
        category: payload.data.category?.trim() || null,
        target_budget: payload.data.target_budget ?? null,
        currency: payload.data.currency?.trim() || "USD",
        status: payload.data.status?.trim() || "active",
        notes: payload.data.notes?.trim() || null,
      };
    }

    if (payload.entity === "supplier") {
      if (!payload.data.company_name?.trim()) {
        return NextResponse.json(
          { success: false, error: "Supplier name is required." },
          { status: 400 }
        );
      }

      table = "suppliers";
      data = {
        company_name: payload.data.company_name.trim(),
        country: payload.data.country?.trim() || null,
        categories: Array.isArray(payload.data.categories)
          ? payload.data.categories.filter(Boolean)
          : [],
        contact_name: payload.data.contact_name?.trim() || null,
        email: payload.data.email?.trim() || null,
        phone: payload.data.phone?.trim() || null,
        rating: payload.data.rating ?? null,
        risk_level: payload.data.risk_level?.trim() || "unknown",
        notes: payload.data.notes?.trim() || null,
      };
    }

    if (payload.entity === "rfq") {
      if (!payload.data.title?.trim()) {
        return NextResponse.json(
          { success: false, error: "RFQ title is required." },
          { status: 400 }
        );
      }

      table = "rfqs";
      data = {
        project_id: payload.data.project_id || null,
        title: payload.data.title.trim(),
        specification: payload.data.specification?.trim() || null,
        quantity: payload.data.quantity?.trim() || null,
        target_price: payload.data.target_price ?? null,
        currency: payload.data.currency?.trim() || "USD",
        status: payload.data.status?.trim() || "draft",
        due_date: payload.data.due_date || null,
      };
    }

    if (!table) {
      return NextResponse.json(
        { success: false, error: "Unknown entity." },
        { status: 400 }
      );
    }

    const { data: inserted, error } = await supabaseAdmin
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("[workspace:post]", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create ${payload.entity}.`,
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entity: payload.entity,
      data: inserted,
    });
  } catch (error) {
    console.error("[workspace:post]", error);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}
