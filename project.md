# Emma Stickers — Project Reference

## Overview

A custom merchandise e-commerce site built for EL4 Designs / Peel & Party Co.
Customers can buy stickers, mugs, keyrings, coasters, and magnets with dynamic quantity-based pricing.
Hosted on Vercel. Live at: https://peelpartyco.co.uk

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | Redis via Upstash (ioredis) |
| Image storage | Vercel Blob |
| Hosting | Vercel |
| Auth | Cookie-based admin token (`ADMIN_TOKEN` env var) |

---

## Environment Variables (required on Vercel)

```
UPSTASH_REDIS_REST_REDIS_URL   # ioredis connection string to Upstash
ADMIN_TOKEN                    # password for the admin panel
BLOB_READ_WRITE_TOKEN          # Vercel Blob token for image uploads
```

---

## Route Structure

```
src/app/
  layout.tsx                   # Root layout — html/body/CartProvider/CartDrawer only
  (public)/
    layout.tsx                 # Public layout — adds Header + Footer (force-dynamic)
    page.tsx                   # Homepage
    shop/page.tsx              # Shop all products
    shop/[category]/page.tsx   # Category pages (stickers, mugs, keyrings, coasters, magnets)
    products/[slug]/page.tsx   # Product detail page
    about/page.tsx
    contact/page.tsx
    gallery/page.tsx
    custom-order/page.tsx
    checkout/page.tsx
  admin/
    layout.tsx                 # Admin layout — checks ADMIN_TOKEN cookie, renders sidebar
    login/page.tsx
    page.tsx                   # Dashboard
    products/                  # Product list + new/edit
    bundles/                   # Bundle list + new/edit
    gallery/                   # Gallery manager
    quotes/                    # Quote requests
    costs/                     # Global cost settings + production run calculator
    materials/                 # Material types (e.g. sublimation paper)
    settings/                  # Site settings (name, email, phone, social links)
  api/admin/
    login / logout
    products / products/[id]
    bundles / bundles/[id]
    gallery / gallery/[id]
    quotes / quotes/[id]
    costs
    materials
    settings
    upload                     # Vercel Blob image upload
```

> **Important:** `(public)` is a Next.js route group — it does NOT appear in URLs. All public routes resolve at their normal paths (e.g. `/shop`, `/products/...`).

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/lib/types.ts` | All shared TypeScript types |
| `src/lib/server-data.ts` | All Redis read/write functions + server-side type definitions |
| `src/lib/pricing.ts` | Pricing calculation engine |
| `src/lib/utils.ts` | `formatPrice`, `cn`, and other small helpers |
| `src/components/ui/ProductCard.tsx` | Product card used on shop/category listing pages |
| `src/app/(public)/products/[slug]/ProductActions.tsx` | Client component — size/qty selector and add-to-cart on product page |
| `src/app/admin/products/ProductForm.tsx` | Admin form for creating/editing products |
| `src/app/admin/materials/MaterialsAdmin.tsx` | Admin CRUD for material types |
| `src/app/admin/costs/CostsAdmin.tsx` | Global cost settings + production run calculator |
| `src/components/layout/Footer.tsx` | Async server component — reads name/email/phone/socials from settings |

---

## Data Models

### Product (`src/lib/types.ts`)

```typescript
Product {
  id: string
  slug: string
  name: string
  category: "stickers" | "mugs" | "keyrings" | "coasters" | "magnets"
  price: number               // in POUNDS (despite "// pence" comment — comment is wrong)
  originalPrice?: number      // in POUNDS, shown as struck-through
  description: string         // short, shown on cards
  longDescription: string     // shown on product detail page
  images: string[]            // Vercel Blob URLs; first is the main image
  options: ProductOption[]    // e.g. [{name: "Size", values: ["5cm","10cm"]}]
  supportsTextInput: boolean
  supportsFileUpload: boolean
  orderType: "buy-now" | "request-quote"
  badge?: string              // e.g. "Best Seller", "Sale", "New"
  featured?: boolean
  inStock: boolean
  reviewCount: number
  rating: number
  sizeVariants?: SizeVariant[]
  costConfig?: ProductCostConfig
  priceMatrix?: { [sizeName: string]: PriceTier[] }
}
```

### SizeVariant

Used by sticker-type products. Each entry maps to a Size option value.

```typescript
SizeVariant {
  name: string          // e.g. "5cm x 5cm" — must match a value in options["Size"]
  widthCm: number
  heightCm: number
  stickersPerSheet: number   // auto-calculated from sheet dimensions in cost settings
}
```

### ProductCostConfig

Internal pricing config stored on the product.

```typescript
ProductCostConfig {
  productType: "sticker" | "cup" | "tshirt" | "other"
  materialIds?: string[]     // IDs of MaterialType entries to use
  widthCm?: number           // sticker products only — sticker width
  heightCm?: number          // sticker products only — sticker height
  itemsPerSheet?: number     // sublimation products — how many items fit per sheet
                             //   Keyrings=5, Coasters=2, Mugs=1, Magnets=8
  batchSize: number          // sheets per run (sheet-based) OR units per run (unit-based)
  batchMinutes: number       // minutes to complete one batch
  inkCostPence?: number      // override global ink cost (stored in pence)
  postagePence?: number      // override global postage cost (stored in pence)
}
```

### PriceTier

Pre-computed price point stored in `priceMatrix`.

```typescript
PriceTier {
  qty: number          // e.g. 25
  totalPence: number   // total price for this qty in PENCE
  unitPence: number    // price per item in PENCE
}
```

### MaterialType (`src/lib/server-data.ts`)

```typescript
MaterialType {
  id: string
  name: string                  // e.g. "Sublimation Paper", "Vinyl"
  productType: ProductType      // "sticker" = sheet-based; anything else = unit-based
  costPencePerSheet: number     // cost in pence per sheet (used when productType="sticker")
  costPencePerUnit: number      // cost in pence per blank item (used otherwise)
}
```

### CostSettings (`src/lib/server-data.ts`)

Global settings stored under Redis key `costSettings`.

```typescript
CostSettings {
  hourlyRatePence: number          // labour rate, default 1500 (£15/hr)
  targetProfitPercent: number      // e.g. 40 = 40% margin
  defaultPostagePence: number      // default 150 (£1.50)
  defaultInkCostPence: number      // default 10 (£0.10/unit)
  sheetWidthCm: number             // print sheet width, default 17.32cm
  sheetHeightCm: number            // print sheet height, default 23.67cm
  standardSizes: StandardSize[]    // synced to product size variants
  maxOrderQty: number              // above this, customer goes to quote form
  materials: MaterialType[]
  productConfigs: Record<string, ProductCostConfig>  // unused legacy field
}
```

### SiteSettings (`src/lib/server-data.ts`)

Stored under Redis key `settings`. Used by the Footer and potentially the Header.

```typescript
SiteSettings {
  businessName, tagline, email, phone, address
  freeShippingThreshold
  heroTitle, heroSubtitle, heroPrimaryCta, heroSecondaryCta
  customOrderTitle, customOrderSubtitle
  socialInstagram, socialFacebook, socialTiktok
  metaTitle, metaDescription
}
```

---

## Redis Keys

All data is stored as JSON strings.

| Key | Type | Contents |
|---|---|---|
| `products` | `Product[]` | All products |
| `costSettings` | `CostSettings` | Global cost/pricing config and materials |
| `settings` | `SiteSettings` | Site name, contact details, hero copy, social links |
| `gallery` | `GalleryItem[]` | Gallery images |
| `quotes` | `Quote[]` | Customer quote requests |
| `bundles` | `Bundle[]` | Product bundles |

---

## Pricing System

### How it works

When a product is **saved** in admin, the server:
1. Fetches `costSettings` from Redis
2. Calls `buildPriceMatrix(product, costSettings)` in `src/lib/pricing.ts`
3. Stores the result as `product.priceMatrix` alongside the product in Redis

At **display time**, `ProductActions.tsx` reads directly from `product.priceMatrix` — no runtime calculation needed.

### Price formula (`calcRunCosts`)

```
sheetsNeeded = ceil(quantity / perSheet)
  where perSheet = itemsPerSheet (if set) OR stickersPerSheet (sticker) OR 0 (unit-based)

materialCost = sum over selected materials:
  if material is sheet-based (productType="sticker"): sheetsNeeded × costPencePerSheet
  if material is unit-based:                          quantity × costPencePerUnit

inkCost     = quantity × inkCostPence (or global default)
batchDivisor = sheetsNeeded (if sheet-based) OR quantity (if unit-based)
batches     = ceil(batchDivisor / batchSize)
labourCost  = batches × batchMinutes / 60 × hourlyRatePence
postageCost = postagePence (or global default)

totalCost       = materialCost + inkCost + labourCost + postageCost
suggestedPrice  = totalCost / (1 - profitPct/100)   [all values in PENCE]
```

### Quantity tiers

- **Sheet-based products** (stickers, sublimation): tiers are multiples of `perSheet`, using multipliers `[1,2,3,5,10,15,25,50,100,150,250,500,1000]`
- **Unit-based products**: fixed tiers `[1, 5, 10, 25, 50, 100, 250, 500]`

### Critical pence/pounds conventions

| Field | Unit | Notes |
|---|---|---|
| `product.price` | **Pounds** | Despite "// pence" comment in types.ts — comment is wrong |
| `product.originalPrice` | **Pounds** | |
| `PriceTier.totalPence` | **Pence** | Divide by 100 before passing to `formatPrice` |
| `PriceTier.unitPence` | **Pence** | Divide by 100 before passing to `formatPrice` |
| `CostSettings.*Pence` fields | **Pence** | e.g. `hourlyRatePence`, `defaultPostagePence` |
| `MaterialType.costPencePerSheet` | **Pence** | |
| `formatPrice(n)` | expects **Pounds** | Returns `£${n.toFixed(2)}` — does NOT divide by 100 |

---

## Admin Panel

URL: `/admin` — protected by `ADMIN_TOKEN` cookie.

| Section | URL | Purpose |
|---|---|---|
| Dashboard | `/admin` | Overview stats |
| Products | `/admin/products` | List, create, edit, delete products |
| Bundles | `/admin/bundles` | Product bundles |
| Gallery | `/admin/gallery` | Gallery images |
| Quote Requests | `/admin/quotes` | View customer quote submissions |
| Costs & Profit | `/admin/costs` | Global cost settings + production run calculator |
| Materials | `/admin/materials` | Material types (e.g. "Sublimation Paper" at 18p/sheet) |
| Settings | `/admin/settings` | Business name, email, phone, social links, hero copy |

### Adding a new product (workflow)

1. **Admin → Materials** — ensure all materials needed exist (e.g. Sublimation Paper = 18p/sheet, productType = Sticker Sheet)
2. **Admin → Costs & Profit** — set global hourly rate, profit %, sheet size, standard sizes
3. **Admin → Products → New** — fill in:
   - Basic info: name, category, description, order type
   - Images: drag and drop (uploads to Vercel Blob)
   - Sizes (sticker/coaster/magnet): click "Sync Sizes" to pull from standard sizes
   - Cost Setup: choose product type, tick materials, set items-per-sheet (for sublimation products), batch size and time
4. Save — price matrix is auto-computed and stored

### Sublimation paper products (items-per-sheet reference)

| Product | Items per sheet |
|---|---|
| Keyrings | 5 |
| Coasters | 2 |
| Mugs | 1 |
| Magnets | 8 |

---

## Key Conventions & Gotchas

- **`product.price` is in pounds**, NOT pence — the comment `// pence` in `types.ts` is incorrect
- **`formatPrice` does not divide by 100** — always pass pounds to it
- **`PriceTier` values are in pence** — always divide by 100 before calling `formatPrice`
- **Price matrix is pre-computed at save time** — if you change cost settings or materials, re-save all affected products to update their prices
- **`(public)` route group** is `force-dynamic` — public pages render server-side on each request so Redis is always available (they are not statically pre-generated at build time)
- **Admin layout** reads the cookie directly and renders conditionally — the login page is the `children` when not authenticated
- **Footer is an async server component** — reads `SiteSettings` from Redis on every request

---

## Product Categories

| Category | Sheet-based | Notes |
|---|---|---|
| Stickers | Yes — A4 sheet dimensions | Size variants synced from standard sizes |
| Mugs | Yes — sublimation paper (1/sheet) | No size variants |
| Keyrings | Yes — sublimation paper (5/sheet) | No size variants |
| Coasters | Yes — sublimation paper (2/sheet) | Can have size variants |
| Magnets | Yes — sublimation paper (8/sheet) | Can have size variants |
