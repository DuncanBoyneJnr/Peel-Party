import { NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const allowed = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const filename = `gallery-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const dest = path.join(process.cwd(), "public", filename);
  writeFileSync(dest, buffer);

  return NextResponse.json({ src: `/${filename}` });
}
