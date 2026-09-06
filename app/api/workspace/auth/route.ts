import { NextResponse } from "next/server";

import {
  WORKSPACE_COOKIE,
  createWorkspaceSession,
  verifyWorkspaceKey,
  verifyWorkspacePassword,
  workspaceSessionMaxAge,
} from "@/lib/workspace-auth";

export async function GET(
  req: Request
) {
  const auth =
    verifyWorkspaceKey(req);

  return NextResponse.json(
    {
      success: auth.ok,
      authenticated: auth.ok,
    },
    {
      status: auth.ok
        ? 200
        : auth.status,
    }
  );
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    if (
      !verifyWorkspacePassword(
        body?.key
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid workspace key.",
        },
        {
          status: 401,
        }
      );
    }

    const session =
      createWorkspaceSession();

    const res =
      NextResponse.json({
        success: true,
        authenticated: true,
      });

    res.cookies.set({
      name: WORKSPACE_COOKIE,

      /*
       * Important:
       * The cookie now contains a signed session,
       * NOT the admin key.
       */
      value: session,

      httpOnly: true,
      sameSite: "lax",

      secure:
        process.env.NODE_ENV ===
        "production",

      path: "/",

      maxAge:
        workspaceSessionMaxAge(),
    });

    return res;
  } catch (error) {
    console.error(
      "[workspace-auth]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE() {
  const res =
    NextResponse.json({
      success: true,
      authenticated: false,
    });

  res.cookies.set({
    name: WORKSPACE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",

    secure:
      process.env.NODE_ENV ===
      "production",

    path: "/",
    maxAge: 0,
  });

  return res;
}