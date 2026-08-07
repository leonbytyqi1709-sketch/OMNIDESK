import { config } from 'dotenv'

// Muss vor allen Imports laufen, die process.env lesen (db/client, auth)
config({ path: '.env.local' })

const [
  { serve },
  { Hono },
  { requireAuth },
  { linksRoute },
  { notesRoute },
  { tasksRoute },
  { contactsRoute },
  { appointmentsRoute },
  { commandsRoute },
  { projectsRoute },
  { vaultRoute },
  { bookingRoute },
  { publicBookingRoute },
] = await Promise.all([
  import('@hono/node-server'),
  import('hono'),
  import('./auth.ts'),
  import('./routes/links.ts'),
  import('./routes/notes.ts'),
  import('./routes/tasks.ts'),
  import('./routes/contacts.ts'),
  import('./routes/appointments.ts'),
  import('./routes/commands.ts'),
  import('./routes/projects.ts'),
  import('./routes/vault.ts'),
  import('./routes/booking.ts'),
  import('./routes/public-booking.ts'),
])

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

const port = Number(process.env.API_PORT ?? 8787)
serve({ fetch: app.fetch, port }, () => {
  console.log(`OmniDesk API läuft auf http://localhost:${port}`)
})
