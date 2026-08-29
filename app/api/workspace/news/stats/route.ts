import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyWorkspaceKey } from "@/lib/workspace-auth";

export async function GET(req: Request) {
  const auth = verifyWorkspaceKey(req);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const admin = createSupabaseAdmin();
  const statuses = ["draft", "published", "archived"] as const;
  const counts: Record<string, number> = {};

  for (const status of statuses) {
    const { count, error } = await admin
      .from("company_news")
      .select("id", { count: "exact", head: true })
      .eq("status", status);
    if (error) {
      return NextResponse.json({ success: false, error: "Failed to load stats." }, { status: 500 });
    }
    counts[status] = count || 0;
  }

  return NextResponse.json({ success: true, counts });
}
