// User types
export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  avatar_url?: string;
  profile_image_url?: string;
  role: UserRole;
  entity_type?: EntityType;
  credits_balance: number;
  subscription_tier?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = "user" | "artist" | "label" | "moderator" | "admin" | "super_admin";
export type EntityType = "individual" | "artist" | "label" | "organization" | "band";

// Music types
export interface Song {
  id: number;
  title: string;
  slug: string;
  artist_id: number;
  album_id?: number;
  duration: number;
  play_count: number;
  download_count: number;
  like_count: number;
  status: SongStatus;
  audio_url: string;
  stream_url?: string;
  file_url?: string;
  artwork_url?: string;
  waveform_data?: number[];
  genres: Genre[];
  artist: Artist;
  album?: Album;
  lyrics?: string;
  featured_artists?: Artist[];
  pivot?: { created_at?: string; position?: number };
  created_at: string;
  released_at?: string;
}

export type SongStatus = "draft" | "pending" | "approved" | "published" | "rejected";

export interface Artist {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  cover_image_url?: string;
  profile_image_url?: string;
  follower_count: number;
  song_count?: number;
  album_count?: number;
  monthly_listeners: number;
  is_verified: boolean;
  status: ArtistStatus;
  genres: Genre[];
  social_links?: SocialLinks;
}

export type ArtistStatus = "pending" | "active" | "verified" | "suspended";

export interface Album {
  id: number;
  title: string;
  slug: string;
  artist_id: number;
  artwork_url?: string;
  release_date?: string;
  track_count: number;
  duration: number;
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
  image_url?: string;
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
  is_public: boolean;
  is_collaborative: boolean;
  track_count: number;
  song_count?: number;
  duration: number;
  follower_count: number;
  user: User;
  songs?: Song[];
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
