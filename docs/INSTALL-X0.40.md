# X0.40 Installation

Base: X0.38.

No new SQL is required beyond the X0.38 `xy_cases` migration.

```powershell
.\install-X0.40.ps1 "C:\path\to\xingyueyang-enterprise"
```

Then:
```powershell
Ctrl+C
npm run dev
```

Hard refresh with `Ctrl+F5`.

Verify:
1. Hero contains no AI card or AI overlay.
2. AI launcher is fixed at bottom-right and opens a modal only after click.
3. Homepage includes Solutions, Products, Data Flow, Engineering Cases, News and CTA.
4. News uses compact editorial rows.
5. Scroll sections reveal softly.
6. Mobile AI becomes a compact circular launcher.
7. Run `npm run build` before deployment.

If X0.38 SQL was not previously executed, execute `supabase/xingyueyang_x038.sql` first.
