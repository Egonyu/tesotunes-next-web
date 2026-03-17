import Pusher from 'pusher-js';
import Echo from 'laravel-echo';

// Make Pusher available globally for Laravel Echo
if (typeof window !== 'undefined') {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<'pusher'> | null = null;

function resolveRealtimeOptions() {
  const reverbHost = process.env.NEXT_PUBLIC_REVERB_HOST;
  const reverbPort = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080);
  const reverbScheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http';
  const usingReverb = Boolean(reverbHost);

  return {
    broadcaster: 'pusher' as const,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_REVERB_APP_KEY || '',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    forceTLS: usingReverb ? reverbScheme === 'https' : true,
    enabledTransports: ['ws', 'wss'] as ('ws' | 'wss')[],
    authEndpoint: '/api/backend/broadcasting/auth',
    ...(usingReverb
      ? {
          wsHost: reverbHost,
          wsPort: reverbPort,
          wssPort: reverbPort,
        }
      : {}),
  };
}

/**
 * Return a configured Echo instance.
 * Private-channel auth goes through the Next.js backend proxy so the Laravel
 * access token never needs to be exposed to browser JavaScript.
 */
export function getEchoInstance(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;

  if (!echoInstance) {
    echoInstance = new Echo(resolveRealtimeOptions());
  }

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

/**
 * Reconnect Echo so it can re-authorize via the current authenticated session.
 */
export function reconnectEcho(): void {
  disconnectEcho();
  // Next call to getEchoInstance() will create a fresh instance.
}

export type { Echo };
