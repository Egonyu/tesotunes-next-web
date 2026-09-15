'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import EventForm from '@/components/events/form/EventForm';
import { emptyDraft, mapServerErrors, toArtistRequest } from '@/components/events/form/event-form-model';
import { useCreateEvent } from '@/hooks/useEvents';
import { getErrorMessage, getValidationErrors } from '@/lib/utils';

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const [initial] = useState(emptyDraft);
  const [serverErrors, setServerErrors] = useState<ReturnType<typeof mapServerErrors> | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">New event</h1>
        <p className="text-sm text-muted-foreground">Three steps. Save a draft anytime.</p>
      </div>

      <EventForm
        mode="artist"
        initial={initial}
        submitting={createEvent.isPending}
        serverErrors={serverErrors}
        estimateEndpoint="/artist/events/commission-simulation"
        onCancel={() => router.back()}
        onSubmit={async (draft, intent) => {
          setServerErrors(null);
          try {
            const result = await createEvent.mutateAsync(
              toArtistRequest(draft, intent === 'publish' ? 'published' : 'draft'),
            );
            toast.success(intent === 'publish' ? 'Event published' : 'Draft saved');
            const created = result.data as { id?: number; slug?: string };
            router.push(`/artist/events/${created?.id ?? created?.slug ?? ''}`);
          } catch (error: unknown) {
            setServerErrors(mapServerErrors(getValidationErrors(error)));
            toast.error(getErrorMessage(error, 'Could not save the event'));
          }
        }}
      />
    </div>
  );
}
