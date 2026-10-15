import { describe, expect, it } from 'vitest';
import {
  balanceDeltaOnStatus,
  computeTotals,
  generateRedemptionCode,
  pointsEarnedFor,
  redemptionBlocker,
} from './loyalty';
import type { Product } from '../types';

const product = (id: string, price: number): Product => ({
  id,
  name: id,
  price,
  category: 'Fungicide',
  description: '',
  image: '',
  cropPrograms: [],
});
const catalog = { quantis: product('quantis', 1800), enrich: product('enrich', 4500) };
const cart = [
  { productId: 'quantis', qty: 2 },
  { productId: 'enrich', qty: 1 },
];

describe('loyalty rules (figures from the blueprint)', () => {
  it('earns 1 point per Rs 10', () => {
    expect(pointsEarnedFor(1800)).toBe(180);
    expect(pointsEarnedFor(7920)).toBe(792);
    expect(pointsEarnedFor(1815)).toBe(181);
  });

  it('W05: checkout without redemption', () => {
    expect(computeTotals(cart, catalog, 5000, false)).toEqual({
      itemCount: 3,
      subtotal: 8100,
      deliveryFee: 300,
      pointsRedeemed: 0,
      discount: 0,
      total: 8400,
      pointsToEarn: 810,
    });
  });

  it('W06: redeem all — Rs 3,400 payable, +310 to earn', () => {
    const t = computeTotals(cart, catalog, 5000, true);
    expect(t.pointsRedeemed).toBe(5000);
    expect(t.total).toBe(3400);
    expect(t.pointsToEarn).toBe(310);
  });

  it('blocks redemption for zero balance, oversized balance and load failure', () => {
    expect(redemptionBlocker(0, 8400)).toBe('zero_balance');
    expect(redemptionBlocker(9500, 8400)).toBe('exceeds_total');
    expect(redemptionBlocker(5000, 8400, false)).toBe('points_unavailable');
    expect(redemptionBlocker(8400, 8400)).toBeNull();
  });

  it('ignores the redeem flag when redemption is blocked', () => {
    expect(computeTotals(cart, catalog, 9500, true).total).toBe(8400);
  });

  it('W11/W12: delivered credits the earn, cancelled returns redeemed points', () => {
    const order = { pointsRedeemed: 5000, pointsToEarn: 181 };
    expect(balanceDeltaOnStatus(order, 'confirmed')).toBe(0);
    expect(balanceDeltaOnStatus(order, 'delivered')).toBe(181);
    expect(balanceDeltaOnStatus(order, 'cancelled')).toBe(5000);
  });

  it('generates CW-XXXXXX codes without look-alike characters', () => {
    for (let i = 0; i < 50; i++) expect(generateRedemptionCode()).toMatch(/^CW-[A-HJKMNP-Z2-9]{6}$/);
  });
});
