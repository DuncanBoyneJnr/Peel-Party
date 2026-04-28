import { NextResponse } from "next/server";
import { getPostageSettings } from "@/lib/server-data";

export async function GET() {
  return NextResponse.json(await getPostageSettings());
}
