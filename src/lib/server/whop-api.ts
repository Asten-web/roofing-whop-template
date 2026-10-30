import { timingSafeEqual } from "node:crypto";

type WhopApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  idempotencyKey?: string;
};

type WhopApiResponse = Record<string, unknown> & {
  id?: string;
  status?: string;
  client_secret?: string;
  payment_method?: { id?: string };
  payment_method_id?: string;
  invoice?: { id?: string };
  lead?: { id?: string };
  pay_url?: string;
  payment_url?: string;
  hosted_invoice_url?: string;
  account_id?: string;
  company_id?: string;
  account?: { id?: string };
  company?: { id?: string };
};

class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function whopConfig() {
  const accountId = process.env.WHOP_ACCOUNT_ID?.trim();
  if (!accountId) {
    throw new Error("WHOP_ACCOUNT_ID must be configured on the server.");
  }
  return { accountId };
}

function apiBaseUrl(): URL {
  const explicitBase = process.env.WHOP_API_BASE_URL?.trim();
  if (explicitBase) return new URL(`${explicitBase.replace(/\/+$/, "")}/`);

  const configuredOrigin = process.env.WHOP_API_ORIGIN?.trim();
  const base = new URL(
    configuredOrigin ||
      (process.env.WHOP_SANDBOX === "true"
        ? "https://sandbox-api.whop.com"
        : "https://api.whop.com"),
  );
  if (!base.pathname.replace(/\/+$/, "").endsWith("/api/v1")) {
    base.pathname = `${base.pathname.replace(/\/+$/, "")}/api/v1`;
  }
  return new URL(`${base.toString().replace(/\/+$/, "")}/`);
}

export async function whopApi(
  path: string,
  options: WhopApiOptions = {},
): Promise<WhopApiResponse> {
  const apiBase = apiBaseUrl();
  const url = new URL(path.replace(/^\/+/, ""), apiBase);
  const headers = new Headers({
    Accept: "application/json",
    "Whop-API-Version":
      process.env.WHOP_API_VERSION_DATE?.trim() || "2026-10-29-8",
  });
  const apiKey =
    process.env.WHOP_API_KEY?.trim() ||
    process.env.WHOP_COMPANY_API_KEY?.trim();

  // Whop Websites signs outbound API requests in its hosted runtime.
  if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);
  if (options.body) headers.set("Content-Type", "application/json");
  if (options.idempotencyKey)
    headers.set("Idempotency-Key", options.idempotencyKey);

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const data =
      result && typeof result === "object"
        ? (result as Record<string, unknown>)
        : {};
    const message =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : "Whop API request failed.";
    throw new HttpError(message, response.status);
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("Whop API returned an invalid response.");
  }

  return result as WhopApiResponse;
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const expectedOrigin = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : new URL(request.url).origin;
  let actualOrigin: string | null = null;
  if (origin) {
    try {
      actualOrigin = new URL(origin).origin;
    } catch {
      throw new HttpError("Invalid request origin.", 403);
    }
  }

  if (
    (actualOrigin && actualOrigin !== expectedOrigin) ||
    fetchSite === "cross-site"
  ) {
    throw new HttpError("Invalid request origin.", 403);
  }
}

const requestWindows = new Map<
  string,
  { startedAt: number; count: number }
>();

export function enforceRateLimit(
  request: Request,
  scope: string,
  maximum = 10,
  windowMs = 60_000,
): Response | null {
  const address =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!address) return null;

  const now = Date.now();
  const key = `${scope}:${address}`;
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    requestWindows.set(key, { startedAt: now, count: 1 });
  } else if (current.count >= maximum) {
    return Response.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((windowMs - (now - current.startedAt)) / 1000),
          ),
        },
      },
    );
  } else {
    current.count += 1;
  }

  if (requestWindows.size > 5_000) {
    for (const [entry, value] of requestWindows) {
      if (now - value.startedAt >= windowMs) requestWindows.delete(entry);
      if (requestWindows.size <= 4_000) break;
    }
  }
  return null;
}

export function requireAdminKey(request: Request): void {
  const configuredKey = process.env.WHOP_ADMIN_KEY || process.env.ROOFING_ADMIN_KEY;
  if (!configuredKey)
    throw new Error("WHOP_ADMIN_KEY must be configured on the server.");

  const providedKey = request.headers.get("x-admin-key") || "";
  const expected = Buffer.from(configuredKey);
  const provided = Buffer.from(providedKey);
  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    throw new HttpError("Admin authentication is required.", 401);
  }
}

export function jsonError(error: unknown): Response {
  if (error instanceof HttpError) {
    const status =
      error.status >= 400 && error.status <= 599 ? error.status : 500;
    return Response.json({ error: error.message }, { status });
  }

  console.error(
    "Whop API request failed.",
    error instanceof Error ? error.message : "Unknown server error.",
  );
  return Response.json(
    { error: "An unexpected server error occurred." },
    { status: 500 },
  );
}
