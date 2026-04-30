import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowed = ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf", "ai", "eps"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "File type not allowed. Please upload JPG, PNG, SVG, PDF, AI or EPS." }, { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum 20MB." }, { status: 400 });
  }

  try {
    const blob = await put(`artwork/${Date.now()}-${file.name}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[artwork-upload] Blob upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
