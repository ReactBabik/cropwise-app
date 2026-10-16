import type { DeliveryInfo, Order, OrderLine, OrderStatus } from '../types';
import { LOYALTY_RULES, pointsEarnedFor } from '../lib/loyalty';
import { PRODUCTS_BY_ID } from './products';

/** PROTOTYPE DATA — the signed-in Cropwise grower from the blueprint. */
export const DEMO_USER: DeliveryInfo = {
  fullName: 'Akram Hussain',
  phone: '03032593019',
  address: 'Near Govt. School',
  district: 'Sahiwal',
  tehsil: 'Sahiwal',
  village: 'Chak 42/5L',
};

export const DEMO_POINTS_BALANCE = 5000;

/** The first order placed in the demo gets the blueprint's number, #NS-10482. */
export const FIRST_NEW_ORDER_NUMBER = 10482;

/** District → tehsil → villages. Replace with the address master-data API. */
export const LOCATIONS: Record<string, Record<string, string[]>> = {
  Sahiwal: {
    Sahiwal: ['Chak 42/5L', 'Chak 89/6R', 'Chak 91/9L'],
    Chichawatni: ['Chak 110/7R', 'Chak 39/12L'],
  },
  Okara: {
    Okara: ['Chak 2/4L', 'Chak 48/3R'],
    Depalpur: ['Basirpur', 'Hujra Shah Muqeem'],
  },
  Pakpattan: {
    Pakpattan: ['Chak 16/SP', 'Malka Hans'],
    Arifwala: ['Chak 65/EB', 'Qabula'],
  },
};

function line(productId: string, qty: number): OrderLine {
  const p = PRODUCTS_BY_ID[productId];
  return { productId, name: p.name, image: p.image, price: p.price, qty };
}

function seedOrder(
  id: string,
  placedAt: string,
  statusHistory: OrderStatus[],
  lines: OrderLine[],
  pointsRedeemed: number,
): Order {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const deliveryFee = LOYALTY_RULES.deliveryFee;
  return {
    id,
    placedAt,
    status: statusHistory[statusHistory.length - 1],
    statusHistory,
    lines,
    itemCount: lines.reduce((n, l) => n + l.qty, 0),
    subtotal,
    deliveryFee,
    pointsRedeemed,
    discount: pointsRedeemed,
    total: subtotal + deliveryFee - pointsRedeemed,
    pointsToEarn: pointsEarnedFor(subtotal - pointsRedeemed),
    delivery: DEMO_USER,
    paymentMethod: 'cod',
  };
}

/**
 * Order history so My Orders and the four status screens (W09–W12) have content on first load.
 * #NS-10377 is the blueprint's order-details example: Rs 6,810 − 5,000 points + Rs 300 = Rs 2,110, +181 points.
 */
export const SEED_ORDERS: Order[] = [
  seedOrder(
    'NS-10377',
    '2026-10-06T10:12:00+05:00',
    ['pending', 'confirmed'],
    [line('cruiser-200ml', 4), line('topik-200ml', 1)],
    5000,
  ),
  seedOrder('NS-10211', '2026-09-21T16:40:00+05:00', ['pending', 'confirmed', 'delivered'], [line('isabion-500ml', 1)], 0),
  seedOrder('NS-10105', '2026-09-02T09:05:00+05:00', ['pending', 'confirmed', 'cancelled'], [line('topik-200ml', 1)], 0),
];
