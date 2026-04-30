import { NextRequest, NextResponse } from "next/server";
import { getPromoCodes, savePromoCodes } from "@/lib/server-data";

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const codes = await getPromoCodes();
  const idx = codes.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found." }, { status: 404 });
  codes[idx] = {
    ...codes[idx],
    code: body.code !== undefined ? String(body.code).trim().toUpperCase() : codes[idx].code,
    discountType: body.discountType ?? codes[idx].discountType,
    discountValue: body.discountValue !== undefined ? Number(body.discountValue) : codes[idx].discountValue,
    active: body.active !== undefined ? Boolean(body.active) : codes[idx].active,
    expiresAt: body.expiresAt !== undefined ? (body.expiresAt || undefined) : codes[idx].expiresAt,
    usageLimit: body.usageLimit !== undefined ? (body.usageLimit ? Number(body.usageLimit) : undefined) : codes[idx].usageLimit,
    minOrderPence: body.minOrderPence !== undefined ? (body.minOrderPence ? Number(body.minOrderPence) : undefined) : codes[idx].minOrderPence,
  };
  await savePromoCodes(codes);
  return NextResponse.json(codes[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const codes = await getPromoCodes();
  await savePromoCodes(codes.filter((c) => c.id !== id));
  return NextResponse.json({ ok: true });
}
