import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AppHeader, Screen, ShopBottomBar } from '../components/Screen';
import { useToast } from '../components/Toast';
import { PillButton, QtyStepper } from '../components/ui';
import { PRODUCTS_BY_ID } from '../data/products';
import { formatNumber, formatRs } from '../lib/format';
import { pointsEarnedFor } from '../lib/loyalty';
import { useAppStore } from '../store/AppStore';

/** W03 · Product detail. */
export function ProductScreen() {
  const { productId = '' } = useParams();
  const product = PRODUCTS_BY_ID[productId];
  const { addToCart } = useAppStore();
  const toast = useToast();
  const [qty, setQty] = useState(1);

  if (!product) return <Navigate to="/shop" replace />;

  return (
    <Screen header={<AppHeader title="Product" backTo="/shop" />} footer={<ShopBottomBar />}>
      <nav aria-label="Breadcrumb" className="px-4 py-3 text-xs font-light text-muted">
        <Link to="/shop">Home</Link> / {product.category} /{' '}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mx-4 rounded-lg bg-white">
        <img src={product.image} alt={product.name} className="mx-auto h-72 object-contain" />
      </div>

      <div className="px-4 pb-8 pt-5">
        <h2 className="text-[22px] font-medium">{product.name}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-xl font-medium text-navy">{formatRs(product.price)}</span>
          <span className="rounded-full bg-brand-tint px-3 py-1 font-sans text-xs font-semibold text-navy">
            Earn {formatNumber(pointsEarnedFor(product.price))} loyalty points
          </span>
        </div>
        <p className="mt-3 text-sm font-light leading-relaxed text-ink/80">{product.description}</p>

        <div className="mt-5 flex items-center gap-3">
          <QtyStepper value={qty} onChange={setQty} label={product.name} />
          <PillButton
            onClick={() => {
              addToCart(product.id, qty);
              toast(`${qty} × ${product.name} added to cart`);
              setQty(1);
            }}
          >
            Add to cart
          </PillButton>
        </div>
      </div>
    </Screen>
  );
}
