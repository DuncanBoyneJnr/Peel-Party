import { NextRequest, NextResponse } from "next/server";
import { getGallery, saveGallery } from "@/lib/server-data";

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const items = await getGallery();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  items[idx] = { ...items[idx], ...body };
  await saveGallery(items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const items = await getGallery();
  await saveGallery(items.filter((i) => i.id !== id));
  return NextResponse.json({ ok: true });
}
