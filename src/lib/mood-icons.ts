import {
  Smile,
  Frown,
  Zap,
  Coffee,
  Heart,
  PartyPopper,
  Flame,
  Sparkles,
  Camera,
  Target,
  Music,
  type LucideIcon,
} from "lucide-react";

/**
 * Clean line icons per mood slug — replaces the emoji set, which clashed with
 * the app's outline-icon aesthetic. Pair with the mood's own color + a bold title.
 */
export const MOOD_ICONS: Record<string, LucideIcon> = {
  happy: Smile,
  sad: Frown,
  energetic: Zap,
  chill: Coffee,
  romantic: Heart,
  party: PartyPopper,
  motivational: Flame,
  worship: Sparkles,
  nostalgic: Camera,
  focus: Target,
};

export function moodIcon(slug: string): LucideIcon {
  return MOOD_ICONS[slug] ?? Music;
}
