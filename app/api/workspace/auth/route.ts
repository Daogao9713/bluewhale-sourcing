import { NextResponse } from "next/server";
import {
  WORKSPACE_COOKIE,
  verifyWorkspaceKey,
  verifyWorkspacePassword,
} from "@/lib/workspace-auth";

export async function GET(req: Request) {
  const auth = verifyWorkspaceKey(req);
  return NextResponse.json(
    { success: auth.ok, authenticated: auth.ok },
    { status: auth.ok ? 200 : auth.status }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!verifyWorkspacePassword(body?.key)) {
      return NextResponse.json(
        { success: false, error: "Invalid workspace key." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true, authenticated: true });
    res.cookies.set({
      name: WORKSPACE_COOKIE,
      value: String(body.key).trim(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, authenticated: false });
  res.cookies.set({
    name: WORKSPACE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
