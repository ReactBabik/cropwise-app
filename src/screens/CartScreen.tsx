import { Link, useNavigate } from 'react-router-dom';
import { AppHeader, Screen } from '../components/Screen';
import { Card, PillButton, QtyStepper, SummaryRow } from '../components/ui';
import { PRODUCTS_BY_ID } from '../data/products';
import { formatNumber, formatRs } from '../lib/format';
import { computeTotals } from '../lib/loyalty';
import { useAppStore } from '../store/AppStore';

/** W04 · Cart. */
export function CartScreen() {
  const navigate = useNavigate();
  const { state, setCartQty } = useAppStore();
  const totals = computeTotals(state.cart, PRODUCTS_BY_ID, state.pointsBalance, false);
  const showPointsHint = state.pointsLoadState === 'ready' && state.pointsBalance > 0;

  return (
    <Screen header={<AppHeader title="My cart" backTo="/loyalty?section=shop" />}>
      <div className="space-y-3 px-4 pb-8 pt-4">
        <h2 className="text-[22px] font-medium">Cart</h2>

        {state.cart.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-sm text-muted">Your cart is empty.</p>
            <Link
              to="/loyalty?section=shop"
              className="mt-3 inline-block text-sm font-medium text-brand-deep underline underline-offset-2"
            >
              Browse products
            </Link>
          </Card>
        ) : (
          <>
            {state.cart.map((line) => {
              const p = PRODUCTS_BY_ID[line.productId];
              return (
                <Card key={p.id} className="flex items-center gap-3 !p-3">
                  <img src={p.image} alt="" className="h-20 w-16 shrink-0 object-contain" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm">{p.name}</h3>
                    <p className="pb-1.5 text-sm font-medium text-navy">{formatRs(p.price)}</p>
                    {/* min 0: stepping below 1 removes the line */}
                    <QtyStepper
                      size="sm"
                      min={0}
                      value={line.qty}
                      onChange={(qty) => setCartQty(p.id, qty)}
                      label={p.name}
                    />
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatRs(p.price * line.qty)}
                  </span>
                </Card>
              );
            })}

            <Card className="space-y-2">
              <SummaryRow label="Subtotal" value={formatRs(totals.subtotal)} />
              <SummaryRow label="Delivery" value={formatRs(totals.deliveryFee)} />
              <p className="text-xs font-light text-muted">Delivery fee may vary by product.</p>
              <div className="border-t border-line pt-3">
                <SummaryRow strong label="Total" value={formatRs(totals.total)} />
              </div>

              {showPointsHint && (
                <p className="rounded-md bg-brand-tint px-3 py-2.5 text-[13px] leading-relaxed text-navy">
                  You have {formatNumber(state.pointsBalance)} loyalty points. Redeem them all at
                  checkout.
                </p>
              )}

              <PillButton className="!mt-3" onClick={() => navigate('/checkout')}>
                Proceed to checkout
              </PillButton>
            </Card>
          </>
        )}
      </div>
    </Screen>
  );
}
