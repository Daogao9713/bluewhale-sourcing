# Blue Whale V0.25 · Enterprise Public Platform

V0.25 moves Blue Whale OS from a sourcing demo toward a sellable general-purpose enterprise operations foundation.

## Workspace i18n
- Dashboard and all primary Workspace navigation now switch between Chinese and English.
- Language choice is persisted locally.

## Enterprise documents
- New `business_documents` model.
- Quotation, Contract, Purchase Order and Report drafts.
- Printable HTML output designed for browser "Save as PDF".
- Excel-compatible `.xls` export without adding a heavy spreadsheet runtime dependency.
- Audit trail foundation.

## Integration gateway
- New integration registry for MES / ERP / WMS / CRM / Webhook / custom adapters.
- Reserved HTTP JSON MES adapter.
- `/api/workspace/integrations` reports configured connectors and MES health.
- No vendor-specific MES schema is hard-coded into the core platform.

## AI optimization
The V0.21 Copilot loaded up to 40 projects, 60 suppliers, 60 RFQs and 30 inquiries on every request, then serialized large JSON into the prompt.
V0.25 changes this to:
1. count-only global snapshot,
2. intent detection,
3. fetch only relevant modules,
4. explicit field selection,
5. smaller record limits,
6. shorter conversation history,
7. 700-token normal output budget,
8. no email/phone disclosure by default.

This makes the public edition safer and more scalable while leaving room for enterprise RAG/vector search later.

## Positioning
V0.25 is a public/general edition. Customer-specific MES mappings, approval chains, accounting rules, permissions, SSO and data warehouse optimization remain implementation work for each enterprise.
