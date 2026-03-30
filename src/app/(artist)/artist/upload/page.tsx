'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  Image as ImageIcon,
  FileAudio,
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  Calendar,
  DollarSign,
  Info,
  RefreshCw,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadSong, useArtistAlbums, UploadSongData } from '@/hooks/useArtist';
import { useGenres } from '@/hooks/api';
import { useMySubscription } from '@/hooks/useSubscriptions';
import { FeatureGate } from '@/components/subscription/FeatureGate';

export default function UploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status: authStatus } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Form fields - ALL fields supported by backend
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState<number | ''>('');
  const [genreId, setGenreId] = useState('');
  const [featuredArtists, setFeaturedArtists] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [isExplicit, setIsExplicit] = useState(false);
  const [description, setDescription] = useState('');
  const [composer, setComposer] = useState('');
  const [producer, setProducer] = useState('');
  const [isDownloadable, setIsDownloadable] = useState(true);
  const [isFree, setIsFree] = useState(true);

  // UI state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Hooks - only fetch when authenticated
  const isAuthenticated = authStatus === 'authenticated';
  const { data: genres, isLoading: genresLoading, error: genresError } = useGenres();
  const { data: albumsData, error: albumsError } = useArtistAlbums({ per_page: 100, enabled: isAuthenticated });
  const albums = albumsData?.data || [];
  const { data: currentSub } = useMySubscription();

  // Log any hook errors for debugging
  if (genresError) console.error('Genres fetch error:', genresError);
  if (albumsError) console.error('Albums fetch error:', albumsError);

  const uploadMutation = useUploadSong((progress) => {
    setUploadProgress(progress.percent);
  });

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type — mobile browsers report varied MIME types
      const validTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave',
        'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/x-aac', 'audio/mp4',
        'audio/m4a', 'audio/x-m4a', 'audio/ogg', 'audio/vorbis',
        'audio/webm', 'video/mp4',  // some mobile browsers report video/mp4 for m4a
      ];
      const validExtensions = /\.(mp3|wav|flac|aac|m4a|ogg|mp4|wma|webm)$/i;
      const hasValidType = !file.type || validTypes.includes(file.type) || file.type.startsWith('audio/');
      const hasValidExt = validExtensions.test(file.name);
      if (!hasValidType && !hasValidExt) {
        setError('Please select a valid audio file (MP3, WAV, FLAC, AAC, M4A, or OGG)');
        return;
      }
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }
      setAudioFile(file);
      setError(null);
      // Auto-set title from filename
      if (!title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(fileName);
      }
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Cover image must be less than 10MB');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a song title');
      return;
    }

    setError(null);
    setUploadProgress(0);

    // Build upload data with ALL fields
    const uploadData: UploadSongData = {
      title: title.trim(),
      audio_file: audioFile,
    };

    // Optional fields
    if (coverFile) uploadData.cover_image = coverFile;
    if (albumId) uploadData.album_id = Number(albumId);
    if (genreId) uploadData.genre = genreId;
    if (featuredArtists.trim()) uploadData.featured_artists = featuredArtists.trim();
    if (lyrics.trim()) uploadData.lyrics = lyrics.trim();
    if (releaseDate) uploadData.release_date = releaseDate;
    if (price && !isFree) uploadData.price = parseFloat(price);
    uploadData.is_explicit = isExplicit;
    if (description.trim()) uploadData.description = description.trim();
    if (composer.trim()) uploadData.composer = composer.trim();
    if (producer.trim()) uploadData.producer = producer.trim();
    uploadData.is_downloadable = isDownloadable;
    uploadData.is_free = isFree;

    uploadMutation.mutate(uploadData, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => {
          router.push('/artist/songs');
        }, 2000);
      },
      onError: (err) => {
        // Extract detailed error message from axios error
        let errorMessage = 'Upload failed. Please try again.';
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number } };
          if (axiosError.response?.status === 401) {
            errorMessage = 'Your session has expired. Please log in again to upload.';
          } else if (axiosError.response?.status === 413) {
            errorMessage = 'This upload is larger than the server currently accepts. Please choose a smaller file or contact support.';
          } else if (axiosError.response?.status === 502) {
            errorMessage = 'The upload gateway could not reach the music API. Please try again in a moment.';
          } else if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          } else if (axiosError.response?.data?.errors) {
            errorMessage = Object.values(axiosError.response.data.errors).flat().join(', ');
          } else if (axiosError.response?.status) {
            errorMessage = `Server error (${axiosError.response.status}). Please try again.`;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const resetForm = () => {
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setTitle('');
    setAlbumId('');
    setGenreId('');
    setFeaturedArtists('');
    setLyrics('');
    setReleaseDate('');
    setPrice('');
    setIsExplicit(false);
    setDescription('');
    setComposer('');
    setProducer('');
    setIsDownloadable(true);
    setIsFree(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
  };

  // Success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-600">Upload Successful!</h1>
          <p className="text-muted-foreground">
            Your song has been submitted for review. You&apos;ll be notified when it&apos;s approved.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to your songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.flac,audio/*"
        className="hidden"
        onChange={handleAudioSelect}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverSelect}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Upload Music
        </h1>
        <p className="text-muted-foreground">Share your music with the world</p>
      </div>

      {/* Upload quota gate */}
      {currentSub && (
        <FeatureGate
          feature="uploads"
          used={0}
          limit={currentSub.limits.uploads_per_month}
          planName={currentSub.plan_name ?? currentSub.plan}
        />
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-200">Error</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            {error.includes('session has expired') ? (
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 whitespace-nowrap"
              >
                Log in
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  queryClient.invalidateQueries();
                  setError(null);
                  window.location.reload();
                }}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Audio File Upload */}
        <div className="p-6 rounded-xl border-2 border-dashed bg-card">
          {!audioFile ? (
            <div
              className="flex flex-col items-center justify-center py-8 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                <Upload className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium mb-2">Click to select audio file</p>
              <p className="text-sm text-muted-foreground">
                MP3, WAV, FLAC, AAC, M4A, OGG • Max 100MB
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-600">
                <FileAudio className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{audioFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(audioFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudioFile(null)}
                className="p-2 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Song Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover Art */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Art</label>
            <div
              className="aspect-square rounded-xl border-2 border-dashed bg-card flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload cover</p>
                  <p className="text-xs text-muted-foreground">Max 10MB</p>
                </div>
              )}
            </div>
            {coverFile && (
              <button
                type="button"
                onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove cover
              </button>
            )}
          </div>

          {/* Basic Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Song Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
                required
                maxLength={255}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Album (optional)</label>
                <select
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                >
                  <option value="">Single Release</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>{album.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  disabled={genresLoading}
                >
                  <option value="">Select genre</option>
                  {genres?.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Featured Artists</label>
              <input
                type="text"
                placeholder="e.g., Sheebah, Fik Fameica"
                value={featuredArtists}
                onChange={(e) => setFeaturedArtists(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="p-4 rounded-xl border bg-card space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Pricing</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="isFree" className="text-sm">
                Free to stream/download
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDownloadable"
                checked={isDownloadable}
                onChange={(e) => setIsDownloadable(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="isDownloadable" className="text-sm">
                Allow downloads
              </label>
            </div>
          </div>

          {!isFree && (
            <div>
              <label className="block text-sm font-medium mb-2">Price (UGX)</label>
              <input
                type="number"
                placeholder="e.g., 1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
                min="0"
                step="100"
              />
            </div>
          )}
        </div>

        {/* Release Date */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Release Date (optional)
          </label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty to release immediately after approval
          </p>
        </div>

        {/* Lyrics */}
        <div>
          <label className="block text-sm font-medium mb-2">Lyrics (optional)</label>
          <textarea
            rows={4}
            placeholder="Paste lyrics here..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-background resize-none"
          />
        </div>

        {/* Explicit Content */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="explicit"
            checked={isExplicit}
            onChange={(e) => setIsExplicit(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <label htmlFor="explicit" className="text-sm">
            This song contains explicit content
          </label>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-primary hover:underline text-sm"
        >
          <Info className="h-4 w-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 rounded-xl border bg-muted/30">
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                rows={3}
                placeholder="Tell listeners about this song..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">{description.length}/2000</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Composer</label>
                <input
                  type="text"
                  placeholder="Song composer"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Producer</label>
                <input
                  type="text"
                  placeholder="Song producer"
                  value={producer}
                  onChange={(e) => setProducer(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  maxLength={255}
                />
              </div>
            </div>
          </div>
        )}

        {/* Collaborator Split Note */}
        <div className="p-4 rounded-xl border bg-card space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Revenue Splits</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Want to share revenue with collaborators? After uploading, add royalty splits from the{' '}
            <Link href="/artist/royalty-splits" className="text-primary hover:underline">
              Royalty Splits
            </Link>{' '}
            page.
          </p>
        </div>

        {/* Review Note */}
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your song will be reviewed before publishing. This usually takes 24-48 hours.
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadMutation.isPending && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 border rounded-lg hover:bg-muted"
            disabled={uploadMutation.isPending}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!audioFile || !title.trim() || uploadMutation.isPending}
            className={cn(
              "flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload Song
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
