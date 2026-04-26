import { getProducts } from "@/lib/server-data";
import { getCostSettings } from "@/lib/server-data";
import CostsAdmin from "./CostsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCostsPage() {
  const [products, costSettings] = await Promise.all([
    getProducts(),
    getCostSettings(),
  ]);
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Costs & Profit</h1>
        <p className="text-[#6b7280] mt-1">Track material costs, labour, postage and profit margins per product.</p>
      </div>
      <CostsAdmin products={products} initialSettings={costSettings} />
    </div>
  );
}
