import { NextResponse } from "next/server";
import { db } from "@/lib/database/server";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";

const deny = (a: any) =>
  NextResponse.json({ success: false, error: a.error }, { status: a.status });

export async function GET(req: Request) {
  const a = verifyWorkspaceKey(req);
  if (!a.ok) return deny(a);

  const { data, error } = await db().from("xy_products").select("*").order("sort_order");

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ success: true, products: data || [] });
}

export async function POST(req: Request) {
  const a = verifyWorkspaceKey(req);
  if (!a.ok) return deny(a);

  const b = await req.json();
  const model = String(b.model || "").trim();
  const name = String(b.name || "").trim();

  if (!model || !name) {
    return NextResponse.json(
      { error: "Model and name are required." },
      { status: 400 }
    );
  }

  const slug = String(b.slug || model)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");

  const row = {
    model,
    name,
    slug,
    category: b.category || null,
    description: b.description || null,
    subtitle: b.subtitle || null,
    image_url: b.image_url || null,
    features: b.features || [],
    applications: b.applications || [],
    specifications: b.specifications || {},
    featured: !!b.featured,
    sort_order: Number(b.sort_order) || 0,
    status: b.status || "active",
  };

  const { data, error } = await db().from("xy_products").insert(row).select("*").single();

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ success: true, product: data });
}
