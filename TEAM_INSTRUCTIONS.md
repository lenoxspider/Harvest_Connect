# Harvest Connect – Team Instructions

This repo contains:
- Spring Boot microservices (REST)
- A Spring Cloud API Gateway
- An Expo (React Native) mobile app
- A Docker Compose setup for Postgres + pgAdmin + all services

## Prerequisites

- Git
- Docker Desktop (Linux containers)
- Node.js + npm (for the Expo app)

## 1) First-time setup

From the repo root:

1. Create your environment file:
   - Windows PowerShell: `copy .env.example .env`

2. Start backend + database:
   - `docker compose up --build`

This will take a while the first time (downloads images + Maven dependencies).

## 2) Verify everything is running

- Check containers: `docker compose ps`
- Gateway: `http://localhost:8080`
- Postgres: `localhost:5432`
- pgAdmin: `http://localhost:5050`

Default ports:
- `api-gateway`: 8080
- `auth-service`: 8081
- `produce-service`: 8082
- `transport-service`: 8083
- `storage-service`: 8084
- `payment-service`: 8085
- `notification-service`: 8086

## 3) pgAdmin connection

Open `http://localhost:5050` and login using `.env`:
- Email: `PGADMIN_DEFAULT_EMAIL` (default: `admin@example.com`)
- Password: `PGADMIN_DEFAULT_PASSWORD` (default: `admin`)

Add a server connection:
- Host: `postgres`
- Port: `5432`
- Username: `POSTGRES_USER`
- Password: `POSTGRES_PASSWORD`

Databases are auto-created on first run (fresh Docker volume):
- `auth_db`, `produce_db`, `transport_db`, `storage_db`, `payment_db`, `notification_db`

## 4) Testing APIs (quick)

All calls should go through the API Gateway:
- Base URL: `http://localhost:8080`

Example (PowerShell):
- `Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/register -ContentType application/json -Body '{\"fullName\":\"Test User\",\"phoneNumber\":\"0500000000\",\"password\":\"pass1234\",\"role\":\"BUYER\",\"region\":\"Greater Accra\"}'`

If you get errors, check logs:
- `docker compose logs -f auth-service`
- `docker compose logs -f api-gateway`

## 5) Run the Expo app

In a new terminal:

1. Go to the app:
   - `cd mobile-app`

2. Create Expo env file:
   - `copy .env.example .env`

3. Set the API URL for your device/simulator in `mobile-app\.env`:
   - Android emulator: `http://10.0.2.2:8080`
   - iOS simulator: `http://localhost:8080`
   - Physical phone: `http://<YOUR_PC_LAN_IP>:8080`

4. Install and run:
   - `npm install`
   - `npx expo start`

## 6) Common issues

- pgAdmin doesn’t open:
  - Ensure `PGADMIN_DEFAULT_EMAIL` is a real email format (example: `admin@example.com`)
  - Restart: `docker compose up -d pgadmin`

- Docker builds are slow:
  - First build is expected to be slow; subsequent builds use cache.

- Mobile app can’t reach backend:
  - Don’t use `localhost` on a physical phone.
  - Set `EXPO_PUBLIC_API_BASE_URL` correctly in `mobile-app\.env`.


## 7) Admin page (homepage images)

We use a local admin web page to manage the homepage image URLs (so they are not hardcoded in the app).

- App folder: dmin-web/`r
- Run instructions: dmin-web/README.md`r
- API endpoints (via gateway):
  - GET http://localhost:8080/api/notifications/settings/homepage`r
  - PUT http://localhost:8080/api/notifications/settings/homepage`r

