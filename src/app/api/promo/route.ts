import { NextRequest, NextResponse } from "next/server";
import { getPromoCodes } from "@/lib/server-data";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const subtotalPence: number = typeof body.subtotalPence === "number" ? body.subtotalPence : 0;

  if (!code) return NextResponse.json({ valid: false, error: "No code provided." });

  const codes = await getPromoCodes();
  const promo = codes.find((c) => c.code.toUpperCase() === code);

  if (!promo) return NextResponse.json({ valid: false, error: "Code not found." });
  if (!promo.active) return NextResponse.json({ valid: false, error: "This code is no longer active." });
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: "This code has expired." });
  }
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return NextResponse.json({ valid: false, error: "This code has reached its usage limit." });
  }
  if (promo.minOrderPence && subtotalPence < promo.minOrderPence) {
    return NextResponse.json({
      valid: false,
      error: `Minimum order of £${(promo.minOrderPence / 100).toFixed(2)} required.`,
    });
  }

  const description =
    promo.discountType === "percent"
      ? `${promo.discountValue}% off`
      : `£${(promo.discountValue / 100).toFixed(2)} off`;

  return NextResponse.json({
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    description,
  });
}
