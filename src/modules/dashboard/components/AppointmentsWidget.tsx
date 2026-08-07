import { NavLink } from 'react-router'
import { CalendarDays } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAppointments } from '@/modules/calendar/api'
import { PRIORITY_META } from '@/modules/calendar/constants'
import { WidgetCard } from './WidgetCard'

/** Die nächsten anstehenden Termine. */
export function AppointmentsWidget() {
  const { data: appointments, isLoading } = useAppointments()

  const upcoming = (appointments ?? []).filter(
    (a) => new Date(a.endsAt) >= new Date(),
  )

  return (
    <WidgetCard title="Nächste Termine" icon={CalendarDays} to="/calendar">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-8 rounded-md" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine anstehenden Termine.</p>
      ) : (
        <ul className="-mx-2">
          {upcoming.slice(0, 4).map((a) => (
            <li key={a.id}>
              <NavLink
                to="/calendar"
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
              >
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    PRIORITY_META[a.priority].dotClass,
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-sm">{a.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(a.startsAt).toLocaleString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  )
}
