# ServeLink Backend + Frontend

ServeLink is a service marketplace platform with role-based access for `customer`, `provider`, and `admin`.

## Project Structure

- `Backend/` - Express + MongoDB API
- `Frontend/` - React Native (Expo) mobile app

## Backend Quick Start

1. Copy env template:
   - `cp Backend/.env.example Backend/.env`
2. Update values in `Backend/.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - Cloudinary keys
3. Install and run:
   - `cd Backend`
   - `npm install`
   - `npm run dev`

API default: `http://localhost:5000`

## Frontend Quick Start

1. Set API URL in `Frontend/.env`:
   - `EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000/api`
2. Install and run:
   - `cd Frontend`
   - `npm install`
   - `npm start`

## Seed Data

From `Backend/`:

- `npm run seed`

Creates:

- 1 admin user
- 2 customers
- 2 providers
- provider profiles, services, and sample bookings

## Core Admin Endpoints

- `GET /api/admin/dashboard` (admin only)
- `GET /api/admin/providers/pending` (admin only)
- `GET /api/admin/providers/:id` (admin only)
- `PATCH /api/providers/:id/verify` (admin only, supports approve/reject)
- `DELETE /api/reviews/:id` (admin only)
