"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!images?.length) {
    return (
      <div className="aspect-square bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8] flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect width="120" height="120" rx="16" fill="#f0ede8"/>
          <circle cx="46" cy="46" r="14" fill="#d1c8bc"/>
          <path d="M20 95L38 68L55 80L72 60L90 80L108 58L120 70V95H20Z" fill="#d1c8bc"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8] overflow-hidden">
        <Image
          src={images[selected]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === selected ? "border-[#ef8733]" : "border-[#e5e1d8] hover:border-[#ef8733]"
              }`}
            >
              <Image src={src} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
