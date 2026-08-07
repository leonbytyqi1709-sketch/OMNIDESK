import type { TaskDto } from '../api'
import { STATUS_META, STATUS_ORDER } from '../constants'
import { TaskCard } from './TaskCard'

interface TaskBoardViewProps {
  tasks: TaskDto[]
  onEdit: (task: TaskDto) => void
  onDelete: (task: TaskDto) => void
  onMove: (task: TaskDto, direction: -1 | 1) => void
}

/** Kanban: drei Spalten (Offen / In Arbeit / Erledigt). */
export function TaskBoardView({
  tasks,
  onEdit,
  onDelete,
  onMove,
}: TaskBoardViewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STATUS_ORDER.map((status) => {
        const items = tasks.filter((t) => t.status === status)
        return (
          <div key={status} className="rounded-lg bg-secondary/40 p-3">
            <h2 className="mb-3 px-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {STATUS_META[status].label}{' '}
              <span className="text-muted-foreground/60">({items.length})</span>
            </h2>
            <div className="space-y-2">
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMove={onMove}
                />
              ))}
              {items.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  Keine Aufgaben
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
