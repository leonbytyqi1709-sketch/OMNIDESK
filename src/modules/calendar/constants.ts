import type { AppointmentPriority } from './api'

/** Prioritätsfarben für Termin-Chips (Spec: „Prioritätsfarben“). */
export const PRIORITY_META: Record<
  AppointmentPriority,
  { label: string; chipClass: string; dotClass: string }
> = {
  high: {
    label: 'Hoch',
    chipClass: 'border-destructive/50 bg-destructive/15 text-red-300',
    dotClass: 'bg-destructive',
  },
  medium: {
    label: 'Mittel',
    chipClass: 'border-amber-500/50 bg-amber-500/15 text-amber-300',
    dotClass: 'bg-amber-500',
  },
  low: {
    label: 'Niedrig',
    chipClass: 'border-border bg-secondary text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
}
