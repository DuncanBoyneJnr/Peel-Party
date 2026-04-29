const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const secret = process.env.PAYPAL_CLIENT_SECRET ?? "";
  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(params: {
  totalGBP: string;
  customId: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approvalUrl: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: params.customId,
          description: params.description,
          amount: { currency_code: "GBP", value: params.totalGBP },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal create order failed ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    id: string;
    links: Array<{ rel: string; href: string }>;
  };

  const approvalUrl = data.links.find((l) => l.rel === "payer-action")?.href;
  if (!approvalUrl) throw new Error("No payer-action URL in PayPal response");

  return { id: data.id, approvalUrl };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  status: string;
  customId: string;
  amountValue: string;
}> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal capture failed ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    status: string;
    purchase_units: Array<{
      custom_id?: string;
      payments?: { captures?: Array<{ amount?: { value?: string } }> };
    }>;
  };

  const unit = data.purchase_units[0];
  return {
    status: data.status,
    customId: unit?.custom_id ?? "",
    amountValue: unit?.payments?.captures?.[0]?.amount?.value ?? "0",
  };
}
