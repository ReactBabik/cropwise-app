import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { CartLine, DeliveryInfo, Order, OrderStatus, PointsLoadState } from '../types';
import { PRODUCTS_BY_ID } from '../data/products';
import { DEMO_POINTS_BALANCE, DEMO_USER, FIRST_NEW_ORDER_NUMBER, SEED_ORDERS } from '../data/seed';
import { balanceDeltaOnStatus, computeTotals, NEXT_STATUSES } from '../lib/loyalty';

/**
 * Client-side stand-in for the loyalty / order backend.
 *
 * Every action below maps to an API call in production (see README → "API contract").
 * The reducer is where the server-side side effects are simulated: deducting points when an
 * order is placed, crediting them on delivery, returning them on cancellation.
 */

export interface AppState {
  user: DeliveryInfo;
  pointsBalance: number;
  pointsLoadState: PointsLoadState;
  cart: CartLine[];
  orders: Order[];
  nextOrderNumber: number;
}

type Action =
  | { type: 'cart/add'; productId: string; qty: number }
  | { type: 'cart/setQty'; productId: string; qty: number }
  | { type: 'order/place'; delivery: DeliveryInfo; redeemAll: boolean; placedAt: string }
  | { type: 'order/setStatus'; orderId: string; status: OrderStatus }
  | { type: 'points/setBalance'; balance: number }
  | { type: 'points/setLoadState'; state: PointsLoadState }
  | { type: 'reset' };

const STORAGE_KEY = 'cropwise-loyalty-prototype-v1';

function initialState(): AppState {
  return {
    user: DEMO_USER,
    pointsBalance: DEMO_POINTS_BALANCE,
    pointsLoadState: 'ready',
    cart: [],
    orders: SEED_ORDERS,
    nextOrderNumber: FIRST_NEW_ORDER_NUMBER,
  };
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...initialState(), ...JSON.parse(saved) };
  } catch {
    // Storage blocked or corrupted — start from the seed.
  }
  return initialState();
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'cart/add': {
      const existing = state.cart.find((l) => l.productId === action.productId);
      const cart = existing
        ? state.cart.map((l) =>
            l.productId === action.productId ? { ...l, qty: l.qty + action.qty } : l,
          )
        : [...state.cart, { productId: action.productId, qty: action.qty }];
      return { ...state, cart };
    }

    case 'cart/setQty': {
      const cart =
        action.qty <= 0
          ? state.cart.filter((l) => l.productId !== action.productId)
          : state.cart.map((l) =>
              l.productId === action.productId ? { ...l, qty: action.qty } : l,
            );
      return { ...state, cart };
    }

    case 'order/place': {
      if (state.cart.length === 0) return state;
      const redeemAll = action.redeemAll && state.pointsLoadState === 'ready';
      const totals = computeTotals(state.cart, PRODUCTS_BY_ID, state.pointsBalance, redeemAll);
      const order: Order = {
        ...totals,
        id: `NS-${state.nextOrderNumber}`,
        placedAt: action.placedAt,
        status: 'pending',
        statusHistory: ['pending'],
        lines: state.cart.map((l) => {
          const p = PRODUCTS_BY_ID[l.productId];
          return { productId: p.id, name: p.name, image: p.image, price: p.price, qty: l.qty };
        }),
        delivery: action.delivery,
        paymentMethod: 'cod',
      };
      return {
        ...state,
        cart: [],
        orders: [order, ...state.orders],
        nextOrderNumber: state.nextOrderNumber + 1,
        // Redeemed points leave the balance as soon as the order is placed.
        pointsBalance: state.pointsBalance - totals.pointsRedeemed,
        user: action.delivery,
      };
    }

    case 'order/setStatus': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || !NEXT_STATUSES[order.status].includes(action.status)) return state;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? { ...o, status: action.status, statusHistory: [...o.statusHistory, action.status] }
            : o,
        ),
        pointsBalance: state.pointsBalance + balanceDeltaOnStatus(order, action.status),
      };
    }

    case 'points/setBalance':
      return { ...state, pointsBalance: Math.max(0, Math.floor(action.balance)) };

    case 'points/setLoadState':
      return { ...state, pointsLoadState: action.state };

    case 'reset':
      return initialState();
  }
}

interface AppStore {
  state: AppState;
  cartCount: number;
  addToCart: (productId: string, qty?: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  /** Returns the new order's id. */
  placeOrder: (delivery: DeliveryInfo, redeemAll: boolean) => string;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  setPointsBalance: (balance: number) => void;
  setPointsLoadState: (state: PointsLoadState) => void;
  reset: () => void;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistence is a demo convenience only.
    }
  }, [state]);

  const store = useMemo<AppStore>(
    () => ({
      state,
      cartCount: state.cart.reduce((n, l) => n + l.qty, 0),
      addToCart: (productId, qty = 1) => dispatch({ type: 'cart/add', productId, qty }),
      setCartQty: (productId, qty) => dispatch({ type: 'cart/setQty', productId, qty }),
      placeOrder: (delivery, redeemAll) => {
        const id = `NS-${state.nextOrderNumber}`;
        dispatch({ type: 'order/place', delivery, redeemAll, placedAt: new Date().toISOString() });
        return id;
      },
      setOrderStatus: (orderId, status) => dispatch({ type: 'order/setStatus', orderId, status }),
      setPointsBalance: (balance) => dispatch({ type: 'points/setBalance', balance }),
      setPointsLoadState: (s) => dispatch({ type: 'points/setLoadState', state: s }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state],
  );

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error('useAppStore must be used inside <AppStoreProvider>');
  return store;
}
