import { getQuotes } from "@/lib/server-data";
import QuotesAdmin from "./QuotesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const quotes = (await getQuotes()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Quote Requests</h1>
        <p className="text-[#6b7280] mt-1">
          {quotes.length} total · {quotes.filter((q) => q.status === "new").length} new
        </p>
      </div>
      <QuotesAdmin initialQuotes={quotes} />
    </div>
  );
}
