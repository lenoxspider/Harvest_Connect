# Harvest Connect

Harvest Connect is a multi-role platform connecting Farmers, Buyers, Transporters, and Storage Owners in Ghana.

## Quick start (local)

1. Copy env:
   - `copy .env.example .env`
2. Start backend + database:
   - `docker compose up --build`
3. API Gateway:
   - `http://localhost:8080`

## Mobile app (Expo Go)

1. Go to the app:
   - `cd mobile-app`
2. Copy env:
   - `copy .env.example .env`
3. Set API base URL in `mobile-app/.env`:
   - Android emulator: `http://10.0.2.2:8080`
   - iOS simulator: `http://localhost:8080`
   - Physical phone: `http://<YOUR_PC_LAN_IP>:8080`
4. Run:
   - `npm install`
   - `npm start`

Demo steps are in `mobile-app/DEMO_CHECKLIST.md`.

## Repo structure

- `api-gateway/` - Spring Cloud Gateway for routing requests
- `auth-service/` - authentication + JWT
- `produce-service/` - produce listings + orders
- `transport-service/` - truck listings + bookings
- `storage-service/` - storage listings + bookings
- `payment-service/` - payments + commissions
- `notification-service/` - notifications + homepage settings
- `mobile-app/` - Expo (React Native) + TypeScript client app

## Key API endpoints (via gateway)

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Produce
  - `GET /api/produce/listings` (public)
  - `GET /api/produce/listings/{id}` (public)
  - `POST /api/produce/orders` (BUYER)
  - `GET /api/produce/orders/my` (BUYER/FARMER)
  - `PUT /api/produce/orders/{id}/accept` (FARMER)
  - `PUT /api/produce/orders/{id}/decline` (FARMER)
- Storage
  - `POST /api/storage/listings` (STORAGE_OWNER)
  - `GET /api/storage/listings/my` (STORAGE_OWNER)
- Notifications
  - `GET /api/notifications/settings/homepage` (public; used by mobile Explore)
  - `GET /api/notifications/my` (requires `X-User-Id` header in current implementation)

