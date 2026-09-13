import { useState } from 'react'
import {
  Check,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ChatSessionDto } from '../api'
import { useDeleteSession, useUpdateSession } from '../api'

interface ChatSidebarProps {
  sessions: ChatSessionDto[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onCloseMobile?: () => void
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onCloseMobile,
}: ChatSidebarProps) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const updateMutation = useUpdateSession()
  const deleteMutation = useDeleteSession()

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  )

  const handleStartEdit = (s: ChatSessionDto) => {
    setEditingId(s.id)
    setEditTitle(s.title)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return
    try {
      await updateMutation.mutateAsync({ id, title: editTitle.trim() })
      setEditingId(null)
      toast.success('Chat umbenannt')
    } catch {
      toast.error('Umbenennen fehlgeschlagen')
    }
  }

  const handleDelete = async (s: ChatSessionDto) => {
    if (!confirm(`Chat "${s.title}" wirklich löschen?`)) return
    try {
      await deleteMutation.mutateAsync(s.id)
      toast.success('Chat gelöscht')
    } catch {
      toast.error('Löschen fehlgeschlagen')
    }
  }

  return (
    <div className="flex h-full w-full flex-col border-r border-zinc-800 bg-zinc-950/60 p-3">
      {/* Header mit Neu-Button */}
      <div className="flex items-center justify-between gap-2 pb-3">
        <Button
          onClick={onNewChat}
          className="flex-1 bg-gradient-accent text-white shadow-sm glow-subtle hover:brightness-110"
          size="sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Neuer Chat
        </Button>
        {onCloseMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-400"
            onClick={onCloseMobile}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suchfeld */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Chats filtern..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 pl-8 text-xs bg-zinc-900/60 border-zinc-800"
        />
      </div>

      {/* Chat-Liste */}
      <ScrollArea className="flex-1 -mx-1 px-1">
        <div className="space-y-1 py-1">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-zinc-500">
              {search ? 'Keine Chats gefunden' : 'Noch keine Chats gestartet'}
            </p>
          ) : (
            filtered.map((s) => {
              const isSelected = s.id === currentSessionId

              if (editingId === s.id) {
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1"
                  >
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-7 text-xs border-0 bg-transparent focus-visible:ring-0"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(s.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-emerald-400"
                      onClick={() => handleSaveEdit(s.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                )
              }

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800/90 text-zinc-100 font-medium shadow-sm border border-zinc-700/80'
                      : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isSelected ? 'text-primary' : 'text-zinc-500'
                      }`}
                    />
                    <span className="truncate">{s.title}</span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-200"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => handleStartEdit(s)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Umbenennen
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(s)}
                        className="text-rose-400 focus:text-rose-300"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
