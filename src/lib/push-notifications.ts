/**
 * Push Notifications Manager
 * Handles browser push notification registration and management
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }
  
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers not supported');
  }
  
  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  });
  
  // Wait for service worker to be ready
  await navigator.serviceWorker.ready;
  
  return registration;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications not supported');
  }
  
  // Check permission
  let permission = getNotificationPermission();
  
  if (permission === 'default') {
    permission = await requestNotificationPermission();
  }
  
  if (permission === 'denied') {
    throw new Error('Notification permission denied');
  }
  
  // Register service worker
  const registration = await registerServiceWorker();
  
  // Check if already subscribed
  let subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    // Subscribe
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });
  }
  
  return subscription;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }
  
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return false;
  }
  
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return false;
  }
  
  return await subscription.unsubscribe();
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }
  
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return null;
  }
  
  return await registration.pushManager.getSubscription();
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Show a local notification (for testing)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }
  
  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }
  
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.showNotification(title, {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      ...options,
    });
  } else {
    new Notification(title, options);
  }
}
