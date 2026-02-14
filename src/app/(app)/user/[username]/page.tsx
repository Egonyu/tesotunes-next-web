"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Music,
  Heart,
  ListMusic,
  Calendar,
  MapPin,
  Link as LinkIcon,
  MessageSquare,
  UserPlus,
  UserCheck,
  MoreHorizontal,
  Share2,
  Flag,
  Users,
  Play,
  Clock,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { formatNumber, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface UserProfile {
  id: number;
  name: string;
  username: string;
  bio?: string;
  avatar_url: string | null;
  cover_url: string | null;
  location?: string;
  website?: string;
  joined_at: string;
  is_verified: boolean;
  is_artist: boolean;
  is_following: boolean;
  is_follower: boolean;
  stats: {
    followers: number;
    following: number;
    playlists: number;
    liked_songs: number;
  };
  badges: {
    id: number;
    name: string;
    icon: string;
  }[];
  recent_activity: {
    id: number;
    type: "like" | "playlist" | "follow" | "listen";
    content: string;
    timestamp: string;
    item?: {
      title: string;
      image_url: string | null;
      url: string;
    };
  }[];
  public_playlists: {
    id: number;
    name: string;
    slug: string;
    cover_url: string | null;
    tracks_count: number;
    followers_count: number;
  }[];
  favorite_artists: {
    id: number;
    name: string;
    slug: string;
    avatar_url: string | null;
  }[];
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: () => apiGet<UserProfile>(`/social/profiles/${username}`),
  });

  const toggleFollow = useMutation({
    mutationFn: () => apiPost(`/social/follow/${profile?.id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", username] });
      toast.success(profile?.is_following ? "Unfollowed" : "Following");
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-muted" />
        <div className="container mx-auto px-4 -mt-16">
          <div className="flex items-end gap-6 mb-8">
            <div className="w-32 h-32 bg-muted rounded-full border-4 border-background" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find a user with that username.
        </p>
        <Link href="/browse" className="text-primary hover:underline">
          Browse Music
        </Link>
      </div>
    );
  }

  const isOwnProfile = Number(session?.user?.id) === profile.id;

  return (
    <div>
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-linear-to-br from-primary/30 to-primary/10">
        {profile.cover_url && (
          <Image
            src={profile.cover_url}
            alt="Cover"
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-muted overflow-hidden">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    width={160}
                    height={160}
                    className="object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 m-auto mt-10 text-muted-foreground" />
                )}
              </div>
              {profile.is_verified && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.is_artist && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    Artist
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>
              
              {profile.bio && (
                <p className="mt-3 max-w-2xl">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(profile.joined_at)}
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <button className="text-center hover:text-primary">
                  <span className="font-bold">{formatNumber(profile.stats.followers)}</span>
                  <span className="text-sm text-muted-foreground ml-1">Followers</span>
                </button>
                <button className="text-center hover:text-primary">
                  <span className="font-bold">{formatNumber(profile.stats.following)}</span>
                  <span className="text-sm text-muted-foreground ml-1">Following</span>
                </button>
                <div className="text-center">
                  <span className="font-bold">{formatNumber(profile.stats.playlists)}</span>
                  <span className="text-sm text-muted-foreground ml-1">Playlists</span>
                </div>
              </div>

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {profile.badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="px-2 py-1 bg-muted rounded-full text-xs flex items-center gap-1"
                      title={badge.name}
                    >
                      <span>{badge.icon}</span>
                      {badge.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Link
                  href="/settings/profile"
                  className="px-4 py-2 border rounded-lg hover:bg-muted"
                >
                  Edit Profile
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleFollow.mutate()}
                    disabled={toggleFollow.isPending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      profile.is_following
                        ? "border hover:bg-muted"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {profile.is_following ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </button>
                  <Link
                    href={`/messages?user=${profile.username}`}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Link>
                  <button className="p-2 border rounded-lg hover:bg-muted">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Public Playlists */}
            {profile.public_playlists.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ListMusic className="h-5 w-5" />
                    Public Playlists
                  </h2>
                  <Link href={`/user/${username}/playlists`} className="text-primary text-sm">
                    See all
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.public_playlists.slice(0, 4).map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={`/playlists/${playlist.slug}`}
                      className="flex items-center gap-4 p-4 bg-card rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="relative w-16 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                        {playlist.cover_url ? (
                          <Image
                            src={playlist.cover_url}
                            alt={playlist.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ListMusic className="w-6 h-6 m-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{playlist.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {playlist.tracks_count} tracks • {formatNumber(playlist.followers_count)} followers
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Activity */}
            {profile.recent_activity.length > 0 && (
              <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {profile.recent_activity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-card rounded-lg border"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === "like"
                            ? "bg-red-500/10 text-red-500"
                            : activity.type === "playlist"
                            ? "bg-blue-500/10 text-blue-500"
                            : activity.type === "follow"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-purple-500/10 text-purple-500"
                        }`}
                      >
                        {activity.type === "like" && <Heart className="h-5 w-5" />}
                        {activity.type === "playlist" && <ListMusic className="h-5 w-5" />}
                        {activity.type === "follow" && <UserPlus className="h-5 w-5" />}
                        {activity.type === "listen" && <Play className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p>{activity.content}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                      {activity.item && (
                        <Link
                          href={activity.item.url}
                          className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0"
                        >
                          {activity.item.image_url ? (
                            <Image
                              src={activity.item.image_url}
                              alt={activity.item.title}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <Music className="w-5 h-5 m-3.5 text-muted-foreground" />
                          )}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Favorite Artists */}
            {profile.favorite_artists.length > 0 && (
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Favorite Artists
                </h3>
                <div className="space-y-3">
                  {profile.favorite_artists.map((artist) => (
                    <Link
                      key={artist.id}
                      href={`/artists/${artist.slug}`}
                      className="flex items-center gap-3 hover:bg-muted p-2 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                        {artist.avatar_url ? (
                          <Image
                            src={artist.avatar_url}
                            alt={artist.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 m-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium">{artist.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mutual Friends */}
            {!isOwnProfile && profile.is_follower && (
              <div className="bg-card rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Follows you</span>
                </div>
              </div>
            )}

            {/* Share Profile */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-muted">
                <Share2 className="h-4 w-4" />
                Share Profile
              </button>
              {!isOwnProfile && (
                <button className="p-3 border rounded-lg hover:bg-muted text-muted-foreground">
                  <Flag className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
