import { createHash } from "node:crypto";

export interface StripeResponseSummary {
  status: number;
  ok: boolean;
  requestId: string | null;
  responseHeaders: Record<string, string>;
  body: unknown;
}

export function getStripeSecretKey() {
  const raw = process.env.STRIPE_SECRET_KEY ?? "";
  const cleaned = raw.replace(/[^\x20-\x7E]/g, "");

  return {
    raw,
    cleaned,
    fingerprint: cleaned
      ? createHash("sha256").update(cleaned).digest("hex").slice(0, 16)
      : "",
  };
}

export async function stripeFetch(
  path: string,
  init: RequestInit,
): Promise<StripeResponseSummary> {
  const res = await fetch(`https://api.stripe.com${path}`, {
    ...init,
    cache: "no-store",
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = { parseError: "Stripe response was not valid JSON." };
  }

  const responseHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    status: res.status,
    ok: res.ok,
    requestId: res.headers.get("request-id"),
    responseHeaders,
    body,
  };
}
