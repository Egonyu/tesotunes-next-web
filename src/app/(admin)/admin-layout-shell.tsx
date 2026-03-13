'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Music,
  Disc3,
  Mic2,
  ShoppingBag,
  Calendar,
  MessageSquare,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Menu,
  PieChart,
  Headphones,
  FileText,
  Shield,
  Megaphone,
  ScrollText,
  Flag,
  Percent,
  BarChart3,
  Trophy,
  Tags,
  Crown,
  Building2,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioPlayer, PlayerBar, FullScreenPlayer } from '@/components/player';
import { api } from '@/lib/api';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/songs', label: 'Songs', icon: Music },
  { href: '/admin/albums', label: 'Albums', icon: Disc3 },
  { href: '/admin/artists', label: 'Artists', icon: Mic2 },
  { href: '/admin/genres', label: 'Genres', icon: Tags },
  { href: '/admin/featured', label: 'Featured', icon: Star },
  { href: '/admin/podcasts', label: 'Podcasts', icon: Headphones },
  { href: '/admin/store', label: 'Store', icon: ShoppingBag },
  { href: '/admin/store/promotions', label: 'Promotions', icon: Percent },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/awards', label: 'Awards', icon: Trophy },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/admin/promotions', label: 'Promo Market', icon: Megaphone },
  { href: '/admin/promotions/disputes', label: 'Disputes', icon: Megaphone },
  { href: '/admin/promotions/analytics', label: 'Promo Analytics', icon: BarChart3 },
  { href: '/admin/sacco', label: 'SACCO', icon: CreditCard },
  { href: '/admin/sacco/board-meetings', label: 'Board Meetings', icon: Building2 },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: Crown },
  { href: '/admin/forums', label: 'Forums', icon: MessageSquare },
  { href: '/admin/polls', label: 'Polls', icon: BarChart3 },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: PieChart },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
  { href: '/admin/roles', label: 'Roles & Permissions', icon: Shield },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

type AdminLayoutShellProps = {
  children: React.ReactNode;
  userName: string;
  userRole: string;
};

export default function AdminLayoutShell({
  children,
  userName,
  userRole,
}: AdminLayoutShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiVersion, setApiVersion] = useState<string | null>(null);

  useEffect(() => {
    api.get('/health', { timeout: 5000 }).then(res => {
      const ver = res.headers['x-api-version'] as string | undefined;
      if (ver) setApiVersion(ver);
    }).catch(() => {/* silently ignore */});
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-muted rounded-lg">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold">TesoTunes Admin</span>
        <button className="p-2 hover:bg-muted rounded-lg">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 h-full bg-background border-r z-50 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!collapsed && <span className="font-bold text-lg">Admin Panel</span>}
          <button
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="p-2 hover:bg-muted rounded-lg hidden lg:block"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-2 border-t bg-background">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="text-sm font-medium">Exit Admin</span>}
          </Link>
        </div>
      </aside>

      <main className={cn(
        'min-h-screen transition-all duration-300 pt-16 lg:pt-0',
        collapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        <header className="hidden lg:flex h-16 items-center justify-between px-6 bg-background border-b sticky top-0 z-40">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-muted/50"
            />
          </div>
          <div className="flex items-center gap-4">
            {apiVersion && (
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-muted text-muted-foreground border" title="Backend API version">
                API {apiVersion}
              </span>
            )}
            <button className="relative p-2 hover:bg-muted rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10" />
              <div className="text-sm">
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 pb-28">
          {children}
        </div>
      </main>

      <AudioPlayer />
      <PlayerBar />
      <FullScreenPlayer />
    </div>
  );
}
