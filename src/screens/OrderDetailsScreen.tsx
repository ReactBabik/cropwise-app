import { Check, X } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import { AppHeader, Screen } from '../components/Screen';
import { STATUS_LABEL, StatusBadge } from '../components/ui';
import { formatNumber, formatPhoneLocal, formatRs } from '../lib/format';
import { PRODUCTS_BY_ID } from '../data/products';
import { useAppStore } from '../store/AppStore';
import type { Order, OrderStatus } from '../types';

const STATUS_NOTE: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Your order is confirmed and on its way.',
  delivered: 'Order delivered and paid (Cash on delivery). Points earned are now available.',
  cancelled: 'This order won’t be delivered. Nothing was charged (Cash on delivery).',
};

/** W09–W12 · Order details for Pending, Confirmed, Delivered and Cancelled. */
export function OrderDetailsScreen() {
  const { orderId } = useParams();
  const { state } = useAppStore();
  const order = state.orders.find((o) => o.id === orderId);

  if (!order) return <Navigate to="/orders" replace />;

  const { status, delivery } = order;
  const cancelled = status === 'cancelled';

  return (
    <Screen variant="app" header={<AppHeader title="Order details" backTo="/orders" centered />}>
      <div className="space-y-3 px-3 pb-8 pt-3">
        <Panel className="flex items-center justify-between">
          <h2 className="text-base font-bold">#{order.id}</h2>
          <StatusBadge status={status} size="md" />
        </Panel>

        <Panel>
          <h3 className="text-[15px] font-bold">Order status</h3>
          <StatusTimeline order={order} />
          {STATUS_NOTE[status] && (
            <p className="mt-3 border-t border-line pt-3 text-[13px] text-muted">
              {STATUS_NOTE[status]}
            </p>
          )}
        </Panel>

        <Panel>
          <h3 className="text-[15px] font-bold">Products</h3>
          <ul className="mt-2 space-y-2">
            {order.lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-3 text-sm">
                <img
                  src={PRODUCTS_BY_ID[l.productId]?.image ?? l.image}
                  alt=""
                  className="size-11 shrink-0 rounded-md bg-app object-contain p-0.5"
                />
                <span className="min-w-0 flex-1">
                  {l.qty} × {l.name}
                </span>
                <span className="shrink-0 font-bold tabular-nums">{formatRs(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            <Row label="Subtotal" value={formatRs(order.subtotal)} />
            {order.pointsRedeemed > 0 && (
              <Row
                green
                label="Loyalty points"
                value={
                  cancelled
                    ? `${formatNumber(order.pointsRedeemed)} points returned`
                    : `− ${formatNumber(order.pointsRedeemed)} points`
                }
              />
            )}
            <Row label="Delivery" value={formatRs(order.deliveryFee)} />
          </dl>

          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-2.5 text-base font-bold">
            <span>Total · Cash on delivery</span>
            <span className={`tabular-nums ${cancelled ? 'line-through' : ''}`}>
              {formatRs(order.total)}
            </span>
          </div>

          <PointsOutcome order={order} />
        </Panel>

        <Panel>
          <h3 className="text-[15px] font-bold">Delivery address</h3>
          <p className="mt-1 text-sm text-ink/80">
            Home · {delivery.village}, {delivery.address.replace(/^Near/, 'near')}, {delivery.district},
            Punjab
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {delivery.fullName} · {formatPhoneLocal(delivery.phone)}
          </p>
        </Panel>
      </div>
    </Screen>
  );
}

/** The highlighted strip under the total: what happens / happened to the customer's points. */
function PointsOutcome({ order }: { order: Order }) {
  const earn = `+${formatNumber(order.pointsToEarn)} points`;

  if (order.status === 'cancelled') {
    const parts = [
      order.pointsRedeemed > 0 && `${formatNumber(order.pointsRedeemed)} back in your account`,
      order.pointsToEarn > 0 && `+${formatNumber(order.pointsToEarn)} cancelled`,
    ].filter(Boolean);
    if (parts.length === 0) return null;
    return (
      <div className="mt-2.5 flex gap-4 rounded-md bg-brand-tint px-3 py-2.5 text-sm">
        <span>Loyalty points</span>
        <span className="font-bold text-brand">{parts.join(' · ')}</span>
      </div>
    );
  }

  const delivered = order.status === 'delivered';
  return (
    <div
      className={`mt-2.5 flex justify-between rounded-md px-3 py-2.5 text-sm ${
        delivered ? 'bg-brand-tint' : 'bg-pending-bg'
      }`}
    >
      <span>{delivered ? 'Points earned · now available' : 'Points after delivery'}</span>
      <span className={`font-bold ${delivered ? 'text-brand' : 'text-pending-fg'}`}>{earn}</span>
    </div>
  );
}

type StepState = 'done' | 'current' | 'upcoming' | 'cancelled';

/**
 * One step per status the order has actually been through, so an order cancelled while
 * still pending doesn't claim it was confirmed. Open orders also show the steps still ahead
 * (greyed) so the horizontal track always reads Pending → Confirmed → Delivered.
 */
function timelineSteps(order: Order): Array<{ label: string; state: StepState }> {
  const steps = order.statusHistory.map((s, i) => ({
    label: STATUS_LABEL[s],
    state: (i < order.statusHistory.length - 1
      ? 'done'
      : s === 'cancelled'
        ? 'cancelled'
        : 'current') as StepState,
  }));
  const ahead: Partial<Record<OrderStatus, OrderStatus[]>> = {
    pending: ['confirmed', 'delivered'],
    confirmed: ['delivered'],
  };
  for (const s of ahead[order.status] ?? []) steps.push({ label: STATUS_LABEL[s], state: 'upcoming' });
  return steps;
}

/** Horizontal stepper: dots joined by a track, labels underneath. */
function StatusTimeline({ order }: { order: Order }) {
  const { status } = order;
  const steps = timelineSteps(order);
  return (
    <ol className="mt-4 flex">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.label} className="relative flex flex-1 flex-col items-center text-center">
            {/* Track to the next step: from this dot's centre to the next dot's centre. */}
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-[11px] h-0.5 w-full ${
                  steps[i + 1].state === 'upcoming' ? 'bg-neutral-300' : 'bg-brand'
                }`}
              />
            )}
            <span className="relative z-10 rounded-full bg-white">
              <StepDot state={step.state} pending={status === 'pending'} final={status === 'delivered'} />
            </span>
            <span
              className={`mt-2 text-[13px] leading-tight ${
                step.state === 'cancelled'
                  ? 'font-bold text-cancelled-fg'
                  : step.state === 'current'
                    ? `font-bold ${status === 'delivered' ? 'text-delivered-fg' : ''}`
                    : step.state === 'upcoming'
                      ? 'text-neutral-400'
                      : ''
              }`}
              aria-current={step.state === 'current' || step.state === 'cancelled' ? 'step' : undefined}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepDot({ state, pending, final }: { state: StepState; pending: boolean; final: boolean }) {
  const base = 'grid size-6 shrink-0 place-items-center rounded-full text-white';
  if (state === 'upcoming') return <span className={`${base} border-2 border-neutral-300`} />;
  if (state === 'cancelled') {
    return (
      <span className={`${base} bg-cancelled-fg`}>
        <X className="size-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (state === 'done' || final) {
    return (
      <span className={`${base} bg-brand`}>
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    );
  }
  // Current, not yet final: amber while waiting for confirmation, green once confirmed.
  return (
    <span className={`${base} ${pending ? 'bg-[#f0a020]' : 'bg-brand'}`}>
      <span className="size-1.5 rounded-full bg-white" />
    </span>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-white p-4 ${className}`}>{children}</section>;
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className={`flex justify-between ${green ? 'text-brand' : ''}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
