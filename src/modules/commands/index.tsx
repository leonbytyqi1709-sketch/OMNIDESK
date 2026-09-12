import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sliders,
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
import {
  CommandParamDialog,
  extractPlaceholders,
} from './components/CommandParamDialog'
import { STARTER_COMMANDS } from './starter-library'
import {
  useCommands,
  useCreateCommandsBulk,
  useDeleteCommand,
  type CommandDto,
} from './api'

function getCategoryIcon(cat: string) {
  if (cat.includes('Linux') || cat.includes('Ubuntu')) return '🐧'
  if (cat.includes('Windows') || cat.includes('PowerShell')) return '🪟'
  if (cat.includes('Git')) return '🌿'
  if (cat.includes('Docker')) return '🐳'
  if (cat.includes('Netzwerk') || cat.includes('Cisco')) return '🌐'
  return '⚡'
}

function CommandRow({
  cmd,
  onEdit,
  onDelete,
  onParamClick,
}: {
  cmd: CommandDto
  onEdit: (cmd: CommandDto) => void
  onDelete: (cmd: CommandDto) => void
  onParamClick: (cmd: CommandDto) => void
}) {
  const [copied, setCopied] = useState(false)
  const placeholders = extractPlaceholders(cmd.command)
  const hasPlaceholders = placeholders.length > 0

  const handleAction = async () => {
    if (hasPlaceholders) {
      onParamClick(cmd)
      return
    }
    await navigator.clipboard.writeText(cmd.command)
    setCopied(true)
    toast.success('Befehl in die Zwischenablage kopiert!')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{cmd.title}</p>
          {hasPlaceholders && (
            <Badge
              variant="outline"
              className="cursor-pointer border-primary/30 bg-primary/10 text-[10px] text-primary gap-1 py-0 px-1.5"
              onClick={() => onParamClick(cmd)}
              title="Parameter vor dem Kopieren ausfüllen"
            >
              <Sliders className="size-2.5" />
              {placeholders.length} {placeholders.length === 1 ? 'Parameter' : 'Parameter'}
            </Badge>
          )}
        </div>
        <code className="mt-0.5 block truncate font-mono text-sm text-foreground">
          {cmd.command}
        </code>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleAction}
        className={cn('size-7 shrink-0', copied && 'text-green-400')}
        title={hasPlaceholders ? 'Parameter anpassen & kopieren' : 'Befehl kopieren'}
        aria-label="Befehl kopieren"
      >
        {copied ? (
          <Check className="size-4" />
        ) : hasPlaceholders ? (
          <Sliders className="size-4 text-primary" />
        ) : (
          <Copy className="size-4" />
        )}
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
          {hasPlaceholders && (
            <DropdownMenuItem onClick={() => onParamClick(cmd)}>
              <Sliders className="size-4 text-primary" /> Parameter ausfüllen
            </DropdownMenuItem>
          )}
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
  const [paramCommand, setParamCommand] = useState<CommandDto | null>(null)
  const [paramDialogOpen, setParamDialogOpen] = useState(false)

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

  const openParams = (cmd: CommandDto) => {
    setParamCommand(cmd)
    setParamDialogOpen(true)
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
      toast.success(`${rows.length} Befehle erfolgreich in deine Bibliothek importiert!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import fehlgeschlagen')
    }
  }

  const isEmpty = !isLoading && !error && (commands ?? []).length === 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header mit Aktionen */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Befehlsbibliothek
            </h1>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              {(commands ?? []).length} Befehle
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Zentrales CLI-Cheat-Sheet für Windows, Git, Ubuntu & Linux-Server mit Parametern.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={importStarter}
            disabled={createBulk.isPending}
            className="gap-2 text-xs h-9 border-primary/30 hover:bg-primary/5"
            title="Importiert über 80 geprüfte IT-Befehle (Windows, Git, Linux, Docker, Cisco)"
          >
            <Sparkles className="size-3.5 text-primary" />
            {createBulk.isPending ? 'Importiere...' : 'IT-Referenzset importieren (80+)'}
          </Button>

          <Button onClick={openCreate} className="bg-gradient-accent glow text-white gap-2 h-9 text-xs">
            <Plus className="size-4" /> Neuer Befehl
          </Button>
        </div>
      </div>

      {/* Suche & Kategorie-Filter Tabs */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Befehl, Titel, Parameter oder Kategorie suchen…"
            className="pl-9 h-10"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge
              variant={activeCategory === null ? 'default' : 'outline'}
              className="cursor-pointer text-xs py-1 px-3"
              onClick={() => setActiveCategory(null)}
            >
              Alle ({(commands ?? []).length})
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer text-xs py-1 px-3 gap-1.5"
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
              >
                <span>{getCategoryIcon(cat)}</span>
                <span>{cat}</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Fehler beim Laden der Befehle: {error.message}
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
            <Terminal className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-semibold">Noch keine Befehle vorhanden</h2>
          <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
            Starte mit unserer umfangreichen Starter-Bibliothek mit über 80 kuratierten Befehlen
            für Windows (CMD & PowerShell), Git, Linux-Server und Docker, oder lege manuell eigene Befehle an.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={importStarter}
              disabled={createBulk.isPending}
              className="bg-gradient-accent glow text-white gap-2"
            >
              <Sparkles className="size-4" />
              {createBulk.isPending ? 'Wird importiert…' : 'Starter-Bibliothek laden (80+ Befehle)'}
            </Button>
            <Button variant="outline" onClick={openCreate}>
              Eigenen Befehl anlegen
            </Button>
          </div>
        </div>
      )}

      {/* Befehlsliste nach Kategorien gruppiert */}
      {!isLoading && !isEmpty && grouped.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-8 text-center">
          Keine Befehle gefunden, die deiner Suche entsprechen.
        </p>
      )}

      {!isLoading && !isEmpty && grouped.length > 0 && (
        <div className="space-y-6">
          {grouped.map(([category, items]) => (
            <div
              key={category}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span>{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                </h2>
                <Badge variant="secondary" className="text-[10px]">
                  {items.length} {items.length === 1 ? 'Befehl' : 'Befehle'}
                </Badge>
              </div>

              <div className="divide-y divide-border">
                {items.map((cmd) => (
                  <CommandRow
                    key={cmd.id}
                    cmd={cmd}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onParamClick={openParams}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CommandFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editCommand={editCommand}
        categories={categories}
      />

      <CommandParamDialog
        command={paramCommand}
        open={paramDialogOpen}
        onOpenChange={setParamDialogOpen}
      />
    </div>
  )
}
