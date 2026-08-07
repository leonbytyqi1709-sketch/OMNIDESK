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

/**
 * Gemeinsame App-Factory für beide Laufzeiten:
 * - lokal:   server/index.ts (@hono/node-server, Port 8787)
 * - Vercel:  api/[[...route]].ts (hono/vercel-Adapter)
 * Neue Routen NUR hier registrieren.
 */
export function createApp() {
  const app = new Hono().basePath('/api')

  // Öffentliche Routen VOR der Auth-Middleware registrieren
  app.route('/public/booking', publicBookingRoute)

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

  return app
}
