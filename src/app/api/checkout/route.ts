import { NextRequest, NextResponse } from "next/server";
import { getProducts, getPostageSettings } from "@/lib/server-data";
import { PriceTier } from "@/lib/types";

interface CheckoutItem {
  productId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

interface CustomerDetails {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
}

// Flatten a nested object into Stripe's URL-encoded param format:
// { line_items: [{ price_data: { currency: "gbp" } }] }
// → "line_items[0][price_data][currency]=gbp"
function flattenParams(obj: unknown, prefix = ""): string {
  if (obj === null || obj === undefined) return "";
  if (Array.isArray(obj)) {
    return obj
      .map((item, i) => flattenParams(item, `${prefix}[${i}]`))
      .filter(Boolean)
      .join("&");
  }
  if (typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>)
      .map(([key, val]) => flattenParams(val, prefix ? `${prefix}[${key}]` : key))
      .filter(Boolean)
      .join("&");
  }
  return `${encodeURIComponent(prefix)}=${encodeURIComponent(String(obj))}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }
  // Keep only printable ASCII — strips newlines, zero-width spaces, BOM, and any other invisible Unicode
  const stripeKey = process.env.STRIPE_SECRET_KEY.replace(/[^\x20-\x7E]/g, "");
  console.log(`[checkout] stripeKey len=${stripeKey.length} tail=${stripeKey.slice(-4)}`);

  let body: { items: CheckoutItem[]; customer: CustomerDetails };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { items, customer } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!customer?.email) {
    return NextResponse.json({ error: "Customer email is required." }, { status: 400 });
  }

  // Re-fetch all prices server-side — never trust client-supplied amounts
  let products: Awaited<ReturnType<typeof getProducts>>;
  let postageSettings: Awaited<ReturnType<typeof getPostageSettings>>;
  try {
    [products, postageSettings] = await Promise.all([
      getProducts(),
      getPostageSettings(),
    ]);
  } catch (err) {
    console.error("[checkout] Failed to fetch data store:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Service temporarily unavailable. Please try again later." }, { status: 503 });
  }

  const lineItems: { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }[] = [];
  let subtotalPounds = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
    }

    let unitAmountPence: number;
    let stripeQuantity: number;
    let displayName: string;

    if (product.priceMatrix && Object.keys(product.priceMatrix).length > 0) {
      const sizeKey = item.selectedOptions?.["Size"] ?? "";
      const tiers: PriceTier[] = product.priceMatrix[sizeKey] ?? product.priceMatrix[""] ?? [];

      if (!tiers.length) {
        console.error(`[checkout] No price tiers for "${product.name}" sizeKey="${sizeKey}"`);
        return NextResponse.json({ error: `No pricing found for: ${product.name}` }, { status: 400 });
      }

      const tier =
        tiers.find((t) => t.qty === item.quantity) ??
        [...tiers].reverse().find((t) => t.qty <= item.quantity) ??
        tiers[0];

      unitAmountPence = tier.totalPence;
      stripeQuantity = 1;
      subtotalPounds += tier.totalPence / 100;
      displayName = `${product.name} × ${item.quantity}`;
    } else {
      if (!product.price || product.price <= 0) {
        console.error(`[checkout] Zero price for "${product.name}" id=${product.id}`);
        return NextResponse.json({ error: `Invalid price for: ${product.name}` }, { status: 400 });
      }
      unitAmountPence = Math.round(product.price * 100);
      stripeQuantity = item.quantity;
      subtotalPounds += product.price * item.quantity;
      displayName = product.name;
    }

    if (unitAmountPence <= 0) {
      console.error(`[checkout] unit_amount ${unitAmountPence} for "${product.name}"`);
      return NextResponse.json({ error: `Invalid price for: ${product.name}` }, { status: 400 });
    }

    lineItems.push({
      price_data: { currency: "gbp", product_data: { name: displayName }, unit_amount: unitAmountPence },
      quantity: stripeQuantity,
    });
  }

  const shippingCost =
    postageSettings.freeThreshold > 0 && subtotalPounds >= postageSettings.freeThreshold
      ? 0
      : postageSettings.flatRate;

  if (shippingCost > 0) {
    lineItems.push({
      price_data: { currency: "gbp", product_data: { name: "Postage & Packaging" }, unit_amount: Math.round(shippingCost * 100) },
      quantity: 1,
    });
  }

  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://peelpartyco.co.uk";

  const sessionParams = {
    mode: "payment",
    customer_email: customer.email,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    metadata: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone ?? "",
      address1: customer.address1,
      address2: customer.address2 ?? "",
      city: customer.city,
      postcode: customer.postcode,
    },
    line_items: lineItems,
  };

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: flattenParams(sessionParams),
    });

    const stripeBody = await stripeRes.json() as { url?: string; id?: string; error?: { message: string; type: string; code?: string; param?: string } };

    if (!stripeRes.ok || stripeBody.error) {
      console.error("[checkout] Stripe error:", stripeBody.error ?? stripeRes.status);
      return NextResponse.json({ error: "Payment service error. Please try again.", _d: { t: stripeBody.error?.type, c: stripeBody.error?.code, m: stripeBody.error?.message?.slice(0, 150), s: stripeRes.status } }, { status: 500 });
    }

    if (!stripeBody.url) {
      console.error("[checkout] No URL in Stripe response");
      return NextResponse.json({ error: "Payment service error. Please try again.", _d: "no-url" }, { status: 500 });
    }

    return NextResponse.json({ url: stripeBody.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[checkout] fetch to Stripe failed:", msg);
    return NextResponse.json({ error: "Payment service error. Please try again.", _d: { b: "fetch-threw", e: msg.slice(0, 200) } }, { status: 500 });
  }
}
