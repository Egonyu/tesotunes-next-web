"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2, ListMusic, ImagePlus, Users } from "lucide-react";
import { useCreatePlaylist } from "@/hooks/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Playlist } from "@/types";
import { isApiError } from "@/lib/api";

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (playlist: Playlist) => void;
  redirectOnCreate?: boolean;
}

export function CreatePlaylistModal({
  open,
  onClose,
  onCreated,
  redirectOnCreate = true,
}: CreatePlaylistModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [collaborationRequiresApproval, setCollaborationRequiresApproval] = useState(false);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const createPlaylist = useCreatePlaylist();

  const extractPlaylistErrorMessage = (error: unknown): string => {
    if (isApiError(error)) {
      const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
      const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;

      return firstFieldError || data?.message || "Failed to create playlist";
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Failed to create playlist";
  };

  useEffect(() => {
    if (!artworkFile) {
      setArtworkPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(artworkFile);
    setArtworkPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [artworkFile]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = new FormData();
    payload.append("name", name.trim());
    if (description.trim()) {
      payload.append("description", description.trim());
    }
    payload.append("is_public", isPublic ? "1" : "0");
    payload.append("is_collaborative", isCollaborative ? "1" : "0");
    payload.append("collaboration_requires_approval", isCollaborative && collaborationRequiresApproval ? "1" : "0");
    if (artworkFile) {
      payload.append("cover_image", artworkFile);
    }

    createPlaylist.mutate(
      payload,
      {
        onSuccess: (playlist) => {
          toast.success("Playlist created!");
          setName("");
          setDescription("");
          setIsPublic(true);
          setIsCollaborative(false);
          setCollaborationRequiresApproval(false);
          setArtworkFile(null);
          onClose();
          onCreated?.(playlist);
          if (redirectOnCreate && (playlist?.slug || playlist?.id)) {
            router.push(`/playlists/${playlist.slug || playlist.id}`);
          }
        },
        onError: (error) => {
          toast.error(extractPlaylistErrorMessage(error));
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-card border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Create Playlist</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Cover image (optional)</label>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-3 hover:bg-muted/40 transition-colors">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {artworkPreview ? (
                  <Image
                    src={artworkPreview}
                    alt="Playlist cover preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium">Upload cover art</p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, or WEBP up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => setArtworkFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome playlist"
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this playlist about?"
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">Make playlist public</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCollaborative}
              onChange={(e) => setIsCollaborative(e.target.checked)}
              className="rounded border-border"
            />
            <span className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Let collaborators add and reorder songs
            </span>
          </label>

          {isCollaborative && (
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3">
              <input
                type="checkbox"
                checked={collaborationRequiresApproval}
                onChange={(e) => setCollaborationRequiresApproval(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">
                Require approval before someone joins through the invite link
              </span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createPlaylist.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createPlaylist.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
