# Blue Whale V0.25 Installation

Target baseline: the current GitHub `main` after V0.21.

## 1. Apply files

PowerShell:

```powershell
.\install.ps1 "C:\path\to\bluewhale-sourcing"
```

## 2. Run migration

In Supabase SQL Editor run:

```text
supabase/bluewhale_v025_enterprise.sql
```

This adds:
- business_documents
- integration_connections
- integration_events
- audit_logs

Existing V0.21 tables are not removed.

## 3. Optional MES environment

Do NOT configure these until you have a real MES endpoint:

```env
MES_API_BASE_URL=
MES_API_TOKEN=
```

Without them the Integration page intentionally reports that the MES adapter is reserved but not configured.

## 4. Existing environment

Keep all V0.21 Supabase, Workspace and AI variables unchanged.

## 5. Restart

```powershell
Ctrl+C
npm run dev
```

## 6. Test

1. `/workspace` -> switch 中文 / EN.
2. Dashboard -> counts render.
3. Documents -> create a quotation.
4. Open PDF / Print -> browser print view opens.
5. Excel -> `.xls` downloads and opens in Excel.
6. Integrations -> MES shows reserved/not configured.
7. AI Copilot -> ask “调出现在的数据库”.
   Expected: compact counts first, not a full PII/database dump.
8. Ask “有哪些供应商？”.
   Expected: supplier context only.
9. Run `npm run build` before production deployment.

## Production note

The V0.21 single-admin key remains suitable for demonstration/internal pilot use, not a large multi-user enterprise deployment. A customer implementation should add SSO/RBAC, approval workflows, tenant isolation, observability and vendor-specific MES mappings.
