import { Hono } from 'hono'
import { requireAuth } from './auth.ts'
import { linksRoute } from './routes/links.ts'
import { notesRoute } from './routes/notes.ts'
import { tasksRoute } from './routes/tasks.ts'
import { contactsRoute } from './routes/contacts.ts'
import { appointmentsRoute } from './routes/appointments.ts'
import { commandsRoute } from './routes/commands.ts'
import { projectsRoute } from './routes/projects.ts'
import { vaultRoute } from './routes/vault.ts'
import { bookingRoute } from './routes/booking.ts'
import { publicBookingRoute } from './routes/public-booking.ts'
import { googleCallbackRoute } from './routes/google-callback.ts'
import { integrationsRoute } from './routes/integrations.ts'
import { mailRoute } from './routes/mail.ts'
import { cloudMonitorRoute } from './routes/cloud-monitor.ts'
import { uptimeRoute } from './routes/uptime.ts'
import { chatRoute } from './routes/chat.ts'

/**
 * Gemeinsame App-Factory für beide Laufzeiten:
 * - lokal:   server/index.ts (@hono/node-server, Port 8787)
 * - Vercel:  api/[[...route]].ts (hono/vercel-Adapter)
 * Neue Routen NUR hier registrieren.
 */
export function createApp() {
  const app = new Hono().basePath('/api')

  // Zentraler Fehlerfänger: Wirft eine Route einen Fehler (z. B. DB-Ausfall),
  // antwortet die API sauber mit 500 statt den Fehler an Node durchreichen
  // zu lassen (früher ein häufiger Crash-/Absturzgrund).
  app.onError((err, c) => {
    console.error(`[API] Fehler in ${c.req.method} ${c.req.path}:`, err)
    return c.json({ error: 'Interner Serverfehler' }, 500)
  })

  // Health-Check (öffentlich, ohne Auth) – zum Überwachen der API
  app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))

  // Öffentliche Routen VOR der Auth-Middleware registrieren
  app.route('/public/booking', publicBookingRoute)
  app.route('/integrations/google', googleCallbackRoute)

  // Vercel-Cron-Endpunkt: Uptime-Auto-Check alle 5 Minuten (vercel.json).
  // Ersetzt den 5-Minuten-Ticker aus server/index.ts, der im Serverless-
  // Betrieb nicht laufen kann. Geschützt über CRON_SECRET (Vercel sendet
  // automatisch `Authorization: Bearer $CRON_SECRET`).
  app.get('/cron/uptime-refresh', async (c) => {
    const secret = process.env.CRON_SECRET
    if (!secret) {
      return c.json({ error: 'CRON_SECRET ist nicht konfiguriert' }, 403)
    }
    if (c.req.header('Authorization') !== `Bearer ${secret}`) {
      return c.json({ error: 'Ungültiges Cron-Secret' }, 401)
    }
    try {
      const { refreshAllMonitors } = await import('./uptime-check.ts')
      await refreshAllMonitors()
      return c.json({ ok: true })
    } catch (err) {
      console.error('[Cron] Uptime-Refresh fehlgeschlagen:', err)
      return c.json({ error: 'Uptime-Refresh fehlgeschlagen' }, 500)
    }
  })

  app.use('*', requireAuth)
  app.route('/links', linksRoute)
  app.route('/notes', notesRoute)
  app.route('/tasks', tasksRoute)
  app.route('/contacts', contactsRoute)
  app.route('/appointments', appointmentsRoute)
  app.route('/commands', commandsRoute)
  app.route('/projects', projectsRoute)
  app.route('/vault', vaultRoute)
  app.route('/booking', bookingRoute)
  app.route('/integrations', integrationsRoute)
  app.route('/mail', mailRoute)
  app.route('/cloud-monitor', cloudMonitorRoute)
  app.route('/uptime', uptimeRoute)
  app.route('/chat', chatRoute)

  return app
}
