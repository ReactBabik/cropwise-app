import { useState } from 'react';
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatNumber, formatRs } from '../lib/format';
import { NEXT_STATUSES } from '../lib/loyalty';
import { useAppStore } from '../store/AppStore';
import type { OrderStatus } from '../types';
import { STATUS_LABEL, StatusBadge } from './ui';

/**
 * PROTOTYPE ONLY — not part of the app. Presenter controls that stand in for things the
 * real backend does (changing an order's status, changing the balance) and shortcuts to
 * each blueprint screen. Delete this file and its mount in App.tsx when lifting the screens.
 */

const BALANCE_PRESETS = [
  { value: 5000, note: 'blueprint default' },
  { value: 0, note: 'zero points' },
  { value: 9500, note: 'worth more than a small order' },
];

const STATUS_ACTION: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirm',
  delivered: 'Mark delivered',
  cancelled: 'Cancel',
};

export function DemoPanel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const store = useAppStore();
  const { state } = store;
  const [openOnMobile, setOpenOnMobile] = useState(false);

  const orderWith = (status: OrderStatus) => state.orders.find((o) => o.status === status);
  const latestOrder = state.orders[0];

  const screens: Array<{ code: string; label: string; to?: string }> = [
    { code: 'W01', label: 'Cropwise Home', to: '/' },
    { code: 'W02', label: 'Loyalty + QR', to: '/loyalty' },
    { code: 'W02b', label: 'Shop', to: '/shop' },
    { code: 'W03', label: 'Product detail', to: '/product/quantis-800ml' },
    { code: 'W04', label: 'Cart', to: '/cart' },
    { code: 'W05–06', label: 'Checkout', to: state.cart.length ? '/checkout' : undefined },
    { code: 'W07', label: 'Order placed', to: latestOrder && `/order-placed/${latestOrder.id}` },
    { code: 'W08', label: 'My Orders', to: '/orders' },
    ...(['pending', 'confirmed', 'delivered', 'cancelled'] as const).map((status, i) => {
      const order = orderWith(status);
      return {
        code: `W${String(9 + i).padStart(2, '0')}`,
        label: `Status · ${STATUS_LABEL[status]}`,
        to: order && `/orders/${order.id}`,
      };
    }),
    { code: 'S02', label: 'Ask Savera chat', to: '/savera' },
  ];

  const go = (to: string) => {
    navigate(to);
    setOpenOnMobile(false);
  };

  const loadBlueprintCart = () => {
    state.cart.forEach((l) => store.setCartQty(l.productId, 0));
    store.addToCart('quantis-800ml', 2);
    store.addToCart('enrich-8kg', 1);
    go('/cart');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenOnMobile(true)}
        className="fixed left-1/2 top-1.5 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur lg:hidden"
      >
        <SlidersHorizontal className="size-3" />
        Demo controls
      </button>

      <aside
        className={`${
          openOnMobile ? 'fixed inset-0 z-50 block' : 'hidden'
        } w-full shrink-0 overflow-y-auto bg-[#17171c] p-5 font-sans text-sm text-neutral-200 lg:static lg:block lg:h-full lg:w-[340px]`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
              Prototype controls
            </p>
            <h1 className="mt-1 text-lg font-semibold text-white">Cropwise · Naya Savera Loyalty</h1>
            <p className="mt-1 text-xs text-neutral-400">
              In-app journey. This panel is not part of the app — it simulates the backend.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close demo controls"
            onClick={() => setOpenOnMobile(false)}
            className="grid size-9 place-items-center lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <Section title="Jump to screen">
          <ul className="grid gap-1">
            {screens.map((s) => {
              const active = s.to?.split('?')[0] === pathname;
              return (
                <li key={s.code}>
                  <button
                    type="button"
                    disabled={!s.to}
                    title={s.to ? undefined : 'Nothing in this state yet'}
                    onClick={() => s.to && go(s.to)}
                    className={`flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-left transition disabled:opacity-35 ${
                      active ? 'bg-white/15 text-white' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="w-14 shrink-0 font-mono text-[11px] text-neutral-400">{s.code}</span>
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <PanelButton className="mt-2 w-full" onClick={loadBlueprintCart}>
            Load blueprint cart (2 × Quantis, 1 × Enrich)
          </PanelButton>
        </Section>

        <Section title="Loyalty balance">
          <p className="text-2xl font-semibold tabular-nums text-white">
            {formatNumber(state.pointsBalance)} <span className="text-sm font-normal text-neutral-400">points</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {BALANCE_PRESETS.map((p) => (
              <PanelButton key={p.value} title={p.note} onClick={() => store.setPointsBalance(p.value)}>
                {formatNumber(p.value)}
              </PanelButton>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              className="size-4 accent-emerald-500"
              checked={state.pointsLoadState === 'error'}
              onChange={(e) => store.setPointsLoadState(e.target.checked ? 'error' : 'ready')}
            />
            Simulate “points couldn’t load”
          </label>
        </Section>

        <Section title="Back office · order status">
          <p className="mb-2 text-xs text-neutral-400">
            Naya Savera moves orders along. Delivered credits the earned points; Cancelled returns
            redeemed points.
          </p>
          <ul className="space-y-2">
            {state.orders.map((o) => (
              <li key={o.id} className="rounded-md bg-white/5 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <button type="button" onClick={() => go(`/orders/${o.id}`)} className="font-medium text-white underline-offset-2 hover:underline">
                    #{o.id}
                  </button>
                  <span className="text-xs text-neutral-400">{formatRs(o.total)}</span>
                  <StatusBadge status={o.status} />
                </div>
                {NEXT_STATUSES[o.status].length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {NEXT_STATUSES[o.status].map((next) => (
                      <PanelButton key={next} onClick={() => store.setOrderStatus(o.id, next)}>
                        {STATUS_ACTION[next]}
                      </PanelButton>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <PanelButton
          className="mt-6 flex w-full items-center justify-center gap-2"
          onClick={() => {
            store.reset();
            go('/');
          }}
        >
          <RotateCcw className="size-3.5" />
          Reset demo
        </PanelButton>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{title}</h2>
      {children}
    </section>
  );
}

function PanelButton({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-md border border-white/20 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 ${className}`}
      {...props}
    />
  );
}
