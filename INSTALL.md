# Blue Whale V0.21 · Workspace Auth Fix

Install this **on top of V0.20**.

No SQL migration is required.

## 1. Confirm environment

`.env.local` must contain:

```env
BLUEWHALE_ADMIN_KEY=your-admin-key
```

Keep the existing Supabase and AI variables.

## 2. Install

Windows PowerShell:

```powershell
.\install.ps1 "C:\path\to\bluewhale-sourcing"
```

## 3. Restart Next.js

Required:

```powershell
Ctrl+C
npm run dev
```

## 4. Open Workspace

Open:

```text
/workspace
```

If your V0.18/V0.20 browser session already contains `bluewhale_admin_key`, V0.21 migrates it to the HttpOnly workspace cookie automatically.

If it does not, use the existing Workspace key entry UI. After the key is saved, refresh `/workspace`.

## 5. Expected CMD result

Healthy:

```text
GET /workspace 200
GET /api/workspace/auth 200
GET /api/workspace 200
POST /api/agent 200
GET /api/workspace/news 200
GET /api/workspace/news/stats 200
```

A single initial `GET /api/workspace/auth 401` is acceptable during migration if the browser has not received a cookie yet. It should then POST the stored key and subsequent protected requests should return 200.

## 6. If it still says Unauthorized

Clear the old browser session and enter the key again:

Browser DevTools -> Application -> Session Storage -> remove `bluewhale_admin_key`

Then reload `/workspace` and enter the exact value from `BLUEWHALE_ADMIN_KEY`.

Also restart Next.js after changing `.env.local`.

## Tonight's stop condition

Stop upgrading when all of these work:

- public homepage
- public News
- public AI Concierge
- `/workspace` data
- Workspace AI Copilot
- `/workspace/news` CMS
- Supabase reads/writes

V0.21 intentionally contains no new product features.
