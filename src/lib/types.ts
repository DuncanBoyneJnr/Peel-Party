export type Category = "stickers" | "mugs" | "keyrings";

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
