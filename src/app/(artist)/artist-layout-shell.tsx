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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtistProfile } from '@/hooks/useArtist';
import { AudioPlayer, PlayerBar, FullScreenPlayer } from '@/components/player';
import { InitialsAvatar, SafeImage } from '@/components/ui/safe-image';
import { pickMediaUrl } from '@/lib/media';
import { usePlayerStore, useUIStore } from '@/stores';

const navItems = [
  { href: '/artist', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/artist/songs', label: 'My Songs', icon: Music },
  { href: '/artist/albums', label: 'My Albums', icon: Disc3 },
  { href: '/artist/upload', label: 'Upload', icon: Upload },
  { href: '/artist/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/artist/earnings', label: 'Earnings', icon: Wallet },
  { href: '/artist/royalty-splits', label: 'Royalty Splits', icon: Users },
  { href: '/artist/wallet', label: 'Wallet', icon: Wallet },
  { href: '/artist/fan-club', label: 'Fan Club', icon: Crown },
  { href: '/artist/referrals', label: 'Fan Referrals', icon: Users },
  { href: '/artist/events', label: 'Events', icon: Calendar },
  { href: '/artist/store', label: 'Store', icon: ShoppingBag },
  { href: '/artist/promotions', label: 'Promotions', icon: Megaphone },
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

  const artistName = profile?.stage_name || userName || 'Artist';
  const artistAvatar = pickMediaUrl(profile?.avatar, userImage);
  const isVerified = profile?.is_verified || false;
  const hasActivePlayer = !!currentSong && !playerMinimized;

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
              <span className="font-bold">Artist Studio</span>
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
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
              ? 'bottom-[calc(9rem+env(safe-area-inset-bottom))] lg:bottom-[72px]'
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
              <h1 className="text-lg font-semibold">Artist Studio</h1>
              <p className="text-xs text-muted-foreground">Manage releases, earnings, store and promotions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/artist/upload"
              className="hidden sm:flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              <Upload className="h-4 w-4" />
              Upload Music
            </Link>

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
          <div className="mx-auto w-full max-w-[1500px]">
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
