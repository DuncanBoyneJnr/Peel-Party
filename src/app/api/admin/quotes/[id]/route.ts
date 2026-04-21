import { NextRequest, NextResponse } from "next/server";
import { getQuotes, saveQuotes } from "@/lib/server-data";

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const quotes = await getQuotes();
  const idx = quotes.findIndex((q) => q.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  quotes[idx] = { ...quotes[idx], ...body };
  await saveQuotes(quotes);
  return NextResponse.json(quotes[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const quotes = await getQuotes();
  await saveQuotes(quotes.filter((q) => q.id !== id));
  return NextResponse.json({ ok: true });
}
