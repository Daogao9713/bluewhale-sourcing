import { NextResponse } from "next/server";
import { db } from "@/lib/database/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";

type WorkspaceAuthResult = ReturnType<typeof verifyWorkspaceKey>;

const no = (a: WorkspaceAuthResult) =>
  NextResponse.json(
    { error: a.error },
    { status: a.status }
  );

/**
 * 获取全部工程案例
 * GET /api/workspace/cases
 */
export async function GET(req: Request) {
  const auth = verifyWorkspaceKey(req);

  if (!auth.ok) {
    return no(auth);
  }

  const { data, error } = await db()
    .from("xy_cases")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    cases: data || [],
  });
}

/**
 * 新增工程案例
 * POST /api/workspace/cases
 */
export async function POST(req: Request) {
  const auth = verifyWorkspaceKey(req);

  if (!auth.ok) {
    return no(auth);
  }

  try {
    const body = await req.json();

    const title = String(body.title || "").trim();

    if (!title) {
      return NextResponse.json(
        { error: "Title required." },
        { status: 400 }
      );
    }

    const slug = String(
      body.slug || `case-${Date.now()}`
    )
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");

    const row = {
      slug,
      title,
      industry: body.industry || null,
      summary: body.summary || null,
      content: body.content || null,
      image_url: body.image_url || null,
      location: body.location || null,
      related_product: body.related_product || null,
      featured: Boolean(body.featured),
      sort_order: Number(body.sort_order) || 0,
      status: body.status || "draft",

      published_at:
        body.status === "published"
          ? new Date().toISOString()
          : null,
    };

    const { data, error } = await db()
      .from("xy_cases")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      console.error("[workspace/cases POST db]", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      case: data,
    });
  } catch (error: unknown) {
    console.error("[workspace/cases POST]", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message :
          "Failed to create case.",
      },
      { status: 500 }
    );
  }
}

/**
 * 编辑工程案例
 * PATCH /api/workspace/cases
 *
 * 案例 ID 从 JSON body.id 获取
 */
export async function PATCH(req: Request) {
  const auth = verifyWorkspaceKey(req);

  if (!auth.ok) {
    return no(auth);
  }

  try {
    const body = await req.json();

    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "Case ID required." },
        { status: 400 }
      );
    }

    const title = String(body.title || "").trim();

    if (!title) {
      return NextResponse.json(
        { error: "Title required." },
        { status: 400 }
      );
    }

    const slug = String(
      body.slug || `case-${Date.now()}`
    )
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");

    const row = {
      slug,
      title,
      industry: body.industry || null,
      summary: body.summary || null,
      content: body.content || null,
      image_url: body.image_url || null,
      location: body.location || null,
      related_product: body.related_product || null,
      featured: Boolean(body.featured),
      sort_order: Number(body.sort_order) || 0,
      status: body.status || "draft",

      published_at:
        body.status === "published"
          ? body.published_at || new Date().toISOString()
          : null,
    };

    const { data, error } = await db()
      .from("xy_cases")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[workspace/cases PATCH db]", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      case: data,
    });
  } catch (error: unknown) {
    console.error("[workspace/cases PATCH]", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message :
          "Failed to update case.",
      },
      { status: 500 }
    );
  }
}