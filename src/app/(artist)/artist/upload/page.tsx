'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload,
  Music,
  Image as ImageIcon,
  FileAudio,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadSong, useArtistAlbums, UploadProgress } from '@/hooks/useArtist';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'details' | 'review'>('upload');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState<number | undefined>();
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [featuredArtists, setFeaturedArtists] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [isExplicit, setIsExplicit] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Hooks
  const { data: albumsData } = useArtistAlbums();
  const uploadMutation = useUploadSong((progress) => setUploadProgress(progress));
  
  const genres = ['Afrobeats', 'Dancehall', 'Hip Hop', 'R&B', 'Gospel', 'Reggae', 'Traditional', 'Pop'];
  const moods = ['Happy', 'Energetic', 'Romantic', 'Chill', 'Sad', 'Party', 'Motivational'];
  
  const handleAudioSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac)$/i)) {
        alert('Please select a valid audio file (MP3, WAV, or FLAC)');
        return;
      }
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB');
        return;
      }
      setAudioFile(file);
      // Auto-set title from filename if not set
      if (!title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(fileName);
      }
      setStep('details');
    }
  }, [title]);
  
  const handleCoverSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setCoverFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  }, []);
  
  const handleSubmit = async () => {
    if (!audioFile || !title || !agreedToTerms) return;
    
    try {
      await uploadMutation.mutateAsync({
        title,
        audio_file: audioFile,
        cover_image: coverFile || undefined,
        album_id: albumId,
        genre: genre || undefined,
        featured_artists: featuredArtists || undefined,
        lyrics: lyrics || undefined,
        release_date: releaseDate || undefined,
        price: price || undefined,
        is_explicit: isExplicit,
      });
      
      // Success - redirect to songs list
      router.push('/artist/songs?uploaded=true');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
        <h1 className="text-2xl font-bold">Upload Music</h1>
        <p className="text-muted-foreground">Share your music with the world</p>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {['upload', 'details', 'review'].map((s, index) => (
          <div key={s} className="flex items-center flex-1">
            <div className={cn(
              'flex items-center justify-center h-10 w-10 rounded-full font-medium',
              step === s ? 'bg-primary text-primary-foreground' :
              ['details', 'review'].indexOf(step) > index - 1 && step !== 'upload' ? 'bg-primary/20 text-primary' :
              'bg-muted text-muted-foreground'
            )}>
              {index + 1}
            </div>
            {index < 2 && (
              <div className={cn(
                'flex-1 h-1 mx-2',
                ['details', 'review'].indexOf(step) > index ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between text-sm">
        <span className={step === 'upload' ? 'text-primary font-medium' : 'text-muted-foreground'}>Upload File</span>
        <span className={step === 'details' ? 'text-primary font-medium' : 'text-muted-foreground'}>Song Details</span>
        <span className={step === 'review' ? 'text-primary font-medium' : 'text-muted-foreground'}>Review & Submit</span>
      </div>
      
      {/* Upload Step */}
      {step === 'upload' && (
        <div className="p-8 rounded-xl border-2 border-dashed bg-card">
          {!audioFile ? (
            <div 
              className="flex flex-col items-center justify-center py-12 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                <Upload className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium mb-2">Drag and drop your audio file</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Supported formats: MP3, WAV, FLAC • Max size: 100MB
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-600">
                <FileAudio className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{audioFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(audioFile.size)}
                </p>
              </div>
              <button 
                onClick={() => setAudioFile(null)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Details Step */}
      {step === 'details' && (
        <div className="space-y-6">
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
                    <p className="text-xs text-muted-foreground">1400x1400px recommended</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Song Info */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Song Title *</label>
                <input
                  type="text"
                  placeholder="Enter song title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Album (optional)</label>
                <select 
                  value={albumId ?? ''}
                  onChange={(e) => setAlbumId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                >
                  <option value="">Single (no album)</option>
                  {albumsData?.data?.map((album) => (
                    <option key={album.id} value={album.id}>{album.title}</option>
                  ))}
                </select>
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
                <p className="text-xs text-muted-foreground mt-1">Separate multiple artists with commas</p>
              </div>
            </div>
          </div>
          
          {/* Genre & Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Genre *</label>
              <select 
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              >
                <option value="">Select genre</option>
                {genres.map((g) => (
                  <option key={g} value={g.toLowerCase()}>{g}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Mood</label>
              <select 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              >
                <option value="">Select mood</option>
                {moods.map((m) => (
                  <option key={m} value={m.toLowerCase()}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Release Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Release Date</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty to release immediately after approval</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Price (UGX)</label>
              <input
                type="number"
                placeholder="0 for free download"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-full px-4 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>
          
          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium mb-2">Lyrics (optional)</label>
            <textarea
              rows={6}
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
        </div>
      )}
      
      {/* Review Step */}
      {step === 'review' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-4">Review Your Submission</h2>
            
            <div className="flex gap-6">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="h-32 w-32 rounded-xl object-cover" />
              ) : (
                <div className="h-32 w-32 rounded-xl bg-muted flex items-center justify-center">
                  <Music className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-xl font-bold">{title || 'Untitled Song'}</p>
                <p className="text-muted-foreground">
                  {albumId && albumsData?.data?.find(a => a.id === albumId)?.title || 'Single'} 
                  {genre && ` • ${genre.charAt(0).toUpperCase() + genre.slice(1)}`}
                </p>
                {audioFile && (
                  <p className="text-sm text-muted-foreground">File: {audioFile.name}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Release: {releaseDate || 'Immediately after approval'}
                </p>
                {isExplicit && (
                  <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded">
                    Explicit
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {uploadMutation.isError && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Upload Failed</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {(uploadMutation.error as Error)?.message || 'An error occurred while uploading your song.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Review Note</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your song will be reviewed by our team before publishing. This usually takes 24-48 hours.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="h-4 w-4 rounded" 
            />
            <label htmlFor="terms" className="text-sm">
              I confirm that I own or have the rights to distribute this music
            </label>
          </div>
          
          {/* Upload Progress */}
          {uploadMutation.isPending && uploadProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress.percent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        {step !== 'upload' && (
          <button
            onClick={() => setStep(step === 'review' ? 'details' : 'upload')}
            disabled={uploadMutation.isPending}
            className="px-6 py-2 border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            Back
          </button>
        )}
        <div className="flex-1" />
        {step === 'upload' && audioFile && (
          <button
            onClick={() => setStep('details')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Continue
          </button>
        )}
        {step === 'details' && (
          <button
            onClick={() => setStep('review')}
            disabled={!title}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Review
          </button>
        )}
        {step === 'review' && (
          <button 
            onClick={handleSubmit}
            disabled={!agreedToTerms || uploadMutation.isPending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Submit for Review'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
