import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DemoPanel } from './components/DemoPanel';
import { ToastProvider } from './components/Toast';
import { AppStoreProvider } from './store/AppStore';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoyaltyScreen } from './screens/LoyaltyScreen';
import { OrderDetailsScreen } from './screens/OrderDetailsScreen';
import { OrderPlacedScreen } from './screens/OrderPlacedScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { ProductScreen } from './screens/ProductScreen';
import { SaveraScreen } from './screens/SaveraScreen';
import { ShopScreen } from './screens/ShopScreen';

/** Route ↔ blueprint screen map. Keep in sync with the table in README.md. */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} /> {/* W01 */}
      <Route path="/loyalty" element={<LoyaltyScreen />} /> {/* W02 Loyalty + QR, S01 */}
      <Route path="/shop" element={<ShopScreen />} /> {/* W02 Shop (split out) */}
      <Route path="/product/:productId" element={<ProductScreen />} /> {/* W03 */}
      <Route path="/cart" element={<CartScreen />} /> {/* W04 */}
      <Route path="/checkout" element={<CheckoutScreen />} /> {/* W05, W06 */}
      <Route path="/order-placed/:orderId" element={<OrderPlacedScreen />} /> {/* W07 */}
      <Route path="/orders" element={<OrdersScreen />} /> {/* W08 */}
      <Route path="/orders/:orderId" element={<OrderDetailsScreen />} /> {/* W09–W12 */}
      <Route path="/savera" element={<SaveraScreen />} /> {/* S02 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    // HashRouter so the static build works from any path (file share, webview, sub-folder).
    <HashRouter>
      <AppStoreProvider>
        <div className="flex h-full">
          <DemoPanel />
          <div className="flex min-w-0 flex-1 items-center justify-center lg:p-6">
            {/* Phone frame: full-bleed on a real phone, 390 × 844 device on desktop. */}
            <div className="relative h-full w-full overflow-hidden bg-white lg:h-[min(844px,100%)] lg:w-[390px] lg:rounded-[28px] lg:shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </div>
          </div>
        </div>
      </AppStoreProvider>
    </HashRouter>
  );
}
