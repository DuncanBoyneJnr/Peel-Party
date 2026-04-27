export type Category = "stickers" | "mugs" | "keyrings" | "coasters" | "magnets";

export type ProductType = "sticker" | "cup" | "tshirt" | "other";

export interface ProductCostConfig {
  productType: ProductType;
  materialIds?: string[];
  widthCm?: number;
  heightCm?: number;
  batchSize: number;
  batchMinutes: number;
  inkCostPence?: number;
  postagePence?: number;
}

export interface SizeVariant {
  name: string;
  widthCm: number;
  heightCm: number;
  stickersPerSheet: number;
}

export type OrderType = "buy-now" | "request-quote";

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number; // pence
  originalPrice?: number;
  description: string;
  longDescription: string;
  images: string[];
  options: ProductOption[];
  supportsTextInput: boolean;
  supportsFileUpload: boolean;
  orderType: OrderType;
  badge?: string;
  featured?: boolean;
  inStock: boolean;
  reviewCount: number;
  rating: number;
  sizeVariants?: SizeVariant[];
  costConfig?: ProductCostConfig;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
  customText?: string;
  artworkFileName?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface QuoteFormData {
  productSlug: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  customText: string;
  artworkFile: File | null;
  name: string;
  email: string;
  company?: string;
  notes: string;
}
