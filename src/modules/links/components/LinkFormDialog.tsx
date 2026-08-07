import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateLink, useUpdateLink, type LinkDto } from '../api'

interface LinkFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Vorhandener Link beim Bearbeiten, sonst null (Neuanlage) */
  editLink: LinkDto | null
  /** Vorschläge für das Kategorie-Feld */
  categories: string[]
}

export function LinkFormDialog({
  open,
  onOpenChange,
  editLink,
  categories,
}: LinkFormDialogProps) {
  const createLink = useCreateLink()
  const updateLink = useUpdateLink()
  const isPending = createLink.isPending || updateLink.isPending

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')

  // Formular beim Öffnen mit dem zu bearbeitenden Link (oder leer) befüllen
  useEffect(() => {
    if (open) {
      setTitle(editLink?.title ?? '')
      setUrl(editLink?.url ?? '')
      setCategory(editLink?.category ?? '')
    }
  }, [open, editLink])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const input = {
      title,
      url,
      category: category.trim() === '' ? null : category.trim(),
    }
    try {
      if (editLink) {
        await updateLink.mutateAsync({ id: editLink.id, ...input })
        toast.success('Link aktualisiert')
      } else {
        await createLink.mutateAsync(input)
        toast.success('Link gespeichert')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Speichern fehlgeschlagen')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editLink ? 'Link bearbeiten' : 'Neuer Link'}
          </DialogTitle>
          <DialogDescription>
            Web-Interface mit sprechendem Namen speichern.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-title">Titel</Label>
            <Input
              id="link-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Proxmox Cluster"
              required
              maxLength={200}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              required
              maxLength={2048}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-category">Kategorie (optional)</Label>
            <Input
              id="link-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="z.B. Infrastruktur"
              maxLength={100}
              list="link-categories"
            />
            <datalist id="link-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-accent glow text-white"
            >
              {isPending ? 'Speichert…' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
