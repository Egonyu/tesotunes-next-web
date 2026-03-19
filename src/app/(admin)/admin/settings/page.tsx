'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api';
import { toast } from 'sonner';
import {
  Settings,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Palette,
  Database,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────
interface PlatformSettings {
  general: {
    platform_name: string;
    tagline: string;
    support_email: string;
    default_currency: string;
    timezone: string;
    maintenance_mode: boolean;
    registration_enabled: boolean;
  };
  appearance: {
    primary_color: string;
    logo_light: string;
    logo_dark: string;
    favicon: string;
  };
  notifications: {
    push_enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    digest_frequency: string;
  };
  security: {
    two_factor_required: boolean;
    password_min_length: number;
    session_timeout_minutes: number;
    max_login_attempts: number;
    lockout_duration_minutes: number;
  };
  payments: {
    mtn_enabled: boolean;
    mtn_api_key: string;
    airtel_enabled: boolean;
    airtel_api_key: string;
    zengapay_enabled: boolean;
    zengapay_merchant_id: string;
    zengapay_api_key: string;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_from_name: string;
    smtp_from_email: string;
  };
  storage: {
    driver: string;
    max_upload_mb: number;
    allowed_audio_formats: string;
    allowed_image_formats: string;
  };
}

interface SettingsResponse {
  data: PlatformSettings;
}

interface NotificationHealthResponse {
  data: {
    mail: {
      mailer: string;
      from_address_configured: boolean;
      smtp_host_configured: boolean;
      smtp_port_configured: boolean;
      is_log_mailer: boolean;
      is_array_mailer: boolean;
    };
    queue: {
      connection: string;
      is_async: boolean;
      pending_jobs: number | null;
      failed_jobs: number | null;
      recent_failures: Array<{
        id: string | number;
        queue: string | null;
        failed_at: string | null;
        exception_summary: string | null;
      }>;
    };
    push: {
      active_device_tokens: number | null;
    };
    notifications: {
      sent_last_24h: number;
      unread_total: number;
      top_types_last_7d: Array<{
        type: string;
        count: number;
      }>;
    };
    checks: {
      mail_ready: boolean;
      queue_ready: boolean;
      push_ready: boolean;
    };
  };
}

// ── Component ────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'storage', label: 'Storage', icon: Database },
  ];

  // ── Queries ──────────────────────────────────────────────────────
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => apiGet<SettingsResponse>('/admin/settings'),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: notificationHealthData, isLoading: notificationHealthLoading } = useQuery({
    queryKey: ['admin-notification-health'],
    queryFn: () => apiGet<NotificationHealthResponse>('/notifications/health'),
    retry: 1,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (settingsData?.data) {
      setSettings(settingsData.data);
    }
  }, [settingsData]);

  // ── Mutations ────────────────────────────────────────────────────
  const saveSettings = useMutation({
    mutationFn: (data: Partial<PlatformSettings>) =>
      apiPut('/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings saved successfully');
      setIsDirty(false);
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  // ── Helpers ──────────────────────────────────────────────────────
  function updateField<S extends keyof PlatformSettings>(
    section: S,
    field: keyof PlatformSettings[S],
    value: PlatformSettings[S][keyof PlatformSettings[S]]
  ) {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: { ...settings[section], [field]: value },
    });
    setIsDirty(true);
  }

  function handleSave() {
    if (!settings) return;
    saveSettings.mutate(settings);
  }

  function handleReset() {
    if (settingsData?.data) {
      setSettings(settingsData.data);
      setIsDirty(false);
      toast.info('Settings reset to last saved state');
    }
  }

  // ── Toggle switch helper ─────────────────────────────────────────
  function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'right-0.5' : 'left-0.5'
        )} />
      </button>
    );
  }

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load settings</p>
          <p className="text-sm text-red-500 dark:text-red-500 mt-1">
            The settings endpoint may not be available. Please contact your administrator.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure platform settings</p>
        </div>
        {isDirty && (
          <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <nav className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 p-6 rounded-xl border bg-card">
          {/* General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">General Settings</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Name</label>
                  <input type="text" value={settings.general.platform_name} onChange={(e) => updateField('general', 'platform_name', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input type="text" value={settings.general.tagline} onChange={(e) => updateField('general', 'tagline', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <input type="email" value={settings.general.support_email} onChange={(e) => updateField('general', 'support_email', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default Currency</label>
                  <select value={settings.general.default_currency} onChange={(e) => updateField('general', 'default_currency', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background">
                    <option value="UGX">UGX - Ugandan Shilling</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="TZS">TZS - Tanzanian Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select value={settings.general.timezone} onChange={(e) => updateField('general', 'timezone', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background">
                    <option value="Africa/Kampala">Africa/Kampala (EAT +3)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT +3)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                  </div>
                  <Toggle checked={settings.general.maintenance_mode} onChange={(v) => updateField('general', 'maintenance_mode', v)} />
                </div>
                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <p className="font-medium">User Registration</p>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Toggle checked={settings.general.registration_enabled} onChange={(v) => updateField('general', 'registration_enabled', v)} />
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Appearance Settings</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={settings.appearance.primary_color} onChange={(e) => updateField('appearance', 'primary_color', e.target.value)} className="h-10 w-20 rounded cursor-pointer" />
                    <input type="text" value={settings.appearance.primary_color} onChange={(e) => updateField('appearance', 'primary_color', e.target.value)} className="px-4 py-2 border rounded-lg bg-background w-32" />
                  </div>
                </div>
                <div><label className="block text-sm font-medium mb-2">Logo (Light Mode) URL</label><input type="text" value={settings.appearance.logo_light} onChange={(e) => updateField('appearance', 'logo_light', e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">Logo (Dark Mode) URL</label><input type="text" value={settings.appearance.logo_dark} onChange={(e) => updateField('appearance', 'logo_dark', e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">Favicon URL</label><input type="text" value={settings.appearance.favicon} onChange={(e) => updateField('appearance', 'favicon', e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Notification Settings</h2>
              <div className="grid gap-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div><p className="font-medium">Push Notifications</p><p className="text-sm text-muted-foreground">Browser push notifications</p></div>
                  <Toggle checked={settings.notifications.push_enabled} onChange={(v) => updateField('notifications', 'push_enabled', v)} />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div><p className="font-medium">Email Notifications</p><p className="text-sm text-muted-foreground">Send emails for important events</p></div>
                  <Toggle checked={settings.notifications.email_enabled} onChange={(v) => updateField('notifications', 'email_enabled', v)} />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div><p className="font-medium">SMS Notifications</p><p className="text-sm text-muted-foreground">Send SMS for critical alerts</p></div>
                  <Toggle checked={settings.notifications.sms_enabled} onChange={(v) => updateField('notifications', 'sms_enabled', v)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Digest Frequency</label>
                  <select value={settings.notifications.digest_frequency} onChange={(e) => updateField('notifications', 'digest_frequency', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">Delivery Health</h3>
                    <p className="text-sm text-muted-foreground">
                      Quick diagnostics for notification delivery, queues, and mail configuration.
                    </p>
                  </div>
                  {notificationHealthLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                {notificationHealthData?.data ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Mail</p>
                          <CheckCircle className={cn('h-4 w-4', notificationHealthData.data.checks.mail_ready ? 'text-green-600' : 'text-amber-600')} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">Mailer: {notificationHealthData.data.mail.mailer}</p>
                        <p className="text-sm text-muted-foreground">
                          From address: {notificationHealthData.data.mail.from_address_configured ? 'configured' : 'missing'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          SMTP host: {notificationHealthData.data.mail.smtp_host_configured ? 'configured' : 'missing'}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Queue</p>
                          <CheckCircle className={cn('h-4 w-4', notificationHealthData.data.checks.queue_ready ? 'text-green-600' : 'text-amber-600')} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">Connection: {notificationHealthData.data.queue.connection}</p>
                        <p className="text-sm text-muted-foreground">
                          Mode: {notificationHealthData.data.queue.is_async ? 'async' : 'sync'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Failed jobs: {notificationHealthData.data.queue.failed_jobs ?? 'n/a'}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Push</p>
                          <CheckCircle className={cn('h-4 w-4', notificationHealthData.data.checks.push_ready ? 'text-green-600' : 'text-amber-600')} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Active device tokens: {notificationHealthData.data.push.active_device_tokens ?? 'n/a'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Notifications sent (24h): {notificationHealthData.data.notifications.sent_last_24h}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Unread total: {notificationHealthData.data.notifications.unread_total}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-3">Recent Failed Jobs</h4>
                        {notificationHealthData.data.queue.recent_failures.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No failed jobs recorded.</p>
                        ) : (
                          <div className="space-y-3">
                            {notificationHealthData.data.queue.recent_failures.map((failure) => (
                              <div key={failure.id} className="rounded-md bg-muted/40 p-3">
                                <p className="text-sm font-medium">Queue: {failure.queue || 'default'}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {failure.failed_at || 'Unknown time'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {failure.exception_summary || 'No exception summary available.'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-3">Top Notification Types (7d)</h4>
                        {notificationHealthData.data.notifications.top_types_last_7d.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No recent notifications recorded.</p>
                        ) : (
                          <div className="space-y-2">
                            {notificationHealthData.data.notifications.top_types_last_7d.map((item) => (
                              <div key={item.type} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                                <span className="font-medium">{item.type}</span>
                                <span className="text-muted-foreground">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Notification diagnostics are unavailable right now.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              <div className="grid gap-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div><p className="font-medium">Require 2FA</p><p className="text-sm text-muted-foreground">Require two-factor for admin accounts</p></div>
                  <Toggle checked={settings.security.two_factor_required} onChange={(v) => updateField('security', 'two_factor_required', v)} />
                </div>
                <div><label className="block text-sm font-medium mb-2">Minimum Password Length</label><input type="number" min={6} max={32} value={settings.security.password_min_length} onChange={(e) => updateField('security', 'password_min_length', Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label><input type="number" min={5} value={settings.security.session_timeout_minutes} onChange={(e) => updateField('security', 'session_timeout_minutes', Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">Max Login Attempts</label><input type="number" min={1} value={settings.security.max_login_attempts} onChange={(e) => updateField('security', 'max_login_attempts', Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">Lockout Duration (minutes)</label><input type="number" min={1} value={settings.security.lockout_duration_minutes} onChange={(e) => updateField('security', 'lockout_duration_minutes', Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Payment Settings</h2>
              <div className="grid gap-6">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white font-bold">M</div>
                      <div><p className="font-medium">MTN Mobile Money</p><p className="text-sm text-muted-foreground">Accept MTN MoMo payments</p></div>
                    </div>
                    <Toggle checked={settings.payments.mtn_enabled} onChange={(v) => updateField('payments', 'mtn_enabled', v)} />
                  </div>
                  <input type="text" value={settings.payments.mtn_api_key} onChange={(e) => updateField('payments', 'mtn_api_key', e.target.value)} placeholder="API Key" className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold">A</div>
                      <div><p className="font-medium">Airtel Money</p><p className="text-sm text-muted-foreground">Accept Airtel Money payments</p></div>
                    </div>
                    <Toggle checked={settings.payments.airtel_enabled} onChange={(v) => updateField('payments', 'airtel_enabled', v)} />
                  </div>
                  <input type="text" value={settings.payments.airtel_api_key} onChange={(e) => updateField('payments', 'airtel_api_key', e.target.value)} placeholder="API Key" className="w-full px-4 py-2 border rounded-lg bg-background" />
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">Z</div>
                      <div><p className="font-medium">ZengaPay</p><p className="text-sm text-muted-foreground">Card payments via ZengaPay</p></div>
                    </div>
                    <Toggle checked={settings.payments.zengapay_enabled} onChange={(v) => updateField('payments', 'zengapay_enabled', v)} />
                  </div>
                  <div className="space-y-3">
                    <input type="text" value={settings.payments.zengapay_merchant_id} onChange={(e) => updateField('payments', 'zengapay_merchant_id', e.target.value)} placeholder="Merchant ID" className="w-full px-4 py-2 border rounded-lg bg-background" />
                    <input type="text" value={settings.payments.zengapay_api_key} onChange={(e) => updateField('payments', 'zengapay_api_key', e.target.value)} placeholder="API Key" className="w-full px-4 py-2 border rounded-lg bg-background" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Email Configuration</h2>
              <div className="grid gap-4">
                <div><label className="block text-sm font-medium mb-2">SMTP Host</label><input type="text" value={settings.email.smtp_host || ''} onChange={(e) => updateField('email', 'smtp_host', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="smtp.example.com" /></div>
                <div><label className="block text-sm font-medium mb-2">SMTP Port</label><input type="number" value={settings.email.smtp_port || ''} onChange={(e) => updateField('email', 'smtp_port', Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">SMTP Username</label><input type="text" value={settings.email.smtp_username || ''} onChange={(e) => updateField('email', 'smtp_username', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">From Name</label><input type="text" value={settings.email.smtp_from_name || ''} onChange={(e) => updateField('email', 'smtp_from_name', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">From Email</label><input type="email" value={settings.email.smtp_from_email || ''} onChange={(e) => updateField('email', 'smtp_from_email', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
              </div>
            </div>
          )}

          {/* Storage */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Storage Settings</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Storage Driver</label>
                  <select value={settings.storage.driver} onChange={(e) => updateField('storage', 'driver', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background">
                    <option value="local">Local Disk</option>
                    <option value="s3">Amazon S3</option>
                    <option value="gcs">Google Cloud Storage</option>
                    <option value="do_spaces">DigitalOcean Spaces</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-2">Max Upload Size (MB)</label><input type="number" min={1} value={settings.storage.max_upload_mb} onChange={(e) => updateField('storage', 'max_upload_mb', Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-2">Allowed Audio Formats</label><input type="text" value={settings.storage.allowed_audio_formats} onChange={(e) => updateField('storage', 'allowed_audio_formats', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="mp3,wav,flac,aac" /></div>
                <div><label className="block text-sm font-medium mb-2">Allowed Image Formats</label><input type="text" value={settings.storage.allowed_image_formats} onChange={(e) => updateField('storage', 'allowed_image_formats', e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="jpg,png,webp,gif" /></div>
              </div>
            </div>
          )}

          {/* Save / Reset */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
            <button onClick={handleReset} disabled={!isDirty} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted disabled:opacity-50">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button onClick={handleSave} disabled={!isDirty || saveSettings.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {saveSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
