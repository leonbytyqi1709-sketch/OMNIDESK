import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Terminal,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { CommandFormDialog } from './components/CommandFormDialog'
import { STARTER_COMMANDS } from './starter-library'
import {
  useCommands,
  useCreateCommandsBulk,
  useDeleteCommand,
  type CommandDto,
} from './api'

function CommandRow({
  cmd,
  onEdit,
  onDelete,
}: {
  cmd: CommandDto
  onEdit: (cmd: CommandDto) => void
  onDelete: (cmd: CommandDto) => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(cmd.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{cmd.title}</p>
        <code className="mt-0.5 block truncate font-mono text-sm">
          {cmd.command}
        </code>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={copy}
        className={cn('size-7 shrink-0', copied && 'text-green-400')}
        aria-label="Befehl kopieren"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label="Befehl-Aktionen"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(cmd)}>
            <Pencil className="size-4" /> Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(cmd)}>
            <Trash2 className="size-4" /> Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default function CommandsPage() {
  const { data: commands, isLoading, error } = useCommands()
  const createBulk = useCreateCommandsBulk()
  const deleteCommand = useDeleteCommand()

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCommand, setEditCommand] = useState<CommandDto | null>(null)

  const categories = useMemo(
    () => [...new Set((commands ?? []).map((c) => c.category))].sort(),
    [commands],
  )

  /** Echtzeit-Suche über Beschreibung, Befehl und Kategorie. */
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = (commands ?? []).filter(
      (c) =>
        (activeCategory === null || c.category === activeCategory) &&
        (q === '' ||
          c.title.toLowerCase().includes(q) ||
          c.command.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)),
    )
    const map = new Map<string, CommandDto[]>()
    for (const cmd of filtered) {
      map.set(cmd.category, [...(map.get(cmd.category) ?? []), cmd])
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'de'))
  }, [commands, search, activeCategory])

  const openCreate = () => {
    setEditCommand(null)
    setDialogOpen(true)
  }

  const openEdit = (cmd: CommandDto) => {
    setEditCommand(cmd)
    setDialogOpen(true)
  }

  const handleDelete = async (cmd: CommandDto) => {
    try {
      await deleteCommand.mutateAsync(cmd.id)
      toast.success('Befehl gelöscht')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Löschen fehlgeschlagen')
    }
  }

  const importStarter = async () => {
    try {
      const rows = await createBulk.mutateAsync(STARTER_COMMANDS)
      toast.success(`${rows.length} Starter-Befehle importiert`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import fehlgeschlagen')
    }
  }

  const isEmpty = !isLoading && !error && (commands ?? []).length === 0

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Befehlsbibliothek
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(commands ?? []).length} Befehle im Cheat-Sheet
          </p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-accent glow text-white">
          <Plus className="size-4" /> Neuer Befehl
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 basis-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Befehl, Beschreibung, Kategorie…"
            className="pl-9"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={activeCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setActiveCategory(null)}
            >
              Alle
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
              >
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 space-y-8">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">
            Befehle konnten nicht geladen werden: {error.message}
          </p>
        )}

        {isEmpty && (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-muted-foreground">
            <Terminal className="size-8" />
            <p className="text-sm">Noch keine Befehle gespeichert.</p>
            <Button
              variant="outline"
              onClick={importStarter}
              disabled={createBulk.isPending}
            >
              <Sparkles className="size-4" />
              {createBulk.isPending
                ? 'Importiert…'
                : `Starter-Bibliothek laden (${STARTER_COMMANDS.length} Befehle)`}
            </Button>
          </div>
        )}

        {!isEmpty && !isLoading && grouped.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Keine Treffer für deine Suche.
          </p>
        )}

        {grouped.map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {category} ({items.length})
            </h2>
            <div className="divide-y rounded-lg border bg-card">
              {items.map((cmd) => (
                <CommandRow
                  key={cmd.id}
                  cmd={cmd}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <CommandFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editCommand={editCommand}
        categories={categories}
      />
    </div>
  )
}
