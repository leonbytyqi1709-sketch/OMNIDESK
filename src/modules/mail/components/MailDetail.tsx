import { Mail, Reply, Star, Trash2, MailQuestion } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MailMessageDto } from '../api'
import { useDeleteMailMessage, useUpdateMailMessage } from '../api'

interface MailDetailProps {
  message: MailMessageDto | null
  onReply: (message: MailMessageDto) => void
  onClose?: () => void
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function MailDetail({ message, onReply, onClose }: MailDetailProps) {
  const updateMutation = useUpdateMailMessage()
  const deleteMutation = useDeleteMailMessage()

  if (!message) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20">
          <Mail className="size-6 opacity-40" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          Keine E-Mail ausgewählt
        </h3>
        <p className="mt-1 text-xs max-w-xs text-muted-foreground">
          Wähle eine E-Mail aus der Liste aus, um ihren Inhalt und Details anzuzeigen.
        </p>
      </div>
    )
  }

  const handleToggleStar = () => {
    updateMutation.mutate(
      { id: message.id, isStarred: !message.isStarred },
      {
        onSuccess: () => {
          toast.success(message.isStarred ? 'Markierung entfernt' : 'E-Mail markiert')
        },
      },
    )
  }

  const handleToggleUnread = () => {
    updateMutation.mutate(
      { id: message.id, isRead: false },
      {
        onSuccess: () => {
          toast.success('Als ungelesen markiert')
          if (onClose) onClose()
        },
      },
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(message.id, {
      onSuccess: () => {
        toast.success('E-Mail in den Papierkorb verschoben')
        if (onClose) onClose()
      },
    })
  }

  const initials = message.fromName
    ? message.fromName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'EM'

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Mail Header & Aktionen */}
      <div className="border-b p-4 sm:p-6 space-y-4 shrink-0 bg-card/40">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {message.subject}
          </h2>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'size-8 text-muted-foreground hover:text-amber-400',
                message.isStarred && 'text-amber-400 fill-amber-400',
              )}
              onClick={handleToggleStar}
              aria-label="Als Favorit markieren"
            >
              <Star className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={handleToggleUnread}
              aria-label="Als ungelesen markieren"
            >
              <MailQuestion className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              aria-label="Löschen"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Absender-Leiste */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-9 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground truncate">
                  {message.fromName}
                </span>
                <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                  &lt;{message.fromEmail}&gt;
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                An: {message.toEmail}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatDate(message.date)}
            </span>
          </div>
        </div>

        {/* Aktions-Button: Antworten */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="bg-gradient-accent glow text-white gap-1.5 h-8 text-xs"
            onClick={() => onReply(message)}
          >
            <Reply className="size-3.5" />
            Antworten
          </Button>
        </div>
      </div>

      {/* Mail Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-sm text-foreground space-y-4">
        {message.bodyHtml ? (
          <div
            className="prose prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
          />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{message.snippet}</p>
        )}
      </div>
    </div>
  )
}
