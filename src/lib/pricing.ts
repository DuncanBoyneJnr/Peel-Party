import { ProductCostConfig, SizeVariant } from "./types";
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
