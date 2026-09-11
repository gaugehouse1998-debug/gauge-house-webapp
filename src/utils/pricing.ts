import { Product, ProductVariant, CartItem } from '../types';

export interface PriceBreakdown {
  regularPrice: number;
  discountPrice?: number;
  sellingPrice: number; // Actual effective selling price
  hasDiscount: boolean;
  savings?: number;
}

/**
 * Calculates the exact pricing breakdown for any product or variant.
 * Strictly guarantees that if a discount/sale price exists and is lower than the regular price,
 * the selling price is the discount price, and regular price is marked for crossing out.
 */
export function getItemPriceBreakdown(
  product: Pick<Product, 'price' | 'salePrice'>,
  variant?: Partial<Pick<ProductVariant, 'price' | 'salePrice'>> | null
): PriceBreakdown {
  // If a variant is selected and has its own pricing
  if (variant && typeof variant.price === 'number' && variant.price > 0) {
    const regular = Number(variant.price);
    const sale = (typeof variant.salePrice === 'number' && variant.salePrice > 0)
      ? Number(variant.salePrice)
      : undefined;

    if (sale !== undefined && sale < regular) {
      return {
        regularPrice: regular,
        discountPrice: sale,
        sellingPrice: sale,
        hasDiscount: true,
        savings: regular - sale,
      };
    }
    return {
      regularPrice: regular,
      sellingPrice: regular,
      hasDiscount: false,
    };
  }

  // Base product pricing
  const regular = Number(product.price) || 0;
  const sale = (typeof product.salePrice === 'number' && product.salePrice > 0)
    ? Number(product.salePrice)
    : undefined;

  if (sale !== undefined && sale < regular) {
    return {
      regularPrice: regular,
      discountPrice: sale,
      sellingPrice: sale,
      hasDiscount: true,
      savings: regular - sale,
    };
  }

  return {
    regularPrice: regular,
    sellingPrice: regular,
    hasDiscount: false,
  };
}

/**
 * Accurately calculates subtotal using selling price x quantity.
 * Never uses regular price when a discounted price exists.
 */
export function calculateLineSubtotal(unitPrice: number, quantity: number): number {
  return (Number(unitPrice) || 0) * (Number(quantity) || 0);
}
