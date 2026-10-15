# Cropwise · Naya Savera Loyalty — in-app journey prototype

Clickable prototype of the **"Website · In-app journey"** from the loyalty blueprint
(screens W01–W12 and S01–S02). It is the companion to the POS prototype in `../POS-System`
and uses the same loyalty rules, so a sale behaves the same way at the counter and in the app.

Everything runs in the browser. There is no backend: `src/store/AppStore.tsx` stands in for it.

## Run it

```bash
npm install
npm run dev      # http://localhost:5174
npm test         # loyalty-rule tests
npm run build    # static bundle in dist/, works from any folder (relative paths + hash routes)
```

On a desktop browser the app is shown in a phone frame with a **Prototype controls** panel on
the left. On a phone-sized screen the app is full-bleed and the panel opens from the
"Demo controls" pill at the top. The panel is not part of the app — see "Demo panel" below.

## Screen map

| Blueprint | Route | File |
|---|---|---|
| W01 Cropwise Home | `/` | `src/screens/HomeScreen.tsx` |
| W02 Loyalty + QR + Shop | `/loyalty` (`?section=shop` scrolls to the shop) | `src/screens/LoyaltyScreen.tsx`, `src/components/RedemptionQrCard.tsx`, `src/components/ProductCard.tsx` |
| W03 Product detail | `/product/:productId` | `src/screens/ProductScreen.tsx` |
| W04 Cart | `/cart` | `src/screens/CartScreen.tsx` |
| W05 Checkout · points shown, W06 Checkout · redeem all ticked | `/checkout` | `src/screens/CheckoutScreen.tsx` |
| W07 Order placed | `/order-placed/:orderId` | `src/screens/OrderPlacedScreen.tsx` |
| W08 My Orders | `/orders` | `src/screens/OrdersScreen.tsx` |
| W09–W12 Status · Pending / Confirmed / Delivered / Cancelled | `/orders/:orderId` | `src/screens/OrderDetailsScreen.tsx` |
| S01 Savera avatar + pop-up | on `/loyalty` | `src/components/SaveraBubble.tsx` |
| S02 Ask Savera chat | `/savera` | `src/screens/SaveraScreen.tsx` |

W01 and S02 are existing Cropwise screens, rebuilt only so the journey has a start and an exit.
On W01 only the **Loyalty** card and the **Savera** tile are live.

## Code layout

```
src/
  lib/loyalty.ts        All loyalty rules as pure functions + LOYALTY_RULES constants. Start here.
  lib/loyalty.test.ts   The blueprint's figures as tests (810 / 310 / 181 / 792 points …).
  lib/format.ts         Rs, number and phone formatting.
  types.ts              Product, Order, DeliveryInfo … — the shapes the API should return.
  store/AppStore.tsx    Mock backend: cart, orders, points balance. Persists to localStorage.
  data/                 PROTOTYPE DATA: catalogue, crop programmes, seed orders, locations.
  screens/              One file per blueprint screen (table above).
  components/           Screen shell + header + bottom bar, UI primitives, QR card, Savera bubble.
  components/DemoPanel.tsx   Presenter controls. Not part of the app.
  styles/index.css      Design tokens (colours, fonts) as a Tailwind 4 @theme.
```

Stack: React 18, TypeScript, Vite, Tailwind CSS 4, react-router (hash routes), lucide-react
icons, qrcode.react. Same family as the POS prototype.

## Loyalty rules implemented

Defined once in `src/lib/loyalty.ts`; every screen calls these functions rather than doing its own maths.

| Rule | Value | Blueprint evidence |
|---|---|---|
| Earn | 1 point per Rs 10 of product value paid, rounded down. Delivery fee earns nothing. | Rs 1,800 → 180 · Rs 8,100 → +810 · POS Rs 7,920 → +792 |
| Earn after redeeming | Calculated on subtotal minus the points discount. | 8,100 − 5,000 → +310 · 6,810 − 5,000 → +181 |
| Redeem | 1 point = Rs 1. **All points or none.** | "5,000 points = Rs 5,000 off" |
| Redeemed points | Leave the balance when the order is placed. | W07 "Loyalty points redeemed 5,000" |
| Earned points | Credited when the order is **Delivered**. | W11 "Points earned · now available" |
| Cancellation | Redeemed points come back; the pending earn is dropped. | W12 "5,000 back in your account · +181 cancelled" |
| Delivery fee | Flat Rs 300. | W04 |
| Counter code | `CW-` + 6 characters, single use, 60-second life, refreshable. | W02 |
| Payment | Cash on Delivery only. | W05 |

### States the checkout handles

| State | Behaviour |
|---|---|
| Points available and ≤ order total | "Redeem all" can be ticked (W05 → W06). |
| Zero points | Checkbox disabled: "No points to redeem yet…" (mirrors POS P·E3). |
| Points worth more than the order | Checkbox disabled with an explanation (mirrors POS P·E4). |
| Points couldn't load | Notice with Retry; the order can still be placed without redeeming (mirrors POS P·E2). |
| Missing delivery fields | Inline errors, focus moves to the first invalid field. |

## What is stubbed

Search the code for `PROTOTYPE` to find every one of these.

- **No API.** `AppStore.tsx` holds all state and simulates the server-side effects on the points balance.
- **Counter code / QR** is generated on the device. In production it must come from the backend so POS can verify and burn it. The QR currently encodes just the code string (e.g. `CW-M4WD73`).
- **Order status** never changes by itself; the demo panel plays the back office.
- **Catalogue**: names and prices are from the blueprint. Categories, descriptions and the product ↔ crop-programme mapping are placeholders. Product images were lifted from the blueprint PDF and are low resolution.
- **Ask Savera** shows the greeting and returns one fixed reply. The microphone is disabled.
- **"Current location shared"** toggles a flag; it does not read the device location.
- **Locations** (district → tehsil → village) are a small sample list.
- **Signed-in user** is hard-coded (Akram Hussain, 0303 259 3019). There is no login.

## API contract the screens expect

Suggested endpoints, one per store action — rename freely; the payload shapes are in `src/types.ts`.

| Store action | Suggested call | Notes |
|---|---|---|
| read `pointsBalance` | `GET /loyalty/balance` | Failure → `pointsLoadState: 'error'`. |
| `RedemptionQrCard` | `POST /loyalty/redemption-codes` → `{ code, expiresAt }` | Called on open, on Refresh and on expiry. |
| catalogue | `GET /products`, `GET /products/:id`, `GET /crop-programs` | |
| `addToCart`, `setCartQty` | cart can stay client-side, or `PUT /cart` | |
| `placeOrder(delivery, redeemAll)` | `POST /orders` → `Order` | **Server must recompute totals and points** — never trust the client's figures. |
| read `orders` | `GET /orders`, `GET /orders/:id` | Needs `statusHistory` for the timeline. |
| `setOrderStatus` | not an app call — back office / rider | App only needs to refetch or receive a push. |

## Questions for product before build

These are places where the blueprint is silent or inconsistent and the prototype had to pick.

1. **"Points worth more than the order"** — the prototype compares points with *subtotal + delivery*. Should it be subtotal only (i.e. can points pay for delivery)?
2. **Order numbers** — My Orders shows `#NS-10482`, order details shows `ORD-58214`. The prototype uses `NS-` everywhere.
3. **Confirmed timeline** — W10 shows no "Delivered" step ahead. The prototype follows that; a pending order previews only "Confirmed".
4. **Cancelled from Pending** — W12 only shows cancellation after confirmation. The prototype shows the statuses the order actually went through.
5. **Crop Programs** — tapping one filters the Product Portfolio in the prototype. The blueprint doesn't say where it should lead.
6. **Product categories** — Quantis is under "Fungicide" in the W03 breadcrumb although it is a biostimulant. The four portfolio tabs have no home for biostimulants/nutrition.
7. **Is location sharing required** to place an order? The prototype treats it as optional.
8. **Header cart badge** on order details shows "5" in the blueprint with an empty cart; the prototype shows the real cart count.
9. **Points changing mid-checkout** (e.g. redeemed at a counter while the cart is open) — the prototype re-checks eligibility live; the server needs to reject a stale redemption.

## Demo panel

`src/components/DemoPanel.tsx` — remove it and its mount in `src/App.tsx` when lifting the screens.

- **Jump to screen** — every blueprint screen. Status screens are enabled when an order in that status exists.
- **Load blueprint cart** — 2 × Quantis + 1 × Enrich, the cart from W04–W06.
- **Loyalty balance** — presets for 5,000 (blueprint), 0 (zero points) and 9,500 (worth more than a small order), plus a "points couldn't load" switch.
- **Back office · order status** — Confirm / Mark delivered / Cancel each order and watch the balance move.
- **Reset demo** — back to the seeded state.

Suggested walkthrough: Home → *Shop & Redeem* → open Quantis, add 2 → add Enrich → cart → checkout →
tick *Redeem all* → place order → My Orders → open the order → use the panel to Confirm, then
Deliver (balance +310) or Cancel (balance +5,000).
