import { NextResponse } from "next/server";

import {
  WORKSPACE_COOKIE,
  createWorkspaceSession,
  verifyWorkspaceKey,
  verifyWorkspacePassword,
  workspaceSessionMaxAge,
} from "@/lib/workspace-auth";

import {
  RequestValidationError,
  objectBody,
  readJsonBody,
} from "@/lib/security/request";

import {
  checkRateLimit,
} from "@/lib/security/rate-limit";

const LOGIN_BODY_LIMIT = 4_096;

const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_SECONDS =
  15 * 60;

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
    /*
     * X0.45 P1-A:
     *
     * Workspace login now uses the same request-security
     * boundary as other hardened public APIs.
     *
     * This rejects:
     * - non-JSON requests
     * - oversized bodies
     * - malformed JSON
     * - arrays / primitive JSON bodies
     */
    const rawBody =
      await readJsonBody(
        req,
        LOGIN_BODY_LIMIT
      );

    const body =
      objectBody(rawBody);

    /*
     * Rate-limit login attempts before password
     * verification.
     *
     * This deliberately counts both successful and failed
     * login attempts. It keeps the implementation simple
     * and avoids creating a password-validity side channel.
     */
    const rate = await checkRateLimit(req, {
      scope: "workspace-login",
      limit: LOGIN_RATE_LIMIT,
      windowSeconds: LOGIN_RATE_WINDOW_SECONDS,
    });

    if (!rate.allowed) {
  return NextResponse.json(
    {
      success: false,
      error:
        "Too many login attempts. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(
          LOGIN_RATE_WINDOW_SECONDS
        ),
      },
    }
  );
}

    if (
      !verifyWorkspacePassword(
        body.key
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
    /*
     * Expected request-validation failures are safe to
     * expose as generic client errors.
     */
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

    /*
     * Unexpected failures must not expose database,
     * crypto, environment or internal implementation
     * details to the client.
     */
    console.error(
      "[workspace-auth]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Workspace authentication temporarily unavailable.",
      },
      {
        status: 500,
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