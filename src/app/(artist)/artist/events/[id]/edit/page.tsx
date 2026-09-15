'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import EventForm from '@/components/events/form/EventForm';
import { draftFromEvent, mapServerErrors, toArtistRequest } from '@/components/events/form/event-form-model';
import { apiGet } from '@/lib/api';
import { Event, UpdateEventRequest, useUpdateEvent } from '@/hooks/useEvents';
import { getErrorMessage, getValidationErrors } from '@/lib/utils';

export default function EditArtistEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateEvent = useUpdateEvent();
  const [serverErrors, setServerErrors] = useState<ReturnType<typeof mapServerErrors> | null>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ['artist', 'events', id],
    queryFn: () => apiGet<{ data: Event }>(`/artist/events/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const initial = useMemo(() => (event ? draftFromEvent(event) : null), [event]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!event || !initial) {
    return (
      <div className="py-20 text-center">
        <h2 className="mb-2 text-xl font-semibold">Event not found</h2>
        <Link href="/artist/events" className="text-primary hover:underline">Back to events</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/artist/events/${id}`} className="rounded-lg p-2 hover:bg-muted" aria-label="Back to event">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">Edit event</h1>
          <p className="truncate text-sm text-muted-foreground">{event.title}</p>
        </div>
      </div>

      <EventForm
        mode="artist"
        isEdit
        initial={initial}
        submitting={updateEvent.isPending}
        serverErrors={serverErrors}
        estimateEndpoint="/artist/events/commission-simulation"
        onCancel={() => router.push(`/artist/events/${id}`)}
        onSubmit={async (draft) => {
          setServerErrors(null);
          try {
            await updateEvent.mutateAsync({ id: Number(id), ...toArtistRequest(draft) } as UpdateEventRequest);
            await queryClient.invalidateQueries({ queryKey: ['artist', 'events', id] });
            toast.success('Event updated');
            router.push(`/artist/events/${id}`);
          } catch (error: unknown) {
            setServerErrors(mapServerErrors(getValidationErrors(error)));
            toast.error(getErrorMessage(error, 'Could not save changes'));
          }
        }}
      />
    </div>
  );
}
