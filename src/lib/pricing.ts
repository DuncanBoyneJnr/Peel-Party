import { Product, ProductCostConfig, PriceTier, SizeVariant } from "./types";
import { CostSettings } from "./server-data";

export function calcStickersPerSheet(
  widthCm: number | undefined,
  heightCm: number | undefined,
  sheetW: number,
  sheetH: number
): number {
  if (!widthCm || !heightCm) return 0;
  const normal = Math.floor(sheetW / widthCm) * Math.floor(sheetH / heightCm);
  const rotated = Math.floor(sheetW / heightCm) * Math.floor(sheetH / widthCm);
  return Math.max(normal, rotated, 0);
}

export interface RunCostResult {
  isSticker: boolean;
  perSheet: number;
  sheetsNeeded: number;
  materialCost: number;
  inkCost: number;
  labourMinutes: number;
  labourCost: number;
  postageCost: number;
  totalCost: number;
  profit: number;
  suggestedPrice: number;
  pricePerUnit: number;
}

export function calcRunCosts(
  config: ProductCostConfig,
  settings: CostSettings,
  quantity: number,
  profitPct: number,
  sizeVariant?: SizeVariant
): RunCostResult {
  const isSticker = !config.productType || config.productType === "sticker";
  const perSheet = isSticker
    ? (sizeVariant?.stickersPerSheet ??
        calcStickersPerSheet(config.widthCm, config.heightCm, settings.sheetWidthCm, settings.sheetHeightCm))
    : 0;
  const sheetsNeeded = perSheet > 0 ? Math.ceil(quantity / perSheet) : 0;

  // Sum costs across all selected materials
  const materialIds = config.materialIds ?? [];
  let materialCost = 0;
  for (const id of materialIds) {
    const mat = settings.materials.find((m) => m.id === id);
    if (!mat) continue;
    const matIsSticker = !mat.productType || mat.productType === "sticker";
    if (matIsSticker && sheetsNeeded > 0) {
      materialCost += sheetsNeeded * mat.costPencePerSheet;
    } else if (!matIsSticker) {
      materialCost += quantity * mat.costPencePerUnit;
    }
  }

  const inkCost = quantity * (config.inkCostPence ?? settings.defaultInkCostPence);
  const batches = config.batchSize > 0 ? Math.ceil(quantity / config.batchSize) : 0;
  const labourMinutes = batches * config.batchMinutes;
  const labourCost = Math.round((labourMinutes / 60) * settings.hourlyRatePence);
  const postageCost = config.postagePence ?? settings.defaultPostagePence;
  const totalCost = materialCost + inkCost + labourCost + postageCost;
  const suggestedPrice =
    profitPct < 100
      ? Math.round(totalCost / (1 - profitPct / 100))
      : totalCost * 2;
  const profit = suggestedPrice - totalCost;
  const pricePerUnit = quantity > 0 ? Math.round(suggestedPrice / quantity) : 0;

  return {
    isSticker,
    perSheet,
    sheetsNeeded,
    materialCost,
    inkCost,
    labourMinutes,
    labourCost,
    postageCost,
    totalCost,
    profit,
    suggestedPrice,
    pricePerUnit,
  };
}

// Quantity tiers for sheet-based products (multiples of stickersPerSheet)
export function getQuantityTiers(stickersPerSheet: number, maxQty: number): number[] {
  const multipliers = [1, 2, 3, 5, 10, 15, 25, 50, 100, 150, 250, 500, 1000];
  return [...new Set(
    multipliers.map((m) => m * stickersPerSheet).filter((q) => q <= maxQty)
  )].sort((a, b) => a - b);
}

// Standard quantity tiers for unit-based products
export const UNIT_QTY_TIERS = [1, 5, 10, 25, 50, 100, 250, 500];

// Build a price matrix for a product and store it alongside the product.
// Called server-side when a product is saved.
export function buildPriceMatrix(
  product: Product,
  costSettings: CostSettings
): { [sizeName: string]: PriceTier[] } {
  if (!product.costConfig) return {};
  const { targetProfitPercent, maxOrderQty } = costSettings;

  if (product.sizeVariants?.length) {
    const matrix: { [sizeName: string]: PriceTier[] } = {};
    for (const variant of product.sizeVariants) {
      const qtys = getQuantityTiers(variant.stickersPerSheet, maxOrderQty);
      matrix[variant.name] = qtys.map((qty) => {
        const r = calcRunCosts(product.costConfig!, costSettings, qty, targetProfitPercent, variant);
        return { qty, totalPence: r.suggestedPrice, unitPence: r.pricePerUnit };
      });
    }
    return matrix;
  }

  // No size variants — use standard unit tiers
  const qtys = UNIT_QTY_TIERS.filter((q) => q <= maxOrderQty);
  return {
    "": qtys.map((qty) => {
      const r = calcRunCosts(product.costConfig!, costSettings, qty, targetProfitPercent);
      return { qty, totalPence: r.suggestedPrice, unitPence: r.pricePerUnit };
    }),
  };
}
