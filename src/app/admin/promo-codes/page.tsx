import { getPromoCodes } from "@/lib/server-data";
import PromoCodesAdmin from "./PromoCodesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPromoCodesPage() {
  const codes = await getPromoCodes();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Promo Codes</h1>
        <p className="text-[#6b7280] mt-1">Create and manage discount codes for your customers.</p>
      </div>
      <PromoCodesAdmin initialCodes={codes} />
    </div>
  );
}
