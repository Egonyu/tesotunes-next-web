# Public URL and slug audit

Audited on 2026-09-22 against the Next.js App Router tree and link generation in `src/`.

## Inventory

There are **67 dynamic page routes**:

| Route area         | Dynamic pages | SEO relevance                                              |
| ------------------ | ------------: | ---------------------------------------------------------- |
| Admin              |            26 | Private application screens; keep stable numeric IDs       |
| Artist dashboard   |             5 | Authenticated application screens; keep stable numeric IDs |
| Public application |            36 | Review for indexability and canonical URLs                 |

Of the 36 public dynamic routes, **15 declare an ID, UUID, token, order number, or code parameter** instead of a slug parameter. Ten are checkout, ticket, invitation, order, promotion-request, promoter, or SACCO workflows. Those should be `noindex` and retain opaque identifiers.

## SEO migration scope

Six public entity families currently expose database IDs in discoverable links and should move to canonical slugs:

1. Events: `/events/{id}`
2. Podcasts: `/podcasts/{id}`
3. Podcast episodes: `/podcasts/{id}/episodes/{episodeId}`
4. Polls: `/polls/{id}`
5. Edula posts: `/edula/{postId}`
6. Forum topics: the route is named `[topic]`, but callers pass `topic.id`

Events are the highest priority because `src/app/sitemap.ts` currently publishes `/events/{id}`, and event cards link to the same numeric URL.

## Existing slug routes that can still emit IDs

Artists, albums, songs, genres, playlists, and loyalty clubs use expressions such as `entity.slug || entity.id`. A missing database slug therefore creates a second numeric URL shape. Backfill missing slugs and stop returning public records without a slug before removing these fallbacks.

## Migration contract

For each entity family:

1. Add a unique indexed slug in the API database and backfill it deterministically.
2. Return the slug from list, search, recommendation, and detail endpoints.
3. Resolve both ID and slug during migration.
4. Permanently redirect an ID request to the slug URL.
5. Emit only slug URLs from cards, sharing, structured data, Open Graph metadata, canonicals, and the sitemap.
6. Add a regression test covering ID redirect, canonical metadata, and sitemap output.

Admin URLs such as `/admin/users/166` should remain ID based. They are private operational routes and gain no SEO value from a slug.
