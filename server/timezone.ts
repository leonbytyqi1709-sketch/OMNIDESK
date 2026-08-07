/**
 * Explizite Zeitzonen-Behandlung fürs Booking (Spec: Feinschliff-Punkt
 * "Booking-Zeitzonen"). Die Verfügbarkeiten ("09:00–17:00") sind als
 * Europe-Berlin-Zeiten gemeint – unabhängig davon, in welcher Zeitzone der
 * Server läuft (lokal: Europe/Berlin, Vercel: UTC).
 * Bewusst ohne Zusatz-Dependency über die Intl-API gelöst.
 */
export const BOOKING_TIMEZONE = 'Europe/Berlin'

const offsetFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BOOKING_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** UTC-Offset (ms) der Booking-Zeitzone zum Zeitpunkt t (DST-abhängig +1h/+2h). */
function timezoneOffsetMs(t: Date): number {
  const parts = Object.fromEntries(
    offsetFormatter.formatToParts(t).map((p) => [p.type, p.value]),
  )
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    // Intl liefert für Mitternacht je nach Runtime "24" – normalisieren
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return asUtc - t.getTime()
}

/**
 * Exakter UTC-Zeitpunkt für "YYYY-MM-DD" + Minuten seit Mitternacht,
 * interpretiert in der Booking-Zeitzone.
 */
export function zonedDateTime(dateStr: string, minutes: number): Date {
  const utcGuess =
    new Date(`${dateStr}T00:00:00Z`).getTime() + minutes * 60_000
  const offset = timezoneOffsetMs(new Date(utcGuess))
  let result = utcGuess - offset
  // DST-Randfall: Nach der Korrektur kann ein anderer Offset gelten
  const offsetAfter = timezoneOffsetMs(new Date(result))
  if (offsetAfter !== offset) result = utcGuess - offsetAfter
  return new Date(result)
}

/** Wochentags-Index (0 = Sonntag) eines Kalenderdatums "YYYY-MM-DD". */
export function weekdayOfDate(dateStr: string): number {
  // Mittags-UTC vermeidet jede Datumsgrenzen-Ambiguität
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay()
}

/** Folgetag eines Kalenderdatums "YYYY-MM-DD". */
export function nextDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}
