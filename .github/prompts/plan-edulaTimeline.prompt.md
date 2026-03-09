# Plan: Edula (Timeline) — Assessment & Implementation Roadmap

## TL;DR

Edula is TesoTunes's platform-wide activity feed — a "Facebook News Feed" for everything happening on the platform. The **backend architecture is well-designed** (FeedItem model, FeedService with ranking/diversity, ActivityService, observers) but the **core value proposition — auto-aggregating platform events into a unified feed — is barely wired up**. Currently Edula works as a user-generated posting system (Twitter-like), but only 3 of 11+ modules actually generate feed items. The recommended approach: register missing observers, add new observers per module, and populate `feed_items` table from platform events — then refine the frontend to display heterogeneous feed content.

---

## Assessment

### What's Built (Wins)

#### Backend (tesotunes-api)
| Component | Status | Notes |
|-----------|--------|-------|
| `FeedItem` model + migration | ✅ Complete | Comprehensive schema with actor, subject (polymorphic), media, engagement, ranking, tags, visibility |
| `Activity` model + migration | ✅ Complete | Logs user actions with polymorphic subject |
| `Post` model + CRUD | ✅ Complete | User-generated posts with media, privacy, likes, comments, shares, reposts |
| `FeedService` | ✅ Complete | Builder pattern, module filtering, preset feeds (forYou, following, discover, music, events, awards), caching, ranking |
| `FeedRankingService` | ✅ Complete | Composite scoring: recency (0.35), relevance (0.25), engagement (0.15), diversity (0.10), personalization (0.10), prestige (0.05) |
| `ContentDiversityService` | ✅ Complete | Prevents clustering, round-robin interleaving, max 3 items per artist |
| `FeedPreferenceService` | ✅ Complete | Not-interested, hidden, saved |
| `FeedAnalyticsService` | ✅ Complete | View/click/engagement tracking, A/B testing |
| `ActivityService` | ✅ Complete | Activity logging with privacy, cache management |
| `FeedItem` DTO | ✅ Complete | Clean transformation layer |
| `FeedController` | ✅ Complete | All endpoints: main feed, for-you, following, trending, discover, module, preferences, analytics |
| `PostController` | ✅ Complete | Full CRUD + like/unlike/bookmark/repost/comments |
| Routes | ✅ Complete | social.php, posts.php, engagement.php all included |
| `SongObserver` | ✅ Registered | Logs: uploaded_song, distributed_song, featured_song |
| `EventObserver` | ✅ Registered | Logs: created event |
| `LikeObserver` | ✅ Registered | Logs: liked_* with polymorphic support |
| `AwardVoteObserver` | ✅ Registered | Logs award votes |
| DB Indexes | ✅ Migrated | feed_items indexed on (module, published_at), (visibility, published_at), (actor_id, published_at) |

#### Frontend (tesotunes-next-web)
| Component | Status | Notes |
|-----------|--------|-------|
| Edula routes | ✅ Complete | /edula, /following, /trending, /discover, /announcements, /[postId] |
| Layout | ✅ Complete | 3-column: nav sidebar, main content, trending+suggested users sidebar |
| PostCard | ✅ Complete | Renders posts with all media types (image, video, song, album), actions, trending badges |
| CreatePostComposer | ✅ Complete | Text + media upload + visibility selector |
| TrendingSidebar | ✅ Complete | Shows trending topics |
| WhoToFollow | ✅ Complete | Suggested users with follow/unfollow |
| useFeed hooks | ✅ Complete | 20+ React Query hooks: feed, posts, comments, follow, preferences |
| useSocial hooks | ✅ Complete | Polymorphic comments/likes/follows |
| Types | ✅ Complete | edula.ts + social.ts with all interfaces |
| API client | ✅ Complete | Axios with auth, interceptors, form uploads |
| social-api | ✅ Complete | Polymorphic comments/likes/follows API |

### What's Broken / Missing (Gaps)

#### Critical Backend Gaps
1. **FeedItemFactory & TransformerRegistry are STUBS** — Both files are empty `__call()` stubs. No system events are being transformed into feed items.
2. **Only 3/11 modules log activities** — Song, Event, Like observers work. Everything else (Store, SACCO, Loyalty, Forums, Podcasts, Campaigns, Polls, Promotions) has ZERO activity logging.
3. **3 observers exist but NOT REGISTERED** — `UserFollowObserver`, `CommentObserver`, `ShareObserver` are built but commented out in AppServiceProvider.
4. **Feed items table is EMPTY** — No system events populate `feed_items`. The feed only shows user-generated Posts.
5. **UserSocialController.php is MISSING** — Referenced in routes/api/posts.php for follow/unfollow but doesn't exist. Follow/unfollow likely broken.
6. **No bridge from Activity → FeedItem** — Activities are logged but never converted to FeedItems. The two systems run independently.
7. **System activity logging silently skipped** — `ActivityService::logSystem()` has a guard that returns early since system activities have no user_id.

#### Frontend Gaps
8. **Feed only renders Posts** — The frontend PostCard component only handles the `Post` shape. It doesn't render `FeedItem` DTOs (system events like "Artist X uploaded a new song").
9. **No FeedItem card component** — Missing a component to render system-generated feed items (song releases, event creations, store purchases, etc.).
10. **No real-time updates** — Manual refresh only (no WebSocket/SSE/polling).
11. **No saved posts page** — Bookmarked posts have no collection view.
12. **No "who liked this" list** — Missing modal showing users who liked a post.

#### Data Flow Gap (The Core Problem)
```
CURRENT STATE (broken):
  Platform Events → Observers → ActivityService → Activity table → (dead end)
  Users → PostController → Post table → FeedController → Frontend ✅

DESIRED STATE:
  Platform Events → Observers → ActivityService → FeedItem table ──┐
  Users → PostController → Post table ──────────────────────────────┤
                                                                    ├→ FeedService (merged) → Frontend
```

### Potential Issues

1. **Dual system confusion** — Post + Activity + FeedItem = 3 models storing "feed-like" data. Need to decide: are activities and posts both converted to FeedItems, or does FeedService query all 3 tables?
2. **Performance at scale** — FeedService currently queries both Posts and FeedItems, but with all 11 modules generating events, the feed_items table will grow fast. The indexes are good but pagination needs testing.
3. **N+1 query risk** — FeedController transforms Posts inline with eager loading, but FeedItems use actor/subject morphTo which can cause N+1 queries.
4. **Privacy model inconsistency** — Posts have privacy (public/followers/private), Activities have show_activity flag, FeedItems have visibility (public/members). These need unified treatment.
5. **Observer registration order** — Registering all observers at once may cause cascading activity logs (e.g., liking a song creates a Like → LikeObserver logs activity → ActivityObserver creates FeedItem). Need debouncing/deduplication.
6. **Store/SACCO module loading** — Store uses conditional loading (`STORE_ENABLED=true`). Observers need to respect module toggles.

### Viability Assessment

**Is this viable? YES** — with phased approach.

The architecture is solid. The core services (FeedService, FeedRankingService, ContentDiversityService) are production-ready. The main work is **plumbing** — wiring up existing modules to produce FeedItems, and building a frontend component to render them.

**Estimated effort by phase:**
- Phase 1 (Critical fixes): Register existing observers, fix UserSocialController, bridge Activity→FeedItem
- Phase 2 (Module wiring): Add observers/hooks for all 11 modules
- Phase 3 (Frontend): Build FeedItemCard, update feed to display heterogeneous content
- Phase 4 (Polish): Real-time updates, saved posts page, moderation

---

## Implementation Plan

### Phase 1: Fix Critical Plumbing (Backend)

**Goal**: Make the existing infrastructure actually work.

1. **Register missing observers in AppServiceProvider** — Uncomment `UserFollow::observe()`, `Comment::observe()`, `Share::observe()` in `app/Providers/AppServiceProvider.php`
   - Files: `app/Providers/AppServiceProvider.php`
   - Depends on: nothing

2. **Create UserSocialController** — Implement follow/unfollow for users (not just artists)
   - Files: `app/Http/Controllers/Api/UserSocialController.php`
   - Reference: `ArtistFollowController.php` for patterns
   - Depends on: step 1

3. **Build Activity→FeedItem bridge** — When an Activity is created, auto-create a corresponding FeedItem in `feed_items` table
   - Approach: Create `ActivityObserver` that calls a new `FeedItemService::createFromActivity(Activity $activity)` method
   - Files: `app/Observers/ActivityObserver.php`, `app/Services/FeedItemService.php`
   - Alternative: Implement `FeedItemFactory` (currently a stub) to transform Activities→FeedItems
   - Depends on: nothing

4. **Implement FeedItemFactory** — Replace the stub with actual transformation logic
   - Maps activity types to FeedItem shapes (type, module, title, body, media, actor)
   - Files: `app/Feed/FeedItemFactory.php`
   - Depends on: step 3

### Phase 2: Module Event Wiring (Backend)

**Goal**: All 11 modules generate feed items when interesting things happen.

**Can run in parallel per module:**

5. **Music module** (already partially done)
   - Existing: SongObserver logs uploaded_song, distributed_song, featured_song
   - Add: album_released, playlist_created, song_milestone (100/1000/10000 plays)
   - Files: `app/Observers/SongObserver.php`, `app/Observers/AlbumObserver.php`, `app/Observers/PlaylistObserver.php`

6. **Events module** (already partially done)
   - Existing: EventObserver logs event creation
   - Add: ticket_purchased, event_attended, event_checkin, event_cancelled
   - Files: `app/Observers/EventObserver.php`

7. **Store module** — NEW
   - Add: product_purchased, product_reviewed, store_created
   - Files: Create `app/Observers/StoreProductObserver.php`, `app/Observers/OrderObserver.php`
   - Note: Respect `STORE_ENABLED` env toggle

8. **SACCO module** — NEW
   - Add: sacco_joined, loan_taken, loan_repaid, dividend_received, share_purchased
   - Files: Create `app/Observers/Sacco/SaccoMemberObserver.php`, `app/Observers/Sacco/SaccoLoanObserver.php`

9. **Loyalty module** — NEW
   - Add: fan_club_joined, reward_redeemed, points_milestone
   - Files: Create `app/Observers/Loyalty/LoyaltyCardMemberObserver.php`

10. **Awards module** (partially done via AwardVoteObserver)
    - Existing: vote logged
    - Add: nomination_submitted, award_won, season_started
    - Files: `app/Observers/AwardVoteObserver.php`

11. **Forums module** — NEW
    - Add: thread_created, reply_posted, thread_pinned
    - Files: Create `app/Observers/ForumTopicObserver.php`, `app/Observers/ForumReplyObserver.php`

12. **Podcasts module** — NEW
    - Add: episode_published, podcast_milestone
    - Files: Create observer for podcast models

13. **Campaigns/Ojokotau module** — NEW
    - Add: campaign_created, campaign_funded, campaign_milestone
    - Files: Create observer for campaign models

14. **Polls module** — Already has PollObserver (needs registration check)
    - Add: poll_created, poll_ended
    - Files: `app/Observers/PollObserver.php`

15. **Promotions module** — NEW
    - Add: promotion_started, promotion_featured
    - Files: Create observer or hook into existing promotion logic

### Phase 3: Frontend Feed Rendering

**Goal**: Display heterogeneous feed content (not just user posts).

16. **Create FeedItemCard component** — Renders system-generated events distinctly from user posts
    - Different layouts per type: song_release (with audio player), event_created (with date/venue), store_purchase, milestone (with celebration badge)
    - Files: `src/components/edula/feed-item-card.tsx`
    - Reference: PostCard for interaction patterns
    - Depends on: Phase 1 (backend produces FeedItems)

17. **Update Edula feed page** — Merge Posts and FeedItems into unified feed
    - Update `useFeed` to handle mixed content types
    - Render PostCard for user posts, FeedItemCard for system events
    - Files: `src/app/(app)/edula/page.tsx`, `src/hooks/useFeed.ts`
    - Depends on: step 16

18. **Add module filter tabs/chips** — Let users filter feed by module (music, events, store, etc.)
    - Files: `src/app/(app)/edula/layout.tsx` or new filter component

19. **Update types** — Extend edula.ts with FeedItem DTO shape matching backend's FeedItemDTO
    - Files: `src/types/edula.ts`
    - Depends on: nothing (can be done early)

### Phase 4: Polish & Enhancements

20. **Saved posts page** — View bookmarked/saved items
21. **Real-time feed updates** — WebSocket or polling for new items
22. **"Who liked this" modal** — Show list of users who liked a post/item
23. **Comment moderation** — Admin approve/reject workflow
24. **@mentions & hashtags** — In posts and comments
25. **Feed preference learning** — Improve not-interested → ranking adjustments

---

## Relevant Files

### Backend (tesotunes-api)
- `app/Providers/AppServiceProvider.php` — Register missing observers (UserFollow, Comment, Share + new ones)
- `app/Services/FeedService.php` — Already complete, queries FeedItem + Post
- `app/Services/ActivityService.php` — Activity logging, needs Activity→FeedItem bridge
- `app/Http/Controllers/Api/FeedController.php` — Already merges Posts + FeedItems
- `app/Models/FeedItem.php` — Complete with toDTO()
- `app/Models/Activity.php` — Complete
- `app/Models/Post.php` — Complete with CRUD helpers
- `app/Feed/FeedItemFactory.php` — STUB, needs implementation
- `app/Feed/TransformerRegistry.php` — STUB, needs implementation
- `app/DTOs/Feed/FeedItem.php` — Complete DTO
- `app/Observers/SongObserver.php` — Active, expand for milestones
- `app/Observers/EventObserver.php` — Active, expand for tickets/attendance
- `app/Observers/LikeObserver.php` — Active
- `app/Observers/CommentObserver.php` — Built, NOT registered
- `app/Observers/ShareObserver.php` — Built, NOT registered
- `app/Observers/UserFollowObserver.php` — Built, NOT registered
- `routes/api/social.php` — Social routes
- `routes/api/posts.php` — Post routes (references missing UserSocialController)
- `database/migrations/2026_02_23_123458_fix_feed_items_table_schema.php` — Feed items schema

### Frontend (tesotunes-next-web)
- `src/app/(app)/edula/page.tsx` — Main feed page
- `src/app/(app)/edula/layout.tsx` — Layout with sidebars
- `src/components/edula/post-card.tsx` — Post rendering (needs FeedItem sibling)
- `src/components/edula/create-post-composer.tsx` — Post creation
- `src/hooks/useFeed.ts` — Feed hooks (needs FeedItem type handling)
- `src/types/edula.ts` — Types (needs FeedItem DTO type)
- `src/lib/api.ts` — API client
- `src/lib/social-api.ts` — Social API client

### Documentation
- `EDULA_CONSOLIDATED_DOCUMENTATION.md` — Full feature guide (900+ lines)
- `EDULA_SOCIAL_SYSTEMS_AUDIT_AND_REBUILD.md` — Audit findings (2200+ lines)

---

## Verification

1. **Backend**: After Phase 1, run `php artisan tinker` → create a song → verify FeedItem appears in feed_items table
2. **Backend**: After Phase 2, verify each module generates feed items: `FeedItem::where('module', 'store')->count()` etc.
3. **Frontend**: After Phase 3, load /edula and verify mixed content (user posts + system events) renders correctly
4. **E2E**: Artist uploads song → verify it appears in Edula feed for followers
5. **E2E**: User purchases store item → verify it appears in Edula feed
6. **Performance**: Load test feed endpoint with 10K+ feed items, verify response < 500ms
7. **API contract**: `GET /api/feed` returns both Posts and FeedItems in unified shape
8. **Observer registration**: `php artisan about` → verify all observers listed
9. **Security**: All Edula routes require `auth:sanctum` except public post listing and share views

## Decisions

- **FeedItem as single source**: All displayable feed content should eventually be in `feed_items` table. Posts create a FeedItem on creation. Activities create a FeedItem via observer. This gives FeedService one table to query + rank.
- **UserSocialController**: Needs to be created since posts.php routes reference it for user follow/unfollow. Pattern should match ArtistFollowController.
- **Module conditional loading**: Store/SACCO observers should only register when their modules are enabled via env.
- **System event aggregation first**: Per user preference, focus on wiring modules to generate feed items before polishing the user-post experience.
- **All 11 modules + polls + promotions**: Per user preference, all modules should feed into Edula.

## Further Considerations

1. **Activity→FeedItem vs Direct FeedItem creation**: Should observers create Activities (which then auto-create FeedItems), or should observers create FeedItems directly? Recommendation: **Direct FeedItem creation** via `FeedItemService::create()` — simpler, avoids double writes. Keep Activity table for audit/history only.
2. **Feed deduplication**: If a user uploads a song AND the song gets auto-published, two feed items may be created. Need a deduplication strategy (e.g., unique constraint on subject_type + subject_id + type within a time window).
3. **Privacy for module events**: Store purchases and SACCO loans are sensitive. Recommendation: Default visibility for financial modules to `private` unless user opts in to sharing.
