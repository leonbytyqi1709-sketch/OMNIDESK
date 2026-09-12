import { Inbox, PenSquare, Send, Star, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { MailAccountDto } from '../api'

interface MailSidebarProps {
  currentFolder: 'inbox' | 'sent' | 'starred' | 'trash'
  onFolderChange: (folder: 'inbox' | 'sent' | 'starred' | 'trash') => void
  onCompose: () => void
  unreadCount?: number
  accounts: MailAccountDto[]
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
}

const FOLDERS = [
  { id: 'inbox' as const, label: 'Posteingang', icon: Inbox },
  { id: 'starred' as const, label: 'Markiert', icon: Star },
  { id: 'sent' as const, label: 'Gesendet', icon: Send },
  { id: 'trash' as const, label: 'Papierkorb', icon: Trash2 },
]

export function MailSidebar({
  currentFolder,
  onFolderChange,
  onCompose,
  unreadCount = 0,
  accounts,
  selectedAccountId,
  onAccountChange,
}: MailSidebarProps) {
  return (
    <div className="flex h-full w-56 flex-col border-r bg-card/40 p-3 space-y-4 shrink-0">
      {/* Compose Button */}
      <Button
        onClick={onCompose}
        className="w-full bg-gradient-accent glow text-white gap-2 font-medium shadow-sm h-10"
      >
        <PenSquare className="size-4" />
        E-Mail schreiben
      </Button>

      {/* Account-Auswahl, falls Accounts vorhanden */}
      {accounts.length > 0 && (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Google-Konto
          </label>
          <Select value={selectedAccountId} onValueChange={onAccountChange}>
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="Konto wählen" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id} className="text-xs">
                  {acc.label || acc.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Ordner-Navigation */}
      <nav className="flex-1 space-y-1">
        {FOLDERS.map((folder) => {
          const isActive = currentFolder === folder.id
          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => onFolderChange(folder.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-gradient-accent glow text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <div className="flex items-center gap-2.5">
                <folder.icon className="size-4 shrink-0" />
                <span>{folder.label}</span>
              </div>

              {folder.id === 'inbox' && unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'size-5 flex items-center justify-center p-0 text-[10px]',
                    isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary',
                  )}
                >
                  {unreadCount}
                </Badge>
              )}
            </button>
          )
        })}
      </nav>

      {/* Status-Footer */}
      <div className="rounded-lg border border-border/50 bg-secondary/20 p-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center justify-between font-medium text-foreground mb-1">
          <span>Gmail-API</span>
          <span className="size-1.5 rounded-full bg-emerald-400" />
        </div>
        <p className="text-[10px] text-muted-foreground/80 leading-tight">
          Nativ angebunden. Synchronisiert mit Google Mail.
        </p>
      </div>
    </div>
  )
}
