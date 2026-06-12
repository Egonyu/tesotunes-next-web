'use client';

import { useRouter } from 'next/navigation';
import { AdForm } from '../_components/AdForm';
import { useCreateAd } from '@/hooks/useAdminAds';

export default function NewAdPage() {
  const router = useRouter();
  const create = useCreateAd();

  return (
    <AdForm
      onSubmit={(data) => create.mutate(data, { onSuccess: () => router.push('/admin/ads') })}
      isSaving={create.isPending}
      title="Create New Ad"
    />
  );
}
