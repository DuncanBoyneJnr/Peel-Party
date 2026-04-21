import { getProducts } from "@/lib/server-data";
import BundleForm from "../BundleForm";

export default function NewBundlePage() {
  const products = getProducts();
  return (
    <div>
      <h1 className="font-display font-800 text-3xl text-[#111111] mb-8">New Bundle</h1>
      <BundleForm isNew products={products} />
    </div>
  );
}
