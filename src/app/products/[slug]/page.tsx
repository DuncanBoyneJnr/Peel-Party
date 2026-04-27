export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getCostSettings } from "@/lib/server-data";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";
import Rating from "@/components/ui/Rating";
import Badge from "@/components/ui/Badge";
import { CheckCircle2, Truck, Shield } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, costSettings] = await Promise.all([getProductBySlug(slug), getCostSettings()]);
  if (!product) notFound();

  const isQuote = product.orderType === "request-quote";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-8">
        <Link href="/" className="hover:text-[#ef8733] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#ef8733] transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop/${product.category}`} className="hover:text-[#ef8733] transition-colors capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-[#111111] font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="relative">
          <ProductGallery images={product.images} name={product.name} />
          {product.badge && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant={product.badge === "Sale" ? "black" : "papaya"}>{product.badge}</Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <Link
              href={`/shop/${product.category}`}
              className="text-xs font-semibold uppercase tracking-wider text-[#ef8733] hover:underline capitalize"
            >
              {product.category}
            </Link>
            <h1 className="font-display font-800 text-3xl sm:text-4xl text-[#111111] mt-1 mb-3">{product.name}</h1>
            <Rating value={product.rating} count={product.reviewCount} />
          </div>

          {isQuote && (
            <div className="flex items-center gap-3">
              <span className="font-display font-700 text-2xl text-[#111111]">Price on request</span>
              <Badge variant="outline">Request a Quote</Badge>
            </div>
          )}

          <p className="text-[#6b7280] leading-relaxed">{product.longDescription}</p>

          <ul className="flex flex-col gap-2">
            {[
              product.supportsFileUpload && "Upload your own artwork",
              product.supportsTextInput && "Add custom text",
              "Digital proof before printing",
              "UK dispatch within 48–72 hours",
            ].filter(Boolean).map((feat) => (
              <li key={feat as string} className="flex items-center gap-2 text-sm text-[#111111]">
                <CheckCircle2 size={15} className="text-[#ef8733] shrink-0" />
                {feat}
              </li>
            ))}
          </ul>

          <ProductActions product={product} maxOrderQty={costSettings.maxOrderQty} costSettings={costSettings} />

          <div className="flex flex-wrap gap-4 pt-4 border-t border-[#e5e1d8]">
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Truck size={14} className="text-[#ef8733]" /> Free delivery over £50
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Shield size={14} className="text-[#ef8733]" /> Quality guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
