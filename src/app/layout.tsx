import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/layout/CartDrawer";

export const metadata: Metadata = {
  metadataBase: new URL("https://peelpartyco.co.uk"),
  title: {
    default: "Peel & Party Co. | Personalised Stickers, Gifts & Party Decor",
    template: "%s | Peel & Party Co.",
  },
  description:
    "Personalised stickers, gifts and party decor handcrafted in the UK. Custom stickers, mugs, keyrings, sweet bags and more — for birthdays, weddings, corporate events and beyond.",
  keywords: [
    "personalised stickers UK",
    "custom party decor",
    "personalised gifts UK",
    "custom mugs UK",
    "personalised keyrings",
    "party stickers",
    "birthday stickers",
    "wedding favours UK",
    "corporate branded merchandise",
    "Peel and Party Co",
  ],
  authors: [{ name: "Emma — Peel & Party Co." }],
  creator: "Peel & Party Co.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://peelpartyco.co.uk",
    siteName: "Peel & Party Co.",
    title: "Peel & Party Co. | Personalised Stickers, Gifts & Party Decor",
    description:
      "Personalised stickers, gifts and party decor handcrafted in the UK. Custom stickers, mugs, keyrings and more.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Peel & Party Co.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Peel & Party Co. | Personalised Stickers, Gifts & Party Decor",
    description:
      "Personalised stickers, gifts and party decor handcrafted in the UK.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://peelpartyco.co.uk",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white">
        <CartProvider>
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
