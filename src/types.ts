export type CropProgramId = 'corn' | 'cotton' | 'rice' | 'sugarcane' | 'wheat';

export type ProductCategory = 'Insecticides' | 'Herbicide' | 'Fungicide';

export interface Product {
  id: string;
  name: string;
  /** Unit price in PKR. */
  price: number;
  category: ProductCategory;
  description: string;
  image: string;
  cropPrograms: CropProgramId[];
  bestSeller?: boolean;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

/** Snapshot of a product at the time of ordering — never re-read from the catalog. */
export interface OrderLine {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  tehsil: string;
  village: string;
}

export interface OrderTotals {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  /** Points redeemed on this order: either 0 or the full balance (all-or-none). */
  pointsRedeemed: number;
  /** PKR value of the redeemed points. */
  discount: number;
  /** Cash payable on delivery. */
  total: number;
  /** Points credited once the order is delivered. */
  pointsToEarn: number;
}

export interface Order extends OrderTotals {
  id: string;
  placedAt: string;
  status: OrderStatus;
  /** Every status the order has been through, oldest first. Drives the timeline on W09–W12. */
  statusHistory: OrderStatus[];
  lines: OrderLine[];
  delivery: DeliveryInfo;
  paymentMethod: 'cod';
}

export type PointsLoadState = 'ready' | 'error';
