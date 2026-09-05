import "server-only";

export class RequestValidationError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);
    this.name = "RequestValidationError";
    this.status = status;
  }
}

export async function readJsonBody(
  req: Request,
  maxBytes: number
): Promise<unknown> {
  const contentType =
    req.headers.get("content-type") || "";

  if (
    !contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    throw new RequestValidationError(
      "Content-Type must be application/json.",
      415
    );
  }

  const contentLength =
    req.headers.get("content-length");

  if (contentLength) {
    const declaredSize =
      Number(contentLength);

    if (
      Number.isFinite(declaredSize) &&
      declaredSize > maxBytes
    ) {
      throw new RequestValidationError(
        "Request body too large.",
        413
      );
    }
  }

  const text = await req.text();

  const actualBytes =
    new TextEncoder().encode(text).length;

  if (actualBytes > maxBytes) {
    throw new RequestValidationError(
      "Request body too large.",
      413
    );
  }

  if (!text.trim()) {
    throw new RequestValidationError(
      "Request body required.",
      400
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new RequestValidationError(
      "Invalid JSON.",
      400
    );
  }
}

export function objectBody(
  value: unknown
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new RequestValidationError(
      "JSON object required.",
      400
    );
  }

  return value as Record<string, unknown>;
}

export function cleanString(
  value: unknown,
  maxLength: number
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, maxLength);
}