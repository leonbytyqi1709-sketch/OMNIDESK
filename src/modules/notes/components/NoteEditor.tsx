import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, Loader2, NotebookPen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { NoteInput } from '../api'

export type SaveStatus = 'saved' | 'saving' | 'dirty'

interface NoteEditorProps {
  draft: NoteInput | null
  onChange: (draft: NoteInput) => void
  status: SaveStatus
  onDelete: () => void
}

function StatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" /> Speichert…
      </span>
    )
  }
  if (status === 'dirty') {
    return (
      <span className="text-xs text-muted-foreground">Ungespeichert…</span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Check className="size-3" /> Gespeichert
    </span>
  )
}

export function NoteEditor({ draft, onChange, status, onDelete }: NoteEditorProps) {
  const [view, setView] = useState<'edit' | 'preview'>('edit')

  if (!draft) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <NotebookPen className="size-8" />
        <p className="text-sm">Wähle eine Notiz aus oder lege eine neue an.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b px-4 py-2">
        <Tabs value={view} onValueChange={(v) => setView(v as 'edit' | 'preview')}>
          <TabsList className="h-8">
            <TabsTrigger value="edit" className="text-xs">
              Bearbeiten
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Vorschau
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <StatusIndicator status={status} />
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label="Notiz löschen"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <input
        value={draft.title}
        onChange={(e) => onChange({ ...draft, title: e.target.value })}
        placeholder="Titel der Notiz"
        maxLength={300}
        className="border-0 bg-transparent px-6 pt-5 pb-2 text-xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
      />

      {view === 'edit' ? (
        <textarea
          value={draft.content}
          onChange={(e) => onChange({ ...draft, content: e.target.value })}
          placeholder="Schreib los… (Markdown wird unterstützt)"
          spellCheck={false}
          className="flex-1 resize-none border-0 bg-transparent px-6 py-2 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50"
        />
      ) : (
        <div className="prose prose-invert prose-sm max-w-none flex-1 overflow-y-auto px-6 py-2">
          {draft.content.trim() === '' ? (
            <p className="text-muted-foreground">Nichts zu sehen – die Notiz ist leer.</p>
          ) : (
            <Markdown remarkPlugins={[remarkGfm]}>{draft.content}</Markdown>
          )}
        </div>
      )}
    </div>
  )
}
