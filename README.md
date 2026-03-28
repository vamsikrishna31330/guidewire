# GigShield

GigShield is a full-stack AI-powered parametric insurance platform for gig economy delivery workers in India, built for the Guidewire DEVTrails Hackathon 2026 Phase 2 scale round.

## Stack

- Frontend: React + Vite + TailwindCSS + React Router v6
- Backend: Node.js + Express.js REST API
- Database: MongoDB Atlas with Mongoose
- Auth: JWT + bcryptjs
- External APIs: OpenWeatherMap and AQICN with deterministic fallback data when API keys are missing

## Project structure

```text
gigshield/
├── client/
├── server/
├── .env.example
└── README.md
```

## Setup

1. Copy `.env.example` to `.env` in the repo root and fill in your MongoDB Atlas connection string and JWT secret.
2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```
4. Seed the demo database:
   ```bash
   cd server
   npm run seed
   ```
5. Start the backend:
   ```bash
   cd server
   npm run dev
   ```
6. Start the frontend in a second terminal:
   ```bash
   cd client
   npm run dev
   ```

The frontend talks to `http://localhost:5000` by default. Override with `VITE_API_BASE_URL` if needed.

## Demo credentials

After running the seed script:

- `arjun@gigshield.demo` / `Password@123`
- `priya@gigshield.demo` / `Password@123`

## API overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/notifications/my`

### Policy

- `GET /api/policy/quote?city=Bengaluru&pincode=560001`
- `POST /api/policy/purchase`
- `GET /api/policy/my`

### Claims

- `GET /api/claims/my`
- `POST /api/claims/submit`
- `PUT /api/claims/:id/verify`

### Payouts

- `POST /api/payouts/process/:claimId`
- `GET /api/payouts/my`

### Admin

- `GET /api/admin/disruptions`
- `GET /api/admin/claims`
- `PUT /api/admin/claims/:id`
- `POST /api/admin/trigger-curfew`

## Risk engine

Premium quote logic uses:

- `Risk Score = (rain_mm * 2) + (wind_speed * 1.5) + (AQI / 50) + 10`
- `Weekly Premium = Risk Score * 2.5`, clamped between `INR 49` and `INR 199`
- `Coverage Amount = Weekly Premium * 8`

## Automated trigger engine

A cron job runs every 30 minutes and checks active policy zones for:

- Heavy rain above 10 mm/hr
- Extreme heat above 42 C
- AQI above 300
- High wind above 50 km/h
- Simulated curfew events through the admin route

When a disruption is detected, GigShield creates a `DisruptionEvent`, auto-creates pending claims, and stores worker notifications in MongoDB.

## Notes for judges

- If API keys are omitted, the app still works with deterministic fallback weather and AQI values.
- The repo still contains some legacy hackathon prototype folders, but the production implementation for this deliverable is the `client/` and `server/` app described above.
