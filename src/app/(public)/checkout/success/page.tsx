import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-20">
      <div className="w-20 h-20 bg-[#fff7ed] rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={40} className="text-[#ef8733]" />
      </div>
      <h1 className="font-display font-800 text-3xl text-[#111111] mb-3">Order Placed!</h1>
      <p className="text-[#6b7280] text-lg max-w-md mb-8">
        Thanks for your order. You'll receive a confirmation email shortly with your order details and production timeline.
      </p>
      <Link href="/shop">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
