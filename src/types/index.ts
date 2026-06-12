export type UserRole = 'user' | 'artist' | 'label' | 'moderator' | 'admin' | 'super_admin';
export type EntityType = 'individual' | 'artist' | 'label' | 'organization' | 'band';
export type SongStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
export type ArtistStatus = 'pending' | 'active' | 'verified' | 'suspended';

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  profile_image_url?: string;
  role: UserRole;
  entity_type?: EntityType;
  credits?: number;
  subscription_tier?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Music types
export interface Song {
  id: number;
  title: string;
  slug: string;
  artist_id: number;
  album_id?: number;
  duration_seconds?: number;
  duration_formatted?: string;
  play_count: number;
  download_count: number;
  like_count: number;
  is_downloadable?: boolean;
  is_free?: boolean;
  is_explicit?: boolean;
  is_featured?: boolean;
  status: SongStatus;
  audio_url?: string | null;
  stream_url?: string | null;
  hls_master_url?: string | null;
  file_url?: string;
  preview_url?: string | null;
  artwork_url?: string | null;
  waveform_data?: number[];
  genre?: Genre;
  artist: Artist;
  album?: Album;
  lyrics?: string;
  isrc?: string | null;
  isrc_assignment?: {
    assigned: boolean;
    eligible: boolean;
    status: "assigned" | "eligible" | "blocked";
    code?: string | null;
    blockers: string[];
    blocker_messages: string[];
  };
  featured_artists?: Artist[];
  pivot?: { created_at?: string; position?: number };
  created_at: string;
  release_date?: string;
  released_at?: string;
}


export interface Artist {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  cover_url?: string;
  cover_image_url?: string;
  profile_image_url?: string;
  follower_count: number;
  total_songs?: number;
  total_albums?: number;
  monthly_listeners?: number;
  total_plays?: number;
  is_verified: boolean;
  is_placeholder?: boolean;
  claim_status?: "unclaimed" | "claimed" | string;
  verification_badge?: string;
  status: ArtistStatus;
  genres: Genre[];
  genre?: Genre;
  social_links?: SocialLinks;
}

export interface CatalogClaimRequest {
  id: number;
  status: "pending" | "under_review" | "approved" | "rejected" | "cancelled" | string;
  phone_number?: string | null;
  message: string;
  rejection_reason?: string | null;
  created_at?: string;
  reviewed_at?: string | null;
  artist?: Artist | null;
}


export interface Album {
  id: number;
  title: string;
  slug: string;
  artist_id: number;
  artwork_url?: string;
  release_date?: string;
  total_tracks: number;
  total_duration_seconds?: number;
  status: string;
  artist: Artist;
  songs?: Song[];
  genre?: Genre;
  genres?: Genre[];
  description?: string;
  play_count?: number;
  like_count?: number;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  color?: string;
  artwork_url?: string;
  description?: string;
  song_count?: number;
}

export interface Playlist {
  id: number;
  name: string;
  slug: string;
  description?: string;
  artwork_url?: string;
  user_id: number;
  visibility?: "public" | "private" | string;
  is_public?: boolean;
  is_collaborative: boolean;
  collaboration_requires_approval?: boolean;
  song_count?: number;
  total_duration_seconds?: number;
  follower_count: number;
  owner?: Pick<User, "id" | "name"> | null;
  user?: User;
  is_owner?: boolean;
  can_edit?: boolean;
  collaborator_role?: "owner" | "admin" | "editor" | "viewer" | null;
  songs?: Song[];
}

export interface PlaylistCollaborator {
  id: number | string;
  user: {
    id: number;
    name: string;
    username?: string;
    avatar_url?: string | null;
  };
  role: "owner" | "admin" | "editor" | "viewer";
  status: "accepted" | "pending" | "invited";
  added_at?: string | null;
  approved_at?: string | null;
  joined_at?: string | null;
  invited_by?: {
    id: number;
    name: string;
    username?: string;
    avatar_url?: string | null;
  } | null;
  can_edit?: boolean;
  can_manage?: boolean;
}

// Player types
export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
}

export type RepeatMode = "off" | "all" | "one";

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Social
export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  spotify?: string;
  website?: string;
}

// Events
export interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string;
  venue: string;
  location: string;
  start_date: string;
  end_date?: string;
  image_url?: string;
  ticket_price?: number;
  is_free: boolean;
  status: string;
  artists: Artist[];
}

// Store
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  stock_quantity: number;
  is_featured: boolean;
  status: string;
  artist?: Artist;
}

// Forum
export interface Poll {
  id: number;
  title: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  is_active: boolean;
  ends_at?: string;
  user_vote?: number;
}

export interface PollOption {
  id: number;
  text: string;
  vote_count: number;
  percentage: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
