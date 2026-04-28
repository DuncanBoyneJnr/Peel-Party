import { NextRequest, NextResponse } from "next/server";
import { getPostageSettings, savePostageSettings } from "@/lib/server-data";

export async function GET() {
  return NextResponse.json(await getPostageSettings());
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const current = await getPostageSettings();
  const updated = { ...current, ...body };
  await savePostageSettings(updated);
  return NextResponse.json(updated);
}
