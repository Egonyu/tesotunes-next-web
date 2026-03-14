'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PiggyBank,
  CreditCard,
  Coins,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: { href: string; label: string }[];
}

const saccoNav: NavItem[] = [
  { href: '/sacco/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/sacco/savings',
    label: 'Savings',
    icon: PiggyBank,
    children: [
      { href: '/sacco/savings', label: 'Overview' },
      { href: '/sacco/savings/goals', label: 'Goals' },
      { href: '/sacco/savings/goals/create', label: 'New Goal' },
    ],
  },
  { href: '/sacco/loans', label: 'Loans', icon: CreditCard },
  { href: '/sacco/shares', label: 'Shares', icon: Coins },
];

function NavItemComponent({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;
  const [expanded, setExpanded] = useState(isActive && hasChildren);
  const Icon = item.icon;

  return (
    <div>
      <div className="flex items-center">
        <Link
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 group',
            isActive
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
          )}
        >
          <Icon
            className={cn(
              'h-4.5 w-4.5 shrink-0',
              isActive && 'text-emerald-600 dark:text-emerald-400'
            )}
          />
          <span className="truncate">{item.label}</span>
          {isActive && !hasChildren && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          )}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="ml-7 mt-0.5 space-y-0.5 border-l-2 border-muted pl-3">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={cn(
                'block px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                pathname === child.href
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SaccoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = saccoNav.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Top Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 lg:px-6 h-14">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link href="/sacco" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <PiggyBank className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight">TesoTunes SACCO</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Artist Finance Platform
              </p>
            </div>
          </Link>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground ml-2">
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">
              {currentPage?.label || 'Home'}
            </span>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/settings"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar — Desktop */}
        <aside className="hidden lg:block w-60 shrink-0 border-r bg-muted/20 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            {saccoNav.map((item) => (
              <NavItemComponent key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed top-14 left-0 bottom-0 z-50 w-64 bg-background border-r shadow-xl lg:hidden overflow-y-auto animate-in slide-in-from-left duration-200">
              <nav className="p-3 space-y-0.5">
                {saccoNav.map((item) => (
                  <NavItemComponent
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
                <div className="pt-3 mt-3 border-t">
                  <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  >
                    <Settings className="h-4.5 w-4.5" />
                    Settings
                  </Link>
                </div>
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}
