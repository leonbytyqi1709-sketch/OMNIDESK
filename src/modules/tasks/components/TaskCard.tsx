import { CalendarClock, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { TaskDto } from '../api'
import { PRIORITY_META, STATUS_ORDER } from '../constants'

export function isOverdue(task: TaskDto): boolean {
  return (
    task.status !== 'done' &&
    task.dueDate !== null &&
    new Date(task.dueDate) < new Date()
  )
}

export function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

interface TaskCardProps {
  task: TaskDto
  onEdit: (task: TaskDto) => void
  onDelete: (task: TaskDto) => void
  onMove: (task: TaskDto, direction: -1 | 1) => void
}

/** Kanban-Karte mit Verschiebe-Pfeilen zwischen den Spalten. */
export function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const statusIndex = STATUS_ORDER.indexOf(task.status)
  const overdue = isOverdue(task)

  return (
    <Card className="gap-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            'text-sm font-medium',
            task.status === 'done' && 'text-muted-foreground line-through',
          )}
        >
          {task.title}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-mt-1 -mr-1 size-7 shrink-0"
              aria-label="Aufgaben-Aktionen"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="size-4" /> Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
              <Trash2 className="size-4" /> Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {task.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={PRIORITY_META[task.priority].badgeClass}>
            {PRIORITY_META[task.priority].label}
          </Badge>
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                overdue ? 'font-medium text-destructive' : 'text-muted-foreground',
              )}
            >
              <CalendarClock className="size-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            disabled={statusIndex === 0}
            onClick={() => onMove(task, -1)}
            aria-label="Status zurück"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            disabled={statusIndex === STATUS_ORDER.length - 1}
            onClick={() => onMove(task, 1)}
            aria-label="Status vor"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
