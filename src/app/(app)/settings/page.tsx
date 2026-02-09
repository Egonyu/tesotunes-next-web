'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Mail, Phone, Globe, MapPin, Calendar, Loader2 } from 'lucide-react';
import { useSettings, useUpdateAllSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateAllSettings();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    country: 'Uganda',
    language: 'en',
    timezone: 'Africa/Kampala',
  });
  
  // Update form when settings load
  useEffect(() => {
    if (settings?.language) {
      setFormData(prev => ({
        ...prev,
        language: settings.language.app_language || 'en',
      }));
    }
  }, [settings]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings.mutateAsync({
        language: {
          app_language: formData.language,
          content_language: formData.language,
        },
      });
      toast.success('Settings saved successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to save settings');
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">General Settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Account Information</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background disabled:opacity-60"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+256 700 000 000"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background disabled:opacity-60"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background disabled:opacity-60"
                >
                  <option value="Uganda">Uganda</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Rwanda">Rwanda</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Regional Settings */}
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Regional Settings</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background disabled:opacity-60"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="lg">Luganda</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background disabled:opacity-60"
                >
                  <option value="Africa/Kampala">East Africa Time (EAT)</option>
                  <option value="Africa/Lagos">West Africa Time (WAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          {isEditing ? (
            <>
              <button
                type="submit"
                disabled={updateSettings.isPending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={updateSettings.isPending}
                className="px-6 py-2 border rounded-lg font-medium hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              Edit Settings
            </button>
          )}
        </div>
      </form>
      
      {/* Danger Zone */}
      <div className="space-y-4 pt-6 border-t border-red-200 dark:border-red-900">
        <h3 className="font-medium text-red-500">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
