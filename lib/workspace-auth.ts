import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export const WORKSPACE_COOKIE =
  "bluewhale_workspace_session";

const SESSION_TTL_SECONDS = 60 * 60 * 12;
const SESSION_VERSION = "v1";

function configuredKey() {
  return (
    process.env.BLUEWHALE_ADMIN_KEY?.trim() ||
    ""
  );
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function sessionSecret() {
  /*
   * X0.45 compatibility:
   *
   * Use a dedicated session secret when configured.
   * Fall back to the existing admin key so current
   * deployments do not immediately break.
   *
   * Production should configure:
   * WORKSPACE_SESSION_SECRET
   */
  return (
    process.env.WORKSPACE_SESSION_SECRET?.trim() ||
    configuredKey()
  );
}

function sign(payload: string) {
  const secret = sessionSecret();

  if (!secret) {
    return "";
  }

  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

function cookieValue(
  req: Request,
  name: string
) {
  const raw =
    req.headers.get("cookie") || "";

  for (const part of raw.split(";")) {
    const [key, ...rest] =
      part.trim().split("=");

    if (key === name) {
      try {
        return decodeURIComponent(
          rest.join("=")
        );
      } catch {
        return "";
      }
    }
  }

  return "";
}

/* =========================================================
   Session
   ========================================================= */

export function createWorkspaceSession() {
  const secret = sessionSecret();

  if (!secret) {
    throw new Error(
      "Workspace session secret is not configured."
    );
  }

  const issuedAt = Math.floor(
    Date.now() / 1000
  );

  const expiresAt =
    issuedAt + SESSION_TTL_SECONDS;

  const payload = [
    SESSION_VERSION,
    issuedAt,
    expiresAt,
  ].join(".");

  const signature = sign(payload);

  return `${payload}.${signature}`;
}

function verifyWorkspaceSession(
  token: string
) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 4) {
    return false;
  }

  const [
    version,
    issuedAtRaw,
    expiresAtRaw,
    providedSignature,
  ] = parts;

  if (version !== SESSION_VERSION) {
    return false;
  }

  const issuedAt = Number(issuedAtRaw);
  const expiresAt = Number(expiresAtRaw);

  if (
    !Number.isSafeInteger(issuedAt) ||
    !Number.isSafeInteger(expiresAt)
  ) {
    return false;
  }

  const now = Math.floor(
    Date.now() / 1000
  );

  if (
    issuedAt > now + 60 ||
    expiresAt <= now ||
    expiresAt <= issuedAt
  ) {
    return false;
  }

  /*
   * Do not accept a token whose lifetime is longer
   * than the server's configured session lifetime.
   */
  if (
    expiresAt - issuedAt >
    SESSION_TTL_SECONDS
  ) {
    return false;
  }

  const payload = [
    version,
    issuedAtRaw,
    expiresAtRaw,
  ].join(".");

  const expectedSignature =
    sign(payload);

  if (
    !expectedSignature ||
    !providedSignature
  ) {
    return false;
  }

  return safeEqual(
    providedSignature,
    expectedSignature
  );
}

/* =========================================================
   Workspace authentication
   ========================================================= */

export function verifyWorkspaceKey(
  req: Request
) {
  const expected = configuredKey();

  if (!expected) {
    return {
      ok: false as const,
      status: 503,
      error:
        "Workspace admin key is not configured.",
    };
  }

  /*
   * Keep x-admin-key support for internal/API
   * compatibility.
   *
   * Browser authentication should use the signed
   * HttpOnly session cookie.
   */
  const headerKey =
    req.headers
      .get("x-admin-key")
      ?.trim() || "";

  if (
    headerKey &&
    safeEqual(headerKey, expected)
  ) {
    return {
      ok: true as const,
      status: 200,
      error: "",
    };
  }

  const sessionToken = cookieValue(
    req,
    WORKSPACE_COOKIE
  );

  if (
    !verifyWorkspaceSession(
      sessionToken
    )
  ) {
    return {
      ok: false as const,
      status: 401,
      error: "Unauthorized",
    };
  }

  return {
    ok: true as const,
    status: 200,
    error: "",
  };
}

export function verifyWorkspacePassword(
  value: unknown
) {
  const expected = configuredKey();

  const candidate =
    typeof value === "string"
      ? value.trim()
      : "";

  return Boolean(
    expected &&
      candidate &&
      safeEqual(candidate, expected)
  );
}

export function workspaceSessionMaxAge() {
  return SESSION_TTL_SECONDS;
}