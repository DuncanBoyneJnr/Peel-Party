export const dynamic = "force-dynamic";

import { getBundles, getProducts } from "@/lib/server-data";
import BundleForm from "../BundleForm";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ id: string }> }

export default async function EditBundlePage({ params }: Props) {
  const { id } = await params;
  const [bundles, products] = await Promise.all([getBundles(), getProducts()]);
  const bundle = bundles.find((b) => b.id === id);
  if (!bundle) notFound();

  return (
    <div>
      <h1 className="font-display font-800 text-3xl text-[#111111] mb-8">Edit Bundle</h1>
      <BundleForm bundle={bundle} products={products} />
    </div>
  );
}
