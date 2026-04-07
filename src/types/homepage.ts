import type { Artist, Playlist, Song, Event } from "@/types";
import type { HomepageTheme } from "@/lib/platform-settings";

export type HomepageAudience = "personalized" | "cold_start";
export type HomepageModulePlacement = "left" | "main" | "right";
export type HomepageMode = "all" | "music" | "radio" | "uganda" | "fresh";
export type HomepageModuleType =
  | "hero_feature"
  | "quick_picks"
  | "recently_played"
  | "made_for_you"
  | "because_you_listened"
  | "recommended_today"
  | "popular_radio"
  | "new_from_followed"
  | "editorial_pick"
  | "ecosystem_spotlight";

export type HomepageItemEntityType = "song" | "artist" | "playlist" | "event";

export interface HomepageChip {
  id: string;
  label: string;
  active?: boolean;
}

export interface HomepageItem {
  id: string | number;
  entity_type: HomepageItemEntityType;
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  reason?: string | null;
  href: string;
  image_url?: string | null;
  accent?: string | null;
  song?: Song;
  artist?: Artist;
  playlist?: Playlist;
  event?: Event;
}

export interface HomepageModule {
  id: string;
  type: HomepageModuleType;
  placement: HomepageModulePlacement;
  title: string;
  subtitle?: string | null;
  explanation?: string | null;
  view_all_href?: string | null;
  item_style?: "hero" | "compact" | "square" | "spotlight";
  items: HomepageItem[];
}

export interface HomepageResponse {
  theme: HomepageTheme;
  audience: HomepageAudience;
  headline: string;
  subheadline?: string | null;
  chips: HomepageChip[];
  modules: HomepageModule[];
}
