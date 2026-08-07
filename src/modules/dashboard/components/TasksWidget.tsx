import { NavLink } from 'react-router'
import { ListTodo } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useTasks } from '@/modules/tasks/api'
import { PRIORITY_META } from '@/modules/tasks/constants'
import { WidgetCard } from './WidgetCard'

/** Offene Aufgaben, dringendste zuerst (Priorität, dann Fälligkeit). */
export function TasksWidget() {
  const { data: tasks, isLoading } = useTasks()

  const open = (tasks ?? [])
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const prio = { high: 0, medium: 1, low: 2 }
      if (prio[a.priority] !== prio[b.priority]) {
        return prio[a.priority] - prio[b.priority]
      }
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return aDue - bDue
    })

  return (
    <WidgetCard
      title={`Offene Aufgaben (${open.length})`}
      icon={ListTodo}
      to="/tasks"
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-8 rounded-md" />
          ))}
        </div>
      ) : open.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Alles erledigt – nichts offen. 🎉
        </p>
      ) : (
        <ul className="-mx-2">
          {open.slice(0, 4).map((task) => {
            const overdue =
              task.dueDate !== null && new Date(task.dueDate) < new Date()
            return (
              <li key={task.id}>
                <NavLink
                  to="/tasks"
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
                >
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      PRIORITY_META[task.priority].dotClass,
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span
                      className={cn(
                        'shrink-0 text-xs',
                        overdue
                          ? 'font-medium text-destructive'
                          : 'text-muted-foreground',
                      )}
                    >
                      {new Date(task.dueDate).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      )}
    </WidgetCard>
  )
}
