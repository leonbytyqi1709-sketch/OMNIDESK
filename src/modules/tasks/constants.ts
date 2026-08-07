import type { TaskPriority, TaskStatus } from './api'

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badgeClass: string; dotClass: string }
> = {
  high: {
    label: 'Hoch',
    badgeClass: 'border-destructive/40 bg-destructive/15 text-red-400',
    dotClass: 'bg-destructive',
  },
  medium: {
    label: 'Mittel',
    badgeClass: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
    dotClass: 'bg-amber-500',
  },
  low: {
    label: 'Niedrig',
    badgeClass: 'border-border bg-secondary text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
}

export const STATUS_META: Record<TaskStatus, { label: string }> = {
  todo: { label: 'Offen' },
  in_progress: { label: 'In Arbeit' },
  done: { label: 'Erledigt' },
}

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done']
