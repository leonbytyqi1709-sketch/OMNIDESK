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
import type { TaskPriority } from '@/db/schema'
import {
  useCreateProject,
  useUpdateProject,
  type ProjectDto,
  type ProjectStatus,
} from '../api'
import { PRIORITY_META, PROJECT_STATUS_META } from '../constants'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editProject: ProjectDto | null
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  editProject,
}: ProjectFormDialogProps) {
  const createProject = useCreateProject()
  const updateProject = useUpdateProject(editProject?.id ?? '')
  const isPending = createProject.isPending || updateProject.isPending

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<ProjectStatus>('active')

  useEffect(() => {
    if (open) {
      setName(editProject?.name ?? '')
      setDescription(editProject?.description ?? '')
      setPriority(editProject?.priority ?? 'medium')
      setStatus(editProject?.status ?? 'active')
    }
  }, [open, editProject])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const input = { name, description, priority, status }
    try {
      if (editProject) {
        await updateProject.mutateAsync(input)
        toast.success('Projekt aktualisiert')
      } else {
        await createProject.mutateAsync(input)
        toast.success('Projekt angelegt')
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
            {editProject ? 'Projekt bearbeiten' : 'Neues Projekt'}
          </DialogTitle>
          <DialogDescription>
            IT-Infrastrukturprojekt mit Kanban-Board und Meilensteinen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Server-Migration Kunde X"
              required
              maxLength={300}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-description">Beschreibung (optional)</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
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
                onValueChange={(v) => setStatus(v as ProjectStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROJECT_STATUS_META) as ProjectStatus[]).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {PROJECT_STATUS_META[s].label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
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
