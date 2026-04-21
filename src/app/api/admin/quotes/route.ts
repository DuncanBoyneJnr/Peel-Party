import { NextRequest, NextResponse } from "next/server";
import { getQuotes, saveQuotes, Quote } from "@/lib/server-data";

export async function GET() {
  const quotes = (await getQuotes()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const quotes = await getQuotes();
  const newQuote: Quote = {
    ...body,
    id: `q${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: "new",
  };
  quotes.push(newQuote);
  await saveQuotes(quotes);
  return NextResponse.json(newQuote, { status: 201 });
}
