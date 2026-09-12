import { CalendarClock, ListChecks, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { TaskDto } from '../api'
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from '../constants'
import { formatDueDate, isOverdue } from './TaskCard'

interface TaskListViewProps {
  tasks: TaskDto[]
  onToggleDone: (task: TaskDto) => void
  onEdit: (task: TaskDto) => void
  onDelete: (task: TaskDto) => void
}

export function TaskListView({
  tasks,
  onToggleDone,
  onEdit,
  onDelete,
}: TaskListViewProps) {
  return (
    <div className="space-y-6">
      {STATUS_ORDER.map((status) => {
        const items = tasks.filter((t) => t.status === status)
        if (items.length === 0) return null
        return (
          <section key={status}>
            <h2 className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {STATUS_META[status].label} ({items.length})
            </h2>
            <div className="divide-y rounded-lg border bg-card">
              {items.map((task) => {
                const overdue = isOverdue(task)
                const subtasks = task.subtasks ?? []
                const doneSubtasks = subtasks.filter((s) => s.done).length

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <Checkbox
                      checked={task.status === 'done'}
                      onCheckedChange={() => onToggleDone(task)}
                      aria-label="Als erledigt markieren"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm',
                          task.status === 'done' &&
                            'text-muted-foreground line-through',
                        )}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {subtasks.length > 0 && (
                      <span
                        className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
                        title={`${doneSubtasks} von ${subtasks.length} Unteraufgaben erledigt`}
                      >
                        <ListChecks className="size-3.5 text-primary" />
                        <span>
                          {doneSubtasks}/{subtasks.length}
                        </span>
                      </span>
                    )}
                    {task.dueDate && (
                      <span
                        className={cn(
                          'flex shrink-0 items-center gap-1 text-xs',
                          overdue
                            ? 'font-medium text-destructive'
                            : 'text-muted-foreground',
                        )}
                      >
                        <CalendarClock className="size-3" />
                        {formatDueDate(task.dueDate)}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0',
                        PRIORITY_META[task.priority].badgeClass,
                      )}
                    >
                      {PRIORITY_META[task.priority].label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0"
                          aria-label="Aufgaben-Aktionen"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          <Pencil className="size-4" /> Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(task)}
                        >
                          <Trash2 className="size-4" /> Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
