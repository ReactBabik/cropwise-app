import { useState } from 'react';
import { X } from 'lucide-react';
import { AppHeader, Screen, ShopBottomBar } from '../components/Screen';
import { EarnPointsCard } from '../components/EarnPointsCard';
import { RedemptionQrCard } from '../components/RedemptionQrCard';
import { SaveraBubble } from '../components/SaveraBubble';
import { formatNumber } from '../lib/format';
import { LOYALTY_RULES } from '../lib/loyalty';
import { useAppStore } from '../store/AppStore';

/**
 * W02 · Loyalty + QR (and host of S01, the Savera bubble).
 * The shop that used to sit below the QR is its own screen now: "Shop now" → /shop.
 */
export function LoyaltyScreen() {
  const { state, setPointsLoadState } = useAppStore();
  const [infoOpen, setInfoOpen] = useState(false);
  const pointsFailed = state.pointsLoadState === 'error';
  // No QR at zero points: there's nothing to redeem at a counter yet.
  const noPoints = !pointsFailed && state.pointsBalance <= 0;

  return (
    <Screen
      header={
        <AppHeader title="Loyalty" backTo="/" centered right="info" onInfo={() => setInfoOpen(true)} />
      }
      footer={<ShopBottomBar primary="shop" />}
      floating={<SaveraBubble />}
    >
      <div className="bg-navy px-4 pb-20 text-center font-sans text-white">
        <p className="text-sm text-white/85">Your loyalty points</p>
        {pointsFailed ? (
          <div className="pb-1 pt-2">
            <p className="text-sm">Couldn't load your points.</p>
            <button
              type="button"
              onClick={() => setPointsLoadState('ready')}
              className="mt-2 rounded-full border border-white/70 px-4 py-1.5 text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        ) : (
          <p className="text-[42px] font-bold leading-tight tabular-nums">
            {formatNumber(state.pointsBalance)}
          </p>
        )}
      </div>

      {/* Bottom padding keeps the card clear of the Savera bubble. */}
      <div className="-mt-16 px-4 pb-28">
        {noPoints ? <EarnPointsCard /> : <RedemptionQrCard />}
      </div>

      {infoOpen && <LoyaltyInfoSheet onClose={() => setInfoOpen(false)} />}
    </Screen>
  );
}

/** Opened by the ⓘ in the header. Copy is generated from LOYALTY_RULES so it can't drift. */
function LoyaltyInfoSheet({ onClose }: { onClose: () => void }) {
  const rules = [
    `Earn 1 point for every Rs ${LOYALTY_RULES.rupeesPerPointEarned} you spend on products, in the app or at a Naya Savera counter.`,
    `1 point = Rs ${LOYALTY_RULES.rupeesPerPointRedeemed} off.`,
    'Redeem all your points or none — partial redemption isn’t available.',
    'Points from an app order are added after delivery.',
    'If an order is cancelled, the points you redeemed come back to your account.',
  ];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loyalty-info-title"
      className="absolute inset-0 z-40 flex items-end bg-black/45 font-sans"
      onClick={onClose}
    >
      <div className="w-full rounded-t-2xl bg-white p-5 pb-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 id="loyalty-info-title" className="text-lg font-bold text-navy">
            How loyalty points work
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-9 place-items-center">
            <X className="size-5" />
          </button>
        </div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
