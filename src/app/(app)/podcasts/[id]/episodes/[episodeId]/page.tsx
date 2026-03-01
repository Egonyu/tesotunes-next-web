'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronLeft,
  Clock,
  Calendar,
  Share2,
  Download,
  ListPlus,
  RotateCcw,
  RotateCw,
  Moon,
  Timer,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LikeButton } from '@/components/social/LikeButton';
import { CommentSection } from '@/components/social/CommentSection';
import { useEpisode, usePodcast } from '@/hooks/usePodcasts';
import { Loader2 as Spinner } from 'lucide-react';

interface Episode {
  id: number;
  number: number;
  title: string;
  description: string;
  longDescription: string;
  duration: number;
  currentTime: number;
  date: string;
  plays: number;
  podcast: {
    id: number;
    title: string;
    host: string;
    cover: string;
  };
  chapters?: {
    title: string;
    startTime: number;
  }[];
  transcript?: string;
}

export default function EpisodePlayerPage({
  params
}: {
  params: Promise<{ id: string; episodeId: string }>
}) {
  const { id, episodeId } = use(params);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number>(0);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepMinutes(null);
    setSleepRemaining(0);
  }, []);

  const startSleepTimer = useCallback((minutes: number) => {
    clearSleepTimer();
    setSleepMinutes(minutes);
    setSleepRemaining(minutes * 60);
    setShowSleepMenu(false);
    sleepTimerRef.current = setInterval(() => {
      setSleepRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          clearSleepTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearSleepTimer]);

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

  // API hooks
  const { data: episodeData, isLoading: episodeLoading } = useEpisode(id, episodeId);
  const { data: podcastData, isLoading: podcastLoading } = usePodcast(id);

  const isLoading = episodeLoading || podcastLoading;

  const episode: Episode | null = episodeData && podcastData ? {
    id: episodeData.id,
    number: episodeData.episode_number || 0,
    title: episodeData.title,
    description: episodeData.description,
    longDescription: episodeData.description || '',
    duration: episodeData.duration_seconds || 0,
    currentTime: 0,
    date: episodeData.published_at || '',
    plays: episodeData.listen_count || 0,
    podcast: {
      id: podcastData.id,
      title: podcastData.title,
      host: podcastData.host_name,
      cover: podcastData.cover_url || '/images/default-podcast.jpg',
    },
    chapters: undefined,
    transcript: undefined,
  } : null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="container py-8 max-w-3xl">
        <Link href={`/podcasts/${id}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to Podcast
        </Link>
        <div className="text-center py-12">
          <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Episode not found</p>
          <p className="text-muted-foreground">This episode may have been removed or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const progressPercent = episode.duration > 0 ? (currentTime / episode.duration) * 100 : 0;

  return (
    <div className="min-h-screen">
      {/* Player Header */}
      <div className="bg-linear-to-b from-primary/20 to-background">
        <div className="container py-8">
          <Link
            href={`/podcasts/${id}`}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Podcast
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="relative h-64 w-64 rounded-xl overflow-hidden flex-shrink-0 bg-muted mx-auto md:mx-0 shadow-2xl">
              <Image
                src={episode.podcast.cover}
                alt={episode.podcast.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="text-sm text-muted-foreground">
                Episode {episode.number} • {new Date(episode.date).toLocaleDateString()}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">{episode.title}</h1>
              <Link
                href={`/podcasts/${id}`}
                className="text-muted-foreground hover:text-foreground mt-1 inline-block"
              >
                {episode.podcast.title} by {episode.podcast.host}
              </Link>

              <p className="mt-4 text-muted-foreground">{episode.description}</p>

              <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(episode.duration)}
                </span>
                <span>{episode.plays.toLocaleString()} plays</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="sticky top-16 z-40 bg-background border-y">
        <div className="container py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              className="h-2 bg-muted rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                setCurrentTime(percent * episode.duration);
              }}
            >
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(episode.duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaybackSpeed(speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length])}
                className="px-2 py-1 text-sm font-medium rounded border hover:bg-muted"
              >
                {playbackSpeed}x
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 15))}
                className="p-2 hover:bg-muted rounded-lg relative"
              >
                <RotateCcw className="h-5 w-5" />
                <span className="absolute text-[9px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">15</span>
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" fill="currentColor" />
                ) : (
                  <Play className="h-6 w-6 ml-1" fill="currentColor" />
                )}
              </button>
              <button
                onClick={() => setCurrentTime(Math.min(episode.duration, currentTime + 30))}
                className="p-2 hover:bg-muted rounded-lg relative"
              >
                <RotateCw className="h-5 w-5" />
                <span className="absolute text-[9px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">30</span>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <LikeButton
                likeableType="podcast_episode"
                likeableId={parseInt(episodeId)}
                variant="inline"
                showCount={false}
                iconSize={5}
              />
              <button className="p-2 hover:bg-muted rounded-lg">
                <ListPlus className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg">
                <Share2 className="h-5 w-5" />
              </button>
              {/* Sleep Timer */}
              <div className="relative">
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  className={cn(
                    'p-2 hover:bg-muted rounded-lg',
                    sleepMinutes && 'text-primary'
                  )}
                  title={sleepMinutes ? `Sleep in ${Math.ceil(sleepRemaining / 60)}m` : 'Sleep timer'}
                >
                  <Moon className="h-5 w-5" />
                </button>
                {showSleepMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border bg-card shadow-lg p-2 z-50">
                    <div className="text-xs font-medium text-muted-foreground px-3 py-1.5">Sleep Timer</div>
                    {[15, 30, 45, 60, 90].map((m) => (
                      <button
                        key={m}
                        onClick={() => startSleepTimer(m)}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted flex items-center justify-between',
                          sleepMinutes === m && 'bg-primary/10 text-primary'
                        )}
                      >
                        <span>{m} minutes</span>
                        {sleepMinutes === m && (
                          <Timer className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ))}
                    {sleepMinutes && (
                      <button
                        onClick={clearSleepTimer}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted text-red-500 flex items-center gap-2"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel timer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Sleep Timer Badge */}
          {sleepMinutes && (
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-primary">
              <Moon className="h-3 w-3" />
              <span>Sleep in {Math.floor(sleepRemaining / 60)}:{(sleepRemaining % 60).toString().padStart(2, '0')}</span>
              <button onClick={clearSleepTimer} className="hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Episode Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-4">About this Episode</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {episode.longDescription}
              </div>
            </div>

            {/* Transcript Toggle */}
            {episode.transcript && (
              <div>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-primary font-medium"
                >
                  {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                </button>
                {showTranscript && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    {episode.transcript}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chapters */}
          <div>
            {episode.chapters && episode.chapters.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-4">Chapters</h3>
                <div className="space-y-2">
                  {episode.chapters.map((chapter, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTime(chapter.startTime)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-lg text-sm hover:bg-muted transition-colors text-left',
                        currentTime >= chapter.startTime &&
                        (index === episode.chapters!.length - 1 || currentTime < episode.chapters![index + 1].startTime)
                          ? 'bg-primary/10 text-primary'
                          : ''
                      )}
                    >
                      <span className="truncate">{chapter.title}</span>
                      <span className="text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(chapter.startTime)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection
            commentableType="podcast_episode"
            commentableId={parseInt(episodeId)}
            title="Episode Discussion"
          />
        </div>
      </div>
    </div>
  );
}
