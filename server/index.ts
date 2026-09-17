import { config } from 'dotenv'

// Muss vor allen Imports laufen, die process.env lesen (db/client, auth)
config({ path: '.env.local' })

// ---------------------------------------------------------------------------
// Globale Fehlerfänger: Der Server darf niemals still sterben.
// Ohne diese Handler beendet sich Node bei JEDER unbehandelten
// Promise-Rejection (z. B. abgebrochene Chat-Streams, Netzwerkfehler der
// Neon-DB) – und `tsx watch` startet nach einem Crash NICHT von selbst neu
// (es reagiert nur auf Datei-Änderungen). Das Resultat war: Die API war
// plötzlich weg und das Frontend zeigte nur noch Ladefehler.
// ---------------------------------------------------------------------------
process.on('unhandledRejection', (reason) => {
  console.error('[API] Unbehandelte Promise-Rejection – Server läuft weiter:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('[API] Unbehandelte Ausnahme – Server läuft weiter:', err)
})

const [{ serve }, { createApp }] = await Promise.all([
  import('@hono/node-server'),
  import('./app.ts'),
])

const app = createApp()

const port = Number(process.env.API_PORT ?? 8787)
serve({ fetch: app.fetch, port }, () => {
  console.log(`OmniDesk API läuft auf http://localhost:${port}`)
})

// Automatischer Uptime-Check-Ticker (alle 5 Minuten für aktive Monitore)
const UPTIME_INTERVAL_MS = 5 * 60 * 1000
const uptimeTicker = setInterval(async () => {
  try {
    const { refreshAllMonitors } = await import('./uptime-check.ts')
    await refreshAllMonitors()
  } catch (err) {
    console.error('Automatischer Uptime-Check fehlgeschlagen:', err)
  }
}, UPTIME_INTERVAL_MS)
uptimeTicker.unref()
