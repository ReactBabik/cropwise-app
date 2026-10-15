import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppHeader, Screen } from '../components/Screen';
import { Card, PillButton, SummaryRow } from '../components/ui';
import { PRODUCTS_BY_ID } from '../data/products';
import { LOCATIONS } from '../data/seed';
import { formatNumber, formatRs, pluralItems } from '../lib/format';
import { computeTotals, pointsValue, redemptionBlocker, type RedemptionBlocker } from '../lib/loyalty';
import { useAppStore } from '../store/AppStore';
import type { DeliveryInfo } from '../types';

type FieldErrors = Partial<Record<'fullName' | 'address' | 'district' | 'tehsil' | 'village', string>>;

function validate(d: DeliveryInfo): FieldErrors {
  const errors: FieldErrors = {};
  if (!d.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!d.address.trim()) errors.address = 'Enter your address.';
  if (!d.district) errors.district = 'Select a district.';
  if (!d.tehsil) errors.tehsil = 'Select a tehsil.';
  if (!d.village) errors.village = 'Select a village.';
  return errors;
}

/** W05 · Checkout (points shown) and W06 · Checkout (redeem all ticked). */
export function CheckoutScreen() {
  const navigate = useNavigate();
  const { state, placeOrder, setPointsLoadState } = useAppStore();
  const [delivery, setDelivery] = useState<DeliveryInfo>(state.user);
  const [redeemAll, setRedeemAll] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  // Placing the order empties the cart; don't let the empty-cart guard hijack the redirect.
  const orderPlaced = useRef(false);

  const balance = state.pointsBalance;
  const before = computeTotals(state.cart, PRODUCTS_BY_ID, balance, false);
  const blocker = redemptionBlocker(balance, before.total, state.pointsLoadState === 'ready');

  // Balance or cart can change under the user (e.g. points spent at a counter meanwhile).
  useEffect(() => {
    if (blocker) setRedeemAll(false);
  }, [blocker]);

  if (state.cart.length === 0 && !orderPlaced.current) return <Navigate to="/cart" replace />;

  const totals = computeTotals(state.cart, PRODUCTS_BY_ID, balance, redeemAll && !blocker);
  const redeeming = totals.pointsRedeemed > 0;

  const set = (patch: Partial<DeliveryInfo>) => setDelivery((d) => ({ ...d, ...patch }));
  const tehsils = Object.keys(LOCATIONS[delivery.district] ?? {});
  const villages = LOCATIONS[delivery.district]?.[delivery.tehsil] ?? [];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(delivery);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      return;
    }
    orderPlaced.current = true;
    const orderId = placeOrder(delivery, redeeming);
    navigate(`/order-placed/${orderId}`, { replace: true });
  };

  return (
    <Screen header={<AppHeader title="Checkout" backTo="/cart" />}>
      <form onSubmit={submit} noValidate className="space-y-3 px-4 pb-8 pt-4">
        <h2 className="text-[22px] font-medium">Checkout</h2>

        {/* ── 1 · Loyalty points ── */}
        <Card>
          <StepTitle n={1}>Loyalty points</StepTitle>

          {blocker === 'points_unavailable' ? (
            <div className="mt-3 rounded-lg bg-pending-bg px-3 py-3 text-[13px] text-pending-fg">
              <p className="font-medium">Couldn't load loyalty points</p>
              <p className="mt-0.5 font-light">
                Check your connection and retry, or place the order without redeeming. You'll still
                earn points on it.
              </p>
              <button
                type="button"
                onClick={() => setPointsLoadState('ready')}
                className="mt-2 rounded-full border border-pending-fg px-4 py-1 text-xs font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-sm font-light text-muted">Available</span>
                <span className="text-brand-deep">
                  <span className="text-[26px] font-medium tabular-nums">{formatNumber(balance)}</span>{' '}
                  <span className="text-sm">points</span>
                </span>
              </div>

              <label
                className={`mt-2 flex items-center gap-3 rounded-lg border px-3 py-3 ${
                  redeeming ? 'border-brand-deep bg-brand-tint' : 'border-line'
                } ${blocker ? 'opacity-60' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={redeeming}
                  disabled={blocker !== null}
                  onChange={(e) => setRedeemAll(e.target.checked)}
                  aria-describedby="redeem-help"
                />
                <span
                  aria-hidden="true"
                  className={`grid size-5 shrink-0 place-items-center rounded border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy ${
                    redeeming ? 'border-brand-deep bg-brand-deep text-white' : 'border-neutral-500'
                  }`}
                >
                  {redeeming && <Check className="size-3.5" strokeWidth={3.5} />}
                </span>
                <span>
                  <span className="block text-sm font-medium">Redeem all loyalty points</span>
                  <span className="block text-xs font-light text-muted">
                    {formatNumber(balance)} points = {formatRs(pointsValue(balance))} off
                  </span>
                </span>
              </label>

              <p
                id="redeem-help"
                className={`mt-2 text-xs font-light ${
                  redeeming ? 'text-brand-deep' : blocker ? 'text-pending-fg' : 'text-muted'
                }`}
              >
                {redeemHelp(blocker, redeeming, balance, before.total)}
              </p>
            </>
          )}
        </Card>

        {/* ── 2 · Delivery information ── */}
        <Card>
          <StepTitle n={2}>Delivery information</StepTitle>

          <Field id="fullName" label="Full name" error={errors.fullName}>
            <input
              id="checkout-fullName"
              className={inputClass(errors.fullName)}
              value={delivery.fullName}
              autoComplete="name"
              onChange={(e) => set({ fullName: e.target.value })}
            />
          </Field>

          <Field id="address" label="Address" error={errors.address}>
            <input
              id="checkout-address"
              className={inputClass(errors.address)}
              value={delivery.address}
              autoComplete="street-address"
              onChange={(e) => set({ address: e.target.value })}
            />
          </Field>

          <Field id="district" label="District" error={errors.district}>
            <Select
              id="checkout-district"
              value={delivery.district}
              options={Object.keys(LOCATIONS)}
              error={errors.district}
              onChange={(district) => set({ district, tehsil: '', village: '' })}
            />
          </Field>

          <Field id="tehsil" label="Tehsil" error={errors.tehsil}>
            <Select
              id="checkout-tehsil"
              value={delivery.tehsil}
              options={tehsils}
              error={errors.tehsil}
              onChange={(tehsil) => set({ tehsil, village: '' })}
            />
          </Field>

          <Field id="village" label="Village" error={errors.village}>
            <Select
              id="checkout-village"
              value={delivery.village}
              options={villages}
              error={errors.village}
              onChange={(village) => set({ village })}
            />
          </Field>

          {/* PROTOTYPE: toggles a flag. Production should read the device location. */}
          <button
            type="button"
            aria-pressed={delivery.locationShared}
            onClick={() => set({ locationShared: !delivery.locationShared })}
            className={`mt-3 flex h-11 w-full items-center gap-2.5 rounded-md border px-3 text-[13px] font-medium ${
              delivery.locationShared
                ? 'border-brand-deep/40 bg-brand-tint text-brand-deep'
                : 'border-line text-ink'
            }`}
          >
            <MapPin className="size-4" />
            {delivery.locationShared ? 'Current location shared ✓' : 'Share current location'}
          </button>

          <div className="mt-3 flex h-12 items-center justify-between rounded-md border border-brand-deep px-3 text-sm font-medium">
            Cash on Delivery
            <span className="grid size-4 place-items-center rounded-full bg-brand-deep">
              <span className="size-1.5 rounded-full bg-white" />
            </span>
          </div>
        </Card>

        {/* ── Order summary ── */}
        <Card className="space-y-2">
          <h3 className="text-base font-medium">Order summary</h3>
          <SummaryRow
            label={`Subtotal (${pluralItems(totals.itemCount)})`}
            value={formatRs(totals.subtotal)}
          />
          <SummaryRow label="Delivery" value={formatRs(totals.deliveryFee)} />
          {redeeming && (
            <SummaryRow
              tone="green"
              label={<span className="font-medium">Loyalty points ({formatNumber(totals.pointsRedeemed)})</span>}
              value={<span className="font-medium">− {formatRs(totals.discount)}</span>}
            />
          )}
          <div className="border-t border-line pt-3">
            <SummaryRow
              strong
              label="Total payable"
              value={<span className="text-brand-deep">{formatRs(totals.total)}</span>}
            />
          </div>
          <SummaryRow
            tone="green"
            label="Points you'll earn after delivery"
            value={<span className="font-medium">+{formatNumber(totals.pointsToEarn)}</span>}
          />
          <PillButton type="submit" className="!mt-4">
            Place order
          </PillButton>
        </Card>
      </form>
    </Screen>
  );
}

function redeemHelp(
  blocker: RedemptionBlocker | null,
  redeeming: boolean,
  balance: number,
  orderTotal: number,
): string {
  if (blocker === 'zero_balance') {
    return 'No points to redeem yet. Place this order to start earning.';
  }
  if (blocker === 'exceeds_total') {
    return `Your points are worth more than this order (${formatRs(pointsValue(balance))} vs ${formatRs(
      orderTotal,
    )}). All points must be redeemed together — add items or continue without redeeming.`;
  }
  if (redeeming) return `All ${formatNumber(balance)} points applied to this order.`;
  return 'All points or none — partial redemption isn’t available.';
}

function StepTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 text-base font-medium">
      <span className="grid size-6 place-items-center rounded-full bg-brand-deep font-sans text-xs font-bold text-white">
        {n}
      </span>
      {children}
    </h3>
  );
}

const inputClass = (error?: string) =>
  `h-11 w-full rounded-md border bg-white px-3 text-sm outline-none focus:border-navy ${
    error ? 'border-cancelled-fg' : 'border-line'
  }`;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-2.5">
      <label htmlFor={`checkout-${id}`} className="mb-1 block text-xs font-light text-muted">
        {label} <span aria-hidden="true">*</span>
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-cancelled-fg">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  id,
  value,
  options,
  error,
  onChange,
}: {
  id: string;
  value: string;
  options: string[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        required
        value={value}
        disabled={options.length === 0}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(error)} appearance-none pr-9 disabled:bg-neutral-100 disabled:text-muted`}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
