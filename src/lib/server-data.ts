import { Redis } from "@upstash/redis";
import { Product } from "./types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Products
export async function getProducts(): Promise<Product[]> {
  const data = await redis.get<Product[]>("products");
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.category === category);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.featured);
}

export async function saveProducts(products: Product[]): Promise<void> {
  await redis.set("products", products);
}

// Gallery
export interface GalleryItem {
  id: string;
  src: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
}

export async function getGallery(): Promise<GalleryItem[]> {
  const data = await redis.get<GalleryItem[]>("gallery");
  return data ?? [];
}

export async function saveGallery(items: GalleryItem[]): Promise<void> {
  await redis.set("gallery", items);
}

// Quotes
export interface Quote {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  productType: string;
  quantity: string;
  deadline: string;
  customText: string;
  notes: string;
  artworkFileName: string;
  submittedAt: string;
  status: "new" | "in-progress" | "responded" | "closed";
}

export async function getQuotes(): Promise<Quote[]> {
  const data = await redis.get<Quote[]>("quotes");
  return data ?? [];
}

export async function saveQuotes(quotes: Quote[]): Promise<void> {
  await redis.set("quotes", quotes);
}

// Settings
export interface SiteSettings {
  businessName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  freeShippingThreshold: number;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  customOrderTitle: string;
  customOrderSubtitle: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTiktok: string;
  metaTitle: string;
  metaDescription: string;
}

const defaultSettings: SiteSettings = {
  businessName: "Peel & Party Co.",
  tagline: "Personalised Stickers, Gifts & Party Decor",
  email: "",
  phone: "",
  address: "",
  freeShippingThreshold: 30,
  heroTitle: "Make it uniquely yours.",
  heroSubtitle: "Premium custom stickers, mugs, and keyrings for businesses, events, and gifts.",
  heroPrimaryCta: "Shop All Products",
  heroSecondaryCta: "Request a Custom Quote",
  customOrderTitle: "Need something bespoke?",
  customOrderSubtitle: "Tell us what you need and we'll make it happen.",
  socialInstagram: "",
  socialFacebook: "",
  socialTiktok: "",
  metaTitle: "Peel & Party Co. | Custom Stickers, Gifts & Party Decor",
  metaDescription: "Personalised stickers, gifts and party decor made in the UK.",
};

export async function getSettings(): Promise<SiteSettings> {
  const data = await redis.get<SiteSettings>("settings");
  return data ?? defaultSettings;
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await redis.set("settings", settings);
}

// Bundles
export interface BundleItem {
  productId?: string;
  name: string;
  qty: string;
}

export interface Bundle {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  emoji?: string;
  items: BundleItem[];
  featured: boolean;
  active: boolean;
}

export async function getBundles(): Promise<Bundle[]> {
  const data = await redis.get<Bundle[]>("bundles");
  return data ?? [];
}

export async function saveBundles(bundles: Bundle[]): Promise<void> {
  await redis.set("bundles", bundles);
}
