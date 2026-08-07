import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { NoteDto } from '../api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface NoteListProps {
  notes: NoteDto[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  isCreating: boolean
}

export function NoteList({
  notes,
  selectedId,
  onSelect,
  onCreate,
  isCreating,
}: NoteListProps) {
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const filtered = notes.filter(
    (n) =>
      q === '' ||
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q),
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Notizen durchsuchen…"
            className="h-9 pl-8"
          />
        </div>
        <Button
          size="icon"
          onClick={onCreate}
          disabled={isCreating}
          className="bg-gradient-accent glow shrink-0 text-white"
          aria-label="Neue Notiz"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {search ? 'Keine Treffer.' : 'Noch keine Notizen.'}
          </p>
        )}
        {filtered.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => onSelect(note.id)}
            className={cn(
              'w-full rounded-md px-3 py-2.5 text-left transition-colors',
              note.id === selectedId
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
          >
            <p className="truncate text-sm font-medium">{note.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(note.updatedAt)}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
