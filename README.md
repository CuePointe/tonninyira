# Tonninyira

Affordable online market connecting customers to verified local vendors and delivery riders.

## Current release

The release includes authenticated customer accounts, secure order ownership, approved vendor/rider onboarding, rate-limited vendor PIN login, product search and filters, wishlists, verified reviews, private support chat with a staff inbox, and automatic loyalty points for completed orders.

## Security

Supabase Row Level Security protects customer and marketplace data. Profile role escalation is protected server-side. Public catalog views use invoker security. Sensitive helper functions have fixed search paths and client execution is revoked. Privileged credentials stay server-side in Edge Functions.

## Production boundary

Customer payment is currently cash-on-delivery. Real payment-gateway integration and hardened media-upload/storage flows remain separate next-phase production features.
