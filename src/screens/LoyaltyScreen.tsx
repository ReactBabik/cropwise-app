import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AppHeader, Screen, ShopBottomBar } from '../components/Screen';
import { ProductCard } from '../components/ProductCard';
import { RedemptionQrCard } from '../components/RedemptionQrCard';
import { SaveraBubble } from '../components/SaveraBubble';
import {
  CROP_PROGRAMS,
  PORTFOLIO_PAGE_SIZE,
  PORTFOLIO_TABS,
  PRODUCTS,
} from '../data/products';
import { formatNumber } from '../lib/format';
import { LOYALTY_RULES } from '../lib/loyalty';
import { useAppStore } from '../store/AppStore';
import type { CropProgramId, ProductCategory } from '../types';

/** W02 · Loyalty + QR + Shop (and host of S01, the Savera bubble). */
export function LoyaltyScreen() {
  const { state, setPointsLoadState } = useAppStore();
  const [params] = useSearchParams();
  const scrollRef = useRef<HTMLElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [program, setProgram] = useState<CropProgramId | null>(null);
  const [visibleCount, setVisibleCount] = useState(PORTFOLIO_PAGE_SIZE);

  const scrollTo = (el: HTMLElement | null) => {
    const scroller = scrollRef.current;
    if (!el || !scroller) return;
    const top =
      el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({ top: top - 8, behavior: 'smooth' });
  };

  // "Shop & Redeem" on the home screen deep-links straight to the shop section.
  useEffect(() => {
    if (params.get('section') === 'shop') scrollTo(shopRef.current);
  }, [params]);

  const portfolio = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (category === null || p.category === category) &&
          (program === null || p.cropPrograms.includes(program)),
      ),
    [category, program],
  );

  const pointsFailed = state.pointsLoadState === 'error';

  return (
    <Screen
      ref={scrollRef}
      header={
        <AppHeader title="Loyalty" backTo="/" centered right="info" onInfo={() => setInfoOpen(true)} />
      }
      footer={<ShopBottomBar />}
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

      <div className="-mt-16 px-4">
        <RedemptionQrCard />
      </div>

      <div className="flex justify-center py-5">
        <button
          type="button"
          onClick={() => scrollTo(shopRef.current)}
          className="flex h-10 items-center gap-2 rounded-full bg-navy px-5 font-sans text-sm font-semibold text-white shadow-[0_4px_14px_rgba(10,10,92,0.3)]"
        >
          Scroll down to buy products
          <ChevronDown className="size-4" />
        </button>
      </div>

      <div ref={shopRef} className="px-4 pb-8">
        <h2 className="text-[22px] font-medium">Crop Programs</h2>
        <p className="mt-1 text-[13px] font-light text-muted">Get the products for your crops.</p>
        <ul className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">
          {CROP_PROGRAMS.map((cp) => (
            <li key={cp.id}>
              <button
                type="button"
                aria-pressed={program === cp.id}
                onClick={() => {
                  setProgram(program === cp.id ? null : cp.id);
                  setVisibleCount(PORTFOLIO_PAGE_SIZE);
                  scrollTo(portfolioRef.current);
                }}
                className="flex w-full flex-col items-center gap-2"
              >
                <img
                  src={cp.image}
                  alt=""
                  className={`size-[84px] rounded-full bg-white ${
                    program === cp.id ? 'ring-2 ring-brand-deep ring-offset-2 ring-offset-page' : ''
                  }`}
                />
                <span className="text-[11px] font-medium tracking-wide underline underline-offset-2">
                  {cp.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-[22px] font-medium">Best Sellers</h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {PRODUCTS.filter((p) => p.bestSeller).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div ref={portfolioRef}>
          <h2 className="mt-8 text-[22px] font-medium">Product Portfolio</h2>
          <div role="tablist" aria-label="Product category" className="mt-2 flex gap-5 text-sm">
            {PORTFOLIO_TABS.map((tab) => {
              const selected = category === tab.category;
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setCategory(tab.category);
                    setVisibleCount(PORTFOLIO_PAGE_SIZE);
                  }}
                  className={`py-2 ${selected ? 'font-semibold text-ink' : 'font-light text-muted'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {program && (
            <button
              type="button"
              onClick={() => setProgram(null)}
              className="mb-2 mt-1 flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-xs font-medium text-brand-deep"
            >
              {CROP_PROGRAMS.find((cp) => cp.id === program)?.label} programme
              <X className="size-3" />
            </button>
          )}

          {portfolio.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No products here yet. Try another category.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2.5">
              {portfolio.slice(0, visibleCount).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {portfolio.length > visibleCount && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PORTFOLIO_PAGE_SIZE)}
                className="h-10 rounded border border-line px-5 text-[13px] font-light"
              >
                Load more products
              </button>
            </div>
          )}
        </div>
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
