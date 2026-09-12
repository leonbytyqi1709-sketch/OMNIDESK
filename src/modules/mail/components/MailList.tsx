import { useState } from 'react'
import { Bell, CheckCircle, Filter, Inbox, Layers, Megaphone, RefreshCw, Search, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { MailMessageDto } from '../api'
import { useUpdateMailMessage } from '../api'

export type MailCategoryType = 'primary' | 'all' | 'promotions' | 'updates'

interface MailListProps {
  messages: MailMessageDto[]
  isLoading: boolean
  selectedId: string | null
  onSelect: (message: MailMessageDto) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  currentFolder: 'inbox' | 'sent' | 'starred' | 'trash'
  category: MailCategoryType
  onCategoryChange: (cat: MailCategoryType) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  accountId?: string
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
  currentFolder,
  category,
  onCategoryChange,
  onRefresh,
  isRefreshing,
  accountId,
}: MailListProps) {
  const [onlyUnread, setOnlyUnread] = useState(false)
  const updateMutation = useUpdateMailMessage()

  const handleStarClick = (e: React.MouseEvent, msg: MailMessageDto) => {
    e.stopPropagation()
    updateMutation.mutate({ id: msg.id, accountId, isStarred: !msg.isStarred })
  }

  const displayedMessages = messages.filter((m) => {
    if (onlyUnread && m.isRead) return false
    return true
  })

  return (
    <div className="flex h-full flex-col border-r bg-card/20">
      {/* Such- und Filterleiste */}
      <div className="p-3 space-y-2.5 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="E-Mails durchsuchen..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9 text-xs bg-background"
            />
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={onRefresh}
              disabled={isRefreshing || isLoading}
              title="Postfach neu laden"
            >
              <RefreshCw className={cn('size-3.5', (isRefreshing || isLoading) && 'animate-spin text-primary')} />
            </Button>
          )}
        </div>

        {/* Gmail Posteingangs-Kategorien (Nur im Posteingang) */}
        {currentFolder === 'inbox' && (
          <div className="flex items-center gap-1 rounded-lg bg-secondary/30 p-1 text-[11px]">
            <button
              type="button"
              onClick={() => onCategoryChange('primary')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded py-1 px-1.5 font-medium transition-colors',
                category === 'primary'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Inbox className="size-3 text-emerald-400" />
              <span>Allgemein</span>
            </button>
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded py-1 px-1.5 font-medium transition-colors',
                category === 'all'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Layers className="size-3 text-blue-400" />
              <span>Alle</span>
            </button>
            <button
              type="button"
              onClick={() => onCategoryChange('promotions')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded py-1 px-1.5 font-medium transition-colors',
                category === 'promotions'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Megaphone className="size-3 text-amber-400" />
              <span>Werbung</span>
            </button>
            <button
              type="button"
              onClick={() => onCategoryChange('updates')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded py-1 px-1.5 font-medium transition-colors',
                category === 'updates'
                  ? 'bg-background shadow-xs text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Bell className="size-3 text-purple-400" />
              <span>Updates</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{displayedMessages.length} Nachrichten geladen</span>
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
            <Skeleton className="h-16 rounded-md" />
          </div>
        ) : displayedMessages.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
            <CheckCircle className="size-8 mx-auto text-emerald-500/40" />
            <p className="font-medium text-foreground">Keine Nachrichten in diesem Bereich</p>
            <p className="text-[11px]">
              {category === 'primary'
                ? 'Dein Allgemeiner Posteingang ist sauber und enthält keine störenden Werbe-E-Mails.'
                : 'Keine Nachrichten für den aktuellen Filter vorhanden.'}
            </p>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isSelected = msg.id === selectedId
            return (
              <div
                key={msg.id}
                onClick={() => onSelect(msg)}
                className={cn(
                  'group relative flex cursor-pointer flex-col gap-1 p-3 transition-colors hover:bg-accent/40',
                  isSelected && 'bg-accent/60',
                  !msg.isRead && 'font-medium',
                )}
              >
                {/* Ungelesen-Indikator */}
                {!msg.isRead && (
                  <div className="absolute left-1 top-4 size-1.5 rounded-full bg-primary glow" />
                )}

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={cn(
                      'truncate',
                      !msg.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {msg.fromName}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatShortDate(msg.date)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleStarClick(e, msg)}
                      className={cn(
                        'size-5 flex items-center justify-center rounded hover:bg-accent transition-colors',
                        msg.isStarred
                          ? 'text-amber-400'
                          : 'text-muted-foreground/40 hover:text-muted-foreground',
                      )}
                      aria-label="Nachricht markieren"
                    >
                      <Star className="size-3.5 fill-current" />
                    </button>
                  </div>
                </div>

                <h4
                  className={cn(
                    'text-xs truncate',
                    !msg.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {msg.subject}
                </h4>

                <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">
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
