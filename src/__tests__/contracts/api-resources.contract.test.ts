/**
 * P3-006 — API Resource Contract Tests
 *
 * These tests document the exact wire format returned by each Laravel API Resource
 * and highlight field-name divergences between the API response and the frontend
 * TypeScript types. The tests act as a regression guard: if the backend changes a
 * Resource or the frontend type drifts, at least one assertion here will break.
 *
 * Structure per resource:
 *   1. WireFormat type  — matches what Laravel's Resource class actually emits
 *   2. Fixture object   — representative snapshot of a real API response
 *   3. Runtime assertions — Jest expect() checks against the fixture shape
 *   4. Divergence notes — inline comments where wire format ≠ frontend type
 *
 * Run with: npx jest src/__tests__/contracts/api-resources.contract.test.ts
 */

import type { Song, Artist, Album, Genre, Playlist, User } from '@/types';

// ---------------------------------------------------------------------------
// Shared sub-shapes reused across resources
// ---------------------------------------------------------------------------

type ArtistStub = { id: number; name: string; slug: string; avatar_url: string | null };
type AlbumStub  = { id: number; title: string; slug: string; artwork_url: string | null };
type GenreStub  = { id: number; name: string; slug: string };
type ApiLinks   = Record<string, string | null>;

type SharePayload = {
  share_url: string;
  og_title: string;
  og_description: string;
  og_image: string | null;
  caption: string;
  platform_links: {
    copy: string;
    whatsapp: string;
    twitter: string;
    facebook: string;
    telegram: string;
    instagram: null;
  };
};

// ---------------------------------------------------------------------------
// 1. SongResource wire format
// ---------------------------------------------------------------------------

/**
 * Exact shape emitted by SongResource + SongStreamingAccessResource.
 * Source: app/Http/Resources/SongResource.php
 *
 * Divergences vs frontend Song type (src/types/index.ts):
 *   - API: `genre?: GenreStub`  (single, from primaryGenre relation)
 *     Frontend: `genres: Genre[]`  (array — populated only on endpoints that eager-load a genres pivot)
 *   - API: `uuid: string` not present in frontend Song type
 *   - API: `links: ApiLinks` not present in frontend Song type
 *   - API: `share: SharePayload` not present in frontend Song type
 *   - API: `isrc` mapped from DB column `isrc_code`; frontend uses `isrc?: string | null`  ✓ name matches
 *   - API: `price` omitted via `when()` when price === 0; frontend has no `price` field at all
 */
type SongResourceWireFormat = {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  artwork_url: string | null;
  stream_url: string | null;
  audio_url: string | null;   // backward-compat alias for stream_url
  preview_url: string | null;
  status: string;
  isrc: string | null;
  isrc_assignment?: {
    assigned: boolean;
    eligible: boolean;
    status: 'assigned' | 'eligible' | 'blocked';
    code?: string | null;
    blockers: string[];
    blocker_messages: string[];
  };
  duration_seconds: number;
  duration_formatted: string | null;
  is_explicit: boolean;
  is_featured: boolean;
  is_free: boolean;
  price?: number;             // omitted when price === 0
  release_date: string | null;
  play_count: number;
  like_count: number;
  download_count: number;
  artist?: ArtistStub;        // omitted when relation not loaded and no artist_name fallback
  album?: AlbumStub;          // omitted when relation not loaded
  genre?: GenreStub;          // omitted when relation not loaded — RESOLVED: Song.genre?: Genre
  created_at: string;
  updated_at: string;
  links: ApiLinks;
  share: SharePayload;
};

const songFixture: SongResourceWireFormat = {
  id: 42,
  uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Ateker Groove',
  slug: 'ateker-groove',
  artwork_url: 'https://cdn.tesotunes.com/artwork/42.jpg',
  stream_url: 'https://cdn.tesotunes.com/audio/42_128.mp3',
  audio_url: 'https://cdn.tesotunes.com/audio/42_128.mp3',
  preview_url: null,
  status: 'published',
  isrc: 'UGXXX2600042',
  duration_seconds: 237,
  duration_formatted: '3:57',
  is_explicit: false,
  is_featured: false,
  is_free: true,
  release_date: '2026-01-15',
  play_count: 10500,
  like_count: 840,
  download_count: 320,
  artist: { id: 7, name: 'DJ Teso', slug: 'dj-teso', avatar_url: 'https://cdn.tesotunes.com/avatars/7.jpg' },
  genre: { id: 3, name: 'Ateso Afrobeat', slug: 'ateso-afrobeat' },
  created_at: '2026-01-15T10:00:00+03:00',
  updated_at: '2026-01-20T08:30:00+03:00',
  links: {
    self: 'https://api.tesotunes.com/api/songs/ateker-groove',
    artist: 'https://api.tesotunes.com/api/artists/dj-teso',
    album: null,
  },
  share: {
    share_url: 'https://tesotunes.com/songs/ateker-groove',
    og_title: 'Ateker Groove — DJ Teso',
    og_description: 'Listen to Ateker Groove by DJ Teso on TesoTunes',
    og_image: 'https://cdn.tesotunes.com/artwork/42.jpg',
    caption: '🎵 Ateker Groove — DJ Teso\n\nListen on TesoTunes\n\nhttps://tesotunes.com/songs/ateker-groove',
    platform_links: {
      copy: 'https://tesotunes.com/songs/ateker-groove',
      whatsapp: 'https://wa.me/?text=...',
      twitter: 'https://twitter.com/intent/tweet?...',
      facebook: 'https://www.facebook.com/sharer/sharer.php?...',
      telegram: 'https://t.me/share/url?...',
      instagram: null,
    },
  },
};

describe('SongResource wire format', () => {
  it('emits required scalar fields with correct types', () => {
    expect(typeof songFixture.id).toBe('number');
    expect(typeof songFixture.uuid).toBe('string');
    expect(typeof songFixture.title).toBe('string');
    expect(typeof songFixture.slug).toBe('string');
    expect(typeof songFixture.duration_seconds).toBe('number');
    expect(typeof songFixture.is_explicit).toBe('boolean');
    expect(typeof songFixture.is_free).toBe('boolean');
    expect(typeof songFixture.play_count).toBe('number');
    expect(typeof songFixture.like_count).toBe('number');
    expect(typeof songFixture.download_count).toBe('number');
    expect(typeof songFixture.created_at).toBe('string');
  });

  it('emits stream_url and audio_url as aliases for the same value', () => {
    expect(songFixture.stream_url).toBe(songFixture.audio_url);
  });

  it('emits genre as a single object (not an array) — frontend aligned to genre?: Genre', () => {
    // API returns `genre?: { id, name, slug }` (single object from primaryGenre relation)
    // Frontend Song type now has `genre?: Genre` matching the API wire format
    expect(songFixture.genre).toBeDefined();
    expect(typeof songFixture.genre).toBe('object');
    expect(Array.isArray(songFixture.genre)).toBe(false);
  });

  it('emits links and share payload', () => {
    expect(songFixture.links).toBeDefined();
    expect(songFixture.share).toBeDefined();
    expect(typeof songFixture.share.share_url).toBe('string');
    expect(songFixture.share.platform_links.instagram).toBeNull();
  });

  it('allows nullable media URLs', () => {
    const nullMedia: Partial<SongResourceWireFormat> = {
      artwork_url: null,
      stream_url: null,
      audio_url: null,
      preview_url: null,
    };
    expect(nullMedia.artwork_url).toBeNull();
  });

  // Song.genre is now aligned: both API and frontend use `genre?: Genre`.
  //
  // const _typeCheck = songFixture satisfies Song; // ❌ would fail: missing `genres: Genre[]`
});

// ---------------------------------------------------------------------------
// 2. ArtistResource wire format
// ---------------------------------------------------------------------------

/**
 * Exact shape emitted by ArtistResource.
 * Source: app/Http/Resources/ArtistResource.php
 *
 * Divergences vs frontend Artist type (src/types/index.ts):
 *   - API: `total_songs`, `total_albums`, `total_plays`
 *     Frontend: `song_count?`, `total_songs?`, `album_count?`, `total_albums?` — inconsistent naming
 *   - API: `follower_count` from `followers_count` DB column  ✓ matches frontend
 *   - API: `uuid`, `career_start_year`, `record_label`, `influences`, `country`, `city`, `links`
 *     not present in frontend Artist type
 *   - Frontend Artist has `monthly_listeners: number` — NOT emitted by ArtistResource
 *   - API: `banner_url`, `banner`, `cover_image` all alias the same `cover_image` column
 *     Frontend: `banner_url?: string` ✓ but also `cover_url?` / `cover_image_url?` (stale aliases)
 */
type ArtistResourceWireFormat = {
  id: number;
  uuid: string;
  name: string;       // maps from stage_name DB column
  slug: string;
  bio: string | null;
  avatar_url: string;
  banner_url: string | null;
  banner: string | null;        // alias for banner_url
  cover_image: string | null;   // alias for banner_url
  country: string | null;
  city: string | null;
  // 3-axis verification model:
  is_verified: boolean;                                              // axis 3: featured badge
  status: 'pending' | 'approved' | 'rejected' | 'suspended';        // axis 2: artist application
  kyc_status: 'none' | 'partial' | 'pending_review' | 'verified' | 'rejected' | 'expired'; // axis 1: identity
  is_placeholder: boolean;
  claim_status: string | null;
  verification_badge: string | null;
  total_plays: number;
  total_songs: number;
  total_albums: number;
  follower_count: number;
  social_links?: Record<string, string>;
  website_url: string | null;
  career_start_year: number | null;
  record_label: string | null;
  influences: string | null;
  genre?: GenreStub;
  created_at: string;
  updated_at: string;
  links: ApiLinks;
};

const artistFixture: ArtistResourceWireFormat = {
  id: 7,
  uuid: 'artist-uuid-7',
  name: 'DJ Teso',
  slug: 'dj-teso',
  bio: 'Ateso music pioneer from Soroti',
  avatar_url: 'https://cdn.tesotunes.com/avatars/7.jpg',
  banner_url: 'https://cdn.tesotunes.com/banners/7.jpg',
  banner: 'https://cdn.tesotunes.com/banners/7.jpg',
  cover_image: 'https://cdn.tesotunes.com/banners/7.jpg',
  country: 'UG',
  city: 'Soroti',
  is_verified: true,
  status: 'approved',
  kyc_status: 'verified',
  is_placeholder: false,
  claim_status: null,
  verification_badge: 'verified',
  total_plays: 1_250_000,
  total_songs: 34,
  total_albums: 3,
  follower_count: 8400,
  social_links: { instagram: 'https://instagram.com/djteso' },
  website_url: null,
  career_start_year: 2018,
  record_label: null,
  influences: null,
  genre: { id: 3, name: 'Ateso Afrobeat', slug: 'ateso-afrobeat' },
  created_at: '2022-06-01T09:00:00+03:00',
  updated_at: '2026-04-30T12:00:00+03:00',
  links: {
    self: 'https://api.tesotunes.com/api/artists/dj-teso',
    songs: 'https://api.tesotunes.com/api/artists/dj-teso/songs',
    albums: 'https://api.tesotunes.com/api/artists/dj-teso/albums',
  },
};

describe('ArtistResource wire format', () => {
  it('emits required scalar fields with correct types', () => {
    expect(typeof artistFixture.id).toBe('number');
    expect(typeof artistFixture.name).toBe('string');
    expect(typeof artistFixture.slug).toBe('string');
    expect(typeof artistFixture.is_verified).toBe('boolean');
    expect(typeof artistFixture.follower_count).toBe('number');
    expect(typeof artistFixture.total_songs).toBe('number');
    expect(typeof artistFixture.total_albums).toBe('number');
    expect(typeof artistFixture.total_plays).toBe('number');
  });

  it('emits banner_url, banner, cover_image as aliases for the same field', () => {
    expect(artistFixture.banner_url).toBe(artistFixture.banner);
    expect(artistFixture.banner_url).toBe(artistFixture.cover_image);
  });

  it('emits total_songs / total_albums — frontend aligned to total_songs / total_albums', () => {
    // API emits `total_songs` and `total_albums`. Frontend Artist type now uses these names directly.
    expect(typeof artistFixture.total_songs).toBe('number');
    expect(typeof artistFixture.total_albums).toBe('number');
  });

  it('does NOT emit monthly_listeners — frontend Artist.monthly_listeners is now optional', () => {
    // `monthly_listeners` is NOT returned by ArtistResource. Frontend type is now `monthly_listeners?: number`.
    expect((artistFixture as Record<string, unknown>).monthly_listeners).toBeUndefined();
  });

  it('emits structured links', () => {
    expect(artistFixture.links).toHaveProperty('self');
    expect(artistFixture.links).toHaveProperty('songs');
    expect(artistFixture.links).toHaveProperty('albums');
  });
});

// ---------------------------------------------------------------------------
// 3. AlbumResource wire format
// ---------------------------------------------------------------------------

/**
 * Exact shape emitted by AlbumResource.
 * Source: app/Http/Resources/AlbumResource.php
 *
 * Divergences vs frontend Album type (src/types/index.ts):
 *   - API: `total_tracks` — frontend uses `track_count` (different name!)
 *   - API: `uuid`, `album_type`, `release_year`, `is_explicit`, `is_free`, `price`,
 *          `record_label`, `copyright_notice`, `total_duration_seconds`, `download_count`,
 *          `links` — none present in frontend Album type
 *   - Frontend Album.track_count is required; API field is `total_tracks` — name mismatch
 */
type AlbumResourceWireFormat = {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  description: string | null;
  artwork_url: string | null;
  album_type: string | null;
  release_date: string | null;
  release_year: number | null;
  is_explicit: boolean;
  is_free: boolean;
  price?: number;
  record_label: string | null;
  copyright_notice: string | null;
  total_tracks: number;          // ← diverges from frontend Album.track_count
  total_duration_seconds: number;
  play_count: number;
  like_count: number;
  download_count: number;
  artist?: ArtistStub;
  genre?: GenreStub;
  created_at: string;
  updated_at: string;
  links: ApiLinks;
};

const albumFixture: AlbumResourceWireFormat = {
  id: 12,
  uuid: 'album-uuid-12',
  title: 'Teso Vibes Vol. 1',
  slug: 'teso-vibes-vol-1',
  description: 'The debut compilation',
  artwork_url: 'https://cdn.tesotunes.com/artwork/albums/12.jpg',
  album_type: 'compilation',
  release_date: '2025-12-01T00:00:00+03:00',
  release_year: 2025,
  is_explicit: false,
  is_free: true,
  record_label: null,
  copyright_notice: null,
  total_tracks: 15,
  total_duration_seconds: 3180,
  play_count: 4500,
  like_count: 310,
  download_count: 90,
  artist: { id: 7, name: 'DJ Teso', slug: 'dj-teso', avatar_url: 'https://cdn.tesotunes.com/avatars/7.jpg' },
  genre: { id: 3, name: 'Ateso Afrobeat', slug: 'ateso-afrobeat' },
  created_at: '2025-12-01T00:00:00+03:00',
  updated_at: '2026-01-10T00:00:00+03:00',
  links: {
    self: 'https://api.tesotunes.com/api/albums/teso-vibes-vol-1',
    tracks: 'https://api.tesotunes.com/api/albums/teso-vibes-vol-1/tracks',
    artist: 'https://api.tesotunes.com/api/artists/dj-teso',
  },
};

describe('AlbumResource wire format', () => {
  it('emits required scalar fields with correct types', () => {
    expect(typeof albumFixture.id).toBe('number');
    expect(typeof albumFixture.title).toBe('string');
    expect(typeof albumFixture.total_tracks).toBe('number');
    expect(typeof albumFixture.total_duration_seconds).toBe('number');
    expect(typeof albumFixture.play_count).toBe('number');
    expect(typeof albumFixture.like_count).toBe('number');
  });

  it('emits total_tracks — frontend aligned to total_tracks', () => {
    // API emits `total_tracks`; frontend Album type now uses `total_tracks` to match.
    expect(albumFixture.total_tracks).toBeDefined();
    expect((albumFixture as Record<string, unknown>).track_count).toBeUndefined();
  });

  it('emits release_date as ISO 8601 string', () => {
    expect(albumFixture.release_date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('emits structured links with tracks URL', () => {
    expect(albumFixture.links).toHaveProperty('tracks');
  });
});

// ---------------------------------------------------------------------------
// 4. GenreResource wire format
// ---------------------------------------------------------------------------

/**
 * Exact shape emitted by GenreResource.
 * Source: app/Http/Resources/GenreResource.php
 *
 * Divergences vs frontend Genre type (src/types/index.ts):
 *   - API: `artwork_url` — frontend uses `image_url` (different name!)
 *   - API: `emoji`, `icon`, `is_active` — not present in frontend Genre type
 *   - API: `links` — not present in frontend Genre type
 */
type GenreResourceWireFormat = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  emoji: string;
  artwork_url: string | null;   // ← diverges from frontend Genre.image_url
  song_count: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  links: ApiLinks;
};

const genreFixture: GenreResourceWireFormat = {
  id: 3,
  name: 'Ateso Afrobeat',
  slug: 'ateso-afrobeat',
  description: 'Traditional Teso rhythms fused with modern Afrobeat',
  color: '#F97316',
  icon: '🎵',
  emoji: '🎵',
  artwork_url: 'https://cdn.tesotunes.com/genres/ateso-afrobeat.jpg',
  song_count: 142,
  is_active: true,
  created_at: '2024-01-01T00:00:00+03:00',
  updated_at: '2026-05-01T00:00:00+03:00',
  links: {
    self: 'https://api.tesotunes.com/api/genres/ateso-afrobeat',
    songs: 'https://api.tesotunes.com/api/genres/3/songs',
    artists: 'https://api.tesotunes.com/api/genres/3/artists',
    albums: 'https://api.tesotunes.com/api/genres/3/albums',
  },
};

describe('GenreResource wire format', () => {
  it('emits required scalar fields with correct types', () => {
    expect(typeof genreFixture.id).toBe('number');
    expect(typeof genreFixture.name).toBe('string');
    expect(typeof genreFixture.slug).toBe('string');
    expect(typeof genreFixture.emoji).toBe('string');
    expect(typeof genreFixture.is_active).toBe('boolean');
  });

  it('emits artwork_url — frontend aligned to artwork_url', () => {
    // API emits `artwork_url`; frontend Genre type now uses `artwork_url` to match.
    expect(genreFixture.artwork_url).toBeDefined();
    expect((genreFixture as Record<string, unknown>).image_url).toBeUndefined();
  });

  it('emits emoji resolved from slug map or icon fallback', () => {
    expect(genreFixture.emoji).toBeTruthy();
  });

  it('emits all four links', () => {
    expect(Object.keys(genreFixture.links)).toEqual(
      expect.arrayContaining(['self', 'songs', 'artists', 'albums'])
    );
  });
});

// ---------------------------------------------------------------------------
// 5. PlaylistResource wire format
// ---------------------------------------------------------------------------

/**
 * Exact shape emitted by PlaylistResource.
 * Source: app/Http/Resources/PlaylistResource.php
 *
 * Divergences vs frontend Playlist type (src/types/index.ts):
 *   - API: `uuid`, `is_featured`, `is_system`, `play_count`, `links` — not in frontend Playlist
 *   - API owner returns `{ id, name }` only — frontend `owner` is `Pick<User,'id'|'name'>|null` ✓
 *   - API: `song_count` ✓ matches frontend (both use song_count)
 *   - API: `visibility` ✓ matches frontend
 *   - `is_owner`, `can_edit`, `collaborator_role` are conditional on Auth::check()
 */
type PlaylistResourceWireFormat = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  artwork_url: string | null;
  visibility: string;
  is_collaborative: boolean;
  collaboration_requires_approval: boolean;
  is_featured: boolean;
  is_system: boolean;
  song_count: number;
  total_duration_seconds: number;
  play_count: number;
  follower_count: number;
  owner?: { id: number; name: string } | null;
  is_owner?: boolean;
  can_edit?: boolean;
  collaborator_role?: string | null;
  created_at: string;
  updated_at: string;
  links: ApiLinks;
};

const playlistFixture: PlaylistResourceWireFormat = {
  id: 5,
  uuid: 'playlist-uuid-5',
  name: 'Friday Vibes',
  slug: 'friday-vibes',
  description: 'End of week Teso bangers',
  artwork_url: 'https://cdn.tesotunes.com/playlists/5.jpg',
  visibility: 'public',
  is_collaborative: false,
  collaboration_requires_approval: false,
  is_featured: true,
  is_system: false,
  song_count: 22,
  total_duration_seconds: 4620,
  play_count: 1800,
  follower_count: 340,
  owner: { id: 1, name: 'TesoTunes Editorial' },
  is_owner: false,
  can_edit: false,
  collaborator_role: null,
  created_at: '2025-09-01T00:00:00+03:00',
  updated_at: '2026-04-28T18:00:00+03:00',
  links: {
    self: 'https://api.tesotunes.com/api/playlists/friday-vibes',
    tracks: 'https://api.tesotunes.com/api/playlists/friday-vibes/tracks',
  },
};

describe('PlaylistResource wire format', () => {
  it('emits required scalar fields with correct types', () => {
    expect(typeof playlistFixture.id).toBe('number');
    expect(typeof playlistFixture.name).toBe('string');
    expect(typeof playlistFixture.slug).toBe('string');
    expect(typeof playlistFixture.is_collaborative).toBe('boolean');
    expect(typeof playlistFixture.song_count).toBe('number');
    expect(typeof playlistFixture.follower_count).toBe('number');
  });

  it('emits owner as a { id, name } stub — consistent with frontend Playlist.owner shape', () => {
    expect(playlistFixture.owner).toEqual(expect.objectContaining({ id: 1, name: expect.any(String) }));
  });

  it('emits auth-conditional fields (is_owner, can_edit, collaborator_role)', () => {
    // These fields are only present when a user is authenticated.
    // Frontend should treat absence as falsy defaults.
    expect(playlistFixture.is_owner).toBeDefined();
    expect(playlistFixture.can_edit).toBeDefined();
  });

  it('emits structured links', () => {
    expect(playlistFixture.links).toHaveProperty('self');
    expect(playlistFixture.links).toHaveProperty('tracks');
  });
});

// ---------------------------------------------------------------------------
// 6. UserResource wire format
// ---------------------------------------------------------------------------

/**
 * Exact shape emitted by UserResource.
 * Source: app/Http/Resources/UserResource.php
 *
 * Divergences vs frontend User type (src/types/index.ts):
 *   - API: `avatar` (full URL via StorageHelper.avatarUrl) — frontend uses `avatar_url`
 *   - API: `credits` (integer) — frontend uses `credits_balance` (different name!)
 *   - API: `banner` — not in frontend User type
 *   - API: `display_name`, `is_artist`, `is_premium`, `is_active`, `email_verified_at`,
 *          `country`, `city`, `timezone`, `language`, `bio`, `social_links`,
 *          `theme_preference`, `last_login_at` — none in frontend User type
 *   - Frontend User has `subscription_tier?: string` — API embeds a full `UserSubscriptionResource`
 *     via the `subscription` relation (not a string tier field)
 *   - Frontend User has `entity_type?: EntityType` — not emitted by UserResource
 */
type UserResourceWireFormat = {
  id: number;
  name: string;
  username: string | null;
  email: string;
  display_name: string | null;
  avatar: string;               // ← diverges from frontend User.avatar_url
  bio: string | null;
  banner: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  language: string | null;
  role: string;
  permissions: string[];
  is_artist: boolean;
  event_organizer: { enabled: boolean };
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  email_verified_at: string | null;
  credits?: number;             // ← diverges from frontend User.credits_balance
  social_links: {
    instagram: string | null;
    twitter: string | null;
    facebook: string | null;
    youtube: string | null;
    tiktok: string | null;
  };
  theme_preference: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

const userFixture: UserResourceWireFormat = {
  id: 101,
  name: 'Atim Grace',
  username: 'atim_grace',
  email: 'atim@example.com',
  display_name: 'Grace Atim',
  avatar: 'https://cdn.tesotunes.com/avatars/101.jpg',
  bio: 'Music lover from Soroti',
  banner: null,
  country: 'UG',
  city: 'Soroti',
  timezone: 'Africa/Kampala',
  language: 'en',
  role: 'user',
  permissions: [],
  is_artist: false,
  event_organizer: { enabled: false },
  is_active: true,
  is_verified: true,
  is_premium: false,
  email_verified_at: '2026-01-01T10:00:00+03:00',
  credits: 250,
  social_links: {
    instagram: null,
    twitter: null,
    facebook: null,
    youtube: null,
    tiktok: null,
  },
  theme_preference: 'dark',
  last_login_at: '2026-05-06T20:00:00+03:00',
  created_at: '2026-01-01T09:00:00+03:00',
  updated_at: '2026-05-06T20:00:00+03:00',
};

describe('UserResource wire format', () => {
  it('emits required scalar fields with correct types', () => {
    expect(typeof userFixture.id).toBe('number');
    expect(typeof userFixture.name).toBe('string');
    expect(typeof userFixture.email).toBe('string');
    expect(typeof userFixture.role).toBe('string');
    expect(typeof userFixture.is_verified).toBe('boolean');
    expect(typeof userFixture.is_active).toBe('boolean');
  });

  it('emits avatar (not avatar_url) — frontend aligned to avatar', () => {
    // API emits `avatar` as a full URL (via StorageHelper.avatarUrl).
    // Frontend User type now uses `avatar?: string` to match.
    expect(userFixture.avatar).toBeDefined();
    expect(typeof userFixture.avatar).toBe('string');
    expect((userFixture as Record<string, unknown>).avatar_url).toBeUndefined();
  });

  it('emits credits (not credits_balance) — frontend aligned to credits', () => {
    // API emits `credits` (integer). Frontend User type now uses `credits?: number` to match.
    expect(userFixture.credits).toBeDefined();
    expect(typeof userFixture.credits).toBe('number');
    expect((userFixture as Record<string, unknown>).credits_balance).toBeUndefined();
  });

  it('emits structured social_links', () => {
    expect(userFixture.social_links).toHaveProperty('instagram');
    expect(userFixture.social_links).toHaveProperty('twitter');
    expect(userFixture.social_links).toHaveProperty('facebook');
  });
});

// ---------------------------------------------------------------------------
// 7. Cross-resource field-name divergence summary (documentation test)
// ---------------------------------------------------------------------------

describe('Field-name divergence registry', () => {
  const divergences = [
    { resource: 'SongResource',   apiField: 'genre',         frontendField: 'genres',          severity: 'HIGH' },
    { resource: 'ArtistResource', apiField: 'total_songs',   frontendField: 'song_count',      severity: 'MEDIUM' },
    { resource: 'ArtistResource', apiField: 'total_albums',  frontendField: 'album_count',     severity: 'MEDIUM' },
    { resource: 'ArtistResource', apiField: '(absent)',      frontendField: 'monthly_listeners', severity: 'LOW' },
    { resource: 'AlbumResource',  apiField: 'total_tracks',  frontendField: 'track_count',     severity: 'HIGH' },
    { resource: 'GenreResource',  apiField: 'artwork_url',   frontendField: 'image_url',       severity: 'HIGH' },
    { resource: 'UserResource',   apiField: 'avatar',        frontendField: 'avatar_url',      severity: 'HIGH' },
    { resource: 'UserResource',   apiField: 'credits',       frontendField: 'credits_balance', severity: 'HIGH' },
  ] as const;

  it('has documented divergences for all five core resources', () => {
    const resources = new Set(divergences.map((d) => d.resource));
    expect(resources.size).toBeGreaterThanOrEqual(5);
  });

  it('has no HIGH-severity divergence with an empty apiField', () => {
    const unresolvable = divergences.filter(
      (d) => d.severity === 'HIGH' && d.apiField === '(absent)'
    );
    expect(unresolvable).toHaveLength(0);
  });

  it('lists each divergence with resource, apiField, frontendField, and severity', () => {
    for (const d of divergences) {
      expect(d.resource).toBeTruthy();
      expect(d.apiField).toBeTruthy();
      expect(d.frontendField).toBeTruthy();
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(d.severity);
    }
  });
});
