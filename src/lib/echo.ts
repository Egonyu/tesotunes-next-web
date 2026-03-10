import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { API_URL } from './api-config';
import { getAuthToken } from './api';

// Make Pusher available globally for Laravel Echo
if (typeof window !== 'undefined') {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<'pusher'> | null = null;

/**
 * Return a configured Echo instance.
 * Auth uses the Sanctum Bearer token (via getAuthToken) so that
 * private-channel authorization works through the Laravel API.
 */
export function getEchoInstance(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${getAuthToken() || ''}`,
          Accept: 'application/json',
        },
      },
    });
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
 * Reconnect Echo with a fresh auth token.
 * Call this after login/token-sync so private channels authenticate properly.
 */
export function reconnectEcho(): void {
  disconnectEcho();
  // Next call to getEchoInstance() will create a fresh instance
  // with the current Bearer token.
}

export type { Echo };
