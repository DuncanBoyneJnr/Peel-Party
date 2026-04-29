import { NextResponse } from "next/server";

export async function GET() {
  const raw = process.env.STRIPE_SECRET_KEY ?? "";
  const cleaned = raw.replace(/[^\x20-\x7E]/g, "");

  const res = await fetch("https://api.stripe.com/v1/customers?limit=1", {
    headers: { Authorization: `Bearer ${cleaned}` },
  });
  const body = await res.json();

  return NextResponse.json({
    rawLen: raw.length,
    cleanedLen: cleaned.length,
    prefix: cleaned.slice(0, 12),
    middle8: cleaned.slice(50, 58),
    tail: cleaned.slice(-8),
    requestId: res.headers.get("request-id"),
    stripeStatus: res.status,
    stripeBody: body,
  });
}
