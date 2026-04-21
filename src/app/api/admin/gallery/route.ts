import { NextRequest, NextResponse } from "next/server";
import { getGallery, saveGallery, GalleryItem } from "@/lib/server-data";

export async function GET() {
  return NextResponse.json(await getGallery());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = await getGallery();
  const newItem: GalleryItem = { ...body, id: `g${Date.now()}` };
  items.push(newItem);
  await saveGallery(items);
  return NextResponse.json(newItem, { status: 201 });
}
