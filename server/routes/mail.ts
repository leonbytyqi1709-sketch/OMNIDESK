import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client.ts'
import { connectedAccounts } from '../../src/db/schema/index.ts'
import { getValidGoogleAccessToken } from '../google-auth.ts'

export const mailRoute = new Hono()

// Simulierter Speicher für In-Memory-Demo-Emails, falls keine echten Google OAuth Tokens vorhanden sind
interface DemoMessage {
  id: string
  accountId: string
  fromName: string
  fromEmail: string
  toEmail: string
  subject: string
  snippet: string
  bodyHtml: string
  date: string
  isRead: boolean
  isStarred: boolean
  folder: 'inbox' | 'sent' | 'starred' | 'trash'
}

const initialDemoMessages: DemoMessage[] = [
  {
    id: 'msg-1',
    accountId: 'demo',
    fromName: 'Proxmox Backup Server',
    fromEmail: 'pbs-admin@datacenter.local',
    toEmail: 'admin@omnidesk.app',
    subject: '[OK] Backup vzdump VM 102 (production-db) erfolgreich',
    snippet: 'Der geplante Backup-Job vzdump-102 wurde ohne Fehler abgeschlossen. Deduplizierungsrate: 4.82x, Dauer: 4m 12s.',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.6;">
      <h3 style="color: #22c55e;">✔ Backup erfolgreich abgeschlossen</h3>
      <p>Der nächtliche Backup-Job für <strong>VM 102 (production-db)</strong> wurde fehlerfrei auf Datastore <em>pbs-storage-01</em> gesichert.</p>
      <ul>
        <li><strong>Dauer:</strong> 4 Minuten 12 Sekunden</li>
        <li><strong>Übertragene Daten:</strong> 1.42 GB</li>
        <li><strong>Deduplizierungsrate:</strong> 4.82x (79.2% Speicherersparnis)</li>
        <li><strong>Status:</strong> Verify OK, Checksummen geprüft</li>
      </ul>
      <p style="color: #888; font-size: 12px;">Automatische Benachrichtigung von Proxmox Backup Server v3.2</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    isRead: false,
    isStarred: true,
    folder: 'inbox',
  },
  {
    id: 'msg-2',
    accountId: 'demo',
    fromName: 'Zabbix IT-Monitoring',
    fromEmail: 'alert@monitoring.firma.de',
    toEmail: 'admin@omnidesk.app',
    subject: 'RESOLVED: Host srv-core-gw ping latency normal',
    snippet: 'Problem gelöst: ICMP ping latency on srv-core-gw ist wieder unter 20ms gefallen. Vorher: 145ms.',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.6;">
      <h3 style="color: #3b82f6;">ℹ Problem behoben: Host srv-core-gw</h3>
      <p>Das zuvor gemeldete Problem bzgl. erhöhter Latenzzeiten wurde automatisch quittiert.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr><td style="padding: 4px; color: #888;">Host:</td><td><strong>srv-core-gw.dmz.local</strong></td></tr>
        <tr><td style="padding: 4px; color: #888;">Schweregrad:</td><td>Warnung (gelöst)</td></tr>
        <tr><td style="padding: 4px; color: #888;">Aktueller Wert:</td><td>14.2 ms (Schwelle: 50 ms)</td></tr>
        <tr><td style="padding: 4px; color: #888;">Dauer des Vorfalls:</td><td>12 Minuten</td></tr>
      </table>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: true,
    isStarred: false,
    folder: 'inbox',
  },
  {
    id: 'msg-3',
    accountId: 'demo',
    fromName: 'Let\'s Encrypt Expiry Bot',
    fromEmail: 'expiry@letsencrypt.org',
    toEmail: 'admin@omnidesk.app',
    subject: 'Zertifikatsverlängerung für *.kunde-portal.de in 14 Tagen fällig',
    snippet: 'Ihr TLS-Zertifikat für *.kunde-portal.de läuft am 26. September 2026 ab. Bitte Certbot-Cron prüfen.',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>Hallo Administrator,</p>
      <p>Ihr SSL/TLS-Zertifikat für die folgenden Domains läuft in <strong>14 Tagen</strong> ab:</p>
      <pre style="background: #27272a; padding: 8px; border-radius: 4px;">*.kunde-portal.de\nkunde-portal.de</pre>
      <p>Sofern Sie automatische ACME-Challenge / Certbot nutzen, sollte die Verlängerung in Kürze automatisch initiiert werden.</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isRead: true,
    isStarred: false,
    folder: 'inbox',
  },
  {
    id: 'msg-4',
    accountId: 'demo',
    fromName: 'Markus Weber (Geschäftsführung)',
    fromEmail: 'm.weber@beispiel-gmbh.de',
    toEmail: 'admin@omnidesk.app',
    subject: 'Neuer Mitarbeiter im Vertrieb ab 01.10. - Arbeitsplatz & Berechtigungen',
    snippet: 'Hallo Leon, ab dem ersten Oktober fängt Herr Schmidt bei uns an. Kannst du den Laptop und die VPN-Accounts vorbereiten?',
    bodyHtml: `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>Hallo Leon,</p>
      <p>ab dem 01.10. verstärkt uns Herr Jonas Schmidt im Vertriebsaußendienst.</p>
      <p>Könntest du bitte Folgendes vorbereiten?</p>
      <ul>
        <li>ThinkPad T14 mit aktuellem Windows 11 Image & VPN-Client</li>
        <li>E-Mail-Adresse: j.schmidt@beispiel-gmbh.de</li>
        <li>Zugriff auf unser ERP und das Kunden-Wiki</li>
      </ul>
      <p>Vielen Dank und beste Grüße,<br>Markus</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: false,
    isStarred: true,
    folder: 'inbox',
  },
]

// In-Memory-State pro laufendem Server-Prozess
let demoStore = [...initialDemoMessages]

/** Google-Accounts des Nutzers abrufen. */
mailRoute.get('/accounts', async (c) => {
  const accounts = await db
    .select({
      id: connectedAccounts.id,
      email: connectedAccounts.email,
      label: connectedAccounts.label,
      avatarUrl: connectedAccounts.avatarUrl,
      provider: connectedAccounts.provider,
    })
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.userId, c.get('userId')),
        eq(connectedAccounts.provider, 'google'),
      ),
    )

  return c.json(accounts)
})

/** Nachrichtenliste abrufen. */
mailRoute.get('/messages', async (c) => {
  const folder = (c.req.query('folder') ?? 'inbox') as 'inbox' | 'sent' | 'starred' | 'trash'
  const accountId = c.req.query('accountId')
  const query = c.req.query('q')?.toLowerCase().trim()

  // Prüfen, ob der Nutzer einen echten Google-Account mit Access-Token hat
  if (accountId) {
    const [acc] = await db
      .select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.id, accountId),
          eq(connectedAccounts.userId, c.get('userId')),
        ),
      )

    // Falls ein echtes Google Token existiert, versuchen wir die Gmail API anzufragen
    if (acc?.accessToken || acc?.refreshToken) {
      try {
        const accessToken = await getValidGoogleAccessToken(acc)
        const gmailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=${encodeURIComponent(
            folder === 'starred' ? 'is:starred' : folder === 'sent' ? 'in:sent' : folder === 'trash' ? 'in:trash' : 'in:inbox',
          )}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        if (gmailRes.ok) {
          const list = (await gmailRes.json()) as { messages?: Array<{ id: string; threadId: string }> }
          if (list.messages) {
            // Details der ersten Nachrichten laden
            const detailed = await Promise.all(
              list.messages.slice(0, 10).map(async (m) => {
                const itemRes = await fetch(
                  `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata`,
                  { headers: { Authorization: `Bearer ${accessToken}` } },
                )
                if (itemRes.ok) {
                  const item = (await itemRes.json()) as {
                    id: string
                    snippet: string
                    internalDate: string
                    labelIds?: string[]
                    payload?: { headers?: Array<{ name: string; value: string }> }
                  }
                  const getHeader = (name: string) =>
                    item.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
                  return {
                    id: item.id,
                    accountId: acc.id,
                    fromName: getHeader('From').replace(/<.*>/, '').trim() || getHeader('From'),
                    fromEmail: getHeader('From'),
                    toEmail: getHeader('To') || acc.email,
                    subject: getHeader('Subject') || '(Kein Betreff)',
                    snippet: item.snippet,
                    bodyHtml: `<p>${item.snippet}</p>`,
                    date: new Date(Number(item.internalDate)).toISOString(),
                    isRead: !item.labelIds?.includes('UNREAD'),
                    isStarred: item.labelIds?.includes('STARRED') ?? false,
                    folder,
                  }
                }
                return null
              }),
            )
            return c.json(detailed.filter(Boolean))
          }
        }
      } catch {
        // Fallback auf Demo-Nachrichten bei API-Fehler
      }
    }
  }

  // Filterung des Demo-Stores
  let result = demoStore.filter((m) => {
    if (folder === 'starred') return m.isStarred
    return m.folder === folder
  })

  if (query) {
    result = result.filter(
      (m) =>
        m.subject.toLowerCase().includes(query) ||
        m.snippet.toLowerCase().includes(query) ||
        m.fromName.toLowerCase().includes(query) ||
        m.fromEmail.toLowerCase().includes(query),
    )
  }

  return c.json(result)
})

/** Einzelne Nachricht mit vollständigem Body abrufen. */
mailRoute.get('/messages/:id', async (c) => {
  const id = c.req.param('id')
  const msg = demoStore.find((m) => m.id === id)
  if (!msg) {
    return c.json({ error: 'Nachricht nicht gefunden' }, 404)
  }

  // Als gelesen markieren
  msg.isRead = true
  return c.json(msg)
})

/** E-Mail senden / beantworten. */
mailRoute.post('/send', async (c) => {
  const sendInput = z.object({
    accountId: z.string().optional(),
    toEmail: z.string().email('Ungültige Empfänger-E-Mail'),
    subject: z.string().trim().min(1, 'Betreff fehlt'),
    body: z.string().min(1, 'Nachrichtentext fehlt'),
  })

  const parsed = sendInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }

  const { accountId, toEmail, subject, body } = parsed.data

  // Falls ein echtes Google-Konto gewählt wurde, über die offizielle Gmail-API versenden
  if (accountId && accountId !== 'demo') {
    const [acc] = await db
      .select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.id, accountId),
          eq(connectedAccounts.userId, c.get('userId')),
        ),
      )

    if (acc && (acc.accessToken || acc.refreshToken)) {
      try {
        const validToken = await getValidGoogleAccessToken(acc)
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
        const messageParts = [
          `From: ${acc.email}`,
          `To: ${toEmail}`,
          `Subject: ${utf8Subject}`,
          'Content-Type: text/plain; charset=utf-8',
          'MIME-Version: 1.0',
          '',
          body,
        ]
        const rawMessage = Buffer.from(messageParts.join('\r\n')).toString('base64url')

        const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${validToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: rawMessage }),
        })

        if (sendRes.ok) {
          const sendData = (await sendRes.json()) as { id: string }
          const newMsg: DemoMessage = {
            id: sendData.id,
            accountId: acc.id,
            fromName: acc.label || acc.email,
            fromEmail: acc.email,
            toEmail,
            subject,
            snippet: body.slice(0, 100),
            bodyHtml: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
            date: new Date().toISOString(),
            isRead: true,
            isStarred: false,
            folder: 'sent',
          }
          demoStore.unshift(newMsg)
          return c.json(newMsg, 201)
        }
      } catch {
        // Fallback auf DemoStore bei Netzwerk- oder Berechtigungsfehlern
      }
    }
  }

  const newMsg: DemoMessage = {
    id: `msg-${Date.now()}`,
    accountId: accountId || 'demo',
    fromName: 'Leon Bytyqi',
    fromEmail: 'admin@omnidesk.app',
    toEmail,
    subject,
    snippet: body.slice(0, 100),
    bodyHtml: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
    date: new Date().toISOString(),
    isRead: true,
    isStarred: false,
    folder: 'sent',
  }

  demoStore.unshift(newMsg)
  return c.json(newMsg, 201)
})

/** Status der Nachricht aktualisieren (isRead, isStarred, folder). */
mailRoute.put('/messages/:id', async (c) => {
  const updateInput = z.object({
    isRead: z.boolean().optional(),
    isStarred: z.boolean().optional(),
    folder: z.enum(['inbox', 'sent', 'starred', 'trash']).optional(),
  })

  const parsed = updateInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }

  const id = c.req.param('id')
  const msg = demoStore.find((m) => m.id === id)
  if (!msg) {
    return c.json({ error: 'Nachricht nicht gefunden' }, 404)
  }

  if (parsed.data.isRead !== undefined) msg.isRead = parsed.data.isRead
  if (parsed.data.isStarred !== undefined) msg.isStarred = parsed.data.isStarred
  if (parsed.data.folder !== undefined) msg.folder = parsed.data.folder

  return c.json(msg)
})

/** Nachricht löschen (in Papierkorb verschieben oder endgültig entfernen). */
mailRoute.delete('/messages/:id', async (c) => {
  const id = c.req.param('id')
  const idx = demoStore.findIndex((m) => m.id === id)
  if (idx === -1) {
    return c.json({ error: 'Nachricht nicht gefunden' }, 404)
  }

  if (demoStore[idx].folder === 'trash') {
    demoStore.splice(idx, 1)
  } else {
    demoStore[idx].folder = 'trash'
  }

  return c.json({ ok: true })
})
