'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Music,
  Disc3,
  BarChart3,
  Upload,
  Wallet,
  Calendar,
  Settings,
  Menu,
  X,
  User,
  Bell,
  ChevronDown,
  LogOut,
  Users,
  Megaphone,
  Crown,
  ShoppingBag,
  PiggyBank,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistProfile } from '@/hooks/useArtist';
import { useCapabilities, type CapabilityName } from '@/hooks/useCapabilities';
import { isAdminRole } from '@/lib/roles';
import AccessNotice from '@/components/auth/AccessNotice';
import { AudioPlayer, PlayerBar, FullScreenPlayer } from '@/components/player';
import { InitialsAvatar, SafeImage } from '@/components/ui/safe-image';
import { pickMediaUrl } from '@/lib/media';
import { usePlayerStore, useUIStore } from '@/stores';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Capabilities that may see this item. Omitted = visible to anyone in the studio. */
  caps?: CapabilityName[];
};

const navItems: NavItem[] = [
  { href: '/artist', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/artist/songs', label: 'My Songs', icon: Music, caps: ['artist'] },
  { href: '/artist/albums', label: 'My Albums', icon: Disc3, caps: ['artist'] },
  { href: '/artist/upload', label: 'Upload', icon: Upload, caps: ['artist'] },
  { href: '/artist/analytics', label: 'Analytics', icon: BarChart3, caps: ['artist'] },
  { href: '/artist/earnings', label: 'Earnings', icon: Wallet, caps: ['artist'] },
  { href: '/artist/royalty-splits', label: 'Royalty Splits', icon: Users, caps: ['artist'] },
  { href: '/artist/distribution', label: 'Distribution', icon: Globe, caps: ['artist'] },
  { href: '/artist/wallet', label: 'Wallet', icon: Wallet, caps: ['artist'] },
  { href: '/artist/fan-club', label: 'Fan Club', icon: Crown, caps: ['artist'] },
  { href: '/artist/referrals', label: 'Fan Referrals', icon: Users, caps: ['artist'] },
  { href: '/artist/events', label: 'Events', icon: Calendar, caps: ['organizer', 'artist'] },
  { href: '/artist/store', label: 'Store', icon: ShoppingBag, caps: ['seller'] },
  { href: '/artist/promotions', label: 'Promotions', icon: Megaphone, caps: ['promoter', 'seller'] },
  { href: '/sacco', label: 'SACCO', icon: PiggyBank },
  { href: '/artist/settings', label: 'Settings', icon: Settings },
];

type ArtistLayoutShellProps = {
  children: React.ReactNode;
  userName: string;
  userImage?: string | null;
  shouldLoadArtistProfile?: boolean;
};

export default function ArtistLayoutShell({
  children,
  userName,
  userImage,
  shouldLoadArtistProfile = true,
}: ArtistLayoutShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const sessionLooksArtistBacked =
    Boolean(session?.user?.isArtist) || session?.user?.role === 'artist';
  const loadArtistProfile = shouldLoadArtistProfile && sessionLooksArtistBacked;
  const { data: profile } = useArtistProfile({ enabled: loadArtistProfile });
  const { currentSong } = usePlayerStore();
  const { playerMinimized } = useUIStore();

  // Capability-aware access: artists, sellers, promoters and organizers each see
  // only their own sections. Admins see everything.
  const { data: capabilities } = useCapabilities();
  const isAdmin = isAdminRole(session?.user?.role);
  const granted = new Set<CapabilityName>(
    (capabilities ?? []).filter((c) => c.status === 'granted').map((c) => c.capability),
  );
  if (sessionLooksArtistBacked) granted.add('artist');
  if (session?.user?.isEventOrganizer) granted.add('organizer');

  const visibleNav = navItems.filter(
    (item) => !item.caps || isAdmin || item.caps.some((c) => granted.has(c)),
  );
  // Only deny when we positively know the account holds no studio capabilities
  // (capabilities loaded as an array, nothing granted, not an admin). A
  // missing/loading posture stays permissive — backend gates protect each page.
  const positivelyNoAccess = Array.isArray(capabilities) && !isAdmin && granted.size === 0;
  const studioName = granted.has('artist') ? 'Artist Studio' : 'Creator Studio';

  const artistName = profile?.stage_name || userName || 'Creator';
  const artistAvatar = pickMediaUrl(profile?.avatar, userImage);
  const isVerified = profile?.is_verified || false;
  const hasActivePlayer = !!currentSong && !playerMinimized;

  if (positivelyNoAccess) {
    return (
      <AccessNotice
        title="No creator tools yet"
        description="Your account doesn't have artist, seller, promoter or organizer access yet. Pick a path from your account to get started."
        callbackUrl="/"
        role={session?.user?.role ?? undefined}
        variant="forbidden"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 border-r border-border/60 bg-card/95 backdrop-blur transform transition-transform duration-200 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/artist" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
              T
            </div>
            <div>
              <span className="font-bold">{studioName}</span>
              <p className="text-[11px] text-muted-foreground">Tesotunes creator workspace</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b p-4">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {artistAvatar ? (
                  <SafeImage
                    src={artistAvatar}
                    alt={artistName}
                    width={48}
                    height={48}
                    className="object-cover"
                    fallback={<InitialsAvatar name={artistName} textClassName="text-base" />}
                  />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold">{artistName}</p>
                <p className="text-xs text-muted-foreground">
                  {isVerified ? '✓ Verified Artist' : 'Artist'}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border/60 bg-card px-3 py-2">
                <p className="text-muted-foreground">Workspace</p>
                <p className="mt-1 font-medium">Creator mode</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card px-3 py-2">
                <p className="text-muted-foreground">Focus</p>
                <p className="mt-1 font-medium">Music + growth</p>
              </div>
            </div>
          </div>
        </div>

        <nav
          className={cn(
            'p-4 space-y-1 overflow-y-auto h-[calc(100vh-11rem)]',
            hasActivePlayer
              ? 'pb-[calc(11rem+env(safe-area-inset-bottom))] lg:pb-28'
              : 'pb-24'
          )}
        >
          {visibleNav.map((item) => {
            const Icon = item.icon;
            // Non-artists' "Dashboard" lands on the universal activity hub, not
            // the artist-only studio dashboard (which would fail to load for them).
            const href =
              item.href === '/artist' && !granted.has('artist') ? '/dashboard' : item.href;
            const isActive = pathname === href;

            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            'absolute left-0 right-0 p-4 border-t bg-card transition-all',
            hasActivePlayer
              ? 'bottom-[calc(9rem+env(safe-area-inset-bottom))] lg:bottom-18'
              : 'bottom-0'
          )}
        >
          <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
            <Music className="h-4 w-4" />
            Back to TesoTunes
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background/80 backdrop-blur flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">{studioName}</h1>
              <p className="text-xs text-muted-foreground">Manage releases, earnings, store and promotions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {granted.has('artist') && (
              <Link
                href="/artist/upload"
                className="flex items-center gap-2 rounded-lg bg-primary px-3 sm:px-4 py-2 text-primary-foreground hover:bg-primary/90 text-sm font-medium"
              >
                <Upload className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Upload Music</span>
                <span className="sm:hidden">Upload</span>
              </Link>
            )}

            <button className="relative p-2 hover:bg-muted rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {artistAvatar ? (
                    <SafeImage
                      src={artistAvatar}
                      alt={artistName}
                      width={32}
                      height={32}
                      className="object-cover"
                      fallback={<InitialsAvatar name={artistName} textClassName="text-xs" />}
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">{artistName}</span>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-card border rounded-lg shadow-lg">
                  <Link href="/artist/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link href="/artist/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link href="/" className="flex items-center gap-2 px-4 py-2 hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                    <Music className="h-4 w-4" />
                    Back to App
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className={cn(
            'relative p-4 lg:p-6',
            hasActivePlayer
              ? 'pb-[calc(11rem+env(safe-area-inset-bottom))] lg:pb-28'
              : 'pb-[calc(2rem+env(safe-area-inset-bottom))] lg:pb-8'
          )}
        >
          <div className="mx-auto w-full max-w-375">
            {children}
          </div>
        </main>
      </div>

      <AudioPlayer />
      <PlayerBar />
      <FullScreenPlayer />
    </div>
  );
}
