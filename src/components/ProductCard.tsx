import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatRs } from '../lib/format';
import { useAppStore } from '../store/AppStore';
import { PillButton } from './ui';
import { useToast } from './Toast';

/** Product tile used in Best Sellers and Product Portfolio (W02). */
export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useAppStore();
  const toast = useToast();

  return (
    <article className="flex flex-col bg-white">
      <Link to={`/product/${product.id}`} className="block">
        <img
          src={product.image}
          alt=""
          className="aspect-[8/9] w-full object-contain"
          loading="lazy"
        />
        <h3 className="min-h-[52px] px-3 pt-3 text-[13px] leading-snug tracking-wide text-ink">
          {product.name}
        </h3>
      </Link>
      <div className="mt-auto px-3 pb-3">
        <p className="pb-2 text-sm font-semibold text-navy">{formatRs(product.price)}</p>
        <PillButton
          className="!h-9 !text-[13px]"
          onClick={() => {
            addToCart(product.id);
            toast(`${product.name} added to cart`);
          }}
        >
          Add to cart
        </PillButton>
      </div>
    </article>
  );
}
