# 🛒 Tonninyira Online App
## Affordable online market for local food, goods and delivery in Uganda 🇺🇬

![Tonninyira](https://img.shields.io/badge/Tonninyira-production-orange?style=flat-square)

Tonninyira connects customers with approved local vendors and delivery riders through a lightweight mobile-first marketplace.

## Current release

- Authenticated customer accounts using Supabase Auth email OTP/magic links.
- Server-bound checkout and order ownership using `auth.uid()`.
- Approved vendor/rider onboarding with controlled approval states.
- Vendor PIN login with rate limiting and real Supabase Auth sessions.
- Product search plus category, area, price, size, colour and sort filters.
- Customer wishlists for saved products.
- Verified customer reviews restricted to completed orders.
- Private customer support chat with an authorized staff inbox at `support.html`.
- Automatic loyalty points for completed orders.
- Server-side order-price, delivery-fee and status integrity controls.
- Public catalog views exposing only intended customer-facing fields.
- Row Level Security across customer and marketplace feature data.
- GitHub CI checks for JavaScript syntax, committed secrets and privileged-key misuse.

## Architecture

```text
Frontend: HTML5 + CSS + Vanilla JavaScript
Backend: Supabase PostgreSQL + Auth + Realtime
Hosting: GitHub Pages / Cloudflare Pages compatible
Source: GitHub
```

## Staff support

Authorized `staff` or `admin` accounts can open `support.html`, select open customer conversations, reply privately, close conversations, refresh the inbox, and sign out.

## Production security

The browser receives only the Supabase public/anon key. Privileged Supabase credentials remain server-side in Edge Functions. Database-side policies and triggers enforce ownership, review eligibility, role protection, catalog pricing, totals and permitted order transitions.

## Payments and media

The current checkout is **cash on delivery**. Real payment-gateway integration and production-grade media upload/storage are deliberately separate next-phase features.

## Local testing

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Repository

- Customer app: `index.html` + `customer-app.js`
- Staff support: `support.html`
- Supabase migrations: `supabase/migrations/`
- Security tests: `supabase/tests/marketplace_security.sql`
- CI: `.github/workflows/security.yml`
