import { NextResponse } from "next/server";
import { getStripeSecretKey, stripeFetch } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  const { raw, cleaned, fingerprint } = getStripeSecretKey();
  const stripe = await stripeFetch("/v1/customers?limit=1", {
    headers: { Authorization: `Bearer ${cleaned}` },
  });

  return NextResponse.json({
    rawLen: raw.length,
    cleanedLen: cleaned.length,
    keyFingerprint: fingerprint,
    prefix: cleaned.slice(0, 12),
    middle8: cleaned.slice(50, 58),
    tail: cleaned.slice(-8),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    vercelRegion: process.env.VERCEL_REGION ?? null,
    requestId: stripe.requestId,
    stripeStatus: stripe.status,
    responseHeaders: stripe.responseHeaders,
    stripeBody: stripe.body,
  });
}
