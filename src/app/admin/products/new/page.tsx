import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111111] transition-colors mb-6">
        <ArrowLeft size={14} /> Back to Products
      </Link>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">New Product</h1>
        <p className="text-[#6b7280] mt-1">Fill in the details below to add a product to your catalogue.</p>
      </div>
      <ProductForm isNew />
    </div>
  );
}
