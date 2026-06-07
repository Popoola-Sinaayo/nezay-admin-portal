# Nezay Admin Portal

React + Vite management dashboard for Nezay operations staff.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_BASE_URL` to your API base (default `http://localhost:8000/api`).

## Backend prerequisites

From `nezay_api`:

```bash
python manage.py migrate admin_portal
python manage.py seed_default_admin
```

Default credentials come from env:

- `DEFAULT_ADMIN_EMAIL` (default `admin@nezay.com`)
- `DEFAULT_ADMIN_PASSWORD` (default `change-me-on-first-login`)

Ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`.

## Features

- Staff JWT login (separate from customer OTP flow)
- Dashboard stats and onboarding funnel
- User search, detail, suspend/activate, messaging
- Onboarding / KYC data review
- Global transaction list with VFD-first reversal (finance/super_admin)
- Broadcast and targeted email + push notifications
- Team management with invite flow

## Build

```bash
npm run build
```

Serve `dist/` via nginx or any static host.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Staff sign-in |
| `/accept-invite?token=...` | Accept admin invite |
| `/` | Dashboard |
| `/users` | User list |
| `/users/:id` | User detail |
| `/transactions` | Transaction list |
| `/transactions/:id` | Transaction detail + reverse |
| `/notifications` | Send / broadcast |
| `/team` | Admin team + invites |
