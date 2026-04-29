import { getOrders } from "@/lib/server-data";
import OrdersAdmin from "./OrdersAdmin";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Orders</h1>
        <p className="text-[#6b7280] mt-1">Paid orders from your shop.</p>
      </div>
      <OrdersAdmin initialOrders={orders} />
    </div>
  );
}
