import type { TaskPriority } from '@/db/schema'
import type { ProjectStatus, ProjectTaskStatus } from './api'

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

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; badgeClass: string }
> = {
  active: {
    label: 'Aktiv',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400',
  },
  paused: {
    label: 'Pausiert',
    badgeClass: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
  },
  done: {
    label: 'Abgeschlossen',
    badgeClass: 'border-border bg-secondary text-muted-foreground',
  },
}

export const BOARD_COLUMNS: { status: ProjectTaskStatus; label: string }[] = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'todo', label: 'To-Do' },
  { status: 'in_progress', label: 'In Arbeit' },
  { status: 'done', label: 'Erledigt' },
]
