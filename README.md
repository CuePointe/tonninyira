# Tonninyira

Affordable online market connecting customers with verified local vendors and delivery riders.

## Current release

- Customer authentication with Supabase Auth email OTP/magic links.
- Authenticated checkout with server-bound order ownership.
- Approved vendor/rider onboarding and rate-limited vendor PIN login.
- Search plus category, area, price, size, colour and sort filters.
- Product wishlists.
- Verified customer reviews restricted to completed orders.
- Private customer support chat plus staff support inbox.
- Automatic loyalty points for completed orders.
- Server-side order pricing, delivery-fee and status integrity.
- Public catalog views with intended customer-facing fields only.
- RLS and security hardening across customer and marketplace data.

## Staff support

Authorized `staff` and `admin` users can use `support.html` to manage open customer support conversations.

## Production boundary

The current checkout is cash-on-delivery. Real payment-gateway integration and hardened media upload/storage remain separate next-phase features.
