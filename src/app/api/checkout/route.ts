import { NextRequest, NextResponse } from "next/server";
import { getProducts, getPostageSettings, setPendingOrder } from "@/lib/server-data";
import { getStripeSecretKey, stripeFetch } from "@/lib/stripe";
import { createPayPalOrder } from "@/lib/paypal";
import { PriceTier, OrderItem } from "@/lib/types";

export const runtime = "nodejs";

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

// Flatten a nested object into Stripe's URL-encoded param format
function flattenParams(obj: unknown, prefix = ""): string {
  if (obj === null || obj === undefined) return "";
  if (Array.isArray(obj)) {
    return obj.map((item, i) => flattenParams(item, `${prefix}[${i}]`)).filter(Boolean).join("&");
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
  let body: { items: CheckoutItem[]; customer: CustomerDetails };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { items, customer } = body;
  if (!items?.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  if (!customer?.email) return NextResponse.json({ error: "Customer email is required." }, { status: 400 });

  let products: Awaited<ReturnType<typeof getProducts>>;
  let postageSettings: Awaited<ReturnType<typeof getPostageSettings>>;
  try {
    [products, postageSettings] = await Promise.all([getProducts(), getPostageSettings()]);
  } catch (err) {
    console.error("[checkout] Failed to fetch data store:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Service temporarily unavailable. Please try again later." }, { status: 503 });
  }

  // Build line items + totals (shared by both providers)
  const lineItems: { name: string; unitAmountPence: number; quantity: number }[] = [];
  let subtotalPounds = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });

    let unitAmountPence: number;
    let qty: number;
    let displayName: string;

    if (product.priceMatrix && Object.keys(product.priceMatrix).length > 0) {
      const sizeKey = item.selectedOptions?.["Size"] ?? "";
      const tiers: PriceTier[] = product.priceMatrix[sizeKey] ?? product.priceMatrix[""] ?? [];
      if (!tiers.length) return NextResponse.json({ error: `No pricing found for: ${product.name}` }, { status: 400 });
      const tier =
        tiers.find((t) => t.qty === item.quantity) ??
        [...tiers].reverse().find((t) => t.qty <= item.quantity) ??
        tiers[0];
      unitAmountPence = tier.totalPence;
      qty = 1;
      subtotalPounds += tier.totalPence / 100;
      displayName = `${product.name} × ${item.quantity}`;
    } else {
      if (!product.price || product.price <= 0)
        return NextResponse.json({ error: `Invalid price for: ${product.name}` }, { status: 400 });
      unitAmountPence = Math.round(product.price * 100);
      qty = item.quantity;
      subtotalPounds += product.price * item.quantity;
      displayName = product.name;
    }

    if (unitAmountPence <= 0)
      return NextResponse.json({ error: `Invalid price for: ${product.name}` }, { status: 400 });

    lineItems.push({ name: displayName, unitAmountPence, quantity: qty });
  }

  const shippingCost =
    postageSettings.freeThreshold > 0 && subtotalPounds >= postageSettings.freeThreshold
      ? 0
      : postageSettings.flatRate;
  const shippingPence = Math.round(shippingCost * 100);
  if (shippingPence > 0) lineItems.push({ name: "Postage & Packaging", unitAmountPence: shippingPence, quantity: 1 });

  const totalPounds = subtotalPounds + shippingCost;
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://peelpartyco.co.uk";

  // Route to PayPal or Stripe based on env var (default: paypal)
  const provider = process.env.PAYMENT_PROVIDER ?? "paypal";

  if (provider === "paypal") {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
    }
    try {
      const subtotalPence = Math.round(subtotalPounds * 100);
      const productItems: OrderItem[] = lineItems
        .filter((l) => l.name !== "Postage & Packaging")
        .map((l) => ({ name: l.name, unitAmountPence: l.unitAmountPence, quantity: l.quantity }));

      const { id: paypalOrderId, approvalUrl } = await createPayPalOrder({
        totalGBP: totalPounds.toFixed(2),
        customId: `pp_${Date.now()}`,
        description: `Peel & Party Co. — ${productItems.map((i) => i.name).join(", ")}`.slice(0, 127),
        returnUrl: `${origin}/checkout/success`,
        cancelUrl: `${origin}/checkout`,
      });

      // Store pending order so success page can reconstruct it
      await setPendingOrder(paypalOrderId, {
        customer: {
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone ?? "",
          address1: customer.address1,
          address2: customer.address2 ?? "",
          city: customer.city,
          postcode: customer.postcode,
        },
        items: productItems,
        subtotalPence,
        postagePence: shippingPence,
        totalPence: Math.round(totalPounds * 100),
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ url: approvalUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[checkout/paypal]", msg);
      return NextResponse.json({ error: "Payment service error. Please try again." }, { status: 500 });
    }
  }

  // ── Stripe path ─────────────────────────────────────────────────────────────
  const { cleaned: stripeKey, fingerprint } = getStripeSecretKey();
  if (!stripeKey) return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  console.log(`[checkout/stripe] len=${stripeKey.length} fp=${fingerprint}`);

  const stripeLineItems = lineItems.map((l) => ({
    price_data: { currency: "gbp", product_data: { name: l.name }, unit_amount: l.unitAmountPence },
    quantity: l.quantity,
  }));

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
      items_json: JSON.stringify(
        stripeLineItems.map((li) => ({ n: li.price_data.product_data.name, p: li.price_data.unit_amount, q: li.quantity }))
      ).slice(0, 490),
    },
    line_items: stripeLineItems,
  };

  try {
    const stripe = await stripeFetch("/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: flattenParams(sessionParams),
    });
    const stripeBody = stripe.body as { url?: string; error?: { message: string; type: string; code?: string } };
    if (!stripe.ok || stripeBody.error) {
      console.error("[checkout/stripe] error:", stripeBody.error ?? stripe.status);
      return NextResponse.json({ error: "Payment service error. Please try again." }, { status: 500 });
    }
    if (!stripeBody.url) return NextResponse.json({ error: "Payment service error. Please try again." }, { status: 500 });
    return NextResponse.json({ url: stripeBody.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[checkout/stripe] fetch failed:", msg);
    return NextResponse.json({ error: "Payment service error. Please try again." }, { status: 500 });
  }
}
