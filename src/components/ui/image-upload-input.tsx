'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiPostForm } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ImageUploadInputProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  uploadType?: 'cover' | 'album' | 'artist' | 'playlist';
  label?: string;
  hint?: string;
  aspectRatio?: 'video' | 'square' | 'banner';
  className?: string;
}

type UploadResponse = {
  success: boolean;
  data: { url: string };
};

export function ImageUploadInput({
  value,
  onChange,
  uploadType = 'cover',
  label,
  hint = 'JPEG, PNG or WebP · max 5 MB',
  aspectRatio = 'video',
  className,
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    banner: 'aspect-[3/1]',
  }[aspectRatio];

  const displayUrl = localPreview ?? value ?? null;

  const handleFile = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('type', uploadType);

      const res = await apiPostForm<UploadResponse>('/uploads/image', fd);

      if (res.success && res.data?.url) {
        onChange(res.data.url);
      } else {
        toast.error('Image upload failed');
        setLocalPreview(null);
        onChange(null);
      }
    } catch {
      toast.error('Failed to upload image — check your connection');
      setLocalPreview(null);
      onChange(null);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange(null);
    setLocalPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <p className="text-sm font-medium">{label}</p>}

      {displayUrl ? (
        <div className={cn('relative w-full overflow-hidden rounded-lg bg-muted', aspectClass)}>
          <Image
            src={displayUrl}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={displayUrl.startsWith('blob:')}
          />

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}

          {!uploading && (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-black/80"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Change
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
          <span className="text-sm font-medium">
            {uploading ? 'Uploading…' : 'Click to upload image'}
          </span>
          {!uploading && hint && (
            <span className="text-xs">{hint}</span>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFile(file);
          }
        }}
      />
    </div>
  );
}
