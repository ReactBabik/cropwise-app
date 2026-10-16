# dukan.pk Loyalty MiniApp for Cropwise — Stack & Architecture

**Goal:** build the dukan.pk **loyalty MiniApp**: a mobile web page that Cropwise's app opens in a webview (via the `miniAppUrl` returned by `getLoyaltyDetails`, integration doc v1.3). The farmer sees their points and a single-use redemption QR + short code (valid 60 s) to show at a dukan.pk franchise counter.

The code lives in `syngenta/cropwise-miniapp`.

---

## 1. What we are (and are not) building

| | |
|---|---|
| **Is** | A hosted web app (the MiniApp) reached only through a session URL issued by dukan.pk |
| **Is** | The PHP endpoints that back the integration (`getToken`, `getLoyaltyDetails`, redemption code, village matching) |
| **Is not** | A native app or a Capacitor/React Native wrapper. Cropwise's own app is the shell and loads our URL |
| **Is not** | An SEO-driven site. A single-use session URL is not indexable. If dukan.pk later wants a public marketing site, it is a separate project |

### Flow

```
Cropwise app ──▶ Syngenta backend ──(server-to-server, IP-whitelisted)──▶ dukan.pk PHP API
                                      getToken, getLoyaltyDetails
                                      ◀── points + miniAppUrl (session token)

Cropwise app opens miniAppUrl in a webview
        │
        ▼
Next.js MiniApp  GET /s/<token>
   1. exchange session token with PHP  (single use)
   2. set httpOnly cookie
   3. redirect to /loyalty  (token no longer in the URL)
        │
        ▼
/loyalty  → points summary + redemption QR / code (60 s, auto-refresh)
```

Cropwise never calls the MiniApp's API. The MiniApp talks only to dukan.pk's PHP backend.

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript (strict)** | Route handlers give us a server-side layer (BFF) for the cookie session, so the token never reaches JavaScript |
| Styling / UI | **Tailwind CSS v4** (shadcn/ui primitives added as needed) | Same as `pos-user` |
| Validation | **Zod** | Every API payload parsed at the boundary, as in `pos-user` |
| QR | `qrcode.react` | Already used in the earlier prototype |
| Package manager | **pnpm** | Same as `pos-user` |
| Backend | Existing core PHP + MySQL. No rewrite | |
| Hosting | A Node host for Next.js (container or VPS behind Nginx) in the same region as PHP | The page needs a Node runtime |

Rendering: every page is per-farmer and dynamic, so there is no static generation and no SEO metadata work. All routes are `noindex`.

---

## 3. Session & security design

1. **Entry `/s/[token]`** is a Route Handler (cookies can only be set in handlers/actions). It calls the PHP session-exchange endpoint, receives an opaque session id, stores it in an **httpOnly, Secure, SameSite=Lax cookie**, and redirects to `/loyalty`. The one-time token is therefore removed from the URL, browser history and any `Referer` header.
2. **Browser never talks to PHP.** Client components call our own `/api/*` route handlers; those read the cookie and call PHP with the bearer session.
3. **Failure states are first-class screens:** expired link, already-used link, session expired (401). Each shows a clear message asking the farmer to reopen the loyalty page from Cropwise (which calls `getLoyaltyDetails` again for a fresh URL).
4. **Headers:** `Cache-Control: no-store` on all dynamic responses, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer`, a restrictive CSP, and `frame-ancestors` limited to what Cropwise needs (a webview is not an iframe, but confirm with Syngenta).
5. **Secrets** (PHP base URL, any shared secret) are server-only environment variables. Nothing sensitive uses a `NEXT_PUBLIC_` prefix.
6. **No logging of tokens or mobile numbers** in plain text.

### Transit encryption
`pos-user` encrypts payloads (AES-256-GCM, RSA key-wrap via `node-forge`) on top of TLS because the browser called PHP directly. Here the browser calls our own origin and Next.js calls PHP server-to-server, so TLS is enough. Do not carry the encryption scheme over unless there is a compliance requirement.

---

## 4. Backend (core PHP) work required

This is the list to hand to the PHP team. Contract details are in `cropwise-miniapp/docs/MINIAPP_API.md`.

**Already specified in the integration doc v1.3 (called by Syngenta):**
- `POST /api/v1/auth/getToken` — `appId`+`appKey` headers → 24 h bearer token; 10 req/h limit
- `POST /api/v1/loyalty/getLoyaltyDetails` — registers a new farmer (needs `customerName`), returns points + `miniAppUrl` + `urlExpiresAt`; 30 req/mobile/h
- IP whitelist (403 `IP_NOT_WHITELISTED`), 401 on bad/expired token, envelope `{ response: { data, message }, code: "11" | "00" }`, HTTP 200 for business errors
- Village matching from lat/long against Syngenta polygons; no match → village empty, flagged for admin

**New endpoints the MiniApp needs (our proposal — not in the integration doc, to be agreed):**
1. `POST session/exchange` — body `{ token }` → `{ session, expires_at }`. Single-use, validates `urlExpiresAt`. Errors: `SESSION_EXPIRED`, `SESSION_ALREADY_USED`, `SESSION_INVALID`.
2. `POST loyalty/summary` (session bearer) — same points fields as `getLoyaltyDetails` (`totalEarnedPoints`, `utilizedPoints`, `availablePoints`, `asOf`) plus farmer display name.
3. `POST loyalty/redemption-code` (session bearer) — creates a single-use code (e.g. `CW-P64CWT`) valid for a configurable time (default 60 s) and returns `{ code, qr_payload, expires_at }`. Issuing a new one invalidates the previous. Rate-limit per farmer.
4. **Counter-side redemption** is a separate flow in the existing POS (`pos-user`): scan/enter the code → validate → deduct points. The MiniApp never redeems; it only displays the code.

**Conventions to keep, per `pos-user`:** envelope handling in one place, `snake_case` fields internally, money/points as integers. Note the integration doc uses `camelCase` for the Cropwise-facing payloads; the MiniApp endpoints are internal, so use `snake_case` to match the rest of the dukan.pk API, or tell us if you prefer camelCase.

**Hygiene:** no debug output before the JSON body (`pos-user`'s client has to defend against this today), consistent envelope, proper HTTP 401 for expired sessions.

---

## 5. Practices adopted from `pos-user`

Reviewed `syngenta/pos-user` (README, `.cursor/rules/RULES.mdc`, `docs/`, `plan.md`, `package.json`, `vite.config.ts`, `.prettierrc.json`, `api.ts`).

- **pnpm** with a build allow-list; strict TypeScript from day one (no curated partial typecheck like `tsconfig.check.json`, which exists only because of prototype debt).
- **Prettier:** single quotes, semicolons, 120 columns, trailing commas.
- `@/` alias → `src/`; kebab-case filenames; PascalCase components; functional components only.
- **Single API choke point** (`src/lib/api/`) for base URL, headers, envelope normalization and error mapping. No `fetch` scattered in components.
- **Zod schemas** per domain in `src/schemas/<domain>/`, with inferred types exported next to them and parsed at the boundary.
- `snake_case` for API-facing fields; camelCase for UI-local state.
- **`sonner`** for toasts, **`lucide-react`** for icons, shadcn/ui for primitives.
- React Hook Form + Zod for any multi-field form (the MiniApp has none yet).
- **Docs-first:** an API contract markdown per domain in `docs/`, written before the screen is built; `.env.example` committed with every variable documented; engineering rules checked into the repo.
- Mock mode for frontend work without the backend (`pos-user` uses `VITE_MOCK_API`; here `MOCK_API=true`).

### Not carried over
Vite/React Router, `vite-plugin-pwa`, Dexie/IndexedDB offline outbox and FIFO sync (offline POS concerns), Redux/RTK Query (the MiniApp has two small reads, so server fetch + a tiny client hook is enough), browser-stored tokens, transit encryption, Figma asset plumbing.

---

## 6. Project layout (`cropwise-miniapp`)

```
src/
  app/
    layout.tsx, globals.css
    page.tsx                  fallback: "open from Cropwise"
    s/[token]/route.ts        session entry: exchange → cookie → redirect
    loyalty/page.tsx          authenticated page (server-reads summary)
    session-ended/page.tsx    expired / used / invalid states
    api/loyalty/redemption-code/route.ts   (summary is read server-side in loyalty/page.tsx)
  components/
    redemption-card.tsx       QR + code + 60 s countdown; farmer taps to get a new code (client)
    points-summary.tsx
  lib/
    api/client.ts             PHP client + envelope normalization
    api/mock.ts               mock backend for MOCK_API=true
    session.ts                cookie helpers
    env.ts                    validated server env
  schemas/                    Zod schemas
docs/MINIAPP_API.md           proposed endpoint contract
.env.example
```

---

## 7. Open questions

1. **Session-exchange design:** is `miniAppUrl`'s token meant to be exchanged by us (proposed) or does dukan.pk's PHP already expose a session mechanism?
2. **Single vs multi-use URL and TTL** (the doc says business team decides). Our flow works for either, but single-use means a webview reload after the exchange relies on the cookie.
3. **Languages:** English only, or Urdu (RTL) as well? `pos-user` has an `i18n.ts` we can reuse.
4. **Points display scope:** just totals, or also history (earned/redeemed transactions)?
5. **Hosting:** can a Node process be deployed next to the PHP stack?
6. **Webview constraints from Syngenta:** cookie support in the Cropwise webview, allowed domains, deep links back into Cropwise.
7. **Redemption code format and QR payload:** plain code, or a signed payload the counter app can verify offline?

---

## 8. Build order

1. Scaffold + conventions + mock backend (**done in `cropwise-miniapp`**)
2. Session entry flow and cookie handling
3. Loyalty page: points + redemption QR with 60 s countdown and a "get a new code" button
4. Error/expired states
5. Replace mock with real PHP endpoints once agreed
6. Security headers, load test, deployment
