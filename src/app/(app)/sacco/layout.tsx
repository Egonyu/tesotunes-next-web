'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PiggyBank, 
  CreditCard, 
  Coins,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const saccoNav = [
  { href: '/sacco/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sacco/savings', label: 'Savings', icon: PiggyBank },
  { href: '/sacco/loans', label: 'Loans', icon: CreditCard },
  { href: '/sacco/shares', label: 'Shares', icon: Coins },
];

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
              <p className="text-white/80">Savings & Credit Cooperative for Artists</p>
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
                {saccoNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                
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
