import { NextRequest, NextResponse } from "next/server";
import { getOrders, saveOrders } from "@/lib/server-data";
import { OrderStatus } from "@/lib/types";

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { status } = await req.json() as { status: OrderStatus };
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  orders[idx] = { ...orders[idx], status };
  await saveOrders(orders);
  return NextResponse.json(orders[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const orders = await getOrders();
  await saveOrders(orders.filter((o) => o.id !== id));
  return NextResponse.json({ ok: true });
}
