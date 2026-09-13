import { and, asc, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../../src/db/client.ts'
import { chatMessages, chatSessions } from '../../src/db/schema/index.ts'

export const chatRoute = new Hono()

const createSessionSchema = z.object({
  title: z.string().trim().max(200).optional(),
})

const updateSessionSchema = z.object({
  title: z.string().trim().min(1).max(200),
})

const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Nachricht darf nicht leer sein').max(20000),
})

/**
 * GET /api/chat/sessions - Liste der Chats des Nutzers.
 */
chatRoute.get('/sessions', async (c) => {
  const userId = c.get('userId')
  const rows = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.updatedAt))

  return c.json(rows)
})

/**
 * POST /api/chat/sessions - Neue Chat-Sitzung starten.
 */
chatRoute.post('/sessions', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => ({}))
  const parsed = createSessionSchema.safeParse(body)
  const title = parsed.success && parsed.data.title ? parsed.data.title : 'Neuer Chat'

  const [session] = await db
    .insert(chatSessions)
    .values({
      userId,
      title,
    })
    .returning()

  return c.json(session, 201)
})

/**
 * PUT /api/chat/sessions/:id - Chat-Titel umbenennen.
 */
chatRoute.put('/sessions/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const parsed = updateSessionSchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }

  const [updated] = await db
    .update(chatSessions)
    .set({
      title: parsed.data.title,
      updatedAt: new Date(),
    })
    .where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)))
    .returning()

  if (!updated) {
    return c.json({ error: 'Chat nicht gefunden' }, 404)
  }

  return c.json(updated)
})

/**
 * DELETE /api/chat/sessions/:id - Chat löschen (Kaskade löscht Nachrichten).
 */
chatRoute.delete('/sessions/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const [deleted] = await db
    .delete(chatSessions)
    .where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)))
    .returning()

  if (!deleted) {
    return c.json({ error: 'Chat nicht gefunden' }, 404)
  }

  return c.json({ success: true })
})

/**
 * GET /api/chat/sessions/:id/messages - Nachrichten einer Sitzung.
 */
chatRoute.get('/sessions/:id/messages', async (c) => {
  const userId = c.get('userId')
  const sessionId = c.req.param('id')

  const [session] = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)))

  if (!session) {
    return c.json({ error: 'Chat nicht gefunden' }, 404)
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt))

  return c.json(messages)
})

/**
 * POST /api/chat/sessions/:id/messages - Neue Nachricht senden & KI-Antwort abrufen.
 */
chatRoute.post('/sessions/:id/messages', async (c) => {
  const userId = c.get('userId')
  const sessionId = c.req.param('id')

  const [session] = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)))

  if (!session) {
    return c.json({ error: 'Chat nicht gefunden' }, 404)
  }

  const parsed = sendMessageSchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: z.prettifyError(parsed.error) }, 400)
  }

  const userContent = parsed.data.content

  // 1. User-Nachricht speichern
  const [userMsg] = await db
    .insert(chatMessages)
    .values({
      sessionId,
      role: 'user',
      content: userContent,
    })
    .returning()

  // Falls der Chat noch "Neuer Chat" heißt, aktualisiere den Titel mit der ersten Frage
  if (session.title === 'Neuer Chat') {
    const cleanTitle =
      userContent.length > 35 ? `${userContent.slice(0, 35).trim()}…` : userContent
    await db
      .update(chatSessions)
      .set({ title: cleanTitle, updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId))
  } else {
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId))
  }

  // 2. Historie für den Kontext laden (letzte 20 Nachrichten)
  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt))
    .limit(20)

  // 3. KI-Provider anrufen (OpenAI-kompatibel)
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = process.env.AI_MODEL || 'gpt-4o-mini'

  let assistantContent = ''

  if (!apiKey) {
    assistantContent = `👋 **Hallo! Ich bin dein OmniDesk KI-Assistent.**

Aktuell ist noch kein \`OPENAI_API_KEY\` in der \`.env.local\` hinterlegt. 

Um mich live zu nutzen, trage einfach folgendes in deine \`.env.local\` ein:
\`\`\`env
OPENAI_API_KEY=dein_api_schluessel_hier
# Optional (z. B. für OpenRouter, LM Studio, Ollama):
# AI_BASE_URL=https://openrouter.ai/api/v1
# AI_MODEL=meta-llama/llama-3-8b-instruct
\`\`\`

Deine Nachricht wurde dennoch erfolgreich im Chatverlauf gespeichert!`
  } else {
    try {
      const messagesPayload = [
        {
          role: 'system',
          content:
            'Du bist der integrierte KI-Assistent von OmniDesk, einer modularen Produktivitätsplattform für IT-Profis, Fachinformatiker (FiSi) und Power-User. Antworte präzise, hilfsbereit, auf Deutsch, nutze Markdown und hebe Codeblöcke mit passendem Sprachbezeichner hervor.',
        },
        ...history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ]

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messagesPayload,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        assistantContent = `⚠️ **Fehler bei der KI-Anfrage (HTTP ${response.status}):**\n\`\`\`\n${errText}\n\`\`\``
      } else {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>
        }
        assistantContent =
          data.choices?.[0]?.message?.content ||
          'Es konnte keine Antwort vom Modell generiert werden.'
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      assistantContent = `⚠️ **Verbindungsfehler zur KI-Schnittstelle:**\n${msg}`
    }
  }

  // 4. Assistant-Antwort speichern
  const [assistantMsg] = await db
    .insert(chatMessages)
    .values({
      sessionId,
      role: 'assistant',
      content: assistantContent,
    })
    .returning()

  return c.json({
    userMessage: userMsg,
    assistantMessage: assistantMsg,
  })
})
