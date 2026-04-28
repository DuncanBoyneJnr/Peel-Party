import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
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

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" });

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

  // Re-fetch all prices from Redis — never trust client-supplied amounts
  const [products, postageSettings] = await Promise.all([
    getProducts(),
    getPostageSettings(),
  ]);

  const lineItems: {
    price_data: { currency: string; product_data: { name: string }; unit_amount: number };
    quantity: number;
  }[] = [];
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
      // Matrix-priced product: price lives in tiers, not product.price (which is 0)
      const sizeKey = item.selectedOptions?.["Size"] ?? "";
      const tiers: PriceTier[] = product.priceMatrix[sizeKey] ?? product.priceMatrix[""] ?? [];

      if (!tiers.length) {
        console.error(`[checkout] No price tiers found for "${product.name}" sizeKey="${sizeKey}"`);
        return NextResponse.json({ error: `No pricing found for: ${product.name}` }, { status: 400 });
      }

      // Match the exact qty tier; fall back to nearest lower tier
      const tier =
        tiers.find((t) => t.qty === item.quantity) ??
        [...tiers].reverse().find((t) => t.qty <= item.quantity) ??
        tiers[0];

      // Pass as a single line at totalPence to avoid rounding drift
      unitAmountPence = tier.totalPence;
      stripeQuantity = 1;
      subtotalPounds += tier.totalPence / 100;
      displayName = `${product.name} × ${item.quantity}`;
    } else {
      // Flat-price product: product.price is in pounds
      if (!product.price || product.price <= 0) {
        console.error(`[checkout] Zero/missing price for flat-price product "${product.name}" id=${product.id}`);
        return NextResponse.json({ error: `Invalid price for: ${product.name}` }, { status: 400 });
      }
      unitAmountPence = Math.round(product.price * 100);
      stripeQuantity = item.quantity;
      subtotalPounds += product.price * item.quantity;
      displayName = product.name;
    }

    if (unitAmountPence <= 0) {
      console.error(`[checkout] unit_amount ${unitAmountPence} for "${product.name}" — aborting`);
      return NextResponse.json({ error: `Invalid price for: ${product.name}` }, { status: 400 });
    }

    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: { name: displayName },
        unit_amount: unitAmountPence,
      },
      quantity: stripeQuantity,
    });
  }

  const shippingCost =
    postageSettings.freeThreshold > 0 && subtotalPounds >= postageSettings.freeThreshold
      ? 0
      : postageSettings.flatRate;

  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: { name: "Postage & Packaging" },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://peelpartyco.co.uk";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customer.email,
      metadata: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone ?? "",
        address1: customer.address1,
        address2: customer.address2 ?? "",
        city: customer.city,
        postcode: customer.postcode,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    if (!session.url) {
      console.error("[checkout] Stripe session created but no URL returned");
      return NextResponse.json({ error: "Payment service error. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe session creation failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Payment service error. Please try again." }, { status: 500 });
  }
}
