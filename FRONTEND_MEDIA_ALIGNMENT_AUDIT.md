# Frontend Media Alignment Audit

Updated: March 13, 2026

## Scope

Focused Phase 4 review of the artist-facing and admin-facing media flows after the auth/session rebuild.

## What Was Aligned

- Artist song create and edit now share a single payload-mapping layer in `src/lib/artist-media-payloads.ts`.
- The artist song edit flow now submits through the shared multipart contract instead of building its own request payload in-page.
- The backend artist song update endpoint now supports the fields the current editor already exposes:
  - `title`
  - `album_id`
  - `genre_id`
  - `featured_artists`
  - `lyrics`
  - `release_date`
  - `price`
  - `is_explicit`
  - `description`
  - `composer`
  - `producer`
  - `is_downloadable`
  - `is_free`
  - `cover` / `cover_image`
- Artist album create/edit now align to a real backend contract for:
  - `title`
  - `description`
  - `release_date`
  - `type`
  - `genre`
  - `cover_image`
- Artist album detail and update endpoints are now present for the existing edit flow.
- Dead artist album "view" links were removed because there is no dedicated album detail page in the Next app yet.
- Admin song create and edit now share a single payload-mapping layer in `src/lib/admin-song-payloads.ts`.
- The backend admin song create/update endpoints now tolerate environment-specific schema drift by persisting only supported `songs` columns while preserving newer fields when the schema provides them.

## Remaining Gaps

- Artist album creation no longer pretends to batch-upload tracks.
  - Track attachment still happens later through the artist song upload flow.
- There is still no dedicated artist album detail page in the Next app.
- Admin media flows use a richer contract than artist flows by design and should stay separate from artist helpers unless we intentionally standardize both surfaces.
- Admin album and any remaining admin media forms still need the same shared-helper cleanup pattern now used for songs.

## Recommended Next Slice

1. Decide whether a dedicated artist album detail page is needed or edit remains the primary destination.
2. Continue reducing ad hoc multipart handling in the remaining media/admin forms.
3. Keep API contract tests around admin/artist media edits aligned with the live schema baseline.
