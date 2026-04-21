import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/server-data";
import { Product } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getProducts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const products = getProducts();
  const newProduct: Product = {
    ...body,
    id: `p${Date.now()}`,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
  };
  products.push(newProduct);
  saveProducts(products);
  return NextResponse.json(newProduct, { status: 201 });
}
