'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PiggyBank, 
  CreditCard, 
  Coins,
  Target,
  Warehouse,
  BarChart3,
  Trophy,
  Users,
  Settings,
  Flame,
  ChevronDown
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
    ]
  },
  { href: '/sacco/loans', label: 'Loans', icon: CreditCard },
  { href: '/sacco/shares', label: 'Shares', icon: Coins },
  { href: '/sacco/resources', label: 'Resources', icon: Warehouse },
  { href: '/sacco/analytics', label: 'Analytics', icon: BarChart3 },
  { 
    href: '/sacco/community', 
    label: 'Community', 
    icon: Users,
    children: [
      { href: '/sacco/community', label: 'Overview' },
      { href: '/sacco/community/leaderboards', label: 'Leaderboards' },
      { href: '/sacco/community/achievements', label: 'Achievements' },
      { href: '/sacco/community/challenges', label: 'Challenges' },
      { href: '/sacco/community/stories', label: 'Success Stories' },
    ]
  },
];

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <div>
      <div className="flex items-center">
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex-1',
            isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Icon className="h-5 w-5" />
          {item.label}
        </Link>
        {hasChildren && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="ml-8 mt-1 space-y-0.5">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                'block px-3 py-2 rounded-md text-xs font-medium transition-colors',
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

export default function SaccoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen">
      {/* SACCO Header */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
              <PiggyBank className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TesoTunes SACCO</h1>
              <p className="text-white/80">Artist Production Finance Platform</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-8 px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Main Content */}
          <main className="flex-1 min-w-0 order-2 lg:order-1 lg:pr-6">
            {children}
          </main>
          
          {/* Right Sidebar Navigation */}
          <aside className="w-full lg:w-72 flex-shrink-0 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 bg-muted/30 rounded-xl p-4 lg:p-5 border border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                Quick Navigation
              </h3>
              <nav className="space-y-1">
                {saccoNav.map((item) => (
                  <NavItemComponent key={item.href} item={item} pathname={pathname} />
                ))}
                
                <div className="pt-4 mt-4 border-t space-y-1">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
                </div>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
