'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Star, 
  CreditCard, 
  Compass, 
  QrCode,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

const loyaltyNav = [
  { href: '/loyalty', label: 'Overview', icon: Star, exact: true },
  { href: '/loyalty/wallet', label: 'My Cards', icon: CreditCard },
  { href: '/loyalty/discover', label: 'Discover', icon: Compass },
  { href: '/loyalty/scan', label: 'Scan QR', icon: QrCode },
  { href: '/loyalty/rewards', label: 'Rewards', icon: Trophy },
];

export default function LoyaltyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen">
      {/* Loyalty Header */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Star className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Loyalty Programs</h1>
              <p className="text-white/80">Earn points, unlock rewards from your favorite artists</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-30">
        <div className="container">
          <nav className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {loyaltyNav.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
