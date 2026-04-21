import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "EL4 Designs — Custom Stickers, Mugs & Keyrings",
    template: "%s | EL4 Designs",
  },
  description:
    "Custom-printed stickers, personalised mugs, and keyrings for businesses and individuals. Order online or request a quote.",
  keywords: ["custom stickers", "personalised mugs", "custom keyrings", "branded merchandise", "UK printing"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white">
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
