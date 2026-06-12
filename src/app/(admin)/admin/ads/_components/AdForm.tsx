'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { apiPostForm } from '@/lib/api';
import { cn } from '@/lib/utils';
import { type AdminAd, type AdType, type AdFormat } from '@/hooks/useAdminAds';

const AD_TYPES: { value: AdType; label: string }[] = [
  { value: 'image', label: 'Image' },
  { value: 'html', label: 'HTML' },
  { value: 'audio', label: 'Audio' },
  { value: 'native', label: 'Native' },
  { value: 'google_adsense', label: 'Google AdSense' },
];

const FORMAT_OPTIONS: Record<AdType, { value: AdFormat; label: string }[]> = {
  image:         [{ value: 'banner_728x90', label: '728×90 Leaderboard' }, { value: 'banner_320x50', label: '320×50 Mobile' }, { value: 'square_300x250', label: '300×250 Rectangle' }],
  html:          [{ value: 'html', label: 'HTML / Responsive' }],
  audio:         [{ value: 'audio', label: 'Audio Spot' }],
  native:        [{ value: 'native', label: 'Native Card' }],
  google_adsense:[{ value: 'banner_728x90', label: '728×90 Leaderboard' }, { value: 'banner_320x50', label: '320×50 Mobile' }, { value: 'square_300x250', label: '300×250 Rectangle' }],
};

const ADSENSE_FORMATS = ['auto', 'rectangle', 'horizontal', 'vertical'];
const TIERS     = ['free', 'premium_basic', 'premium', 'artist', 'label'];
const DEVICES   = ['desktop', 'mobile', 'tablet'];
const COUNTRIES = ['UG', 'KE', 'TZ', 'RW', 'NG', 'GH', 'ZA'];

interface AdFormProps {
  initialData?: Partial<AdminAd>;
  onSubmit: (data: Partial<AdminAd>) => void;
  isSaving: boolean;
  title: string;
}

export function AdForm({ initialData, onSubmit, isSaving, title }: AdFormProps) {
  const [type, setType] = useState<AdType>(initialData?.type ?? 'image');
  const [form, setForm] = useState({
    title:                   initialData?.title ?? '',
    advertiser_name:         initialData?.advertiser_name ?? '',
    format:                  initialData?.format ?? FORMAT_OPTIONS['image'][0].value,
    image_url:               initialData?.image_url ?? '',
    click_url:               initialData?.click_url ?? '',
    cta_text:                initialData?.cta_text ?? '',
    html_content:            initialData?.html_content ?? '',
    audio_url:               initialData?.audio_url ?? '',
    audio_duration_seconds:  initialData?.audio_duration_seconds ?? 30,
    native_headline:         initialData?.native_headline ?? '',
    native_body:             initialData?.native_body ?? '',
    native_image_url:        initialData?.native_image_url ?? '',
    adsense_slot_id:         initialData?.adsense_slot_id ?? '',
    adsense_format:          initialData?.adsense_format ?? 'auto',
    is_active:               initialData?.is_active ?? false,
    starts_at:               initialData?.starts_at ?? '',
    ends_at:                 initialData?.ends_at ?? '',
    total_budget_ugx:        initialData?.total_budget_ugx ?? '',
    daily_budget_ugx:        initialData?.daily_budget_ugx ?? '',
    cost_per_impression_ugx: initialData?.cost_per_impression_ugx ?? '',
    cost_per_click_ugx:      initialData?.cost_per_click_ugx ?? '',
    target_tiers:            initialData?.target_tiers ?? ['free'],
    target_devices:          initialData?.target_devices ?? ['desktop', 'mobile'],
    target_countries:        initialData?.target_countries ?? ['UG'],
    priority:                initialData?.priority ?? 5,
    notes:                   initialData?.notes ?? '',
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleArray = (key: 'target_tiers' | 'target_devices' | 'target_countries', value: string) => {
    const arr = form[key] as string[];
    set(key, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const handleTypeChange = (t: AdType) => {
    setType(t);
    set('format', FORMAT_OPTIONS[t][0].value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<AdminAd> = {
      ...form,
      type,
      total_budget_ugx:        form.total_budget_ugx || null,
      daily_budget_ugx:        form.daily_budget_ugx || null,
      cost_per_impression_ugx: form.cost_per_impression_ugx || null,
      cost_per_click_ugx:      form.cost_per_click_ugx || null,
      starts_at:               form.starts_at || null,
      ends_at:                 form.ends_at || null,
      advertiser_name:         form.advertiser_name || null,
      notes:                   form.notes || null,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/ads" className="p-1.5 border rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      {/* Identity */}
      <Section title="Identity">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title *">
            <input required value={form.title} onChange={(e) => set('title', e.target.value)}
              className={inputCls} placeholder="e.g. MTN MoMo Summer Campaign" />
          </Field>
          <Field label="Advertiser name">
            <input value={form.advertiser_name} onChange={(e) => set('advertiser_name', e.target.value)}
              className={inputCls} placeholder="e.g. MTN Uganda" />
          </Field>
        </div>
      </Section>

      {/* Ad type + format */}
      <Section title="Ad Type">
        <div className="flex flex-wrap gap-2 mb-4">
          {AD_TYPES.map((t) => (
            <button key={t.value} type="button"
              onClick={() => handleTypeChange(t.value)}
              className={cn('px-3 py-1.5 text-sm border rounded-lg transition-colors',
                type === t.value ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Field label="Format *">
          <select value={form.format} onChange={(e) => set('format', e.target.value as AdFormat)} className={inputCls}>
            {FORMAT_OPTIONS[type].map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </Field>
      </Section>

      {/* Type-specific content */}
      {type === 'image' && (
        <Section title="Image Ad">
          <Field label="Ad Image *">
            <AdImageUpload value={form.image_url} onChange={(url) => set('image_url', url)} required />
          </Field>
          <Field label="Click URL"><input value={form.click_url} onChange={(e) => set('click_url', e.target.value)} className={inputCls} placeholder="https://advertiser.com/landing" /></Field>
          <Field label="Call to Action text"><input value={form.cta_text} onChange={(e) => set('cta_text', e.target.value)} className={inputCls} placeholder="Learn More" /></Field>
        </Section>
      )}

      {type === 'html' && (
        <Section title="HTML Ad">
          <Field label="HTML content *">
            <textarea required rows={6} value={form.html_content} onChange={(e) => set('html_content', e.target.value)}
              className={cn(inputCls, 'resize-y font-mono text-xs')} placeholder="<div>...</div>" />
          </Field>
          <Field label="Click URL"><input value={form.click_url} onChange={(e) => set('click_url', e.target.value)} className={inputCls} /></Field>
        </Section>
      )}

      {type === 'audio' && (
        <Section title="Audio Ad">
          <Field label="Audio URL *"><input required value={form.audio_url} onChange={(e) => set('audio_url', e.target.value)} className={inputCls} placeholder="https://cdn.example.com/ad.mp3" /></Field>
          <Field label="Duration (seconds)"><input type="number" min={1} max={120} value={form.audio_duration_seconds} onChange={(e) => set('audio_duration_seconds', Number(e.target.value))} className={inputCls} /></Field>
        </Section>
      )}

      {type === 'native' && (
        <Section title="Native Ad">
          <Field label="Headline *"><input required value={form.native_headline} onChange={(e) => set('native_headline', e.target.value)} className={inputCls} /></Field>
          <Field label="Body"><textarea rows={3} value={form.native_body} onChange={(e) => set('native_body', e.target.value)} className={cn(inputCls, 'resize-none')} /></Field>
          <Field label="Native Image">
            <AdImageUpload value={form.native_image_url} onChange={(url) => set('native_image_url', url)} />
          </Field>
          <Field label="Click URL"><input value={form.click_url} onChange={(e) => set('click_url', e.target.value)} className={inputCls} /></Field>
          <Field label="CTA text"><input value={form.cta_text} onChange={(e) => set('cta_text', e.target.value)} className={inputCls} /></Field>
        </Section>
      )}

      {type === 'google_adsense' && (
        <Section title="Google AdSense">
          <Field label="Ad Slot ID *"><input required value={form.adsense_slot_id} onChange={(e) => set('adsense_slot_id', e.target.value)} className={inputCls} placeholder="1234567890" /></Field>
          <Field label="AdSense format">
            <select value={form.adsense_format} onChange={(e) => set('adsense_format', e.target.value)} className={inputCls}>
              {ADSENSE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        </Section>
      )}

      {/* Scheduling */}
      <Section title="Scheduling">
        <div className="flex items-center gap-3 mb-4">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4" />
          <label htmlFor="is_active" className="text-sm">Active (start serving immediately)</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date"><input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} className={inputCls} /></Field>
          <Field label="End date"><input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} className={inputCls} /></Field>
        </div>
      </Section>

      {/* Targeting */}
      <Section title="Targeting">
        <CheckboxGroup label="Subscriber tiers" options={TIERS} selected={form.target_tiers as string[]}
          onToggle={(v) => toggleArray('target_tiers', v)} />
        <CheckboxGroup label="Devices" options={DEVICES} selected={form.target_devices as string[]}
          onToggle={(v) => toggleArray('target_devices', v)} />
        <CheckboxGroup label="Countries" options={COUNTRIES} selected={form.target_countries as string[]}
          onToggle={(v) => toggleArray('target_countries', v)} />
      </Section>

      {/* Budget */}
      <Section title="Budget (UGX, optional)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Total budget"><input type="number" min={0} value={form.total_budget_ugx} onChange={(e) => set('total_budget_ugx', e.target.value)} className={inputCls} placeholder="0" /></Field>
          <Field label="Daily budget"><input type="number" min={0} value={form.daily_budget_ugx} onChange={(e) => set('daily_budget_ugx', e.target.value)} className={inputCls} placeholder="0" /></Field>
          <Field label="Cost/impression (UGX)"><input type="number" min={0} step="0.0001" value={form.cost_per_impression_ugx} onChange={(e) => set('cost_per_impression_ugx', e.target.value)} className={inputCls} /></Field>
          <Field label="Cost/click (UGX)"><input type="number" min={0} value={form.cost_per_click_ugx} onChange={(e) => set('cost_per_click_ugx', e.target.value)} className={inputCls} /></Field>
        </div>
      </Section>

      {/* Priority & Notes */}
      <Section title="Settings">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority (1=low, 10=high)">
            <input type="number" min={1} max={10} value={form.priority} onChange={(e) => set('priority', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Admin notes">
            <input value={form.notes} onChange={(e) => set('notes', e.target.value)} className={inputCls} placeholder="Internal notes…" />
          </Field>
        </div>
      </Section>

      {/* Submit */}
      <div className="flex gap-3">
        <button type="submit" disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Ad
        </button>
        <Link href="/admin/ads" className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl p-4 space-y-4">
      <h2 className="font-semibold text-sm">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function CheckboxGroup({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onToggle(o)}
            className={cn('px-2.5 py-1 text-xs border rounded-full transition-colors',
              selected.includes(o) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted')}
          >
            {o}
          </button>
        ))}
      </div>
    </Field>
  );
}

function AdImageUpload({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('type', 'ad');
      fd.append('resize', '0');
      const resp = await apiPostForm<{ success: boolean; data: { url: string } }>('/uploads/image', fd);
      if (!resp.data?.url) throw new Error('missing url');
      onChange(resp.data.url);
    } catch (err) {
      const axiosMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(axiosMsg ?? 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative h-24 w-48 overflow-hidden rounded-lg border bg-muted">
          <Image src={value} alt="Ad preview" fill className="object-contain p-1" unoptimized />
        </div>
      ) : (
        <div className="flex h-24 w-48 items-center justify-center rounded-lg border-2 border-dashed text-xs text-muted-foreground">
          No image
        </div>
      )}
      {/* Hidden required sentinel when value is empty */}
      {required && (
        <input
          type="text"
          required={!value}
          value={value}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
      </button>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none';
