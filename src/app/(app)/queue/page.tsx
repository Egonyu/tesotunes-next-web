"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Trash2, GripVertical, Music, Clock, X, ListMusic 
} from "lucide-react";
import { useState } from "react";

interface QueueTrack {
  id: string;
  title: string;
  artist: {
    name: string;
    slug: string;
  };
  album?: {
    title: string;
    slug: string;
    artwork_url: string;
  };
  duration: number;
  is_playing?: boolean;
}

interface QueueData {
  now_playing: QueueTrack | null;
  queue: QueueTrack[];
  history: QueueTrack[];
  shuffle: boolean;
  repeat: "off" | "all" | "one";
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function QueueTrackRow({ 
  track, 
  index, 
  onRemove, 
  onPlay,
  showDragHandle = true 
}: { 
  track: QueueTrack; 
  index: number;
  onRemove?: () => void;
  onPlay?: () => void;
  showDragHandle?: boolean;
}) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">
      {showDragHandle && (
        <button className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-opacity">
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      
      <div className="w-8 text-center text-sm text-gray-500">
        {index + 1}
      </div>
      
      <div className="relative w-12 h-12 flex-shrink-0">
        {track.album?.artwork_url ? (
          <Image
            src={track.album.artwork_url}
            alt={track.album.title}
            fill
            className="object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
            <Music className="w-5 h-5 text-gray-600" />
          </div>
        )}
        {onPlay && (
          <button 
            onClick={onPlay}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded"
          >
            <Play className="w-5 h-5 text-white" fill="white" />
          </button>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{track.title}</h4>
        <Link 
          href={`/artists/${track.artist.slug}`}
          className="text-sm text-gray-400 hover:text-white hover:underline truncate block"
        >
          {track.artist.name}
        </Link>
      </div>
      
      {track.album && (
        <Link 
          href={`/albums/${track.album.slug}`}
          className="hidden md:block text-sm text-gray-400 hover:text-white hover:underline truncate max-w-[200px]"
        >
          {track.album.title}
        </Link>
      )}
      
      <span className="text-sm text-gray-500 w-12 text-right">
        {formatDuration(track.duration)}
      </span>
      
      {onRemove && (
        <button 
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function NowPlayingCard({ track }: { track: QueueTrack }) {
  const [isPlaying, setIsPlaying] = useState(true);
  
  return (
    <div className="bg-linear-to-br from-purple-900/50 to-pink-900/30 rounded-2xl p-6 mb-8">
      <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">
        Now Playing
      </h2>
      
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
          {track.album?.artwork_url ? (
            <Image
              src={track.album.artwork_url}
              alt={track.album.title}
              fill
              className="object-cover rounded-xl shadow-2xl"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
              <Music className="w-10 h-10 text-gray-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl md:text-2xl font-bold text-white truncate mb-1">
            {track.title}
          </h3>
          <Link 
            href={`/artists/${track.artist.slug}`}
            className="text-gray-400 hover:text-white hover:underline"
          >
            {track.artist.name}
          </Link>
          {track.album && (
            <p className="text-sm text-gray-500 mt-1">
              from{" "}
              <Link 
                href={`/albums/${track.album.slug}`}
                className="hover:text-white hover:underline"
              >
                {track.album.title}
              </Link>
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-white rounded-full text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" fill="black" />
            ) : (
              <Play className="w-6 h-6" fill="black" />
            )}
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QueuePage() {
  const queryClient = useQueryClient();
  
  const { data: queueData, isLoading } = useQuery({
    queryKey: ["queue"],
    queryFn: () => apiGet<QueueData>("/music/queue"),
  });

  const clearQueueMutation = useMutation({
    mutationFn: () => apiDelete("/music/queue"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const removeFromQueueMutation = useMutation({
    mutationFn: (trackId: string) => apiDelete(`/music/queue/${trackId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const playTrackMutation = useMutation({
    mutationFn: (trackId: string) => apiPost(`/music/queue/play/${trackId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const toggleShuffleMutation = useMutation({
    mutationFn: () => apiPost("/music/queue/shuffle"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const cycleRepeatMutation = useMutation({
    mutationFn: () => apiPost("/music/queue/repeat"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-900 to-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-32" />
            <div className="h-40 bg-gray-800 rounded-2xl" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasQueue = queueData?.queue && queueData.queue.length > 0;
  const hasHistory = queueData?.history && queueData.history.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ListMusic className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-white">Queue</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Shuffle Button */}
            <button
              onClick={() => toggleShuffleMutation.mutate()}
              className={`p-2 rounded-full transition-colors ${
                queueData?.shuffle 
                  ? "text-green-500 bg-green-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title={queueData?.shuffle ? "Shuffle on" : "Shuffle off"}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            
            {/* Repeat Button */}
            <button
              onClick={() => cycleRepeatMutation.mutate()}
              className={`p-2 rounded-full transition-colors relative ${
                queueData?.repeat !== "off"
                  ? "text-green-500 bg-green-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title={`Repeat: ${queueData?.repeat || "off"}`}
            >
              <Repeat className="w-5 h-5" />
              {queueData?.repeat === "one" && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold text-green-500">
                  1
                </span>
              )}
            </button>
            
            {/* Clear Queue */}
            {hasQueue && (
              <button
                onClick={() => clearQueueMutation.mutate()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Queue
              </button>
            )}
          </div>
        </div>

        {/* Now Playing */}
        {queueData?.now_playing && (
          <NowPlayingCard track={queueData.now_playing} />
        )}

        {/* Queue */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Next Up</h2>
            {hasQueue && (
              <span className="text-sm text-gray-500">
                {queueData.queue.length} song{queueData.queue.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          
          {hasQueue ? (
            <div className="bg-white/5 rounded-xl overflow-hidden">
              {queueData.queue.map((track, index) => (
                <QueueTrackRow
                  key={`${track.id}-${index}`}
                  track={track}
                  index={index}
                  onRemove={() => removeFromQueueMutation.mutate(track.id)}
                  onPlay={() => playTrackMutation.mutate(track.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-xl">
              <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                Your queue is empty
              </h3>
              <p className="text-gray-500 mb-4">
                Add songs to your queue to keep the music playing
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
              >
                Discover Music
              </Link>
            </div>
          )}
        </div>

        {/* Recently Played */}
        {hasHistory && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Recently Played
              </h2>
            </div>
            
            <div className="bg-white/5 rounded-xl overflow-hidden opacity-75">
              {queueData.history.slice(0, 5).map((track, index) => (
                <QueueTrackRow
                  key={`history-${track.id}-${index}`}
                  track={track}
                  index={index}
                  showDragHandle={false}
                  onPlay={() => playTrackMutation.mutate(track.id)}
                />
              ))}
            </div>
            
            {queueData.history.length > 5 && (
              <div className="text-center mt-4">
                <Link
                  href="/history"
                  className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
                >
                  View Full History →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
