import { NextResponse } from "next/server";
import { getSettings } from "@/lib/server-data";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ sections: settings.shopNavSections });
}
