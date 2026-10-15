import type { CartLine, OrderStatus, OrderTotals, Product } from '../types';

/**
 * Loyalty programme rules. Single source of truth for the app prototype —
 * the same numbers drive the POS journey (PKR 7,920 sale → +792 pts).
 */
export const LOYALTY_RULES = {
  /** Earn: 1 point for every Rs 10 of product value actually paid for. */
  rupeesPerPointEarned: 10,
  /** Redeem: 1 point = Rs 1 off. */
  rupeesPerPointRedeemed: 1,
  /** Flat delivery fee used in the blueprint ("Delivery fee may vary by product"). */
  deliveryFee: 300,
  /** Lifetime of the single-use counter code shown under the QR. */
  redemptionCodeTtlSeconds: 60,
} as const;

export function pointsEarnedFor(amountPaid: number): number {
  return Math.floor(Math.max(0, amountPaid) / LOYALTY_RULES.rupeesPerPointEarned);
}

export function pointsValue(points: number): number {
  return points * LOYALTY_RULES.rupeesPerPointRedeemed;
}

export type RedemptionBlocker = 'zero_balance' | 'exceeds_total' | 'points_unavailable';

/**
 * Redemption is all-or-none. It is blocked when there is nothing to redeem, when the
 * balance is worth more than the order (points can't be split), or when the balance
 * couldn't be loaded. Returns null when the customer may tick "Redeem all".
 */
export function redemptionBlocker(
  balance: number,
  orderTotalBeforePoints: number,
  pointsAvailable = true,
): RedemptionBlocker | null {
  if (!pointsAvailable) return 'points_unavailable';
  if (balance <= 0) return 'zero_balance';
  if (pointsValue(balance) > orderTotalBeforePoints) return 'exceeds_total';
  return null;
}

export function computeTotals(
  lines: CartLine[],
  catalog: Record<string, Product>,
  pointsBalance: number,
  redeemAll: boolean,
): OrderTotals {
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((sum, l) => sum + catalog[l.productId].price * l.qty, 0);
  const deliveryFee = itemCount > 0 ? LOYALTY_RULES.deliveryFee : 0;

  const canRedeem = redeemAll && redemptionBlocker(pointsBalance, subtotal + deliveryFee) === null;
  const pointsRedeemed = canRedeem ? pointsBalance : 0;
  const discount = pointsValue(pointsRedeemed);

  return {
    itemCount,
    subtotal,
    deliveryFee,
    pointsRedeemed,
    discount,
    total: subtotal + deliveryFee - discount,
    // Points are earned on product value net of the loyalty discount; delivery earns nothing.
    // 8,100 → +810 · 8,100 − 5,000 → +310 · 6,810 − 5,000 → +181 (all per blueprint).
    pointsToEarn: pointsEarnedFor(subtotal - discount),
  };
}

/** Status changes the back office / rider can make. Delivered and Cancelled are final. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

/**
 * How a status change moves the customer's balance:
 *  - placing an order deducts redeemed points immediately (handled at order creation)
 *  - Delivered credits the earned points
 *  - Cancelled returns the redeemed points; the pending earn is dropped
 */
export function balanceDeltaOnStatus(
  order: Pick<OrderTotals, 'pointsRedeemed' | 'pointsToEarn'>,
  next: OrderStatus,
): number {
  if (next === 'delivered') return order.pointsToEarn;
  if (next === 'cancelled') return order.pointsRedeemed;
  return 0;
}

// Skips look-alike characters (0/O, 1/I/L) because farmers read the code out to the cashier.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Single-use counter code, e.g. "CW-M4WD73". The backend should issue these in production. */
export function generateRedemptionCode(random: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return `CW-${code}`;
}
