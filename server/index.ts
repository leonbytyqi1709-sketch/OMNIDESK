import { config } from 'dotenv'

// Muss vor allen Imports laufen, die process.env lesen (db/client, auth)
config({ path: '.env.local' })

const [{ serve }, { createApp }] = await Promise.all([
  import('@hono/node-server'),
  import('./app.ts'),
])

const app = createApp()

const port = Number(process.env.API_PORT ?? 8787)
serve({ fetch: app.fetch, port }, () => {
  console.log(`OmniDesk API läuft auf http://localhost:${port}`)
})
