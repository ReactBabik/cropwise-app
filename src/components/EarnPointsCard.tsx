import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LOYALTY_RULES } from '../lib/loyalty';

/** Coins that float up out of the bag; staggered so one is always rising. */
const COINS = [
  { x: '-46px', delay: '0s' },
  { x: '0px', delay: '0.7s' },
  { x: '46px', delay: '1.4s' },
];

const SPARKLES = [
  { top: '14%', left: '18%', delay: '0s', size: 10 },
  { top: '8%', left: '74%', delay: '0.6s', size: 8 },
  { top: '46%', left: '86%', delay: '1.2s', size: 12 },
  { top: '52%', left: '8%', delay: '1.8s', size: 8 },
];

/**
 * Shown on W02 instead of the QR when the balance is zero — there is nothing to redeem at a
 * counter yet, so the screen sells earning instead. Animations live in styles/index.css
 * (`earn-*` keyframes) and stop under prefers-reduced-motion.
 */
export function EarnPointsCard() {
  return (
    <section className="overflow-hidden rounded-2xl bg-white px-5 pb-6 pt-5 text-center font-sans shadow-[0_8px_24px_rgba(10,10,92,0.12)]">
      <div aria-hidden="true" className="relative mx-auto h-44 w-56">
        <div className="earn-glow absolute inset-x-6 bottom-2 top-8 rounded-full bg-brand-tint" />

        {SPARKLES.map((s, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={s.size}
            height={s.size}
            className="earn-sparkle absolute fill-[#f2b705]"
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          >
            <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
          </svg>
        ))}

        {COINS.map((c, i) => (
          <span
            key={i}
            className="earn-coin absolute bottom-16 left-[calc(50%-18px)] grid size-9 place-items-center rounded-full border-2 border-[#c98f00] bg-[#f6c42b] text-[11px] font-extrabold text-[#7a5600] shadow"
            style={{ ['--coin-x' as string]: c.x, animationDelay: c.delay }}
          >
            +10
          </span>
        ))}

        <div className="earn-bag absolute inset-x-0 bottom-4 mx-auto grid size-20 place-items-center rounded-2xl bg-brand text-white shadow-[0_10px_20px_rgba(26,154,60,0.35)]">
          <ShoppingBag className="size-10" strokeWidth={1.75} />
        </div>
      </div>

      <h2 className="mt-2 text-lg font-bold text-navy">Shop to start earning points</h2>
      <p className="mx-auto mt-1.5 max-w-[280px] text-sm leading-relaxed text-muted">
        Earn 1 point for every Rs {LOYALTY_RULES.rupeesPerPointEarned} you spend — in the app or at any
        Naya Savera counter. Your counter QR appears once you have points.
      </p>

      <Link
        to="/shop"
        className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-brand-deep text-[15px] font-semibold text-white"
      >
        <ShoppingBag className="size-4" />
        Start shopping
      </Link>
    </section>
  );
}
