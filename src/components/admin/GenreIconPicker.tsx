'use client';

import { useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type GenreIconOption = {
  value: string;
  label: string;
  terms: string[];
};

const GENRE_ICON_OPTIONS: GenreIconOption[] = [
  { value: '🎵', label: 'Music Note', terms: ['music', 'song', 'audio', 'note', 'general'] },
  { value: '🎶', label: 'Notes', terms: ['music', 'song', 'melody', 'general'] },
  { value: '🎼', label: 'Score', terms: ['music', 'composition', 'classical', 'orchestra'] },
  { value: '🎤', label: 'Microphone', terms: ['singing', 'vocals', 'artist', 'performance'] },
  { value: '🎧', label: 'Headphones', terms: ['listening', 'audio', 'dj', 'studio'] },
  { value: '🔊', label: 'Speaker', terms: ['sound', 'loud', 'bass', 'party'] },
  { value: '🥁', label: 'Drums', terms: ['drums', 'percussion', 'traditional', 'rhythm'] },
  { value: '🪘', label: 'Hand Drum', terms: ['african', 'traditional', 'drum', 'cultural'] },
  { value: '🎷', label: 'Saxophone', terms: ['jazz', 'soul', 'horn'] },
  { value: '🎺', label: 'Trumpet', terms: ['brass', 'band', 'horn'] },
  { value: '🎸', label: 'Guitar', terms: ['rock', 'acoustic', 'band'] },
  { value: '🎹', label: 'Keyboard', terms: ['piano', 'keys', 'instrumental'] },
  { value: '🎻', label: 'Violin', terms: ['strings', 'orchestra', 'classical'] },
  { value: '🪗', label: 'Accordion', terms: ['folk', 'traditional'] },
  { value: '📻', label: 'Radio', terms: ['radio', 'broadcast', 'old-school'] },
  { value: '💿', label: 'Disc', terms: ['album', 'record', 'release'] },
  { value: '✨', label: 'Sparkles', terms: ['fresh', 'new', 'vibes', 'special'] },
  { value: '🔥', label: 'Fire', terms: ['hot', 'trending', 'club', 'energy'] },
  { value: '⚡', label: 'Lightning', terms: ['electric', 'edm', 'fast', 'energy'] },
  { value: '🌊', label: 'Wave', terms: ['smooth', 'chill', 'afrobeats', 'flow'] },
  { value: '🌍', label: 'World', terms: ['world', 'global', 'african', 'fusion'] },
  { value: '🌅', label: 'Sunrise', terms: ['soft', 'morning', 'acoustic', 'inspiration'] },
  { value: '🌙', label: 'Moon', terms: ['night', 'slow', 'rnb', 'mellow'] },
  { value: '❤️', label: 'Heart', terms: ['love', 'romance', 'ballad'] },
  { value: '💔', label: 'Broken Heart', terms: ['sad', 'pain', 'heartbreak'] },
  { value: '🙏', label: 'Prayer', terms: ['gospel', 'worship', 'church', 'spiritual'] },
  { value: '⛪', label: 'Church', terms: ['gospel', 'church', 'worship', 'faith'] },
  { value: '🕊️', label: 'Dove', terms: ['peace', 'gospel', 'spirit'] },
  { value: '👑', label: 'Crown', terms: ['royal', 'legend', 'premium', 'classic'] },
  { value: '💃', label: 'Dance', terms: ['dance', 'party', 'amapiano', 'club'] },
  { value: '🕺', label: 'Dancer', terms: ['dance', 'party', 'club', 'performance'] },
  { value: '🎉', label: 'Celebration', terms: ['party', 'festival', 'happy'] },
  { value: '🍾', label: 'Bottle', terms: ['party', 'club', 'luxury'] },
  { value: '🚀', label: 'Rocket', terms: ['upbeat', 'fast', 'rising', 'future'] },
  { value: '🌿', label: 'Leaf', terms: ['roots', 'natural', 'folk', 'cultural'] },
  { value: '🏕️', label: 'Camp', terms: ['folk', 'acoustic', 'traditional'] },
  { value: '🏆', label: 'Trophy', terms: ['hit', 'best', 'top', 'award'] },
];

type GenreIconPickerProps = {
  error?: string;
  onChange: (value: string) => void;
  value: string;
};

export function GenreIconPicker({ value, onChange, error }: GenreIconPickerProps) {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return GENRE_ICON_OPTIONS;
    }

    return GENRE_ICON_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(query) ||
      option.terms.some((term) => term.includes(query))
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-card text-3xl shadow-sm">
          {value || '🎵'}
        </div>
        <div className="flex-1 space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary"
              placeholder="Search icons: gospel, dance, drums, love..."
            />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full rounded-lg border bg-background px-4 py-2 focus:ring-2 focus:ring-primary',
              error && 'border-red-500'
            )}
            placeholder="Selected icon or emoji"
            maxLength={10}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card/50 p-3">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>{filteredOptions.length} quick picks</span>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-9">
          {filteredOptions.map((option) => (
            <button
              key={`${option.value}-${option.label}`}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex h-14 flex-col items-center justify-center rounded-xl border text-2xl transition-all hover:border-primary hover:bg-primary/5',
                value === option.value && 'border-primary bg-primary/10 shadow-sm'
              )}
              title={`${option.label} — ${option.terms.join(', ')}`}
            >
              <span>{option.value}</span>
            </button>
          ))}
        </div>
        {filteredOptions.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No matches yet. You can still paste any emoji or symbol manually.
          </p>
        )}
      </div>
    </div>
  );
}
