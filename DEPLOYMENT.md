# Deployment Guide (Render + MongoDB Atlas)

## 1. Prepare MongoDB Atlas

1. Create an Atlas cluster.
2. Create a database user.
3. Allow Render outbound IPs or temporarily allow `0.0.0.0/0`.
4. Copy connection string into `MONGO_URI`.

## 2. Prepare Cloudinary

Collect:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 3. Render Backend Deployment

1. Push repository to GitHub.
2. In Render, create a **Web Service** from the repo.
3. Set service root to `Backend`.
4. Use:
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
   - `JWT_EXPIRES_IN=15m`
   - `JWT_REFRESH_SECRET=...`
   - `JWT_REFRESH_EXPIRES_IN=7d`
   - `CLOUDINARY_CLOUD_NAME=...`
   - `CLOUDINARY_API_KEY=...`
   - `CLOUDINARY_API_SECRET=...`

## 4. Frontend Environment

Set in `Frontend/.env`:

- `EXPO_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api`

## 5. Production Sanity Checks

1. `POST /api/auth/login` returns access and refresh tokens.
2. `GET /api/auth/me` works with bearer token.
3. Admin login can call `GET /api/admin/dashboard`.
4. Provider NIC upload works via Cloudinary.
5. Public service list returns active approved provider services.

## 6. Database Backups

- Enable Atlas automated backups (daily snapshots).
- If using Atlas free tier, schedule periodic JSON exports with a cron/CI job.
- Test restore process at least once before release.

## 7. Logging and Runtime Notes

- Keep `NODE_ENV=production` in Render.
- Never commit `.env` files.
- Rotate JWT secrets if accidentally exposed.
