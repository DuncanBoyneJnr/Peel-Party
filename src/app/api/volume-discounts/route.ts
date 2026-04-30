import { NextResponse } from "next/server";
import { getCostSettings } from "@/lib/server-data";

export async function GET() {
  const settings = await getCostSettings();
  return NextResponse.json(settings.volumeDiscounts ?? []);
}
