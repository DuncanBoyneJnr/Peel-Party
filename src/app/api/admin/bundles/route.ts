import { NextRequest, NextResponse } from "next/server";
import { getBundles, saveBundles, Bundle } from "@/lib/server-data";
import { slugify } from "@/lib/utils";

export async function GET() {
  return NextResponse.json(await getBundles());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const bundles = await getBundles();
  const newBundle: Bundle = {
    ...body,
    id: `b${Date.now()}`,
    slug: slugify(body.name),
    price: Number(body.price) || 0,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    featured: Boolean(body.featured),
    active: body.active !== false,
    items: body.items ?? [],
  };
  bundles.push(newBundle);
  await saveBundles(bundles);
  return NextResponse.json(newBundle, { status: 201 });
}
