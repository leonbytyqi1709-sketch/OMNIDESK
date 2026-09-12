import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client.ts'
import { connectedAccounts } from '../../src/db/schema/index.ts'
import { getValidGoogleAccessToken } from '../google-auth.ts'

export const mailRoute = new Hono()

// Simulierter Speicher für In-Memory-Demo-Emails
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
]

let demoStore = [...initialDemoMessages]

function getHeader(headers: Array<{ name: string; value: string }> | undefined, name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

function extractBody(payload: Record<string, unknown> | undefined): string {
  if (!payload) return ''
  const body = payload.body as { data?: string } | undefined
  if (body?.data) {
    return Buffer.from(body.data, 'base64url').toString('utf-8')
  }

  const parts = payload.parts as Array<Record<string, unknown>> | undefined
  if (parts && Array.isArray(parts)) {
    // 1. Bevorzuge HTML
    const htmlPart = parts.find((p) => p.mimeType === 'text/html')
    const htmlBody = htmlPart?.body as { data?: string } | undefined
    if (htmlBody?.data) {
      return Buffer.from(htmlBody.data, 'base64url').toString('utf-8')
    }

    // 2. Fallback auf reinen Text
    const textPart = parts.find((p) => p.mimeType === 'text/plain')
    const textBody = textPart?.body as { data?: string } | undefined
    if (textBody?.data) {
      const plain = Buffer.from(textBody.data, 'base64url').toString('utf-8')
      return `<div style="white-space: pre-wrap; font-family: sans-serif; line-height: 1.6;">${plain}</div>`
    }

    // 3. Rekursiv in Unterteilen (multipart/alternative, etc.) suchen
    for (const part of parts) {
      const nested = extractBody(part)
      if (nested) return nested
    }
  }

  return ''
}

/** Google-Accounts des Nutzers abrufen (echte Konten zuerst sortiert). */
mailRoute.get('/accounts', async (c) => {
  const rows = await db
    .select({
      id: connectedAccounts.id,
      email: connectedAccounts.email,
      label: connectedAccounts.label,
      avatarUrl: connectedAccounts.avatarUrl,
      provider: connectedAccounts.provider,
      hasToken: connectedAccounts.refreshToken,
    })
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.userId, c.get('userId')),
        eq(connectedAccounts.provider, 'google'),
      ),
    )

  const accounts = rows.map((r) => ({
    id: r.id,
    email: r.email,
    label: r.label,
    avatarUrl: r.avatarUrl,
    provider: r.provider,
    hasToken: Boolean(r.hasToken),
  }))

  // Echte autorisierte Konten mit Google OAuth zuerst listen!
  accounts.sort((a, b) => (b.hasToken ? 1 : 0) - (a.hasToken ? 1 : 0))

  return c.json(accounts)
})

/** Nachrichtenliste abrufen mit echter Gmail-Kategorisierung und bis zu 50 Nachrichten. */
mailRoute.get('/messages', async (c) => {
  const folder = (c.req.query('folder') ?? 'inbox') as 'inbox' | 'sent' | 'starred' | 'trash'
  const accountId = c.req.query('accountId')
  const category = c.req.query('category') || 'primary'
  const query = c.req.query('q')?.toLowerCase().trim()
  const limit = Math.min(100, Math.max(10, Number(c.req.query('limit') || 50)))

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

    // Echte Gmail API anfragen
    if (acc?.accessToken || acc?.refreshToken) {
      try {
        const accessToken = await getValidGoogleAccessToken(acc)

        // Präziser Suchfilter je nach Ordner und Kategorie
        let q = ''
        if (folder === 'sent') {
          q = 'in:sent'
        } else if (folder === 'starred') {
          q = 'is:starred'
        } else if (folder === 'trash') {
          q = 'in:trash'
        } else {
          // Posteingang: Kategorien steuern
          if (category === 'primary') {
            // Reiner Allgemeiner Posteingang OHNE Werbung und OHNE Social-Spam
            q = 'in:inbox -category:promotions -category:social'
          } else if (category === 'promotions') {
            // Werbung / Anzeigen
            q = 'in:inbox category:promotions'
          } else if (category === 'social') {
            // Social Media
            q = 'in:inbox category:social'
          } else if (category === 'updates') {
            // Benachrichtigungen & Alerts
            q = 'in:inbox category:updates'
          } else {
            // 'all': Alles im Posteingang
            q = 'in:inbox'
          }
        }

        if (query) {
          q += ` ${query}`
        }

        const gmailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}&q=${encodeURIComponent(
            q.trim(),
          )}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )

        if (gmailRes.ok) {
          const list = (await gmailRes.json()) as { messages?: Array<{ id: string; threadId: string }> }
          if (list.messages && list.messages.length > 0) {
            // Details aller gefundenen Nachrichten parallel laden
            const detailed = await Promise.all(
              list.messages.map(async (m) => {
                const itemRes = await fetch(
                  `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=To`,
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
                  const fromRaw = getHeader(item.payload?.headers, 'From')
                  const subject = getHeader(item.payload?.headers, 'Subject') || '(Kein Betreff)'
                  const to = getHeader(item.payload?.headers, 'To') || acc.email
                  const dateIso = item.internalDate
                    ? new Date(Number(item.internalDate)).toISOString()
                    : new Date().toISOString()

                  return {
                    id: item.id,
                    accountId: acc.id,
                    fromName: fromRaw.replace(/<.*>/, '').trim() || fromRaw,
                    fromEmail: fromRaw,
                    toEmail: to,
                    subject,
                    snippet: item.snippet || '',
                    bodyHtml: `<p>${item.snippet || ''}</p>`,
                    date: dateIso,
                    isRead: !item.labelIds?.includes('UNREAD'),
                    isStarred: item.labelIds?.includes('STARRED') ?? false,
                    folder,
                  }
                }
                return null
              }),
            )

            // Streng nach Datum absteigend sortieren (neueste ZUERST!)
            const results = detailed.filter(Boolean) as Array<DemoMessage>
            results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            return c.json(results)
          }

          // Keine Mails im Filter
          return c.json([])
        }
      } catch {
        // Fallback auf Demo bei API-Fehler
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

  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return c.json(result)
})

/** Einzelne Nachricht mit vollständigem Body abrufen. */
mailRoute.get('/messages/:id', async (c) => {
  const id = c.req.param('id')
  const accountId = c.req.query('accountId')

  // Falls ein Google-Konto angegeben ist, echten Body via Gmail API laden
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
        const accessToken = await getValidGoogleAccessToken(acc)
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        if (res.ok) {
          const m = (await res.json()) as {
            id: string
            snippet: string
            internalDate: string
            labelIds?: string[]
            payload?: Record<string, unknown>
          }

          const headers = (m.payload?.headers ?? []) as Array<{ name: string; value: string }>
          const fromRaw = getHeader(headers, 'From')
          const subject = getHeader(headers, 'Subject') || '(Kein Betreff)'
          const to = getHeader(headers, 'To') || acc.email
          const bodyHtml = extractBody(m.payload) || `<p>${m.snippet || ''}</p>`
          const dateIso = m.internalDate
            ? new Date(Number(m.internalDate)).toISOString()
            : new Date().toISOString()

          // Bei Google automatisch als gelesen markieren
          if (m.labelIds?.includes('UNREAD')) {
            fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
            }).catch(() => {})
          }

          return c.json({
            id: m.id,
            accountId: acc.id,
            fromName: fromRaw.replace(/<.*>/, '').trim() || fromRaw,
            fromEmail: fromRaw,
            toEmail: to,
            subject,
            snippet: m.snippet || '',
            bodyHtml,
            date: dateIso,
            isRead: true,
            isStarred: m.labelIds?.includes('STARRED') ?? false,
            folder: m.labelIds?.includes('SENT') ? 'sent' : 'inbox',
          })
        }
      } catch {
        // Fallback
      }
    }
  }

  const msg = demoStore.find((m) => m.id === id)
  if (!msg) {
    return c.json({ error: 'Nachricht nicht gefunden' }, 404)
  }

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
        // Fallback auf DemoStore bei Netzwerkfehlern
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

/** Status der Nachricht aktualisieren (isRead, isStarred, folder) bei Google & Demo. */
mailRoute.put('/messages/:id', async (c) => {
  const updateInput = z.object({
    accountId: z.string().optional(),
    isRead: z.boolean().optional(),
    isStarred: z.boolean().optional(),
    folder: z.enum(['inbox', 'sent', 'starred', 'trash']).optional(),
  })

  const parsed = updateInput.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }

  const id = c.req.param('id')
  const { accountId, isRead, isStarred, folder } = parsed.data

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
        const accessToken = await getValidGoogleAccessToken(acc)
        const addLabelIds: string[] = []
        const removeLabelIds: string[] = []

        if (isStarred === true) addLabelIds.push('STARRED')
        if (isStarred === false) removeLabelIds.push('STARRED')
        if (isRead === false) addLabelIds.push('UNREAD')
        if (isRead === true) removeLabelIds.push('UNREAD')

        if (addLabelIds.length > 0 || removeLabelIds.length > 0) {
          await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ addLabelIds, removeLabelIds }),
          })
        }
      } catch {
        // Fallback
      }
    }
  }

  const msg = demoStore.find((m) => m.id === id)
  if (msg) {
    if (isRead !== undefined) msg.isRead = isRead
    if (isStarred !== undefined) msg.isStarred = isStarred
    if (folder !== undefined) msg.folder = folder
    return c.json(msg)
  }

  return c.json({ ok: true, id })
})

/** Nachricht löschen / in den Papierkorb verschieben bei Google & Demo. */
mailRoute.delete('/messages/:id', async (c) => {
  const id = c.req.param('id')
  const accountId = c.req.query('accountId')

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
        const accessToken = await getValidGoogleAccessToken(acc)
        await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        return c.json({ ok: true })
      } catch {
        // Fallback
      }
    }
  }

  const idx = demoStore.findIndex((m) => m.id === id)
  if (idx !== -1) {
    if (demoStore[idx].folder === 'trash') {
      demoStore.splice(idx, 1)
    } else {
      demoStore[idx].folder = 'trash'
    }
  }

  return c.json({ ok: true })
})
