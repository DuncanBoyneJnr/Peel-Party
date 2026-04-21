import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Product } from "./types";

const dataDir = path.join(process.cwd(), "data");

function read<T>(file: string): T {
  const raw = readFileSync(path.join(dataDir, file), "utf-8");
  return JSON.parse(raw) as T;
}

function write(file: string, data: unknown) {
  writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2), "utf-8");
}

// Products
export function getProducts(): Product[] {
  return read<Product[]>("products.json");
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return getProducts().filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return getProducts().filter((p) => p.featured);
}

export function saveProducts(products: Product[]) {
  write("products.json", products);
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

export function getGallery(): GalleryItem[] {
  return read<GalleryItem[]>("gallery.json");
}

export function saveGallery(items: GalleryItem[]) {
  write("gallery.json", items);
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

export function getQuotes(): Quote[] {
  return read<Quote[]>("quotes.json");
}

export function saveQuotes(quotes: Quote[]) {
  write("quotes.json", quotes);
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

export function getSettings(): SiteSettings {
  return read<SiteSettings>("settings.json");
}

export function saveSettings(settings: SiteSettings) {
  write("settings.json", settings);
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

export function getBundles(): Bundle[] {
  return read<Bundle[]>("bundles.json");
}

export function saveBundles(bundles: Bundle[]) {
  write("bundles.json", bundles);
}
