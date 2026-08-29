# Blue Whale V0.12 Frontend Upgrade

This package is intended to be installed **after V0.1 / Sourcing OS**.

It changes the public website only. It does not replace:

- `/workspace`
- `/api/workspace`
- `/api/agent`
- `/api/inquiry`
- existing Supabase schema
- existing Resend integration

## Recommended branch

```bash
git checkout -b frontend/v0.12-company-site
```

## Windows

From this package directory:

```powershell
.\install.ps1 "C:\path\to\bluewhale-sourcing"
```

## macOS / Linux

```bash
chmod +x install.sh
./install.sh /path/to/bluewhale-sourcing
```

## Build

No new dependencies are required.

```bash
npm install
npm run build
npm run dev
```

## Check these URLs

- `/`
- `/about`
- `/business`
- `/business/sourcing`
- `/technology`
- `/contact`
- `/inquiry`
- `/workspace`

## Notes

The contact page intentionally does not hard-code company email, phone or address because those values were not part of the current repository data reviewed for this upgrade.

Add verified corporate contact details in a later frontend release once finalized.
