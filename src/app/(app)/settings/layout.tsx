'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard, Bell, Shield, Palette, LogOut, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNav = [
  { href: '/settings', label: 'General', icon: User },
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/security', label: 'Security & 2FA', icon: Lock },
  { href: '/settings/privacy', label: 'Privacy', icon: Shield },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full mt-4">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>
        </aside>
        
        {/* Settings Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-card rounded-xl border p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
