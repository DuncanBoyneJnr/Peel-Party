import { NextRequest, NextResponse } from "next/server";
import { getCostSettings, saveCostSettings } from "@/lib/server-data";

export async function GET() {
  return NextResponse.json(await getCostSettings());
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const current = await getCostSettings();
  const updated = { ...current, ...body };
  await saveCostSettings(updated);
  return NextResponse.json(updated);
}
