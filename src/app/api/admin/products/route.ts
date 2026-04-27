import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProducts, saveProducts, getCostSettings } from "@/lib/server-data";
import { Product } from "@/lib/types";
import { buildPriceMatrix } from "@/lib/pricing";

export async function GET() {
  return NextResponse.json(await getProducts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [products, costSettings] = await Promise.all([getProducts(), getCostSettings()]);
  const newProduct: Product = {
    ...body,
    id: `p${Date.now()}`,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
  };
  newProduct.priceMatrix = buildPriceMatrix(newProduct, costSettings);
  products.push(newProduct);
  await saveProducts(products);
  revalidatePath("/", "layout");
  return NextResponse.json(newProduct, { status: 201 });
}
