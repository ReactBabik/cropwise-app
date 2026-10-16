import { forwardRef, type ReactNode } from 'react';
import { ChevronLeft, Info, QrCode, ReceiptText, ShoppingCart, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppStore';

interface ScreenProps {
  header: ReactNode;
  footer?: ReactNode;
  /** Rendered above the scroll area, anchored to the phone frame (e.g. the Savera bubble). */
  floating?: ReactNode;
  /** `shop` = website pages inside the app (Lexend, warm grey); `app` = native Cropwise screens. */
  variant?: 'shop' | 'app';
  children: ReactNode;
}

/** Page shell: fixed header, scrolling body, optional sticky footer. */
export const Screen = forwardRef<HTMLElement, ScreenProps>(function Screen(
  { header, footer, floating, variant = 'shop', children },
  scrollRef,
) {
  return (
    <div
      className={`relative flex h-full flex-col ${
        variant === 'shop' ? 'bg-page font-shop' : 'bg-app font-sans'
      }`}
    >
      {header}
      <main ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {children}
      </main>
      {floating}
      {footer}
    </div>
  );
});

interface AppHeaderProps {
  title: string;
  /** Route the back chevron goes to. Falls back to browser history. */
  backTo?: string;
  centered?: boolean;
  right?: 'cart' | 'info' | 'none';
  onInfo?: () => void;
}

export function AppHeader({ title, backTo, centered, right = 'cart', onInfo }: AppHeaderProps) {
  const navigate = useNavigate();
  const { cartCount } = useAppStore();

  return (
    <header className="shrink-0 bg-navy px-3 pb-3 pt-9 font-sans text-white">
      <div className="relative flex h-10 items-center">
        <button
          type="button"
          aria-label="Back"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="grid size-10 place-items-center rounded-full active:bg-white/10"
        >
          <ChevronLeft className="size-5" strokeWidth={2.5} />
        </button>

        <h1
          className={`text-[17px] font-semibold ${
            centered ? 'pointer-events-none absolute inset-x-12 text-center' : 'ml-1'
          }`}
        >
          {title}
        </h1>

        <div className="ml-auto">
          {right === 'cart' && (
            <Link
              to="/cart"
              aria-label={`My cart, ${cartCount} items`}
              className="relative grid size-10 place-items-center rounded-full active:bg-white/10"
            >
              <ShoppingCart className="size-6" />
              <span className="absolute right-0 top-0 grid min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-[18px]">
                {cartCount}
              </span>
            </Link>
          )}
          {right === 'info' && (
            <button
              type="button"
              aria-label="How loyalty points work"
              onClick={onInfo}
              className="grid size-10 place-items-center rounded-full active:bg-white/10"
            >
              <Info className="size-6" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Sticky bottom bar. The second button depends on the screen:
 *  - 'shop'    Loyalty/QR screen (W02) → "Shop now" opens the shop
 *  - 'loyalty' Shop screen → "Loyalty points" back to the QR (the cart is already in the header)
 *  - 'cart'    product, order and other shop screens → "My cart"
 */
export function ShopBottomBar({ primary = 'cart' }: { primary?: 'cart' | 'shop' | 'loyalty' }) {
  const { cartCount } = useAppStore();
  const primaryClass =
    'flex h-12 items-center justify-center gap-2 rounded-lg bg-brand text-[15px] font-semibold text-white';
  return (
    <nav className="grid shrink-0 grid-cols-2 gap-3 bg-white px-4 pb-5 pt-3 font-sans shadow-[0_-6px_16px_rgba(0,0,0,0.08)]">
      <Link
        to="/orders"
        className="flex h-12 items-center justify-center gap-2 rounded-lg border-[1.5px] border-navy text-[15px] font-semibold text-navy"
      >
        <ReceiptText className="size-5" />
        My orders
      </Link>
      {primary === 'shop' ? (
        <Link to="/shop" className={primaryClass}>
          <Store className="size-5" />
          Shop now
        </Link>
      ) : primary === 'loyalty' ? (
        <Link to="/loyalty" className={primaryClass}>
          <QrCode className="size-5" />
          Loyalty points
        </Link>
      ) : (
        <Link to="/cart" className={primaryClass}>
          <ShoppingCart className="size-5" />
          My cart
          <span className="grid min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-bold leading-5 text-brand">
            {cartCount}
          </span>
        </Link>
      )}
    </nav>
  );
}
