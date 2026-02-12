'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  X,
  Crown,
  Pencil,
  Eye,
  Search,
  Loader2,
  Copy,
  Check,
  MoreVertical,
  Trash2,
  Shield,
  Link2,
  User as UserIcon,
} from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

interface Collaborator {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url: string | null;
  };
  role: 'owner' | 'editor' | 'viewer';
  added_at: string;
}

interface SearchUser {
  id: number;
  name: string;
  username: string;
  avatar_url: string | null;
}

interface PlaylistCollaborationProps {
  playlistId: number;
  isOwner: boolean;
  isCollaborative: boolean;
}

export default function PlaylistCollaboration({
  playlistId,
  isOwner,
  isCollaborative,
}: PlaylistCollaborationProps) {
  const queryClient = useQueryClient();
  const [showPanel, setShowPanel] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const { data: collaborators, isLoading } = useQuery({
    queryKey: ['playlist-collaborators', playlistId],
    queryFn: () => apiGet<Collaborator[]>(`/api/playlists/${playlistId}/collaborators`),
    enabled: showPanel,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: () => apiGet<SearchUser[]>('/social/users/search', { params: { q: searchQuery } }),
    enabled: searchQuery.length >= 2,
  });

  const inviteCollaborator = useMutation({
    mutationFn: (data: { userId: number; role: 'editor' | 'viewer' }) =>
      apiPost(`/api/playlists/${playlistId}/collaborators`, { user_id: data.userId, role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-collaborators', playlistId] });
      toast.success('Collaborator invited!');
      setSearchQuery('');
      setShowInvite(false);
    },
    onError: () => toast.error('Failed to invite collaborator'),
  });

  const removeCollaborator = useMutation({
    mutationFn: (collaboratorId: number) =>
      apiDelete(`/api/playlists/${playlistId}/collaborators/${collaboratorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-collaborators', playlistId] });
      toast.success('Collaborator removed');
      setMenuOpen(null);
    },
    onError: () => toast.error('Failed to remove collaborator'),
  });

  const updateRole = useMutation({
    mutationFn: (data: { collaboratorId: number; role: 'editor' | 'viewer' }) =>
      apiPost(`/api/playlists/${playlistId}/collaborators/${data.collaboratorId}/role`, { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-collaborators', playlistId] });
      toast.success('Role updated');
      setMenuOpen(null);
    },
  });

  const toggleCollaborative = useMutation({
    mutationFn: () =>
      apiPost(`/api/playlists/${playlistId}/collaborative`, { is_collaborative: !isCollaborative }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      toast.success(isCollaborative ? 'Collaboration disabled' : 'Collaboration enabled');
    },
  });

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/playlists/invite/${playlistId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Invite link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3.5 w-3.5 text-yellow-500" />;
      case 'editor': return <Pencil className="h-3.5 w-3.5 text-blue-500" />;
      case 'viewer': return <Eye className="h-3.5 w-3.5 text-muted-foreground" />;
      default: return null;
    }
  };

  const existingUserIds = new Set(collaborators?.map((c) => c.user.id) || []);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setShowPanel(true)}
        className="p-3 text-muted-foreground hover:text-foreground relative"
        title="Collaborators"
      >
        <Users className="h-6 w-6" />
        {isCollaborative && collaborators && collaborators.length > 1 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
            {collaborators.length}
          </span>
        )}
      </button>

      {/* Slide-over panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-background shadow-xl flex flex-col">
            {/* Panel Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Collaborators</h2>
              <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-muted rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Collaborative toggle (owner only) */}
            {isOwner && (
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Collaborative Playlist</p>
                    <p className="text-xs text-muted-foreground">
                      Allow others to add and reorder songs
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCollaborative.mutate()}
                    disabled={toggleCollaborative.isPending}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      isCollaborative ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        isCollaborative ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Invite section */}
            {isOwner && isCollaborative && (
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInvite(!showInvite)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Invite
                  </button>
                  <button
                    onClick={copyInviteLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Link2 className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>

                {showInvite && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search users by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                    </div>
                    {searchResults && searchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-1">
                        {searchResults
                          .filter((u) => !existingUserIds.has(u.id))
                          .map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                  {user.avatar_url ? (
                                    <Image src={user.avatar_url} alt={user.name} width={32} height={32} className="object-cover" />
                                  ) : (
                                    <UserIcon className="w-4 h-4 m-2 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => inviteCollaborator.mutate({ userId: user.id, role: 'editor' })}
                                  disabled={inviteCollaborator.isPending}
                                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                                >
                                  Editor
                                </button>
                                <button
                                  onClick={() => inviteCollaborator.mutate({ userId: user.id, role: 'viewer' })}
                                  disabled={inviteCollaborator.isPending}
                                  className="px-2 py-1 text-xs border rounded hover:bg-muted"
                                >
                                  Viewer
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Collaborator list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : collaborators?.length ? (
                collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                      {collab.user.avatar_url ? (
                        <Image
                          src={collab.user.avatar_url}
                          alt={collab.user.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <UserIcon className="w-5 h-5 m-2.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{collab.user.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {roleIcon(collab.role)}
                        <span className="capitalize">{collab.role}</span>
                      </div>
                    </div>
                    {isOwner && collab.role !== 'owner' && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === collab.id ? null : collab.id)}
                          className="p-1 hover:bg-muted rounded-full"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuOpen === collab.id && (
                          <div className="absolute right-0 top-8 w-40 bg-popover border rounded-lg shadow-lg z-10 py-1">
                            <button
                              onClick={() =>
                                updateRole.mutate({
                                  collaboratorId: collab.id,
                                  role: collab.role === 'editor' ? 'viewer' : 'editor',
                                })
                              }
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                            >
                              <Shield className="h-3.5 w-3.5" />
                              Make {collab.role === 'editor' ? 'Viewer' : 'Editor'}
                            </button>
                            <button
                              onClick={() => removeCollaborator.mutate(collab.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isCollaborative
                      ? 'No collaborators yet. Invite someone!'
                      : 'Enable collaboration to invite others.'}
                  </p>
                </div>
              )}
            </div>

            {/* Info footer */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong>Editors</strong> can add, remove, and reorder songs.{' '}
                  <strong>Viewers</strong> can only listen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
