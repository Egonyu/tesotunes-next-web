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
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity,
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
  FolderUp,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { hasAnyPermission } from '@/lib/permissions';
import { isAdminRole } from '@/lib/roles';
import { AudioPlayer, PlayerBar, FullScreenPlayer } from '@/components/player';
import { api } from '@/lib/api';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { InitialsAvatar, SafeImage } from '@/components/ui/safe-image';
import { ADMIN_REPORTS_ENABLED } from '@/lib/features';
import { usePlayerStore, useUIStore } from '@/stores';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, requiredPermissions: ['admin.dashboard'] },
  { href: '/admin/users', label: 'Users', icon: Users, requiredPermissions: ['admin.users', 'user.view'] },
  { href: '/admin/songs', label: 'Songs', icon: Music, requiredPermissions: ['admin.music', 'music.*'] },
  { href: '/admin/albums', label: 'Albums', icon: Disc3, requiredPermissions: ['admin.music', 'album.*'] },
  { href: '/admin/artists', label: 'Artists', icon: Mic2, requiredPermissions: ['admin.music', 'music.*'] },
  { href: '/admin/catalog', label: 'Catalog Intake', icon: FolderUp, requiredPermissions: ['catalog.view', 'catalog.upload'] },
  { href: '/admin/catalog/claims', label: 'Claim Review', icon: BadgeCheck, requiredPermissions: ['catalog.claim.review'] },
  { href: '/admin/genres', label: 'Genres', icon: Tags, requiredPermissions: ['admin.music', 'music.*'] },
  { href: '/admin/featured', label: 'Featured', icon: Star, requiredPermissions: ['admin.music', 'music.*'] },
  { href: '/admin/podcasts', label: 'Podcasts', icon: Headphones, requiredPermissions: ['admin.music', 'music.*'] },
  { href: '/admin/store', label: 'Store', icon: ShoppingBag, requiredPermissions: ['manage-store', 'admin.settings'] },
  { href: '/admin/store/promotions', label: 'Promotions', icon: Percent, requiredPermissions: ['manage-store', 'admin.settings'] },
  { href: '/admin/events', label: 'Events', icon: Calendar, requiredPermissions: ['admin.dashboard', 'admin.music'] },
  { href: '/admin/awards', label: 'Awards', icon: Trophy, requiredPermissions: ['admin.dashboard', 'admin.music'] },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone, requiredPermissions: ['admin.dashboard'] },
  { href: '/admin/promotions', label: 'Promo Market', icon: Megaphone, requiredPermissions: ['admin.dashboard'] },
  { href: '/admin/promotions/disputes', label: 'Disputes', icon: Megaphone, requiredPermissions: ['admin.dashboard'] },
  { href: '/admin/promotions/analytics', label: 'Promo Analytics', icon: BarChart3, requiredPermissions: ['admin.reports', 'view-analytics'] },
  { href: '/admin/payments', label: 'Payments', icon: Wallet, requiredPermissions: ['admin.payments', 'payment.manage', 'manage-payments'] },
  { href: '/admin/sacco', label: 'SACCO', icon: CreditCard, requiredPermissions: ['manage-sacco'] },
  { href: '/admin/sacco/board-meetings', label: 'Board Meetings', icon: Building2, requiredPermissions: ['manage-sacco'] },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: Crown, requiredPermissions: ['admin.settings', 'admin.users'] },
  { href: '/admin/forums', label: 'Forums', icon: MessageSquare, requiredPermissions: ['admin.dashboard'] },
  { href: '/admin/polls', label: 'Polls', icon: BarChart3, requiredPermissions: ['admin.dashboard'] },
  { href: '/admin/reports', label: 'Reports', icon: FileText, requiredPermissions: ['admin.reports', 'view-reports'] },
  { href: '/admin/analytics', label: 'Analytics', icon: PieChart, requiredPermissions: ['admin.reports', 'view-analytics'] },
  { href: '/admin/security', label: 'Security', icon: Shield, requiredPermissions: ['admin.settings'] },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, requiredPermissions: ['admin.settings'] },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: Flag, requiredPermissions: ['admin.settings'] },
  { href: '/admin/roles', label: 'Roles & Permissions', icon: Shield, requiredPermissions: ['manage-roles', 'admin.settings', 'admin.users'] },
  { href: '/admin/system', label: 'System Health', icon: Activity, requiredPermissions: ['admin.settings'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, requiredPermissions: ['admin.settings', 'manage-settings'] },
];

type AdminLayoutShellProps = {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  userPermissions?: string[];
};

export default function AdminLayoutShell({
  children,
  userName,
  userRole,
  userPermissions = [],
}: AdminLayoutShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const { data: platformSettings } = usePlatformSettings();
  const { currentSong } = usePlayerStore();
  const { playerMinimized } = useUIStore();

  const appearance = platformSettings?.appearance;
  const adminPanelName = appearance?.admin_panel_name || 'Admin Panel';
  const adminPanelSubtitle = appearance?.admin_panel_subtitle || 'Platform operations';
  const adminLogo = appearance?.logo_light || appearance?.logo_dark || '';
  const adminLogoAlt = appearance?.logo_alt || adminPanelName;
  const compactLabel = appearance?.logo_compact_label || adminPanelName.charAt(0);
  const shouldFallbackToRoleVisibility = isAdminRole(userRole) && userPermissions.length === 0;

  const visibleNavItems = (ADMIN_REPORTS_ENABLED ? navItems : navItems.filter((item) => item.href !== '/admin/reports'))
    .filter((item) => {
      if (shouldFallbackToRoleVisibility) return true;
      const permissions = item.requiredPermissions as string[] | undefined;
      if (!permissions || permissions.length === 0) return true;
      return hasAnyPermission(userPermissions, permissions);
    });
  const hasActivePlayer = !!currentSong && !playerMinimized;

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
        <span className="font-bold">{adminPanelName}</span>
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
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-primary/10">
                <SafeImage
                  src={adminLogo}
                  alt={adminLogoAlt}
                  fill
                  className="object-contain p-1.5"
                  fallback={<InitialsAvatar name={compactLabel} textClassName="text-sm" className="bg-primary text-primary-foreground" />}
                />
              </div>
              <div className="min-w-0">
                <span className="block truncate font-bold text-lg">{adminPanelName}</span>
                <span className="block truncate text-xs text-muted-foreground">{adminPanelSubtitle}</span>
              </div>
            </div>
          )}
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

        <nav
          className={cn(
            'p-2 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]',
            hasActivePlayer
              ? 'pb-[calc(11rem+env(safe-area-inset-bottom))] lg:pb-28'
              : 'pb-24'
          )}
        >
          {visibleNavItems.map((item) => {
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

        <div
          className={cn(
            'absolute left-0 right-0 p-2 border-t bg-background transition-all',
            hasActivePlayer
              ? 'bottom-[calc(9rem+env(safe-area-inset-bottom))] lg:bottom-[72px]'
              : 'bottom-0'
          )}
        >
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

        <div
          className={cn(
            'p-6',
            hasActivePlayer
              ? 'pb-[calc(11rem+env(safe-area-inset-bottom))] lg:pb-28'
              : 'pb-[calc(2rem+env(safe-area-inset-bottom))] lg:pb-8'
          )}
        >
          {children}
        </div>
      </main>

      <AudioPlayer />
      <PlayerBar />
      <FullScreenPlayer />
    </div>
  );
}
