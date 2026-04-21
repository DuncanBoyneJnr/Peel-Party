import { NextRequest, NextResponse } from "next/server";
import { getBundles, saveBundles } from "@/lib/server-data";
import { slugify } from "@/lib/utils";

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const bundles = await getBundles();
  const idx = bundles.findIndex((b) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  bundles[idx] = {
    ...bundles[idx],
    ...body,
    id,
    slug: slugify(body.name ?? bundles[idx].name),
    price: Number(body.price) || 0,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    featured: Boolean(body.featured),
    active: body.active !== false,
    items: body.items ?? bundles[idx].items,
  };
  await saveBundles(bundles);
  return NextResponse.json(bundles[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const bundles = await getBundles();
  await saveBundles(bundles.filter((b) => b.id !== id));
  return NextResponse.json({ ok: true });
}
