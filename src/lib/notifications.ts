import { toast } from 'sonner'

/**
 * Browser-Notifications für OmniDesk.
 * - Berechtigungs-Handling (Anfrage nur innerhalb von User-Gesten, z. B. Pomodoro-Start)
 * - Versand bevorzugt über den Service Worker → funktioniert auch als installierte PWA
 *   und im Hintergrund-Tab; Fallback auf new Notification().
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Fragt die Browser-Berechtigung für Notifications an.
 * Sollte aus einer User-Geste heraus aufgerufen werden (z. B. Start des Pomodoro-Timers),
 * da sonst manche Browser die Anfrage still ablehnen.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    toast.info('Browser-Benachrichtigungen werden von diesem Browser nicht unterstützt.')
    return 'unsupported'
  }
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const result = await Notification.requestPermission()
    if (result === 'denied') {
      toast.info(
        'Browser-Benachrichtigungen sind deaktiviert – in den Browser-Einstellungen jederzeit änderbar.',
      )
    }
    return result
  } catch {
    return 'denied'
  }
}

/**
 * Sendet eine Browser-Notification. Liefert true zurück, wenn sie zugestellt wurde.
 * Voraussetzung: Berechtigung 'granted' (sonst passiert nichts – kein Fehler-Toast).
 */
export async function sendBrowserNotification(
  title: string,
  options?: NotificationOptions,
): Promise<boolean> {
  if (getNotificationPermission() !== 'granted') return false
  try {
    // Bevorzugt über den Service Worker (PWA-kompatibel, funktioniert auch bei geschlossenem Tab-Fokus)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.showNotification(title, {
          icon: '/pwa-192.png',
          badge: '/pwa-192.png',
          ...options,
        })
        return true
      }
    }
    new Notification(title, {
      icon: '/pwa-192.png',
      ...options,
    })
    return true
  } catch {
    return false
  }
}
