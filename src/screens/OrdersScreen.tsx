import { Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppHeader, Screen, ShopBottomBar } from '../components/Screen';
import { StatusBadge } from '../components/ui';
import { formatPhoneIntl, formatRs, pluralItems } from '../lib/format';
import { useAppStore } from '../store/AppStore';

/** W08 · My Orders. */
export function OrdersScreen() {
  const { state } = useAppStore();

  return (
    <Screen header={<AppHeader title="My Orders" backTo="/loyalty" />} footer={<ShopBottomBar />}>
      <div className="px-4 pb-8 pt-4">
        <h2 className="text-[22px] font-medium">My Orders</h2>
        <p className="flex items-center gap-1 text-xs font-medium text-brand-deep">
          <Check className="size-3.5" strokeWidth={3} />
          {formatPhoneIntl(state.user.phone)}
        </p>

        {state.orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">You haven't placed any orders yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {state.orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-3 rounded-xl bg-white p-3"
                >
                  <img
                    src={order.lines[0].image}
                    alt=""
                    className="h-16 w-14 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium">#{order.id}</p>
                    <p className="text-xs font-light text-muted">
                      {pluralItems(order.itemCount)} · {formatRs(order.total)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 font-sans">
                    <StatusBadge status={order.status} />
                    <ChevronRight className="size-4 text-muted" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Screen>
  );
}
