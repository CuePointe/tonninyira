<div align="center">

<a href="https://github.com/CuePointe/tonninyira">
  <img src="assets/tonninyira-mark.svg" alt="Tonninyira" width="760">
</a>

# Tonninyira

### A local-first marketplace for discovering, ordering from and working with trusted neighbourhood businesses in Uganda.

<p>
  <a href="https://github.com/CuePointe/tonninyira/tree/tonninyira-enhancements"><img src="https://img.shields.io/badge/branch-tonninyira--enhancements-E23F25?style=for-the-badge&logo=git" alt="Enhancement branch"></a>
  <img src="https://img.shields.io/badge/frontend-HTML%20%2B%20Vanilla%20JS-F5B400?style=for-the-badge&logo=javascript&logoColor=1C1410" alt="Frontend">
  <img src="https://img.shields.io/badge/backend-Supabase-4C9A5B?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/hosting-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Pages">
</p>

<p>
  <strong>Discover locally. Order simply. Work transparently.</strong><br>
  Built for mobile-first use, low-bandwidth environments and the realities of neighbourhood commerce.
</p>

</div>

---

## What is Tonninyira?

Tonninyira is a marketplace concept built around a simple idea: people should be able to discover useful local businesses without first creating an account, while the platform should require a verified account only when a real transaction or private customer action begins.

The product keeps the public experience straightforward:

**Browse → choose → basket → verify → pay → track.**

The marketplace is intentionally split into two familiar shopping journeys:

| Area | Purpose |
| --- | --- |
| **Eats** | Discover meals, snacks and ready-to-eat food from local stalls and food businesses. |
| **Shop** | Discover groceries, raw foods, second-hand goods and other everyday products. |

This is not a catalogue-only storefront. The platform is being developed as an operating system for local marketplace activity: customers, vendors, riders, orders, payments, reviews, support, settlements and marketplace analytics all connect to the same product model.

---

## Product principles

### 01 — Browse before you sign in
Marketplace discovery is public. People can see stalls, products, prices, images and delivery information before creating an account.

### 02 — One identity across the journey
Once a customer verifies with Supabase Auth, that same authenticated session is reused for account access, Support, Orders, Wishlist and payment flows.

### 03 — Low-friction mobile UX
The interface is touch-first, visually familiar and designed to remain useful on ordinary Android devices and constrained connections.

### 04 — Transparent marketplace economics
Vendor and rider earnings are represented as gross earnings, Tonninyira's platform share and the partner's net amount. The current operating model uses a 5% platform cut for partner settlement calculations.

### 05 — Data becomes product intelligence
Every meaningful marketplace event can become a useful signal: search behaviour, product discovery, orders, cancellations, payment state, repeat purchasing, fulfilment speed, geography and partner productivity.

---

## Core capabilities

### 🛍 Customer experience

- Public marketplace browsing
- **Eats / Shop** category split
- Vendor and stall discovery
- Product search
- Area entry and device location support
- Basket and multi-vendor order grouping
- Account creation and sign-in with phone OTP or email
- Order history
- Order status visibility
- Reviews and ratings
- Private customer Support
- **Personal Wishlist** backed by the authenticated account
- Saved stalls remain available across sessions

### 🏪 Vendor experience

- Vendor account verification
- Vendor application and approval workflow
- Stall registration
- Product / menu presentation
- Incoming order workflow
- Gross earnings visibility
- Tonninyira platform deduction visibility
- Net earnings visibility
- Settlement history
- Mobile Money / bank payout request workflow

### 🏍 Rider experience

- Rider account verification
- Rider application and approval workflow
- Delivery job workflow
- Delivery completion
- Gross earnings visibility
- Tonninyira platform deduction visibility
- Net earnings visibility
- Settlement history
- Mobile Money / bank payout request workflow

### 💳 Payments

The payment architecture is prepared for Flutterwave and mobile-money checkout flows. Payment state is recorded separately from the order lifecycle so a payment attempt can be traced without corrupting the core order record.

Actual money movement depends on configured external payment providers and their production credentials. Secrets are kept in Supabase Edge Function configuration rather than committed to this repository.

### 📍 Delivery and location

The marketplace captures customer location using a combination of typed area information and browser/device coordinates. The current fee engine uses distance-based delivery tiers; full road-route optimisation can be added as a later mapping layer.

---

## Architecture

```text
                         ┌──────────────────────────┐
                         │      Tonninyira Web      │
                         │  HTML + CSS + Vanilla JS │
                         └────────────┬─────────────┘
                                      │
                       ┌──────────────┼──────────────┐
                       │              │              │
                       ▼              ▼              ▼
                ┌────────────┐  ┌────────────┐  ┌────────────┐
                │ Supabase   │  │ Flutterwave│  │ Cloudflare │
                │ Auth       │  │ Payments   │  │ Pages/CDN  │
                └─────┬──────┘  └────────────┘  └────────────┘
                      │
                      ▼
                ┌──────────────────────────────────┐
                │ PostgreSQL + RLS + Edge Functions│
                │ profiles · vendors · riders      │
                │ orders · wishlists · reviews     │
                │ settlements · notifications      │
                │ market/order/payment events      │
                └──────────────────────────────────┘
```

### Why this stack?

**Vanilla JavaScript** keeps the client lightweight and avoids framework overhead for a marketplace that needs to work well on everyday devices.

**Supabase** provides authentication, PostgreSQL, row-level security, realtime capabilities and Edge Functions in one backend platform.

**Cloudflare Pages** provides CDN-backed delivery for the static application and keeps the deployment model simple.

**GitHub Actions** automates integration of the enhancement layer and protects the separation between the original application and ongoing product experiments.

---

## Authentication & authorization

Tonninyira uses Supabase Auth as the source of truth for verified identity.

```text
Visitor
  │
  ├── Browse marketplace freely
  │
  ├── View stalls / products / prices
  │
  └── Start a private or transactional action
             │
             ▼
       Verify account
       Phone OTP / Email
             │
             ▼
        Supabase Session
             │
       ┌─────┼─────────────┐
       ▼     ▼             ▼
    Customer Vendor       Rider
       │     │             │
       ▼     ▼             ▼
   Orders  Application   Application
   Wishlist Approval     Approval
   Support  Earnings     Earnings
```

The important distinction is between **saved customer details** and a **real authenticated Supabase session**. A name/phone saved in browser storage is not treated as proof of authentication.

Database access to private customer data is protected with row-level security policies tied to the authenticated user.

---

## Data model

The marketplace is designed around a set of operational entities rather than one giant order table.

```text
profiles
  ├── customer identity
  ├── vendor/rider role
  └── account state

vendors ──────── products / stall presentation
   │
   └──────────── orders
                  │
                  ├── payment transactions
                  ├── order events
                  ├── rider fulfilment
                  ├── notifications
                  └── settlement records

customers ────── wishlists
customers ────── reviews
customers ────── support conversations

market_events ── discovery / behaviour analytics
```

The current backend also includes marketplace event, order event, notification and payment transaction tables to support deeper operational analytics.

---

## Wishlist model

Wishlist is account-based, not just browser-based.

A customer can:

1. Tap the heart on a stall while browsing.
2. Sign in once when asked.
3. Save the stall to `public.wishlists`.
4. Open **My wishlist** from the Account panel.
5. Remove saved stalls at any time.
6. Return later on the same account and see the same saved items.

The table is protected by owner-only RLS policies so one customer cannot read or modify another customer's wishlist.

---

## Marketplace economics

Tonninyira is being designed as a lean marketplace rather than a heavy inventory business.

The product therefore tracks the money flow explicitly:

```text
Order value
    │
    ├── Vendor / Rider gross earnings
    │
    ├── Tonninyira platform share
    │
    └── Partner net amount
```

Current partner settlement calculations use a **5% Tonninyira platform cut**. Payout requests are represented in the wallet workflow; external provider integration is responsible for the final transfer of funds.

---

## Analytics direction

Tonninyira is being built so product decisions can eventually be driven from marketplace evidence rather than intuition alone.

Examples of questions the event model should answer:

| Question | Useful signal |
| --- | --- |
| Where is demand growing? | Area + search + order geography |
| Which stalls convert best? | Discovery → stall view → basket → order |
| Which products drive repeat business? | Product orders + repeat-customer behaviour |
| Where does fulfilment slow down? | Order and rider event timestamps |
| Are partners economically viable? | Gross → platform cut → net → payout data |
| Why do customers leave? | Abandoned baskets, cancellations and payment failures |
| Which customers return? | Authenticated order history + cohort behaviour |

This creates the foundation for future demand forecasting, stall recommendations, delivery-zone planning, partner productivity analysis and unit-economics modelling.

---

## Repository structure

```text
tonninyira/
├── index.html                         # Main marketplace experience
├── app.js                             # Core application logic
├── enhancements.js                    # Product enhancement layer
├── enhancements-fix.js               # Enhancement compatibility/fixes
├── guest-access-flow.js               # Public browsing + account-gated actions
├── account-session-ui.js              # Account state + sign-out UI
├── session-compat.js                  # Shared Supabase client/session bridge
├── support-session-fix.js             # Support session reliability guard
├── wishlist-account.js                # Authenticated wishlist UI
├── flutterwave-payments-v2.js         # Payment initiation client
├── payment-return.html                # Payment return surface
├── vendor-dashboard.html              # Vendor operations
├── rider-dashboard.html               # Rider operations
├── admin.html                         # Admin surface
├── assets/
│   └── tonninyira-mark.svg             # GitHub / project wordmark
├── .github/workflows/
│   ├── apply-enhancements.yml          # Enhancement integration
│   └── integrate-payments-account-pwa.yml
└── README.md                           # Project documentation
```

> The repository contains both the original application and a deliberately layered enhancement system. Legacy experimental files may remain in the branch for reference even when their scripts are no longer injected into the live page.

---

## Local development

Tonninyira is a static web application, so the fastest local setup is a simple HTTP server.

```bash
git clone https://github.com/CuePointe/tonninyira.git
cd tonninyira
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

Because authentication, database access and payment flows depend on external services, local testing still requires the appropriate Supabase project configuration and provider setup.

---

## Deployment model

The intended deployment path is:

```text
Git push
   │
   ▼
GitHub Actions
   │
   ├── Integrate enhancement layer
   └── Keep generated entry-point changes on the enhancement branch
   │
   ▼
Cloudflare Pages
   │
   ▼
Global static delivery
```

The project currently maintains the dedicated `tonninyira-enhancements` branch for this development stream. The original `main` branch is kept separate.

---

## Security notes

- Never commit Supabase service-role keys.
- Never commit Flutterwave secret keys or webhook hashes.
- Keep payment secrets in Supabase Edge Function secrets.
- Treat browser-stored customer details as convenience data, not authentication.
- Keep private customer tables behind RLS.
- Validate server-side payment state before treating an order as paid.
- Do not trust client-supplied platform fees or settlement totals without server-side controls.

---

## Current focus

The current product work is concentrated on making the core marketplace journey reliable before expanding the surface area:

- Unified account/session behaviour
- Customer wishlist persistence
- Customer Support without repeated sign-in prompts
- Mobile-money payment flow
- Vendor and rider earnings visibility
- Better gallery and page performance
- Marketplace analytics and operational event tracking

---

## Roadmap

### Near term

- End-to-end Flutterwave mobile-money verification
- Cleaner payment return / retry handling
- Stronger product-level wishlist support
- Better customer order tracking
- Vendor/rider notification centre
- Improved market-image optimisation

### Next layer

- Map-based location selection
- Road-aware delivery routing
- Demand heatmaps
- Partner performance dashboards
- Repeat-purchase recommendations
- Customer segmentation
- Operational alerts and anomaly detection

### Long term

Tonninyira can evolve from a marketplace frontend into a data-informed local commerce network where the platform learns which products, stalls, neighbourhoods and delivery patterns create the healthiest marketplace outcomes.

---

## Project status

**Tonninyira is an actively developed marketplace project.**

The codebase is being built incrementally, with production-minded authentication, database security, payments, partner operations and analytics introduced as distinct layers rather than hidden inside one large application file.

---

<div align="center">

### Built for local commerce. Designed to scale with evidence.

**Tonninyira 🇺🇬**

</div>
