import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { NoteEditor, type SaveStatus } from './components/NoteEditor'
import { NoteList } from './components/NoteList'
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
  type NoteInput,
} from './api'

const AUTOSAVE_DELAY_MS = 800
const FALLBACK_TITLE = 'Unbenannte Notiz'

export default function NotesPage() {
  const { data: notes, isLoading, error } = useNotes()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<NoteInput | null>(null)
  const [dirty, setDirty] = useState(false)

  // Merkt sich die aktuellen Werte für den Save-Flush beim Notizwechsel
  const flushRef = useRef<{ id: string; draft: NoteInput } | null>(null)
  flushRef.current = selectedId && draft ? { id: selectedId, draft } : null

  const save = (id: string, input: NoteInput) => {
    updateNote.mutate(
      {
        id,
        title: input.title.trim() === '' ? FALLBACK_TITLE : input.title.trim(),
        content: input.content,
      },
      {
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : 'Speichern fehlgeschlagen',
          ),
      },
    )
  }

  // Erste Notiz automatisch auswählen, sobald die Liste da ist
  useEffect(() => {
    if (!selectedId && notes && notes.length > 0) {
      setSelectedId(notes[0].id)
    }
  }, [notes, selectedId])

  // Beim Wechsel der Auswahl den Entwurf aus der Notiz laden
  useEffect(() => {
    const note = notes?.find((n) => n.id === selectedId)
    setDraft(note ? { title: note.title, content: note.content } : null)
    setDirty(false)
    // Bewusst nur an selectedId gekoppelt: Refetches (z.B. nach dem Speichern)
    // dürfen den Entwurf nicht überschreiben, während getippt wird.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  // Autosave mit Debounce
  useEffect(() => {
    if (!dirty || !draft || !selectedId) return
    const timer = setTimeout(() => {
      save(selectedId, draft)
      setDirty(false)
    }, AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, dirty, selectedId])

  const handleChange = (next: NoteInput) => {
    setDraft(next)
    setDirty(true)
  }

  /** Ungespeicherte Änderungen sofort sichern (vor Wechsel/Anlage). */
  const flushPending = () => {
    if (dirty && flushRef.current) {
      save(flushRef.current.id, flushRef.current.draft)
      setDirty(false)
    }
  }

  const handleSelect = (id: string) => {
    if (id === selectedId) return
    flushPending()
    setSelectedId(id)
  }

  const handleCreate = async () => {
    flushPending()
    try {
      const note = await createNote.mutateAsync()
      setSelectedId(note.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Anlegen fehlgeschlagen')
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    const title = draft?.title || FALLBACK_TITLE
    try {
      await deleteNote.mutateAsync(selectedId)
      setDirty(false)
      const remaining = (notes ?? []).filter((n) => n.id !== selectedId)
      setSelectedId(remaining[0]?.id ?? null)
      toast.success(`„${title}" gelöscht`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Löschen fehlgeschlagen')
    }
  }

  const status: SaveStatus = dirty
    ? 'dirty'
    : updateNote.isPending
      ? 'saving'
      : 'saved'

  if (error) {
    return (
      <div className="p-8">
        <p className="text-sm text-destructive">
          Notizen konnten nicht geladen werden: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="w-72 shrink-0 border-r">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        ) : (
          <NoteList
            notes={notes ?? []}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCreate={handleCreate}
            isCreating={createNote.isPending}
          />
        )}
      </aside>
      <section className="min-w-0 flex-1">
        <NoteEditor
          draft={draft}
          onChange={handleChange}
          status={status}
          onDelete={handleDelete}
        />
      </section>
    </div>
  )
}
