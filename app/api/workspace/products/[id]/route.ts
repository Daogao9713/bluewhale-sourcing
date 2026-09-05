import { NextResponse } from "next/server";
import { db } from "@/lib/database/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const a = verifyWorkspaceKey(req);
  if (!a.ok) {
    return NextResponse.json({ error: a.error }, { status: a.status });
  }

  const { id } = await params;
  const b = await req.json();
  const allowed: Record<string, unknown> = {};

  for (const k of [
    "model",
    "name",
    "slug",
    "category",
    "description",
    "subtitle",
    "image_url",
    "gallery",
    "features",
    "applications",
    "specifications",
    "featured",
    "sort_order",
    "status",
  ]) {
    if (k in b) allowed[k] = b[k];
  }

  allowed.updated_at = new Date().toISOString();

  const { data, error } = await db()
    .from("xy_products")
    .update(allowed)
    .eq("id", id)
    .select("*")
    .single();

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ success: true, product: data });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const a = verifyWorkspaceKey(req);
  if (!a.ok) {
    return NextResponse.json({ error: a.error }, { status: a.status });
  }

  const { id } = await params;
  const { error } = await db().from("xy_products").delete().eq("id", id);

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ success: true });
}
