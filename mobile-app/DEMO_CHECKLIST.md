# HarvestConnect (Expo Go) Demo Checklist

Date target: **tomorrow** (relative to current work session).

## 0) One-time setup

1. Ensure API gateway is reachable from your phone (same Wi‑Fi/LAN).
2. Set the mobile app API base URL:
   - `mobile-app/.env`
   - `EXPO_PUBLIC_API_BASE_URL=http://10.2.4.210:8080`
3. Start the app:
   - `cd mobile-app`
   - `npm start`
   - Scan the QR code with **Expo Go**.

## 1) Public (not logged in)

1. Open **Explore**.
2. Tap **Produce** → should open **Produce** list (public read-only).
3. Tap any listing → opens details with **Login** CTA (ordering is blocked for public users).

## 2) Buyer flow (browse → order → pay → view orders)

1. Login with a **BUYER** account.
2. Go to **Explore** → tap **Produce** → browse list → tap a listing.
3. On details screen:
   - Enter quantity
   - Tap **Buy Now**
   - Confirm
4. Go to **Bookings** (buyer orders) → verify the order appears.

## 3) Farmer flow (create listing → view listings → view orders)

1. Login with a **FARMER** account.
2. Go to **Home** → add produce listing.
3. Go to **Listings** → confirm it appears.
4. Go to **Orders** → verify the screen loads (backend support may vary by environment).

## 4) Storage owner flow (facilities list)

1. Login with a **STORAGE_OWNER** account.
2. Go to **Facilities** → verify facilities load and show capacity info.

## 5) Transporter flow (vehicles list)

1. Login with a **TRANSPORTER** account.
2. Go to **Trucks** → verify vehicles load and show capacity + pricing.

## 6) Notifications (bell)

1. While logged in, tap the **bell** icon on:
   - Explore header, or
   - Role home screen header (Farmer/Storage/Transport).
2. Confirm the **Notifications** screen opens.
3. Tap an unread notification to mark it read (uses `/api/notifications/my` + `X-User-Id`).

