import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  CornerDownLeft,
  Loader2,
  Menu,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  useChatMessages,
  useChatSessions,
  useCreateSession,
  useSendMessage,
} from './api'
import { ChatMessageItem } from './components/ChatMessageItem'
import { ChatSidebar } from './components/ChatSidebar'

const STARTER_PROMPTS = [
  'Wie berechne ich die Broadcast-Adresse eines /27 Subnetzes?',
  'Schreibe ein PowerShell-Skript zur Prüfung freier Festplattenkapazitäten.',
  'Erkläre den Unterschied zwischen einem Docker Image und Container.',
  'Welche Linux-Befehle sind am wichtigsten bei der Netzwerk-Fehlersuche?',
]

export default function AssistantPage() {
  const { data: sessions = [], isLoading: sessionsLoading } = useChatSessions()
  const createSessionMutation = useCreateSession()

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [input, setInput] = useState('')

  // Wenn Sessions geladen sind und keine aktiv ist, wähle die erste
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  const { data: messages = [], isLoading: messagesLoading } =
    useChatMessages(activeSessionId)
  const sendMutation = useSendMessage(activeSessionId ?? '')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sendMutation.isPending])

  const handleNewChat = async () => {
    try {
      const newSession = await createSessionMutation.mutateAsync()
      setActiveSessionId(newSession.id)
      setMobileSidebarOpen(false)
    } catch {
      toast.error('Neuer Chat konnte nicht gestartet werden')
    }
  }

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input
    if (!textToSend.trim() || sendMutation.isPending) return

    let currentId = activeSessionId

    // Falls noch keine Session aktiv ist, lege sofort eine an
    if (!currentId) {
      try {
        const newSession = await createSessionMutation.mutateAsync()
        currentId = newSession.id
        setActiveSessionId(currentId)
      } catch {
        toast.error('Fehler beim Starten des Chats')
        return
      }
    }

    if (!customText) {
      setInput('')
    }

    try {
      await sendMutation.mutateAsync(textToSend.trim())
    } catch {
      toast.error('Nachricht konnte nicht gesendet werden')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  return (
    <div className="flex h-[calc(100vh-5.5rem)] overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl card-hover-glow">
      {/* Desktop Sidebar */}
      <div className="hidden w-72 md:block">
        <ChatSidebar
          sessions={sessions}
          currentSessionId={activeSessionId}
          onSelectSession={(id) => setActiveSessionId(id)}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 md:hidden">
          <div className="w-4/5 max-w-xs h-full">
            <ChatSidebar
              sessions={sessions}
              currentSessionId={activeSessionId}
              onSelectSession={(id) => {
                setActiveSessionId(id)
                setMobileSidebarOpen(false)
              }}
              onNewChat={handleNewChat}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Chat Hauptbereich */}
      <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950/40">
        {/* Chat Topbar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/40">
          <div className="flex items-center gap-2.5 truncate">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent text-white shadow-sm glow-subtle shrink-0">
              <Bot className="h-4 w-4" />
            </div>

            <div className="truncate">
              <h2 className="text-sm font-semibold text-zinc-100 truncate">
                {activeSession?.title || 'KI-Assistent'}
              </h2>
              <p className="text-[11px] text-zinc-500">
                IT- &amp; FiSi-Fachwissen, Skripte, Notizen &amp; Fehleranalyse
              </p>
            </div>
          </div>
        </div>

        {/* Nachrichtenliste */}
        <ScrollArea className="flex-1 px-4 py-4">
          {sessionsLoading || messagesLoading ? (
            <div className="flex h-64 items-center justify-center text-xs text-zinc-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              Chat wird geladen...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent text-white shadow-md glow-subtle mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-200">
                Wie kann ich dich heute unterstützen?
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                Frage nach Fachbegriffen, Skripten (PowerShell, Bash, SQL),
                Netzwerk-Konfigurationen oder Vorbereitungsthemen.
              </p>

              {/* Starter-Prompts */}
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 max-w-lg w-full text-left">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-850 hover:text-zinc-100 hover:border-zinc-700 text-left"
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((m) => (
                <ChatMessageItem key={m.id} message={m} />
              ))}
              {sendMutation.isPending && (
                <div className="flex items-center gap-2 py-3 text-xs text-zinc-500">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-accent text-white shadow-sm glow-subtle animate-pulse">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    KI generiert Antwort…
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Bar */}
        <div className="border-t border-zinc-800/80 p-3 bg-zinc-900/40">
          <div className="relative flex items-end rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 shadow-sm focus-within:border-zinc-700">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Frage stellen oder Prompt eingeben... (Enter zum Senden, Shift+Enter für Zeilenumbruch)"
              className="min-h-[44px] max-h-36 resize-none border-0 bg-transparent text-sm focus-visible:ring-0 placeholder:text-zinc-500"
              rows={1}
            />

            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || sendMutation.isPending}
              className="h-8 w-8 shrink-0 bg-gradient-accent text-white hover:brightness-110 disabled:opacity-50"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CornerDownLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
