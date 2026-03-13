# Frontend Runtime Audit

Updated: March 13, 2026

## Active Runtime

- Framework: Next.js App Router
- Auth: NextAuth session + server-side backend proxy
- Data layer: Axios shared client + React Query
- Realtime: Echo/Pusher stack remains active
- Testing: Jest + TypeScript type-check

## Removed Legacy Runtime Luggage

- Vue packages removed
- Inertia packages removed
- Alpine packages removed
- Laravel Vite bridge packages removed
- Remaining Vite-only tooling removed (`vite`, `@tailwindcss/vite`, `vite-plugin-compression2`)

## Runtime Observations

- The main browser/API boundary is now the Next.js proxy route rather than direct browser-to-Laravel token traffic.
- Generated frontend artifacts were previously leaking into source control and are now ignored again.
- Direct request usage is reduced, but a few feature pages still build request payloads locally instead of through shared helpers.
- Media flows now have shared multipart helpers for artist and admin song/album contracts, but a few non-media pages still submit local request payloads inline.

## Phase 4 Focus Areas

1. Reduce ad hoc request logic in page components.
2. Keep multipart field mapping centralized for artist/media flows.
3. Separate true integration tests from UI-level tests more cleanly.
4. Review root-level scratch docs for removal or archive.

## Related Docs

- `FRONTEND_FETCH_AUDIT.md`
- `FRONTEND_MEDIA_ALIGNMENT_AUDIT.md`
