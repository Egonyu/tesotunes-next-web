'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/artist', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/artist/songs', label: 'My Songs', icon: Music },
  { href: '/artist/albums', label: 'My Albums', icon: Disc3 },
  { href: '/artist/upload', label: 'Upload', icon: Upload },
  { href: '/artist/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/artist/earnings', label: 'Earnings', icon: Wallet },
  { href: '/artist/referrals', label: 'Fan Referrals', icon: Users },
  { href: '/artist/events', label: 'Events', icon: Calendar },
  { href: '/artist/settings', label: 'Settings', icon: Settings },
];

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/artist" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="font-bold">Artist Studio</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Artist Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Eddy Kenzo</p>
              <p className="text-xs text-muted-foreground">Verified Artist</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
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
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Quick Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-primary">156</p>
              <p className="text-xs text-muted-foreground">Songs</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">45M</p>
              <p className="text-xs text-muted-foreground">Total Plays</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold hidden sm:block">Artist Studio</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/artist/upload"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-card border rounded-lg shadow-lg">
                  <Link href="/artist/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link href="/artist/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left text-red-600">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
