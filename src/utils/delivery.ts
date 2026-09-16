import { StoreSettings, DeliveryMethodType, CartItem } from '../types';

export interface DeliveryOption {
  method: DeliveryMethodType;
  name: string; // e.g. "TCS" or "Local Cargo"
  label: string; // e.g. "Door-to-Door Delivery" or "Local Cargo Delivery"
  ratePerKg: number;
  deliveryTime: string; // e.g. "2–3 Days"
  fee: number; // Exact calculated delivery fee (PKR)
}

/**
 * Calculates total weight in KG for a list of cart items.
 * Formula: SUM of (productWeightKg * quantity)
 * Returns exact decimal with up to 2 decimal places.
 */
export function calculateCartTotalWeight(items: { weightKg?: number; quantity: number }[]): number {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((sum, item) => {
    const weight = typeof item.weightKg === 'number' && !isNaN(item.weightKg) ? item.weightKg : 0;
    const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
    return sum + (weight * qty);
  }, 0);
  return Math.round(total * 100) / 100;
}

/**
 * Calculates delivery fee based on exact decimal weight in KG and rate per KG.
 * Example: 0.50 KG * 500 PKR/KG = 250 PKR.
 * No arbitrary minimum or forced rounding up to whole KG.
 */
export function calculateDeliveryFee(totalWeightKg: number, ratePerKg: number): number {
  const safeWeight = typeof totalWeightKg === 'number' && totalWeightKg > 0 ? totalWeightKg : 0;
  const safeRate = typeof ratePerKg === 'number' && ratePerKg > 0 ? ratePerKg : 0;
  if (safeWeight === 0 || safeRate === 0) return 0;
  return Math.round(safeWeight * safeRate);
}

/**
 * Returns available delivery methods configured by the Admin in Store Settings,
 * with real-time calculated delivery charges based on the current cart weight.
 */
export function getAvailableDeliveryOptions(settings: StoreSettings, totalWeightKg: number): DeliveryOption[] {
  const options: DeliveryOption[] = [];

  // 1. Door-to-Door / Courier Delivery
  const isDoorEnabled = settings.doorToDoorEnabled !== false;
  if (isDoorEnabled) {
    const rate = Number(settings.doorToDoorRatePerKg) > 0 ? Number(settings.doorToDoorRatePerKg) : 500;
    const name = settings.doorToDoorName?.trim() || 'TCS';
    const time = settings.doorToDoorDeliveryTime?.trim() || '2–3 Days';
    options.push({
      method: 'door_to_door',
      name,
      label: 'Door-to-Door Delivery',
      ratePerKg: rate,
      deliveryTime: time,
      fee: calculateDeliveryFee(totalWeightKg, rate),
    });
  }

  // 2. Local Cargo Delivery
  const isCargoEnabled = settings.localCargoEnabled !== false;
  if (isCargoEnabled) {
    const rate = Number(settings.localCargoRatePerKg) > 0 ? Number(settings.localCargoRatePerKg) : 300;
    const name = settings.localCargoName?.trim() || 'Local Cargo';
    const time = settings.localCargoDeliveryTime?.trim() || '2–5 Days';
    options.push({
      method: 'local_cargo',
      name,
      label: 'Local Cargo Delivery',
      ratePerKg: rate,
      deliveryTime: time,
      fee: calculateDeliveryFee(totalWeightKg, rate),
    });
  }

  // Edge case fallback: if both disabled in settings, provide standard door-to-door fallback
  if (options.length === 0) {
    options.push({
      method: 'door_to_door',
      name: 'Standard Courier',
      label: 'Door-to-Door Delivery',
      ratePerKg: 500,
      deliveryTime: '2–3 Days',
      fee: calculateDeliveryFee(totalWeightKg, 500),
    });
  }

  return options;
}
