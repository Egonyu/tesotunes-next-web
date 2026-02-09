'use client';

import { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Loader2, Save, Check } from 'lucide-react';
import { useSettings, useUpdateAppearanceSettings, type AppearanceSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

const themes = [
  { value: 'light' as const, label: 'Light', icon: Sun, description: 'Classic light theme' },
  { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { value: 'system' as const, label: 'System', icon: Monitor, description: 'Follow OS preference' },
];

const accentColors = [
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F97316', label: 'Orange' },
];

export default function AppearanceSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateAppearance = useUpdateAppearanceSettings();

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    accent_color: '#8B5CF6',
  });
  const [language, setLanguage] = useState({
    app_language: 'en',
    content_language: 'en',
  });

  useEffect(() => {
    if (settings?.appearance) {
      setAppearance(settings.appearance);
    }
    if (settings?.language) {
      setLanguage(settings.language);
    }
  }, [settings]);

  const handleSave = () => {
    updateAppearance.mutate(
      { ...appearance, ...language },
      {
        onSuccess: () => toast.success('Appearance settings updated'),
        onError: () => toast.error('Failed to update appearance settings'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6" />
          Appearance
        </h2>
        <p className="text-muted-foreground mt-1">
          Customize the look and feel of TesoTunes
        </p>
      </div>

      {/* Theme Selection */}
      <div>
        <h3 className="font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = appearance.theme === theme.value;
            return (
              <button
                key={theme.value}
                onClick={() => setAppearance((prev) => ({ ...prev, theme: theme.value }))}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-center">
                  <p className="font-medium">{theme.label}</p>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 p-1 bg-primary rounded-full">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="font-semibold mb-4">Accent Color</h3>
        <div className="flex flex-wrap gap-3">
          {accentColors.map((color) => {
            const isSelected = appearance.accent_color === color.value;
            return (
              <button
                key={color.value}
                onClick={() => setAppearance((prev) => ({ ...prev, accent_color: color.value }))}
                className={`relative w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                  isSelected ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                }`}
                style={{ backgroundColor: color.value, '--tw-ring-color': color.value } as React.CSSProperties}
                title={color.label}
              >
                {isSelected && (
                  <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div>
        <h3 className="font-semibold mb-4">Language</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">App Language</label>
            <select
              value={language.app_language}
              onChange={(e) => setLanguage((prev) => ({ ...prev, app_language: e.target.value }))}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
              <option value="lg">Luganda</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Content Language</label>
            <select
              value={language.content_language}
              onChange={(e) => setLanguage((prev) => ({ ...prev, content_language: e.target.value }))}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
              <option value="lg">Luganda</option>
              <option value="fr">French</option>
              <option value="all">All Languages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateAppearance.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {updateAppearance.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}
