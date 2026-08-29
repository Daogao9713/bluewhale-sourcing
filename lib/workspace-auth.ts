import "server-only";
import { timingSafeEqual } from "crypto";

export const WORKSPACE_COOKIE = "bluewhale_workspace_session";

function configuredKey() {
  return process.env.BLUEWHALE_ADMIN_KEY?.trim() || "";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function cookieValue(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

export function verifyWorkspaceKey(req: Request) {
  const expected = configuredKey();
  if (!expected) {
    return { ok: false as const, status: 503, error: "Workspace admin key is not configured." };
  }

  const headerKey = req.headers.get("x-admin-key")?.trim() || "";
  const cookieKey = cookieValue(req, WORKSPACE_COOKIE).trim();
  const candidate = headerKey || cookieKey;

  if (!candidate || !safeEqual(candidate, expected)) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  return { ok: true as const, status: 200, error: "" };
}

export function verifyWorkspacePassword(value: unknown) {
  const expected = configuredKey();
  const candidate = String(value ?? "").trim();
  return Boolean(expected && candidate && safeEqual(candidate, expected));
}
