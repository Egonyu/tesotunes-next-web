'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/admin';
import EventForm from '@/components/events/form/EventForm';
import { draftFromEvent, mapServerErrors, toAdminFormData } from '@/components/events/form/event-form-model';
import { apiGet, apiPostForm } from '@/lib/api';
import type { Event } from '@/hooks/useEvents';
import { getErrorMessage, getValidationErrors } from '@/lib/utils';

export default function AdminEditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState<ReturnType<typeof mapServerErrors> | null>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ['admin', 'event', id],
    queryFn: () => apiGet<{ data: Event }>(`/admin/events/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const initial = useMemo(() => (event ? draftFromEvent(event) : null), [event]);

  const update = useMutation({
    mutationFn: (data: FormData) => apiPostForm(`/admin/events/${id}`, data),
  });

  if (isLoading || !initial) {
    return (
      <div className="flex items-center justify-center py-20">
        {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>Event not found</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Edit event"
        description={event?.title}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Events', href: '/admin/events' },
          { label: 'Edit' },
        ]}
        backHref={`/admin/events/${id}`}
      />

      <EventForm
        mode="admin"
        isEdit
        initial={initial}
        submitting={update.isPending}
        serverErrors={serverErrors}
        estimateEndpoint="/admin/events/commission-simulation"
        onCancel={() => router.push(`/admin/events/${id}`)}
        onSubmit={async (draft) => {
          setServerErrors(null);
          try {
            await update.mutateAsync(toAdminFormData(draft, undefined, true));
            toast.success('Event updated');
            await queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
            await queryClient.invalidateQueries({ queryKey: ['admin', 'event', id] });
            router.push(`/admin/events/${id}`);
          } catch (error: unknown) {
            setServerErrors(mapServerErrors(getValidationErrors(error)));
            toast.error(getErrorMessage(error, 'Could not save changes'));
          }
        }}
      />
    </div>
  );
}
