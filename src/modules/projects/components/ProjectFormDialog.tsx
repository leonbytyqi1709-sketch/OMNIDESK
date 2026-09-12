import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (open) {
      setName(editProject?.name ?? '')
      setDescription(editProject?.description ?? '')
      setPriority(editProject?.priority ?? 'medium')
      setStatus(editProject?.status ?? 'active')
      setTags(editProject?.tags ? [...editProject.tags] : [])
      setTagInput('')
    }
  }, [open, editProject])

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '')
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const input = { name, description, priority, status, tags }
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

          {/* Tags / Schlagwörter */}
          <div className="flex flex-col gap-2 border-t border-border/40 pt-3">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="size-3.5" /> Tags & Schlagwörter
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Tag eingeben (z. B. Netzwerk, Kunde-A)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="h-9 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                className="h-9 text-xs"
              >
                Hinzufügen
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="gap-1 text-xs py-0.5 px-2"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
