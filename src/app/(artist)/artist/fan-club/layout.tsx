'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Crown,
  Users,
  Gift,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fanClubNav = [
  { href: '/artist/fan-club', label: 'Overview', icon: Crown, exact: true },
  { href: '/artist/fan-club/members', label: 'Members', icon: Users },
  { href: '/artist/fan-club/rewards', label: 'Rewards', icon: Gift },
  { href: '/artist/fan-club/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/artist/fan-club/settings', label: 'Settings', icon: Settings },
];

export default function FanClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Fan Club</h1>
        <p className="text-muted-foreground">
          Build your community with loyalty programs and exclusive rewards
        </p>
      </div>

      {/* Sub-Navigation */}
      <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {fanClubNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Content */}
      {children}
    </div>
  );
}
