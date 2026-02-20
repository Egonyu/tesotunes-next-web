'use client';

import { useState, useRef } from 'react';
import {
  ImageIcon,
  Video,
  Music,
  X,
  Loader2,
  Globe,
  Users,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Visibility = 'public' | 'followers' | 'private';

interface CreatePostComposerProps {
  onSubmit: (data: {
    content: string;
    visibility: Visibility;
    media?: File[];
    song_id?: number;
  }) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
  avatarUrl?: string;
  avatarFallback?: string;
}

const visibilityOptions: { value: Visibility; label: string; icon: React.ElementType }[] = [
  { value: 'public', label: 'Everyone', icon: Globe },
  { value: 'followers', label: 'Followers', icon: Users },
  { value: 'private', label: 'Only me', icon: Lock },
];

export function CreatePostComposer({
  onSubmit,
  isSubmitting = false,
  placeholder = "What's happening in music?",
  avatarUrl,
  avatarFallback = '?',
}: CreatePostComposerProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [showVisibility, setShowVisibility] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    await onSubmit({
      content: content.trim(),
      visibility,
      media: mediaFiles.length > 0 ? mediaFiles : undefined,
    });
    setContent('');
    setMediaFiles([]);
    setMediaPreviews([]);
  };

  const handleFileSelect = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 files
    const remaining = 10 - mediaFiles.length;
    const newFiles = files.slice(0, remaining);

    setMediaFiles((prev) => [...prev, ...newFiles]);

    // Create preview URLs
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const VisibilityIcon = visibilityOptions.find((v) => v.value === visibility)?.icon ?? Globe;

  return (
    <div className="p-4 rounded-xl border bg-card">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
              {avatarFallback}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Visibility Selector */}
          <div className="relative mb-2">
            <button
              onClick={() => setShowVisibility(!showVisibility)}
              className="flex items-center gap-1 text-xs font-medium text-primary px-2.5 py-1 rounded-full border border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <VisibilityIcon className="h-3 w-3" />
              {visibilityOptions.find((v) => v.value === visibility)?.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showVisibility && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowVisibility(false)} />
                <div className="absolute top-full mt-1 left-0 bg-popover border rounded-lg shadow-lg z-20 py-1 w-40">
                  {visibilityOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setVisibility(opt.value);
                          setShowVisibility(false);
                        }}
                        className={cn(
                          'flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors',
                          visibility === opt.value && 'text-primary font-medium'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground"
          />

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group/media">
                  <img
                    src={preview}
                    alt=""
                    className="h-20 w-20 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex gap-1">
              <button
                onClick={() => handleFileSelect('image/*')}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors"
                title="Add image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleFileSelect('video/*')}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors"
                title="Add video"
              >
                <Video className="h-5 w-5" />
              </button>
              <button
                className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors"
                title="Attach song"
              >
                <Music className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && mediaFiles.length === 0) || isSubmitting}
              className={cn(
                'px-5 py-2 rounded-full font-medium text-sm transition-colors',
                content.trim() || mediaFiles.length > 0
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </span>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
