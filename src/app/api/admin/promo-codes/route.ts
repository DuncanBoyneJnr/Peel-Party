import { NextRequest, NextResponse } from "next/server";
import { getPromoCodes, savePromoCodes } from "@/lib/server-data";
import { PromoCode } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getPromoCodes());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const codes = await getPromoCodes();

  const newCode: PromoCode = {
    id: `pc_${Date.now()}`,
    code: String(body.code ?? "").trim().toUpperCase(),
    discountType: body.discountType === "fixed" ? "fixed" : "percent",
    discountValue: Number(body.discountValue ?? 0),
    active: body.active !== false,
    expiresAt: body.expiresAt || undefined,
    usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined,
    usageCount: 0,
    minOrderPence: body.minOrderPence ? Number(body.minOrderPence) : undefined,
  };

  if (!newCode.code) return NextResponse.json({ error: "Code is required." }, { status: 400 });
  if (codes.some((c) => c.code === newCode.code)) {
    return NextResponse.json({ error: "A code with that name already exists." }, { status: 409 });
  }

  await savePromoCodes([...codes, newCode]);
  return NextResponse.json(newCode, { status: 201 });
}
