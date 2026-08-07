import { NavLink } from 'react-router'
import { NotebookPen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotes } from '@/modules/notes/api'
import { WidgetCard } from './WidgetCard'

/** Zuletzt bearbeitete Notizen. */
export function NotesWidget() {
  const { data: notes, isLoading } = useNotes()

  return (
    <WidgetCard title="Letzte Notizen" icon={NotebookPen} to="/notes">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-8 rounded-md" />
          ))}
        </div>
      ) : !notes || notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch keine Notizen.</p>
      ) : (
        <ul className="-mx-2">
          {notes.slice(0, 4).map((note) => (
            <li key={note.id}>
              <NavLink
                to="/notes"
                className="flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
              >
                <span className="truncate text-sm">{note.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  )
}
