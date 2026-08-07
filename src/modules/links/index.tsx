import { useMemo, useState } from 'react'
import { Link2, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { LinkCard } from './components/LinkCard'
import { LinkFormDialog } from './components/LinkFormDialog'
import { useDeleteLink, useLinks, type LinkDto } from './api'

const UNCATEGORIZED = 'Ohne Kategorie'

export default function LinksPage() {
  const { data: links, isLoading, error } = useLinks()
  const deleteLink = useDeleteLink()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editLink, setEditLink] = useState<LinkDto | null>(null)

  const categories = useMemo(
    () =>
      [...new Set((links ?? []).map((l) => l.category).filter(Boolean))] as string[],
    [links],
  )

  /** Nach Suchbegriff gefiltert und nach Kategorie gruppiert. */
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = (links ?? []).filter(
      (l) =>
        q === '' ||
        l.title.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q),
    )
    const map = new Map<string, LinkDto[]>()
    for (const link of filtered) {
      const key = link.category ?? UNCATEGORIZED
      map.set(key, [...(map.get(key) ?? []), link])
    }
    // Alphabetisch, "Ohne Kategorie" immer zuletzt
    return [...map.entries()].sort(([a], [b]) => {
      if (a === UNCATEGORIZED) return 1
      if (b === UNCATEGORIZED) return -1
      return a.localeCompare(b, 'de')
    })
  }, [links, search])

  const openCreate = () => {
    setEditLink(null)
    setDialogOpen(true)
  }

  const openEdit = (link: LinkDto) => {
    setEditLink(link)
    setDialogOpen(true)
  }

  const handleDelete = async (link: LinkDto) => {
    try {
      await deleteLink.mutateAsync(link.id)
      toast.success(`„${link.title}" gelöscht`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Löschen fehlgeschlagen')
    }
  }

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Link-Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deine meistgenutzten Web-Interfaces an einem Ort.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-accent glow text-white">
          <Plus className="size-4" /> Neuer Link
        </Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suchen…"
          className="pl-9"
        />
      </div>

      <div className="mt-8 space-y-8">
        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">
            Links konnten nicht geladen werden: {error.message}
          </p>
        )}

        {!isLoading && !error && grouped.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
            <Link2 className="size-8" />
            <p className="text-sm">
              {search
                ? 'Keine Treffer für deine Suche.'
                : 'Noch keine Links – lege den ersten an.'}
            </p>
          </div>
        )}

        {grouped.map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <LinkFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editLink={editLink}
        categories={categories}
      />
    </div>
  )
}
