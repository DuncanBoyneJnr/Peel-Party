import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getProducts, getPostageSettings } from "@/lib/server-data";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });

interface CheckoutItem {
  productId: string;
  quantity: number;
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

  const { items, customer } = (await req.json()) as {
    items: CheckoutItem[];
    customer: CustomerDetails;
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // Re-fetch product prices from Redis — never trust client-supplied amounts
  const [products, postageSettings] = await Promise.all([
    getProducts(),
    getPostageSettings(),
  ]);

  const lineItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
    }
    subtotal += product.price * item.quantity;
    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: { name: product.name },
        unit_amount: Math.round(product.price * 100), // convert pounds → pence for Stripe
      },
      quantity: item.quantity,
    });
  }

  const shippingCost =
    postageSettings.freeThreshold > 0 && subtotal >= postageSettings.freeThreshold
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

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

  return NextResponse.json({ url: session.url });
}
