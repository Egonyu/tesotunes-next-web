'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Link2,
  Unlink,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Music,
  Globe,
  Loader2,
  Check,
  ExternalLink,
  Plus,
  Shield,
} from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface ConnectedAccount {
  id: number;
  provider: string;
  provider_id: string;
  username: string;
  avatar_url?: string;
  connected_at: string;
  is_login_method: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
}

const SOCIAL_PROVIDERS = [
  { id: 'google', name: 'Google', icon: Globe, color: 'bg-red-500', description: 'Sign in with Google' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', description: 'Sign in with Facebook' },
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: 'bg-sky-500', description: 'Sign in with Twitter' },
  { id: 'apple', name: 'Apple', icon: Shield, color: 'bg-gray-800', description: 'Sign in with Apple' },
] as const;

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@channel' },
  { id: 'spotify', name: 'Spotify', icon: Music, placeholder: 'https://open.spotify.com/artist/...' },
  { id: 'website', name: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
] as const;

export default function ConnectedAccountsPage() {
  const queryClient = useQueryClient();
  const [editingLinks, setEditingLinks] = useState(false);
  const [links, setLinks] = useState<Record<string, string>>({});

  const { data: connectedAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['connected-accounts'],
    queryFn: () => apiGet<ConnectedAccount[]>('/settings/connected-accounts'),
  });

  const { data: socialLinks, isLoading: loadingLinks } = useQuery({
    queryKey: ['social-links'],
    queryFn: () => apiGet<SocialLink[]>('/settings/social-links'),
  });

  // Initialize links form when data loads
  useState(() => {
    if (socialLinks) {
      const linkMap: Record<string, string> = {};
      socialLinks.forEach((l) => { linkMap[l.platform] = l.url; });
      setLinks(linkMap);
    }
  });

  const connectAccount = useMutation({
    mutationFn: (provider: string) =>
      apiPost<{ redirect_url: string }>(`/api/auth/connect/${provider}`, {}),
    onSuccess: (data) => {
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      }
    },
    onError: () => toast.error('Failed to connect account'),
  });

  const disconnectAccount = useMutation({
    mutationFn: (id: number) =>
      apiDelete(`/api/settings/connected-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
      toast.success('Account disconnected');
    },
    onError: () => toast.error('Failed to disconnect account'),
  });

  const saveSocialLinks = useMutation({
    mutationFn: (data: Record<string, string>) =>
      apiPost('/settings/social-links', { links: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
      toast.success('Social links saved');
      setEditingLinks(false);
    },
    onError: () => toast.error('Failed to save social links'),
  });

  const isConnected = (provider: string) =>
    connectedAccounts?.some((a) => a.provider === provider);

  const getConnectedAccount = (provider: string) =>
    connectedAccounts?.find((a) => a.provider === provider);

  if (loadingAccounts || loadingLinks) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Connected Accounts</h1>
        <p className="text-muted-foreground mt-1">
          Manage your login methods and social media links
        </p>
      </div>

      {/* Login Methods */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Login Methods
        </h2>
        <p className="text-sm text-muted-foreground">
          Connect accounts for faster sign-in. You must keep at least one login method active.
        </p>
        <div className="space-y-3">
          {SOCIAL_PROVIDERS.map((provider) => {
            const connected = isConnected(provider.id);
            const account = getConnectedAccount(provider.id);
            const Icon = provider.icon;

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${provider.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    {connected && account ? (
                      <p className="text-sm text-muted-foreground">
                        {account.username} • Connected {new Date(account.connected_at).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    )}
                  </div>
                </div>
                {connected ? (
                  <button
                    onClick={() => account && disconnectAccount.mutate(account.id)}
                    disabled={account?.is_login_method && (connectedAccounts?.length ?? 0) <= 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={account?.is_login_method && (connectedAccounts?.length ?? 0) <= 1 ? 'Cannot disconnect your only login method' : ''}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => connectAccount.mutate(provider.id)}
                    disabled={connectAccount.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {connectAccount.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" />
                    )}
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Links
          </h2>
          {!editingLinks ? (
            <button
              onClick={() => {
                const linkMap: Record<string, string> = {};
                socialLinks?.forEach((l) => { linkMap[l.platform] = l.url; });
                setLinks(linkMap);
                setEditingLinks(true);
              }}
              className="text-sm text-primary hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingLinks(false)}
                className="text-sm text-muted-foreground hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => saveSocialLinks.mutate(links)}
                disabled={saveSocialLinks.isPending}
                className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1 rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saveSocialLinks.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Add your social media profiles. These may be shown on your public profile.
        </p>
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const currentUrl = socialLinks?.find((l) => l.platform === platform.id)?.url;

            return (
              <div key={platform.id} className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                {editingLinks ? (
                  <input
                    type="url"
                    placeholder={platform.placeholder}
                    value={links[platform.id] || ''}
                    onChange={(e) =>
                      setLinks((prev) => ({ ...prev, [platform.id]: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 bg-muted border rounded-lg focus:ring-2 focus:ring-primary text-sm"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{platform.name}</p>
                      {currentUrl ? (
                        <a
                          href={currentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {currentUrl.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not set</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="pt-4 border-t">
        <Link
          href="/settings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}
