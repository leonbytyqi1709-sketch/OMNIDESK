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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateTask,
  useUpdateTask,
  type TaskDto,
  type TaskPriority,
  type TaskStatus,
} from '../api'
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from '../constants'

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTask: TaskDto | null
}

/** ISO-String → Wert für <input type="date"> (lokales Datum). */
function toDateInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TaskFormDialog({
  open,
  onOpenChange,
  editTask,
}: TaskFormDialogProps) {
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const isPending = createTask.isPending || updateTask.isPending

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(editTask?.title ?? '')
      setDescription(editTask?.description ?? '')
      setPriority(editTask?.priority ?? 'medium')
      setStatus(editTask?.status ?? 'todo')
      setDueDate(toDateInputValue(editTask?.dueDate ?? null))
    }
  }, [open, editTask])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const input = {
      title,
      description,
      priority,
      status,
      // Fällig am Ende des gewählten Tages (lokale Zeit)
      dueDate: dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : null,
    }
    try {
      if (editTask) {
        await updateTask.mutateAsync({ id: editTask.id, ...input })
        toast.success('Aufgabe aktualisiert')
      } else {
        await createTask.mutateAsync(input)
        toast.success('Aufgabe angelegt')
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
            {editTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
          </DialogTitle>
          <DialogDescription>
            Mit Priorität, Status und optionaler Fälligkeit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">Titel</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Firewall-Regeln prüfen"
              required
              maxLength={300}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-description">Beschreibung (optional)</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details, Links, Checkpunkte…"
              rows={3}
              maxLength={10_000}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Priorität</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      <span
                        className={`size-2 rounded-full ${PRIORITY_META[p].dotClass}`}
                      />
                      {PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-due">Fällig am (optional)</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
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
