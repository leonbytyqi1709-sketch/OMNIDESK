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
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateCommand,
  useUpdateCommand,
  type CommandDto,
} from '../api'

interface CommandFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editCommand: CommandDto | null
  categories: string[]
}

export function CommandFormDialog({
  open,
  onOpenChange,
  editCommand,
  categories,
}: CommandFormDialogProps) {
  const createCommand = useCreateCommand()
  const updateCommand = useUpdateCommand()
  const isPending = createCommand.isPending || updateCommand.isPending

  const [title, setTitle] = useState('')
  const [command, setCommand] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(editCommand?.title ?? '')
      setCommand(editCommand?.command ?? '')
      setCategory(editCommand?.category ?? '')
    }
  }, [open, editCommand])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const input = {
      title,
      command,
      category: category.trim() === '' ? 'Allgemein' : category.trim(),
    }
    try {
      if (editCommand) {
        await updateCommand.mutateAsync({ id: editCommand.id, ...input })
        toast.success('Befehl aktualisiert')
      } else {
        await createCommand.mutateAsync(input)
        toast.success('Befehl gespeichert')
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
            {editCommand ? 'Befehl bearbeiten' : 'Neuer Befehl'}
          </DialogTitle>
          <DialogDescription>
            CLI-Snippet fürs Cheat-Sheet speichern.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cmd-title">Beschreibung</Label>
            <Input
              id="cmd-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Offene Ports anzeigen"
              required
              maxLength={300}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cmd-command">Befehl</Label>
            <Textarea
              id="cmd-command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="ss -tulpn"
              required
              rows={3}
              maxLength={5000}
              className="font-mono text-sm"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cmd-category">Kategorie</Label>
            <Input
              id="cmd-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="z.B. Linux, PowerShell, Cisco"
              maxLength={100}
              list="cmd-categories"
            />
            <datalist id="cmd-categories">
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
