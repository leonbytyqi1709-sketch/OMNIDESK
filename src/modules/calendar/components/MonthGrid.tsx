import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { cn } from '@/lib/utils'
import type { AppointmentDto } from '../api'
import { PRIORITY_META } from '../constants'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MAX_CHIPS_PER_DAY = 3

interface MonthGridProps {
  month: Date
  appointments: AppointmentDto[]
  onDayClick: (day: Date) => void
  onAppointmentClick: (appointment: AppointmentDto) => void
}

export function MonthGrid({
  month,
  appointments,
  onDayClick,
  onAppointmentClick,
}: MonthGridProps) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayAppointments = appointments
            .filter((a) => isSameDay(new Date(a.startsAt), day))
            .sort(
              (a, b) =>
                new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
            )
          const hidden = dayAppointments.length - MAX_CHIPS_PER_DAY

          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              onKeyDown={(e) => e.key === 'Enter' && onDayClick(day)}
              className={cn(
                'min-h-24 cursor-pointer border-t border-r p-1.5 transition-colors last:border-r-0 hover:bg-accent/40 [&:nth-child(-n+7)]:border-t-0 [&:nth-child(7n)]:border-r-0',
                !isSameMonth(day, month) && 'bg-background/60 text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs',
                  isToday(day) && 'bg-gradient-accent glow font-semibold text-white',
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {dayAppointments.slice(0, MAX_CHIPS_PER_DAY).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAppointmentClick(a)
                    }}
                    className={cn(
                      'block w-full truncate rounded border-l-2 px-1.5 py-0.5 text-left text-xs transition-opacity hover:opacity-80',
                      PRIORITY_META[a.priority].chipClass,
                    )}
                    title={a.title}
                  >
                    {format(new Date(a.startsAt), 'HH:mm')} {a.title}
                  </button>
                ))}
                {hidden > 0 && (
                  <p className="px-1.5 text-xs text-muted-foreground">
                    +{hidden} weitere
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
