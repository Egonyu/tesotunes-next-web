'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AdForm } from '../../_components/AdForm';
import { useAdminAd, useUpdateAd } from '@/hooks/useAdminAds';

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: ad, isLoading } = useAdminAd(Number(id));
  const update = useUpdateAd(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AdForm
      initialData={ad}
      onSubmit={(data) => update.mutate(data, { onSuccess: () => router.push('/admin/ads') })}
      isSaving={update.isPending}
      title="Edit Ad"
    />
  );
}
