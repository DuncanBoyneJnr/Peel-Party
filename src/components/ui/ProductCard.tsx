import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, FileText } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Badge from "./Badge";
import Rating from "./Rating";

interface ProductCardProps {
  product: Product;
}

function getFromPrice(product: Product): number | null {
  const matrix = product.priceMatrix;
  if (!matrix) return null;
  let min = Infinity;
  for (const tiers of Object.values(matrix)) {
    for (const tier of tiers) {
      if (tier.totalPence < min) min = tier.totalPence;
    }
  }
  return min === Infinity ? null : min / 100;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isQuote = product.orderType === "request-quote";
  const fromPrice = getFromPrice(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#e5e1d8] hover:border-[#ef8733] hover:shadow-lg transition-all duration-200"
    >
      {/* Image area */}
      <div className="relative bg-[#f9f7f4] aspect-square overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6b7280]">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="8" fill="#f0ede8"/>
              <path d="M20 44L28 32L36 40L42 34L52 44H20Z" fill="#d1c8bc"/>
              <circle cx="26" cy="26" r="4" fill="#d1c8bc"/>
            </svg>
          </div>
        )}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={product.badge === "Sale" ? "black" : "papaya"}>{product.badge}</Badge>
          </div>
        )}
        {isQuote && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline">Quote</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#ef8733]">
          {product.category}
        </p>
        <h3 className="font-display font-700 text-[#111111] leading-snug group-hover:text-[#ef8733] transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-[#6b7280] line-clamp-2 flex-1">{product.description}</p>

        <Rating value={product.rating} count={product.reviewCount} className="mt-1" />

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#e5e1d8]">
          <div className="flex items-baseline gap-2">
            {isQuote ? (
              <span className="text-sm font-semibold text-[#6b7280]">Price on request</span>
            ) : fromPrice !== null ? (
              <span className="text-lg font-bold text-[#111111]">
                From {formatPrice(fromPrice)}
              </span>
            ) : (
              <>
                <span className="text-lg font-bold text-[#111111]">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-[#6b7280] line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </>
            )}
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              isQuote
                ? "bg-[#111111] text-white group-hover:bg-[#333333]"
                : "bg-[#ef8733] text-white group-hover:bg-[#ea7316]"
            }`}
          >
            {isQuote ? (
              <><FileText size={12} /> Quote</>
            ) : (
              <><ShoppingCart size={12} /> Add</>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
