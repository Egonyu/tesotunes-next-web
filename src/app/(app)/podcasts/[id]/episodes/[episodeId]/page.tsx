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
  Heart,
  ListPlus,
  RotateCcw,
  RotateCw,
  Moon,
  Timer,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isLiked, setIsLiked] = useState(false);
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
  
  // Mock data
  const episode: Episode = {
    id: parseInt(episodeId),
    number: 87,
    title: 'Mastering Afrobeats Drums',
    description: 'Learn how to create authentic Afrobeats drum patterns that move the crowd.',
    longDescription: `In this episode, we dive deep into the world of Afrobeats drum production. DJ Empress breaks down the essential elements that make Afrobeats drums so distinctive and irresistible.

We cover:
• The history and evolution of Afrobeats rhythms
• Essential drum sounds and how to choose them
• Programming patterns that groove
• Swing and timing techniques
• Layering and processing tips
• Common mistakes to avoid

Whether you're just starting out or looking to refine your skills, this episode has something for every producer interested in the Afrobeats sound.`,
    duration: 3600,
    currentTime: 0,
    date: '2026-02-03',
    plays: 2340,
    podcast: {
      id: parseInt(id),
      title: 'The Beat Lab',
      host: 'DJ Empress',
      cover: '/images/podcasts/beat-lab.jpg',
    },
    chapters: [
      { title: 'Introduction', startTime: 0 },
      { title: 'History of Afrobeats Drums', startTime: 180 },
      { title: 'Essential Sounds', startTime: 540 },
      { title: 'Pattern Programming', startTime: 1200 },
      { title: 'Swing & Timing', startTime: 2100 },
      { title: 'Processing Tips', startTime: 2700 },
      { title: 'Q&A', startTime: 3300 },
    ],
    transcript: `Welcome back to The Beat Lab. I'm DJ Empress, and today we're going to explore one of my favorite topics - Afrobeats drums. 

If you've ever wondered what makes Afrobeats so infectious, so impossible not to move to, a lot of that comes down to the drums...`,
  };
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progressPercent = (currentTime / episode.duration) * 100;
  
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
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
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  'p-2 hover:bg-muted rounded-lg',
                  isLiked && 'text-red-500'
                )}
              >
                <Heart className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} />
              </button>
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
      </div>
    </div>
  );
}
