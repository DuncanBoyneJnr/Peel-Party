import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProducts, saveProducts, getCostSettings } from "@/lib/server-data";
import { buildPriceMatrix } from "@/lib/pricing";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const [products, costSettings] = await Promise.all([getProducts(), getCostSettings()]);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = { ...products[idx], ...body };
  updated.priceMatrix = buildPriceMatrix(updated, costSettings);
  products[idx] = updated;
  await saveProducts(products);
  revalidatePath("/", "layout");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const products = await getProducts();
  await saveProducts(products.filter((p) => p.id !== id));
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
