"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import type { Playlist } from "@/types";
import { useRemovePlaylistArtwork, useUpdatePlaylist } from "@/hooks/api";
import { useRouter } from "next/navigation";

interface PlaylistEditModalProps {
  open: boolean;
  onClose: () => void;
  playlist: Playlist;
}

export function PlaylistEditModal({ open, onClose, playlist }: PlaylistEditModalProps) {
  const router = useRouter();
  const updatePlaylist = useUpdatePlaylist();
  const removePlaylistArtwork = useRemovePlaylistArtwork();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description ?? "");
  const [isPublic, setIsPublic] = useState(playlist.visibility === "public" || playlist.is_public === true);
  const [isCollaborative, setIsCollaborative] = useState(playlist.is_collaborative);
  const [collaborationRequiresApproval, setCollaborationRequiresApproval] = useState(playlist.collaboration_requires_approval === true);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(playlist.artwork_url ?? null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(playlist.name);
    setDescription(playlist.description ?? "");
    setIsPublic(playlist.visibility === "public" || playlist.is_public === true);
    setIsCollaborative(playlist.is_collaborative);
    setCollaborationRequiresApproval(playlist.collaboration_requires_approval === true);
    setArtworkFile(null);
    setArtworkPreview(playlist.artwork_url ?? null);
  }, [open, playlist]);

  useEffect(() => {
    if (!artworkFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(artworkFile);
    setArtworkPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [artworkFile]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("_method", "PUT");
    payload.append("name", name.trim());
    payload.append("description", description.trim());
    payload.append("is_public", isPublic ? "1" : "0");
    payload.append("is_collaborative", isCollaborative ? "1" : "0");
    payload.append("collaboration_requires_approval", isCollaborative && collaborationRequiresApproval ? "1" : "0");
    if (artworkFile) {
      payload.append("cover_image", artworkFile);
    }

    updatePlaylist.mutate(
      {
        playlistId: playlist.slug || playlist.id,
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success("Playlist updated");
          router.refresh();
          onClose();
        },
        onError: () => {
          toast.error("Failed to update playlist");
        },
      }
    );
  };

  const handleRemoveArtwork = () => {
    removePlaylistArtwork.mutate(playlist.slug || playlist.id, {
      onSuccess: () => {
        toast.success("Playlist artwork removed");
        setArtworkFile(null);
        setArtworkPreview(null);
        router.refresh();
      },
      onError: () => {
        toast.error("Failed to remove artwork");
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Edit playlist</h2>
            <p className="text-sm text-muted-foreground">Update details, visibility, and artwork</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Cover image</label>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-3 hover:bg-muted/40 transition-colors">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {artworkPreview ? (
                  <Image src={artworkPreview} alt="Playlist artwork preview" fill className="object-cover" unoptimized />
                ) : (
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">Replace cover art</p>
                <p className="text-sm text-muted-foreground">JPG, PNG, or WEBP up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => setArtworkFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {artworkPreview && (
              <button
                type="button"
                onClick={handleRemoveArtwork}
                disabled={removePlaylistArtwork.isPending}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                {removePlaylistArtwork.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Remove artwork
              </button>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-border"
            />
            Make playlist public
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isCollaborative}
              onChange={(e) => setIsCollaborative(e.target.checked)}
              className="rounded border-border"
            />
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Let collaborators add and reorder songs
            </span>
          </label>

          {isCollaborative && (
            <label className="flex items-center gap-2 text-sm rounded-lg border p-3">
              <input
                type="checkbox"
                checked={collaborationRequiresApproval}
                onChange={(e) => setCollaborationRequiresApproval(e.target.checked)}
                className="rounded border-border"
              />
              Require approval for invite-link joins
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || updatePlaylist.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {updatePlaylist.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
