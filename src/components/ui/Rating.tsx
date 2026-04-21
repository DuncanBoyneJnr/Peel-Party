import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  className?: string;
}

export default function Rating({ value, count, className }: RatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.round(value) ? "fill-[#ef8733] text-[#ef8733]" : "fill-gray-200 text-gray-200"}
          />
        ))}
      </div>
      <span className="text-sm text-[#6b7280]">
        {value.toFixed(1)}{count != null && ` (${count})`}
      </span>
    </div>
  );
}
