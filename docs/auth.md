# Authentication

YCSDI uses internal `userId` + bcrypt password accounts stored in MongoDB. The backend issues short-lived JWTs that the frontend attaches to every API call.

## Roles

| Role      | Source                                    |
| --------- | ----------------------------------------- |
| `viewer`  | Not signed in. No DB record.              |
| `student` | Created by admin at registration approval |
| `staff`   | Created by admin                          |
| `admin`   | Seeded via `npm run seed:admin`           |

There is no self-signup for staff or admin. Students self-submit a registration application, but an admin must approve it and issue credentials before the student can log in.

## Backend

- **Model**: `backend/src/models/User.ts` — `userId`, bcrypt `password`, `role`, optional `refId` to a `Student` or `Staff` profile (admins have no profile doc).
- **Login**: `POST /api/v1/auth/login` with `{ userId, password }` returns `{ token, user }`.
- **Current user**: `GET /api/v1/auth/me` (requires `Authorization: Bearer <token>`).
- **Middleware**: `backend/src/middleware/auth.middleware.ts`
  - `requireAuth` — verifies the JWT, loads the live `User` doc from Mongo, and attaches it to `req.user`. Rejects with `401` when missing/invalid.
  - `requireRole(...roles)` — checks `req.user.role`. Rejects with `403` when not allowed.
- **JWT**: signed with `JWT_SECRET`, expires after `JWT_EXPIRES_IN` (default `7d`). Payload is `{ sub: user._id, role }`. The middleware re-reads the User on every request so role/ban changes take effect immediately.

## Frontend

- **Store**: `frontend/src/stores/auth.ts` (zustand + `persist` to localStorage) holds `{ token, user }`.
- **HTTP**: `frontend/src/services/api.ts` axios instance attaches `Authorization: Bearer <token>` via a request interceptor; a response interceptor clears the session on any `401`.
- **Route gating**: `frontend/src/components/auth/RequireAuth.tsx` wraps protected routes. Unauthenticated users are sent to `/login` with their target path stored in `location.state.from`; users with the wrong role are sent home.
- **Login page**: `frontend/src/pages/public/LoginPage.tsx` posts `{ userId, password }`, stores the session, then redirects by role (`admin` → `/admin`, `staff` → `/staff`, `student` → `/student`).

## Seeding the first admin

Without an admin, nobody can approve student registrations. Seed one before bringing the app up the first time:

```bash
# backend/.env must contain ADMIN_USER_ID, ADMIN_PASSWORD, MONGODB_URI, JWT_SECRET
npm run seed:admin --prefix backend
```

The script is idempotent — re-running it does nothing if the admin already exists.

## Required environment

```
JWT_SECRET=             # required; the API refuses to boot without it in production
JWT_EXPIRES_IN=7d       # optional, default 7d
ADMIN_USER_ID=          # only read by seed-admin
ADMIN_PASSWORD=         # only read by seed-admin
```
