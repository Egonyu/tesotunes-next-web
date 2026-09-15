'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/admin';
import EventForm from '@/components/events/form/EventForm';
import { emptyDraft, mapServerErrors, toAdminFormData } from '@/components/events/form/event-form-model';
import { apiPostForm } from '@/lib/api';
import { getErrorMessage, getValidationErrors } from '@/lib/utils';

export default function AdminCreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [initial] = useState(emptyDraft);
  const [serverErrors, setServerErrors] = useState<ReturnType<typeof mapServerErrors> | null>(null);

  const create = useMutation({
    mutationFn: (data: FormData) => apiPostForm<{ data?: { id?: number } }>('/admin/events', data),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="New event"
        description="Create an event on an artist's behalf"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Events', href: '/admin/events' },
          { label: 'New' },
        ]}
        backHref="/admin/events"
      />

      <EventForm
        mode="admin"
        initial={initial}
        submitting={create.isPending}
        serverErrors={serverErrors}
        estimateEndpoint="/admin/events/commission-simulation"
        onCancel={() => router.push('/admin/events')}
        onSubmit={async (draft, intent) => {
          setServerErrors(null);
          try {
            const res = await create.mutateAsync(
              toAdminFormData(draft, intent === 'publish' ? 'published' : draft.status === 'published' ? 'draft' : draft.status),
            );
            toast.success(intent === 'publish' ? 'Event published' : 'Draft saved');
            await queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
            router.push(res?.data?.id ? `/admin/events/${res.data.id}` : '/admin/events');
          } catch (error: unknown) {
            setServerErrors(mapServerErrors(getValidationErrors(error)));
            toast.error(getErrorMessage(error, 'Could not create the event'));
          }
        }}
      />
    </div>
  );
}
