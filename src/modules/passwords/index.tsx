import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  Lock,
  MoreVertical,
  Pencil,
  Plus,
  Search,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { decryptJson } from '@/lib/crypto'
import {
  useDeleteVaultEntry,
  useVaultEntries,
  useVaultMeta,
  type DecryptedEntry,
} from './api'
import { EntryFormDialog } from './components/EntryFormDialog'
import { VaultSetup } from './components/VaultSetup'
import { VaultUnlock } from './components/VaultUnlock'
import {
  CATEGORY_LABELS,
  VAULT_CATEGORIES,
  type VaultCategory,
  type VaultEntryData,
} from './constants'
import { useVaultStore } from './hooks/use-vault-store'

/** Kurzes Kopieren-Feedback pro Button (Häkchen statt Kopier-Icon). */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={copy}
      disabled={value === ''}
      className={cn('size-7 shrink-0', copied && 'text-green-400')}
      aria-label={label}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  )
}

function EntryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: DecryptedEntry
  onEdit: (entry: DecryptedEntry) => void
  onDelete: (entry: DecryptedEntry) => void
}) {
  const [revealed, setRevealed] = useState(false)
  const { data, row } = entry

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{data.title}</p>
          <Badge variant="outline" className="shrink-0 text-xs">
            {CATEGORY_LABELS[row.category]}
          </Badge>
          {data.url !== '' && (
            <a
              href={data.url.startsWith('http') ? data.url : `https://${data.url}`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="URL öffnen"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-4 text-xs text-muted-foreground">
          {data.username !== '' && (
            <span className="flex items-center gap-1 truncate">
              {data.username}
              <CopyButton value={data.username} label="Benutzername kopieren" />
            </span>
          )}
          <span className="flex items-center gap-1 font-mono">
            {revealed ? data.password : '••••••••••'}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRevealed((v) => !v)}
              className="size-7 shrink-0"
              aria-label={revealed ? 'Passwort verbergen' : 'Passwort anzeigen'}
            >
              {revealed ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
            <CopyButton value={data.password} label="Passwort kopieren" />
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label="Eintrag-Aktionen"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(entry)}>
            <Pencil className="size-4" /> Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(entry)}>
            <Trash2 className="size-4" /> Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/** Entsperrter Vault: Einträge laden, entschlüsseln, verwalten. */
function VaultContent({ vaultKey }: { vaultKey: CryptoKey }) {
  const { data: rows, isLoading, error } = useVaultEntries()
  const deleteEntry = useDeleteVaultEntry()
  const lock = useVaultStore((s) => s.lock)

  const [entries, setEntries] = useState<DecryptedEntry[] | null>(null)
  const [failedCount, setFailedCount] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'alle' | VaultCategory>('alle')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<DecryptedEntry | null>(null)

  /** Ciphertext-Zeilen asynchron in Klartext-Einträge überführen. */
  useEffect(() => {
    if (!rows) return
    let cancelled = false
    void (async () => {
      const decrypted: DecryptedEntry[] = []
      let failed = 0
      for (const row of rows) {
        try {
          const data = await decryptJson<VaultEntryData>(
            vaultKey,
            row.ciphertext,
            row.iv,
          )
          decrypted.push({ row, data })
        } catch {
          failed += 1
        }
      }
      if (!cancelled) {
        setEntries(decrypted)
        setFailedCount(failed)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [rows, vaultKey])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (entries ?? []).filter(
      (e) =>
        (category === 'alle' || e.row.category === category) &&
        (q === '' ||
          e.data.title.toLowerCase().includes(q) ||
          e.data.username.toLowerCase().includes(q) ||
          e.data.url.toLowerCase().includes(q)),
    )
  }, [entries, search, category])

  const openCreate = () => {
    setEditEntry(null)
    setDialogOpen(true)
  }

  const openEdit = (entry: DecryptedEntry) => {
    setEditEntry(entry)
    setDialogOpen(true)
  }

  const handleDelete = async (entry: DecryptedEntry) => {
    try {
      await deleteEntry.mutateAsync(entry.row.id)
      toast.success('Eintrag gelöscht')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Löschen fehlgeschlagen')
    }
  }

  const loading = isLoading || (rows !== undefined && entries === null)
  const isEmpty = !loading && !error && (entries ?? []).length === 0

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Passwort-Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(entries ?? []).length} Einträge – AES-256-verschlüsselt, nur in
            diesem Browser entschlüsselt
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={lock}>
            <Lock className="size-4" /> Sperren
          </Button>
          <Button onClick={openCreate} className="bg-gradient-accent glow text-white">
            <Plus className="size-4" /> Neuer Eintrag
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 basis-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Titel, Benutzername, URL…"
            className="pl-9"
          />
        </div>
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as 'alle' | VaultCategory)}
        >
          <TabsList>
            <TabsTrigger value="alle">Alle</TabsTrigger>
            {VAULT_CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {failedCount > 0 && (
        <p className="mt-4 text-sm text-destructive">
          {failedCount} Einträge konnten nicht entschlüsselt werden.
        </p>
      )}

      <div className="mt-8">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">
            Einträge konnten nicht geladen werden: {error.message}
          </p>
        )}

        {isEmpty && (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-muted-foreground">
            <KeyRound className="size-8" />
            <p className="text-sm">Noch keine Einträge im Vault.</p>
            <Button variant="outline" onClick={openCreate}>
              <Plus className="size-4" /> Ersten Eintrag anlegen
            </Button>
          </div>
        )}

        {!loading && !isEmpty && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Keine Treffer für deine Suche.
          </p>
        )}

        {filtered.length > 0 && (
          <div className="divide-y rounded-lg border bg-card">
            {filtered.map((entry) => (
              <EntryRow
                key={entry.row.id}
                entry={entry}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <EntryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vaultKey={vaultKey}
        editEntry={editEntry}
      />
    </div>
  )
}

export default function PasswordsPage() {
  const { data: meta, isLoading, error } = useVaultMeta()
  const vaultKey = useVaultStore((s) => s.key)

  if (isLoading) {
    return (
      <div className="space-y-3 p-8">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-sm text-destructive">
          Vault konnte nicht geladen werden: {error.message}
        </p>
      </div>
    )
  }

  if (!meta) return <VaultSetup />
  if (!vaultKey) return <VaultUnlock meta={meta} />
  return <VaultContent vaultKey={vaultKey} />
}
