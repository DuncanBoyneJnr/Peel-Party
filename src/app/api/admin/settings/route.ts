import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/server-data";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const current = await getSettings();
  const updated = { ...current, ...body };
  await saveSettings(updated);
  return NextResponse.json(updated);
}
