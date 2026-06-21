# HarvestConnect Admin (Local)

This is a simple local admin page for setting the homepage image URLs used by the mobile app.

## Prereqs

- Backend running (API Gateway + notification-service + Postgres). Recommended: `docker compose up --build -d` from the repo root.

## Run

```powershell
cd "C:\Users\YOOF1337\Documents\#school\mobile APP\Harvest_Connect\admin-web"
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm.cmd install
npm.cmd run dev
```

Open the printed URL (default: `http://localhost:5174`).

## API

- GET `http://localhost:8080/api/notifications/settings/homepage`
- PUT `http://localhost:8080/api/notifications/settings/homepage`

