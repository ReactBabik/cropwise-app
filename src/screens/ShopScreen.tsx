import { useMemo, useRef, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppHeader, Screen, ShopBottomBar } from '../components/Screen';
import { ProductCard } from '../components/ProductCard';
import { SaveraBubble } from '../components/SaveraBubble';
import {
  CROP_PROGRAMS,
  PORTFOLIO_PAGE_SIZE,
  PORTFOLIO_TABS,
  PRODUCTS,
} from '../data/products';
import { formatNumber } from '../lib/format';
import { useAppStore } from '../store/AppStore';
import type { CropProgramId, ProductCategory } from '../types';

/**
 * Shop (e-commerce). Was the lower half of W02 in the blueprint; now its own screen,
 * opened from "Shop now" on the Loyalty/QR screen and "Shop & Redeem" on Cropwise Home.
 */
export function ShopScreen() {
  const { state } = useAppStore();
  const scrollRef = useRef<HTMLElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [program, setProgram] = useState<CropProgramId | null>(null);
  const [visibleCount, setVisibleCount] = useState(PORTFOLIO_PAGE_SIZE);

  const scrollToPortfolio = () => {
    const scroller = scrollRef.current;
    const el = portfolioRef.current;
    if (!el || !scroller) return;
    const top =
      el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({ top: top - 8, behavior: 'smooth' });
  };

  const portfolio = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (category === null || p.category === category) &&
          (program === null || p.cropPrograms.includes(program)),
      ),
    [category, program],
  );

  const showPoints = state.pointsLoadState === 'ready' && state.pointsBalance > 0;

  return (
    <Screen
      ref={scrollRef}
      header={<AppHeader title="Shop" backTo="/loyalty" />}
      footer={<ShopBottomBar primary="loyalty" />}
      floating={<SaveraBubble />}
    >
      {showPoints && (
        <Link
          to="/loyalty"
          className="flex items-center gap-2 bg-brand-tint px-4 py-2.5 font-sans text-[13px] text-navy"
        >
          <span>
            You have <span className="font-bold">{formatNumber(state.pointsBalance)} points</span> —
            redeem them all at checkout
          </span>
          <ChevronRight className="ml-auto size-4 shrink-0" />
        </Link>
      )}

      {/* Extra bottom padding so the last products can scroll clear of the Savera avatar. */}
      <div className="px-4 pb-20 pt-5">
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
                  scrollToPortfolio();
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
    </Screen>
  );
}
