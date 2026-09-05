import { NextResponse } from "next/server";
import { publicProducts } from "@/lib/products/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const data = await publicProducts(url.searchParams.get("featured") === "1");
    return NextResponse.json({ success: true, products: data }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
