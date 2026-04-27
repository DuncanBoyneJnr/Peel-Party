import { NextRequest, NextResponse } from "next/server";
import { getCostSettings, saveCostSettings } from "@/lib/server-data";

export async function GET() {
  const settings = await getCostSettings();
  return NextResponse.json(settings.materials);
}

export async function PUT(req: NextRequest) {
  const materials = await req.json();
  const settings = await getCostSettings();
  await saveCostSettings({ ...settings, materials });
  return NextResponse.json(materials);
}
