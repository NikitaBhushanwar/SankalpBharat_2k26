# Sankalp Bharat 2K26

Official Sankalp Bharat 2K26 website and admin panel.

This project contains:
- Public website pages (home, leaderboard, winners, problem statements, policy pages)
- Admin dashboard for managing content
- Database-backed APIs using Supabase
- Session-based admin authentication

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)

## High-Level Architecture

1. Public UI pages fetch data from Next.js API routes.
2. API routes access Supabase using server-side service role credentials.
3. Admin login creates a signed, HTTP-only session cookie.
4. Admin-protected API routes validate that session server-side.
5. Publish-state controls decide whether certain public data is shown live.

## Project Structure

```text
.
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── problem-statements/
│   ├── api/
│   │   ├── admin-auth/
│   │   ├── admin-users/
│   │   ├── leaderboard/
│   │   ├── winners/
│   │   ├── problem-statements/
│   │   └── publish-state/
│   ├── leaderboard/
│   ├── winners/
│   ├── problem-statements/
│   ├── about-event/
│   ├── contact-us/
│   ├── rules-guidelines/
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── context/
├── lib/
├── public/
├── styles/
├── supabase/
│   └── schema.sql
├── package.json
└── README.md
```

## Folder Responsibilities

- `app/`: App Router pages and API routes.
- `app/api/*`: backend logic (data access, auth/session checks).
- `components/`: UI building blocks.
- `context/`: client-side auth/theme providers.
- `lib/`: shared server/client helpers (Supabase client, password/session utilities).
- `supabase/schema.sql`: full DB schema, idempotent setup script.

## Database Model

Core tables used:
- `leaderboard_entries`
- `winners`
- `problem_statements`
- `publish_state`
- `admin_users`

Schema source:
- [supabase/schema.sql](supabase/schema.sql)

`schema.sql` uses `if not exists` and `add column if not exists`, so it is safe to rerun.

## Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SESSION_SECRET=
ADMIN_PASSWORD_ENCRYPTION_KEY=
PRIMARY_SUPER_ADMIN_EMAIL=
```

Variable usage:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only DB access key.
- `ADMIN_SESSION_SECRET`: secret used to sign admin session cookies.
- `ADMIN_PASSWORD_ENCRYPTION_KEY`: encryption key used by password-visibility feature.
- `PRIMARY_SUPER_ADMIN_EMAIL`: email of the immutable primary super admin account.

Security rules:
- Never commit `.env.local`.
- Never put service role key in client-side code.
- Use different secrets for dev and production.
- Rotate secrets immediately if leaked.

## Local Development Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure `.env.local` (see above).

3. Create DB tables:
   - Open Supabase SQL Editor
   - Run [supabase/schema.sql](supabase/schema.sql)

4. Start development server:

```bash
pnpm dev
```

5. Open app:
- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Scripts

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm start    # Run production build
pnpm lint     # Lint project
```

## API Overview

### Public read APIs
- `GET /api/leaderboard`
- `GET /api/winners`
- `GET /api/problem-statements`
- `GET /api/publish-state`

### Admin auth/session APIs
- `POST /api/admin-auth/login`
- `GET /api/admin-auth/session`
- `POST /api/admin-auth/logout`
- `POST /api/admin-auth/change-password`

### Admin management APIs
- `GET /api/admin-users`
- `POST /api/admin-users`
- `PUT /api/admin-users/[id]`
- `DELETE /api/admin-users/[id]`

### Admin-protected content mutation APIs
- `POST /api/leaderboard`
- `PUT/DELETE /api/leaderboard/[id]`
- `POST /api/winners`
- `PUT/DELETE /api/winners/[id]`
- `POST /api/problem-statements`
- `PUT/DELETE /api/problem-statements/[id]`
- `PUT /api/publish-state`

## Authentication & Authorization Flow

1. Admin logs in from `/admin/login`.
2. `POST /api/admin-auth/login` validates credentials against `admin_users`.
3. On success, server sets a signed HTTP-only cookie.
4. Protected APIs verify that cookie server-side.
5. Access rules:
   - Admin session required for create/update/delete operations.
   - Super-admin role required for admin-user management endpoints.
   - Primary super-admin invariants are enforced in backend logic.

## Admin System Notes

- Admin account data is stored in `admin_users`.
- Password hashing is used for login validation.
- Password visibility feature depends on encrypted value storage.
- If an older admin row has no encrypted password value, UI may show “Not available” until password is updated or logged in again (depending on route behavior).

## Security Checklist

For production, ensure all are true:
- RLS enabled on Supabase tables.
- No permissive anonymous write policies.
- Service role key used only in server routes.
- HTTPS enabled (required for secure cookies).
- Strong random values for session/encryption secrets.
- Admin operations audited in logs.

## Deployment Notes

- Add all required environment variables in host dashboard.
- Deploy with HTTPS only.
- Re-run [supabase/schema.sql](supabase/schema.sql) when schema changes.
- Verify admin login/session after each deploy.

### One-command College Server Redeploy

This repository includes an automation script for your college server deployment.

Command:

```bash
pnpm deploy:college
```

Behavior:
- Prompts for server password (or uses `DEPLOY_PASSWORD` env var).
- Uploads project to `/var/www/sankalpbharat.stvincentngp.edu.in/app`.
- Runs `npm install` + `npm run build` on server.
- Restarts PM2 process `sankalpbharat` on port `3001`.
- Verifies `/api/health` after restart.

Optional overrides:

```bash
DEPLOY_HOST=117.239.42.27 \
DEPLOY_USER=sanbha \
DEPLOY_APP_DIR=/var/www/sankalpbharat.stvincentngp.edu.in/app \
DEPLOY_APP_NAME=sankalpbharat \
DEPLOY_APP_PORT=3001 \
pnpm deploy:college
```

## Troubleshooting

### 1) “Invalid email or password” for known admin
- Confirm `admin_users` contains that email.
- Check if `is_active = true`.
- Reset password from admin flow if needed.

### 2) Admin API returns unauthorized/forbidden
- Session cookie may be missing/expired.
- Log out and log in again.
- Confirm role: only super admins can manage admins.

### 3) Public page shows no data
- Check publish state in admin dashboard.
- Verify data exists in corresponding table.

### 4) Build passes but runtime errors occur
- Recheck `.env.local` values.
- Confirm Supabase URL/key belong to the same project.

## Developer Handoff Tips

- Start by reading:
  - [app/api](app/api)
  - [lib](lib)
  - [context/auth-context.tsx](context/auth-context.tsx)
- Keep API permission checks server-side.
- Avoid trusting client-provided identity headers.
- For new admin features, implement API checks first, then UI.
