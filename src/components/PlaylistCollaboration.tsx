'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Crown,
  Link2,
  Loader2,
  MoreVertical,
  Pencil,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { useGeneratePlaylistInviteLink, usePlaylistCollaborators } from '@/hooks/api';
import type { PlaylistCollaborator } from '@/types';
import { toast } from 'sonner';

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
  collaborationRequiresApproval?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
] as const;

export default function PlaylistCollaboration({
  playlistId,
  isOwner,
  isCollaborative,
  collaborationRequiresApproval = false,
}: PlaylistCollaborationProps) {
  const queryClient = useQueryClient();
  const [showPanel, setShowPanel] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | number | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const { data: collaborators, isLoading } = usePlaylistCollaborators(playlistId, { enabled: showPanel });
  const generateInviteLink = useGeneratePlaylistInviteLink();

  const { data: searchResults } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: async () => {
      const response = await apiGet<{ data: SearchUser[] }>('/users/search', { params: { q: searchQuery } });
      return response.data;
    },
    enabled: searchQuery.length >= 2,
  });

  const inviteCollaborator = useMutation({
    mutationFn: (data: { userId: number; role: string }) =>
      apiPost(`/playlists/${playlistId}/collaborators`, { user_id: data.userId, role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-collaborators', playlistId] });
      toast.success('Collaborator added');
      setSearchQuery('');
      setShowInvite(false);
    },
    onError: () => toast.error('Failed to add collaborator'),
  });

  const removeCollaborator = useMutation({
    mutationFn: (collaboratorId: number | string) =>
      apiDelete(`/playlists/${playlistId}/collaborators/${collaboratorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-collaborators', playlistId] });
      toast.success('Collaborator removed');
      setMenuOpen(null);
    },
    onError: () => toast.error('Failed to remove collaborator'),
  });

  const updateRole = useMutation({
    mutationFn: ({ collaboratorId, role }: { collaboratorId: number | string; role: string }) =>
      apiPost(`/playlists/${playlistId}/collaborators/${collaboratorId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-collaborators', playlistId] });
      toast.success('Role updated');
      setMenuOpen(null);
    },
    onError: () => toast.error('Failed to update role'),
  });

  const approveCollaborator = useMutation({
    mutationFn: (collaboratorId: number | string) =>
      apiPost(`/playlists/${playlistId}/collaborators/${collaboratorId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-collaborators', playlistId] });
      toast.success('Collaborator approved');
      setMenuOpen(null);
    },
    onError: () => toast.error('Failed to approve collaborator'),
  });

  const toggleCollaborative = useMutation({
    mutationFn: (nextValue: boolean) =>
      apiPost(`/playlists/${playlistId}/collaborative`, {
        is_collaborative: nextValue,
        collaboration_requires_approval: collaborationRequiresApproval,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      toast.success(isCollaborative ? 'Collaboration disabled' : 'Collaboration enabled');
    },
  });

  const existingUserIds = useMemo(
    () => new Set((collaborators ?? []).map((collaborator) => collaborator.user.id)),
    [collaborators]
  );

  const pendingCollaborators = collaborators?.filter((collaborator) => collaborator.status === 'pending') ?? [];

  const copyInviteLink = async () => {
    try {
      const response = await generateInviteLink.mutateAsync({ playlistId });
      const inviteUrl = response.data.invite_url;

      if (navigator.share) {
        await navigator.share({
          title: 'Join my playlist',
          text: 'Use this link to collaborate on my playlist.',
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }

      toast.success('Invite link ready to share');
    } catch {
      toast.error('Failed to create invite link');
    }
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3.5 w-3.5 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3.5 w-3.5 text-violet-500" />;
      case 'editor':
        return <Pencil className="h-3.5 w-3.5 text-blue-500" />;
      case 'viewer':
        return <UserCheck className="h-3.5 w-3.5 text-emerald-500" />;
      default:
        return null;
    }
  };

  return (
    <>
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

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-background shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Collaborators</h2>
                <p className="text-xs text-muted-foreground">
                  Invite people, review requests, and decide who can edit.
                </p>
              </div>
              <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-muted rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            {isOwner && (
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Collaborative Playlist</p>
                    <p className="text-xs text-muted-foreground">
                      Allow others to add, remove, and reorder songs.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCollaborative.mutate(!isCollaborative)}
                    disabled={toggleCollaborative.isPending}
                    className={`relative w-11 h-6 rounded-full transition-colors ${isCollaborative ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isCollaborative ? 'translate-x-5' : ''}`}
                    />
                  </button>
                </div>

                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-sm font-medium">Join requests</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {collaborationRequiresApproval
                      ? 'New joiners need approval before they can access the playlist.'
                      : 'Anyone with the invite link joins immediately.'}
                  </p>
                </div>
              </div>
            )}

            {isOwner && isCollaborative && (
              <div className="p-4 border-b space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowInvite((value) => !value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add collaborator
                  </button>
                  <button
                    onClick={copyInviteLink}
                    disabled={generateInviteLink.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted"
                  >
                    {generateInviteLink.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" />
                    )}
                    {copied ? 'Copied!' : 'Copy invite link'}
                  </button>
                </div>

                {showInvite && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search users by name or username..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                      </div>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                        className="rounded-lg border bg-background px-2 py-2 text-sm"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {searchResults && searchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-1">
                        {searchResults
                          .filter((user) => !existingUserIds.has(user.id))
                          .map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                              <div className="flex items-center gap-2">
                                <Avatar user={user} />
                                <div>
                                  <p className="text-sm font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => inviteCollaborator.mutate({ userId: user.id, role: selectedRole })}
                                disabled={inviteCollaborator.isPending}
                                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {pendingCollaborators.length > 0 && (
                  <div className="rounded-xl border bg-amber-50/60 p-3 dark:bg-amber-950/20">
                    <p className="text-sm font-medium">Pending approval</p>
                    <div className="mt-2 space-y-2">
                      {pendingCollaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar user={collaborator.user} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{collaborator.user.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                Wants to join as {collaborator.role}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => approveCollaborator.mutate(collaborator.id)}
                            disabled={approveCollaborator.isPending}
                            className="rounded-lg bg-primary px-2.5 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                          >
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : collaborators?.length ? (
                collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <Avatar user={collaborator.user} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{collaborator.user.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {roleIcon(collaborator.role)}
                        <span className="capitalize">{collaborator.role}</span>
                        <span>•</span>
                        <span className="capitalize">{collaborator.status}</span>
                      </div>
                    </div>
                    {isOwner && collaborator.role !== 'owner' && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === collaborator.id ? null : collaborator.id)}
                          className="p-1 hover:bg-muted rounded-full"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuOpen === collaborator.id && (
                          <div className="absolute right-0 top-8 w-40 bg-popover border rounded-lg shadow-lg z-10 py-1">
                            {collaborator.status === 'pending' && (
                              <button
                                onClick={() => approveCollaborator.mutate(collaborator.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </button>
                            )}
                            {ROLE_OPTIONS.map((role) => (
                              <button
                                key={role.value}
                                onClick={() => updateRole.mutate({ collaboratorId: collaborator.id, role: role.value })}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                              >
                                {roleIcon(role.value)}
                                Make {role.label}
                              </button>
                            ))}
                            <button
                              onClick={() => removeCollaborator.mutate(collaborator.id)}
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
                    {isCollaborative ? 'No collaborators yet. Invite someone.' : 'Enable collaboration to invite others.'}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Admins can approve join requests and manage roles. Editors can curate the playlist. Viewers can access private collaboration spaces without editing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Avatar({ user, size = 32 }: { user: { name: string; avatar_url?: string | null }; size?: number }) {
  return (
    <div className="rounded-full bg-muted overflow-hidden shrink-0" style={{ width: size, height: size }}>
      {user.avatar_url ? (
        <Image src={user.avatar_url} alt={user.name} width={size} height={size} className="object-cover h-full w-full" />
      ) : (
        <UserIcon className="text-muted-foreground" style={{ width: size / 2, height: size / 2, margin: size / 4 }} />
      )}
    </div>
  );
}
