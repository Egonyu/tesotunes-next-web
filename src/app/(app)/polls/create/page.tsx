'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Music,
  Mic2,
  MessageSquare,
  Search,
  X,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCreatePoll,
  useSongsSearch,
  useArtistsSearch,
  POLL_CATEGORIES,
  type PollType,
} from '@/hooks/usePolls';
import { useDebounce } from '@/hooks/useDebounce';

const POLL_TYPE_OPTIONS = [
  {
    value: 'general' as PollType,
    label: 'General Poll',
    icon: MessageSquare,
    description: 'Ask anything — text-based options',
  },
  {
    value: 'song_battle' as PollType,
    label: 'Song Battle',
    icon: Music,
    description: 'Pit songs against each other',
  },
  {
    value: 'artist_contest' as PollType,
    label: 'Artist Contest',
    icon: Mic2,
    description: 'Let fans vote for their favourite artist',
  },
] as const;

// ─── Song picker ─────────────────────────────────────────────────────────────

function SongPicker({
  selected,
  onSelect,
  onRemove,
}: {
  selected: { song_id: number; title: string; artwork_url: string | null; artist_name: string | null }[];
  onSelect: (song: { song_id: number; title: string; artwork_url: string | null; artist_name: string | null }) => void;
  onRemove: (song_id: number) => void;
}) {
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 300);
  const { data: results = [], isLoading } = useSongsSearch(debouncedQ);
  const selectedIds = new Set(selected.map(s => s.song_id));

  return (
    <div className="space-y-3">
      {/* Selected songs */}
      {selected.map((song, i) => (
        <div key={song.song_id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
          <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
          {song.artwork_url ? (
            <Image src={song.artwork_url} alt={song.title} width={36} height={36} className="rounded object-cover" />
          ) : (
            <div className="h-9 w-9 rounded bg-muted flex items-center justify-center">
              <Music className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{song.title}</p>
            {song.artist_name && <p className="text-xs text-muted-foreground truncate">{song.artist_name}</p>}
          </div>
          <button type="button" onClick={() => onRemove(song.song_id)} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Search */}
      {selected.length < 10 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search for a song…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm"
          />
          {q.length >= 2 && (
            <div className="absolute z-10 top-full mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-60 overflow-y-auto">
              {isLoading && <p className="text-sm text-center py-3 text-muted-foreground">Searching…</p>}
              {!isLoading && results.length === 0 && <p className="text-sm text-center py-3 text-muted-foreground">No songs found</p>}
              {results.map(song => {
                const already = selectedIds.has(song.id);
                return (
                  <button
                    key={song.id}
                    type="button"
                    disabled={already}
                    onClick={() => {
                      if (!already) {
                        onSelect({ song_id: song.id, title: song.title, artwork_url: song.artwork_url, artist_name: song.artist?.stage_name ?? null });
                        setQ('');
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors',
                      already && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    {song.artwork_url ? (
                      <Image src={song.artwork_url} alt={song.title} width={32} height={32} className="rounded object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                        <Music className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{song.title}</p>
                      {song.artist && <p className="text-xs text-muted-foreground truncate">{song.artist.stage_name}</p>}
                    </div>
                    {already && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Artist picker ────────────────────────────────────────────────────────────

function ArtistPicker({
  selected,
  onSelect,
  onRemove,
}: {
  selected: { artist_id: number; stage_name: string; avatar_url: string | null }[];
  onSelect: (a: { artist_id: number; stage_name: string; avatar_url: string | null }) => void;
  onRemove: (artist_id: number) => void;
}) {
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 300);
  const { data: results = [], isLoading } = useArtistsSearch(debouncedQ);
  const selectedIds = new Set(selected.map(a => a.artist_id));

  return (
    <div className="space-y-3">
      {selected.map((artist, i) => (
        <div key={artist.artist_id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
          <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
          {artist.avatar_url ? (
            <Image src={artist.avatar_url} alt={artist.stage_name} width={36} height={36} className="rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <Mic2 className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <p className="flex-1 text-sm font-medium truncate">{artist.stage_name}</p>
          <button type="button" onClick={() => onRemove(artist.artist_id)} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {selected.length < 10 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search for an artist…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm"
          />
          {q.length >= 2 && (
            <div className="absolute z-10 top-full mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-60 overflow-y-auto">
              {isLoading && <p className="text-sm text-center py-3 text-muted-foreground">Searching…</p>}
              {!isLoading && results.length === 0 && <p className="text-sm text-center py-3 text-muted-foreground">No artists found</p>}
              {results.map(artist => {
                const already = selectedIds.has(artist.id);
                return (
                  <button
                    key={artist.id}
                    type="button"
                    disabled={already}
                    onClick={() => {
                      if (!already) {
                        onSelect({ artist_id: artist.id, stage_name: artist.stage_name, avatar_url: artist.avatar_url });
                        setQ('');
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors',
                      already && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    {artist.avatar_url ? (
                      <Image src={artist.avatar_url} alt={artist.stage_name} width={32} height={32} className="rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Mic2 className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-sm font-medium truncate">{artist.stage_name}</p>
                    {already && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreatePollPage() {
  const router = useRouter();
  const createPollMutation = useCreatePoll();

  const [pollType, setPollType] = useState<PollType>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [creditsReward, setCreditsReward] = useState(3);
  const [duration, setDuration] = useState(7);
  const [allowMultiple, setAllowMultiple] = useState(false);

  // General poll state
  const [textOptions, setTextOptions] = useState([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);

  // Song battle state
  const [songOptions, setSongOptions] = useState<
    { song_id: number; title: string; artwork_url: string | null; artist_name: string | null }[]
  >([]);

  // Artist contest state
  const [artistOptions, setArtistOptions] = useState<
    { artist_id: number; stage_name: string; avatar_url: string | null }[]
  >([]);

  const isValid = (() => {
    if (!title.trim()) return false;
    if (pollType === 'general') return textOptions.filter(o => o.text.trim()).length >= 2;
    if (pollType === 'song_battle') return songOptions.length >= 2;
    if (pollType === 'artist_contest') return artistOptions.length >= 2;
    return false;
  })();

  const addTextOption = () => {
    if (textOptions.length >= 10) return;
    setTextOptions(prev => [...prev, { id: Date.now().toString(), text: '' }]);
  };

  const removeTextOption = useCallback((id: string) => {
    setTextOptions(prev => prev.filter(o => o.id !== id));
  }, []);

  const updateTextOption = useCallback((id: string, text: string) => {
    setTextOptions(prev => prev.map(o => (o.id === id ? { ...o, text } : o)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + duration);

    // Build options for the single question based on poll type
    const questionOptions =
      pollType === 'general'
        ? textOptions.filter((o) => o.text.trim()).map((o) => ({ option_text: o.text }))
        : pollType === 'song_battle'
        ? songOptions.map((s) => ({ option_text: s.title ?? `Song ${s.song_id}`, song_id: s.song_id }))
        : artistOptions.map((a) => ({ option_text: a.stage_name ?? `Artist ${a.artist_id}`, artist_id: a.artist_id }));

    const payload = {
      title,
      description: description || undefined,
      poll_type: pollType,
      category,
      credits_reward: creditsReward,
      ends_at: endsAt.toISOString(),
      allow_multiple: allowMultiple,
      questions: [
        {
          question_text: title,
          question_type: 'multiple_choice',
          is_required: true,
          allow_multiple: allowMultiple,
          options: questionOptions,
        },
      ],
    };

    createPollMutation.mutate(payload, { onSuccess: () => router.push('/polls') });
  };

  return (
    <div className="container py-8 max-w-2xl">
      <Link href="/polls" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />
        Back to Polls
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create a Poll</h1>
        <p className="text-muted-foreground">Ask the Teso music community and earn credits for voting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Poll Type */}
        <div>
          <label className="block text-sm font-medium mb-3">Poll Type</label>
          <div className="grid grid-cols-3 gap-3">
            {POLL_TYPE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPollType(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all',
                    pollType === opt.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <Icon className={cn('h-6 w-6', pollType === opt.value ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{opt.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={
              pollType === 'song_battle' ? 'Which song bangs harder?' :
              pollType === 'artist_contest' ? 'Who is the best Teso artist right now?' :
              'What would you like to ask?'
            }
            maxLength={200}
            required
            className="w-full px-4 py-3 rounded-lg border bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">{title.length}/200</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add more context…"
            rows={2}
            maxLength={500}
            className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
          />
        </div>

        {/* Category + Credits row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background"
            >
              {POLL_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Coins className="h-3.5 w-3.5 inline mr-1" />
              Credits per vote
            </label>
            <select
              value={creditsReward}
              onChange={e => setCreditsReward(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border bg-background"
            >
              {[1, 2, 3, 5, 10].map(v => (
                <option key={v} value={v}>{v} credit{v > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Options — conditional by type */}
        <div>
          <label className="block text-sm font-medium mb-3">
            {pollType === 'general' ? 'Options' : pollType === 'song_battle' ? 'Songs to battle' : 'Artists to contest'}
            <span className="text-red-500 ml-1">*</span>
            <span className="text-muted-foreground ml-1 font-normal">(min 2, max 10)</span>
          </label>

          {pollType === 'general' && (
            <div className="space-y-3">
              {textOptions.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={e => updateTextOption(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                    className="flex-1 px-4 py-2 rounded-lg border bg-background"
                  />
                  {textOptions.length > 2 && (
                    <button type="button" onClick={() => removeTextOption(option.id)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {textOptions.length < 10 && (
                <button type="button" onClick={addTextOption} className="flex items-center gap-2 mt-1 text-sm text-primary hover:text-primary/80">
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              )}
            </div>
          )}

          {pollType === 'song_battle' && (
            <SongPicker
              selected={songOptions}
              onSelect={s => setSongOptions(prev => [...prev, s])}
              onRemove={id => setSongOptions(prev => prev.filter(s => s.song_id !== id))}
            />
          )}

          {pollType === 'artist_contest' && (
            <ArtistPicker
              selected={artistOptions}
              onSelect={a => setArtistOptions(prev => [...prev, a])}
              onRemove={id => setArtistOptions(prev => prev.filter(a => a.artist_id !== id))}
            />
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Poll Duration
          </label>
          <select
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border bg-background"
          >
            <option value={1}>1 day</option>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>

        {/* Settings */}
        <div className="p-4 rounded-lg bg-muted/50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={e => setAllowMultiple(e.target.checked)}
              className="h-4 w-4 rounded border-muted-foreground accent-primary"
            />
            <div>
              <p className="font-medium">Allow multiple selections</p>
              <p className="text-sm text-muted-foreground">Users can vote for more than one option</p>
            </div>
          </label>
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Voters earn {creditsReward} credit{creditsReward > 1 ? 's' : ''} per vote (up to 5 polls/day)</p>
              <ul className="mt-1 space-y-0.5 text-xs">
                <li>• Polls cannot be edited after creation</li>
                <li>• Visible to all TesoTunes members</li>
                <li>• Inappropriate content may be removed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/polls" className="px-6 py-3 border rounded-lg font-medium hover:bg-muted">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!isValid || createPollMutation.isPending}
            className={cn(
              'flex-1 py-3 rounded-lg font-medium transition-colors',
              isValid && !createPollMutation.isPending
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {createPollMutation.isPending ? 'Creating…' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
}
