# Blue Whale V0.21 · Workspace Auth Stabilization

This is a focused stabilization release intended to make tonight's V0.20 stack run end-to-end.

## Fixed

- Workspace APIs can authenticate with an HttpOnly same-origin cookie.
- Existing `x-admin-key` authentication remains compatible.
- Existing `sessionStorage.bluewhale_admin_key` is automatically migrated into the cookie when the Workspace opens.
- `/api/workspace`, Company News admin APIs, and `/api/agent` share the same `verifyWorkspaceKey()` boundary.
- Added `/api/workspace/auth` login/session/logout endpoint.
- Added same-origin credentials to Workspace client requests.
- Added Next.js `data-scroll-behavior="smooth"` hint to the root HTML element when the layout is present.

## Why

V0.20 exposed a client/server authentication mismatch:

```text
/workspace -> 200
/api/workspace -> 401
/api/workspace/news -> 401
```

The page itself is public-renderable, but its protected APIs require `BLUEWHALE_ADMIN_KEY`.
V0.21 makes the authenticated session browser-native instead of depending on every request remembering a custom header.

## Security scope

This remains a single-admin V0.x authentication system. The cookie is HttpOnly, SameSite=Lax and Secure in production. The configured admin key itself is used as the session credential for compatibility and simplicity. Before multi-user production use, replace this with signed/opaque sessions and user accounts.
