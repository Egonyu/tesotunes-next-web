import Pusher from 'pusher-js';
import Echo from 'laravel-echo';

// Make Pusher available globally for Laravel Echo
if (typeof window !== 'undefined') {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<'pusher'> | null = null;

export function getEchoInstance(): Echo<'pusher'> | null {
  if (typeof window === 'undefined') return null;
  
  if (!echoInstance) {
    // Get auth token from cookie or localStorage
    const getAuthToken = () => {
      // Try to get from cookie first
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
          return decodeURIComponent(value);
        }
      }
      return null;
    };

    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '6271e2976a0012739055',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap4',
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://beta.test/api'}/broadcasting/auth`,
      auth: {
        headers: {
          'X-XSRF-TOKEN': getAuthToken() || '',
          'Accept': 'application/json',
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

export type { Echo };
