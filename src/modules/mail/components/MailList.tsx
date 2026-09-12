import { useState } from 'react'
import { Filter, Search, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { MailMessageDto } from '../api'
import { useUpdateMailMessage } from '../api'

interface MailListProps {
  messages: MailMessageDto[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (message: MailMessageDto) => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

export function MailList({
  messages,
  isLoading,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: MailListProps) {
  const [onlyUnread, setOnlyUnread] = useState(false)
  const updateMutation = useUpdateMailMessage()

  const handleStarClick = (e: React.MouseEvent, msg: MailMessageDto) => {
    e.stopPropagation()
    updateMutation.mutate({ id: msg.id, isStarred: !msg.isStarred })
  }

  const displayedMessages = messages.filter((m) => {
    if (onlyUnread && m.isRead) return false
    return true
  })

  return (
    <div className="flex h-full flex-col border-r bg-card/20">
      {/* Such- und Filterleiste */}
      <div className="p-3 space-y-2 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="E-Mails durchsuchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-9 text-xs bg-background"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{displayedMessages.length} Nachrichten</span>
          <button
            type="button"
            onClick={() => setOnlyUnread(!onlyUnread)}
            className={cn(
              'flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors',
              onlyUnread
                ? 'bg-primary/20 text-primary font-medium'
                : 'hover:bg-accent hover:text-foreground',
            )}
          >
            <Filter className="size-3" />
            Nur ungelesen
          </button>
        </div>
      </div>

      {/* Nachrichtenliste */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {isLoading ? (
          <div className="p-3 space-y-3">
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-16 rounded-md" />
          </div>
        ) : displayedMessages.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Keine Nachrichten vorhanden.
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isSelected = msg.id === selectedId
            return (
              <div
                key={msg.id}
                onClick={() => onSelect(msg)}
                className={cn(
                  'group relative flex cursor-pointer flex-col gap-1 p-3 transition-colors',
                  isSelected
                    ? 'bg-accent/60 border-l-2 border-primary'
                    : 'hover:bg-accent/30',
                  !msg.isRead && 'bg-primary/5',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {!msg.isRead && (
                      <span className="size-2 rounded-full bg-primary glow shrink-0" />
                    )}
                    <span
                      className={cn(
                        'truncate text-xs',
                        msg.isRead ? 'text-muted-foreground' : 'font-semibold text-foreground',
                      )}
                    >
                      {msg.fromName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {formatShortDate(msg.date)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleStarClick(e, msg)}
                      className={cn(
                        'size-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-amber-400',
                        msg.isStarred && 'text-amber-400',
                      )}
                    >
                      <Star className={cn('size-3.5', msg.isStarred && 'fill-amber-400')} />
                    </button>
                  </div>
                </div>

                <p
                  className={cn(
                    'truncate text-xs',
                    msg.isRead ? 'text-foreground/80' : 'font-medium text-foreground',
                  )}
                >
                  {msg.subject}
                </p>

                <p className="truncate text-[11px] text-muted-foreground line-clamp-1">
                  {msg.snippet}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
