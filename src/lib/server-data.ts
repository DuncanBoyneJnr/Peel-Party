import Redis from "ioredis";
import fs from "fs";
import path from "path";
import { Product, ProductType, ProductCostConfig, PostageSettings, Order } from "./types";
export type { ProductType, ProductCostConfig, PostageSettings, Order };

// --- Redis (production) ---

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env.UPSTASH_REDIS_REST_REDIS_URL!, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return _redis;
}

// --- File-based fallback (local dev when Redis URL is not configured) ---

const DATA_DIR = path.join(process.cwd(), "data");

function fileGet<T>(key: string): T | null {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, `${key}.json`), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function fileSet(key: string, value: unknown): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, `${key}.json`), JSON.stringify(value, null, 2), "utf-8");
}

const useFileStore = !process.env.UPSTASH_REDIS_REST_REDIS_URL;

// --- Unified read/write ---

async function rget<T>(key: string): Promise<T | null> {
  if (useFileStore) return fileGet<T>(key);
  const raw = await getRedis().get(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

async function rset(key: string, value: unknown): Promise<void> {
  if (useFileStore) { fileSet(key, value); return; }
  await getRedis().set(key, JSON.stringify(value));
}

// Products
export async function getProducts(): Promise<Product[]> {
  return (await rget<Product[]>("products")) ?? [];
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
  await rset("products", products);
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
  return (await rget<GalleryItem[]>("gallery")) ?? [];
}

export async function saveGallery(items: GalleryItem[]): Promise<void> {
  await rset("gallery", items);
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
  return (await rget<Quote[]>("quotes")) ?? [];
}

export async function saveQuotes(quotes: Quote[]): Promise<void> {
  await rset("quotes", quotes);
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
  return (await rget<SiteSettings>("settings")) ?? defaultSettings;
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await rset("settings", settings);
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
  return (await rget<Bundle[]>("bundles")) ?? [];
}

export async function saveBundles(bundles: Bundle[]): Promise<void> {
  await rset("bundles", bundles);
}

// Costs
export interface StandardSize {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
}

export interface MaterialType {
  id: string;
  name: string;
  productType: ProductType;  // determines which cost field is relevant
  costPencePerSheet: number; // pence per A4 sheet (sticker products)
  costPencePerUnit: number;  // pence per blank item (cups, t-shirts, etc.)
}

export interface CostSettings {
  hourlyRatePence: number;
  targetProfitPercent: number;
  defaultPostagePence: number;
  defaultInkCostPence: number;
  sheetWidthCm: number;
  sheetHeightCm: number;
  standardSizes: StandardSize[];
  maxOrderQty: number;
  materials: MaterialType[];
  productConfigs: Record<string, ProductCostConfig>;
}

const defaultCostSettings: CostSettings = {
  hourlyRatePence: 1500,
  targetProfitPercent: 40,
  defaultPostagePence: 150,
  defaultInkCostPence: 10,
  sheetWidthCm: 17.32,
  sheetHeightCm: 23.67,
  standardSizes: [],
  maxOrderQty: 1000,
  materials: [],
  productConfigs: {},
};

export async function getCostSettings(): Promise<CostSettings> {
  const stored = await rget<Partial<CostSettings>>("costSettings");
  if (!stored) return defaultCostSettings;
  return {
    ...defaultCostSettings,
    ...stored,
    standardSizes: stored.standardSizes ?? [],
    maxOrderQty: stored.maxOrderQty ?? 1000,
    materials: stored.materials ?? [],
    productConfigs: stored.productConfigs ?? {},
  };
}

export async function saveCostSettings(settings: CostSettings): Promise<void> {
  await rset("costSettings", settings);
}

// Orders
export async function getOrders(): Promise<Order[]> {
  return (await rget<Order[]>("orders")) ?? [];
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await rset("orders", orders);
}

// Postage
const defaultPostageSettings: PostageSettings = {
  flatRate: 3.95,
  freeThreshold: 50.00,
};

export async function getPostageSettings(): Promise<PostageSettings> {
  return (await rget<PostageSettings>("postageSettings")) ?? defaultPostageSettings;
}

export async function savePostageSettings(settings: PostageSettings): Promise<void> {
  await rset("postageSettings", settings);
}
