import "server-only";

import { createHash } from "node:crypto";
import { db } from "@/lib/database/server";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: string;
};

function clientIp(req: Request) {
  const forwarded = req.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  return (
    forwarded ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function fingerprint(
  req: Request,
  scope: string
) {
  const ip = clientIp(req);

  return createHash("sha256")
    .update(`${scope}:${ip}`)
    .digest("hex");
}

export async function checkRateLimit(
  req: Request,
  options: {
    scope: string;
    limit: number;
    windowSeconds: number;
  }
): Promise<RateLimitResult> {
  const bucket = `${options.scope}:${fingerprint(
    req,
    options.scope
  )}`;

  const { data, error } = await db().rpc(
    "xy_check_rate_limit",
    {
      p_bucket: bucket,
      p_limit: options.limit,
      p_window_seconds:
        options.windowSeconds,
    }
  );

  if (error) {
    console.error(
      "[rate-limit]",
      options.scope,
      error
    );

    /*
     * Fail open.
     *
     * A temporary rate-limit DB failure should not
     * take down the public website.
     */
    return {
      allowed: true,
      remaining: options.limit,
      resetAt: new Date(
        Date.now() +
          options.windowSeconds * 1000
      ).toISOString(),
    };
  }

  const result = Array.isArray(data)
    ? data[0]
    : data;

  if (!result) {
    return {
      allowed: true,
      remaining: options.limit,
      resetAt: new Date(
        Date.now() +
          options.windowSeconds * 1000
      ).toISOString(),
    };
  }

  return {
    allowed: result.allowed === true,
    remaining:
      typeof result.remaining === "number"
        ? result.remaining
        : 0,
    resetAt:
      typeof result.reset_at === "string"
        ? result.reset_at
        : new Date().toISOString(),
  };
}