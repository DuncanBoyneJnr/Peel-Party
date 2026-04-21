import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "papaya" | "black" | "green" | "outline";
  className?: string;
}

export default function Badge({ children, variant = "papaya", className }: BadgeProps) {
  const variants = {
    papaya: "bg-[#ef8733] text-white",
    black: "bg-[#111111] text-white",
    green: "bg-emerald-600 text-white",
    outline: "border border-[#ef8733] text-[#ef8733]",
  };

  return (
    <span
      className={cn(
        "inline-block text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
