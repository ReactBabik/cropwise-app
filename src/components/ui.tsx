import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { OrderStatus } from '../types';

/** Small shared building blocks. Kept in one file so the dev team can lift them as a set. */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

/** Pill button used across the shop screens (Add to cart, Proceed to checkout, Place order…). */
export function PillButton({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const styles =
    variant === 'primary'
      ? 'bg-brand-deep text-white disabled:bg-neutral-300 disabled:text-neutral-500'
      : 'border-[1.5px] border-brand-deep text-brand-deep bg-transparent';
  return (
    <button
      type="button"
      className={`h-12 w-full rounded-full px-5 text-[15px] font-medium transition active:scale-[0.99] ${styles} ${className}`}
      {...props}
    />
  );
}

interface QtyStepperProps {
  value: number;
  onChange: (qty: number) => void;
  /** Lowest value the minus button can reach. Use 0 in the cart so the line can be removed. */
  min?: number;
  label: string;
  size?: 'sm' | 'md';
}

export function QtyStepper({ value, onChange, min = 1, label, size = 'md' }: QtyStepperProps) {
  const cell = size === 'sm' ? 'size-7' : 'size-10';
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className="inline-flex items-center rounded-full border border-line bg-white"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={`grid ${cell} place-items-center rounded-full disabled:opacity-30`}
      >
        <Minus className="size-3.5" />
      </button>
      <span aria-live="polite" className="min-w-6 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className={`grid ${cell} place-items-center rounded-full`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-pending-bg text-pending-fg',
  confirmed: 'bg-confirmed-bg text-confirmed-fg',
  delivered: 'bg-delivered-bg text-delivered-fg',
  cancelled: 'bg-cancelled-bg text-cancelled-fg',
};

export function StatusBadge({ status, size = 'sm' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-block rounded-full font-semibold ${STATUS_STYLE[status]} ${
        size === 'md' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Label / value line used in every price summary. */
export function SummaryRow({
  label,
  value,
  tone = 'default',
  strong,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: 'default' | 'green';
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        tone === 'green' ? 'text-brand-deep' : ''
      } ${strong ? 'text-base font-semibold' : 'text-sm'}`}
    >
      <span>{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl bg-white p-4 ${className}`}>{children}</section>;
}
