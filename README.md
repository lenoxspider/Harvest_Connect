# Harvest Connect

Harvest Connect is a multi-role platform connecting Farmers, Buyers, Transporters, and Storage Owners in Ghana.

## Repo structure

- `api-gateway/` – Spring Cloud Gateway for routing requests
- `auth-service/` – authentication + JWT
- `produce-service/` – produce listings + orders
- `transport-service/` – truck listings + bookings
- `storage-service/` – storage listings + bookings
- `payment-service/` – MTN MoMo escrow payments + commissions
- `notification-service/` – notifications (API stub)
- `mobile-app/` – Expo (React Native) + TypeScript client app

