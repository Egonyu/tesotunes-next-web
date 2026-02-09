'use client';

import { useState } from 'react';
import { 
  Bell,
  Eye,
  EyeOff,
  Filter,
  Globe,
  Heart,
  MessageCircle,
  Music,
  Save,
  Sparkles,
  TrendingUp,
  Users,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Preference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
}

export default function FeedPreferencesPage() {
  const [preferences, setPreferences] = useState<Preference[]>([
    { id: 'autoplay', label: 'Autoplay media', description: 'Automatically play videos and audio previews', enabled: true, icon: <Volume2 className="h-5 w-5" /> },
    { id: 'sensitive', label: 'Show sensitive content', description: 'Display content that may be sensitive', enabled: false, icon: <Eye className="h-5 w-5" /> },
    { id: 'trending', label: 'Trending topics', description: 'Show trending topics in your feed', enabled: true, icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'suggestions', label: 'Follow suggestions', description: 'Show recommended accounts to follow', enabled: true, icon: <Users className="h-5 w-5" /> },
    { id: 'music_previews', label: 'Music previews', description: 'Show inline music previews in posts', enabled: true, icon: <Music className="h-5 w-5" /> },
  ]);
  
  const [interests, setInterests] = useState([
    { id: 'afrobeats', label: 'Afrobeats', selected: true },
    { id: 'hiphop', label: 'Hip Hop', selected: true },
    { id: 'dancehall', label: 'Dancehall', selected: true },
    { id: 'rnb', label: 'R&B', selected: false },
    { id: 'gospel', label: 'Gospel', selected: false },
    { id: 'jazz', label: 'Jazz', selected: false },
    { id: 'reggae', label: 'Reggae', selected: true },
    { id: 'traditional', label: 'Traditional', selected: false },
  ]);
  
  const [notifications, setNotifications] = useState({
    newPosts: true,
    likes: false,
    comments: true,
    mentions: true,
    reposts: false,
  });
  
  const togglePreference = (id: string) => {
    setPreferences(prefs => 
      prefs.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };
  
  const toggleInterest = (id: string) => {
    setInterests(ints => 
      ints.map(i => i.id === id ? { ...i, selected: !i.selected } : i)
    );
  };
  
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Feed Preferences</h1>
        <p className="text-muted-foreground">
          Customize your Edula feed experience
        </p>
      </div>
      
      {/* Content Preferences */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Content Settings</h2>
        <div className="space-y-4">
          {preferences.map((pref) => (
            <div 
              key={pref.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{pref.icon}</div>
                <div>
                  <p className="font-medium">{pref.label}</p>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
              </div>
              <button
                onClick={() => togglePreference(pref.id)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  pref.enabled ? 'bg-primary' : 'bg-muted'
                )}
              >
                <div className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  pref.enabled ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Music Interests */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          <Sparkles className="h-5 w-5 inline mr-2" />
          Music Interests
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select genres you're interested in to personalize your feed
        </p>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                interest.selected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {interest.label}
            </button>
          ))}
        </div>
      </section>
      
      {/* Notification Preferences */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          <Bell className="h-5 w-5 inline mr-2" />
          Feed Notifications
        </h2>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => {
            const labels: Record<string, string> = {
              newPosts: 'New posts from followed accounts',
              likes: 'Likes on your posts',
              comments: 'Comments on your posts',
              mentions: 'When someone mentions you',
              reposts: 'Reposts of your content',
            };
            
            return (
              <div 
                key={key}
                className="flex items-center justify-between py-3"
              >
                <span>{labels[key]}</span>
                <button
                  onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    value ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <div className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    value ? 'translate-x-5' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* Save Button */}
      <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
        <Save className="h-5 w-5" />
        Save Preferences
      </button>
    </div>
  );
}
