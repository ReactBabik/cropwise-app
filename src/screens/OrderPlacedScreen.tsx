import { Check } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppHeader, Screen, ShopBottomBar } from '../components/Screen';
import { Card, PillButton, SummaryRow } from '../components/ui';
import { formatNumber, formatRs } from '../lib/format';
import { useAppStore } from '../store/AppStore';

/** W07 · Order placed. */
export function OrderPlacedScreen() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { state } = useAppStore();
  const order = state.orders.find((o) => o.id === orderId);

  if (!order) return <Navigate to="/orders" replace />;

  return (
    <Screen header={<AppHeader title="Order placed" backTo="/loyalty" />} footer={<ShopBottomBar />}>
      <div className="px-4 pb-8 pt-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-tint text-brand-deep">
          <Check className="size-8" strokeWidth={2.5} />
        </div>
        <h2 className="mt-4 text-[22px] font-medium">Order placed</h2>
        <p className="mt-1 text-sm font-light text-muted">Order #{order.id}</p>

        <Card className="mt-5 space-y-2 text-left">
          <SummaryRow
            label="Total payable (Cash on Delivery)"
            value={<span className="font-medium">{formatRs(order.total)}</span>}
          />
          {order.pointsRedeemed > 0 && (
            <SummaryRow
              label="Loyalty points redeemed"
              value={<span className="font-medium">{formatNumber(order.pointsRedeemed)}</span>}
            />
          )}
          <SummaryRow
            tone="green"
            label="Points to earn after delivery"
            value={<span className="font-medium">+{formatNumber(order.pointsToEarn)}</span>}
          />
        </Card>

        <PillButton className="mt-5" onClick={() => navigate('/orders')}>
          View My Orders
        </PillButton>
        <PillButton
          variant="outline"
          className="mt-3"
          onClick={() => navigate('/loyalty?section=shop')}
        >
          Continue shopping
        </PillButton>
      </div>
    </Screen>
  );
}
