import { NavLink } from 'react-router'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Play,
  Square,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppointments } from '@/modules/calendar/api'
import { useTasks } from '@/modules/tasks/api'
import { usePomodoroStore } from '@/stores/pomodoro'
import { WidgetCard } from './WidgetCard'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/** Bento-Widget: Tages-Fokus & aggregierte Schnellstatistiken. */
export function QuickStatsWidget() {
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: appointments, isLoading: appLoading } = useAppointments()

  const pomodoroRunning = usePomodoroStore((s) => s.running)
  const pomodoroRemaining = usePomodoroStore((s) => s.remaining)
  const pomodoroMode = usePomodoroStore((s) => s.mode)
  const startPomodoro = usePomodoroStore((s) => s.start)
  const pausePomodoro = usePomodoroStore((s) => s.pause)

  const todayStr = new Date().toISOString().slice(0, 10)

  // Aufgaben heute / überfällig
  const openTasks = (tasks ?? []).filter((t) => t.status !== 'done')
  const overdueTasks = openTasks.filter(
    (t) => t.dueDate && t.dueDate.slice(0, 10) < todayStr,
  )
  const dueTodayTasks = openTasks.filter(
    (t) => t.dueDate && t.dueDate.slice(0, 10) === todayStr,
  )

  // Nächster Termin heute
  const todayAppointments = (appointments ?? [])
    .filter((a) => a.startsAt.slice(0, 10) === todayStr)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  const nextAppointment = todayAppointments.find(
    (a) => new Date(a.endsAt).getTime() >= Date.now(),
  )

  const isLoading = tasksLoading || appLoading

  return (
    <WidgetCard title="Tages-Fokus & Status" icon={Zap} to="/tasks">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 rounded" />
          <Skeleton className="h-8 rounded" />
        </div>
      ) : (
        <div className="space-y-2.5 text-xs">
          {/* Aufgaben Status Zeile */}
          <NavLink
            to="/tasks"
            className="flex items-center justify-between rounded-md border border-border/40 bg-secondary/20 p-2 transition-colors hover:bg-secondary/40"
          >
            <div className="flex items-center gap-2">
              <ListTodo className="size-4 text-primary" />
              <span className="font-medium text-foreground">Aufgaben</span>
            </div>
            <div className="flex items-center gap-1.5">
              {overdueTasks.length > 0 && (
                <Badge
                  variant="outline"
                  className="border-destructive/40 bg-destructive/10 text-destructive text-[10px]"
                >
                  {overdueTasks.length} überfällig
                </Badge>
              )}
              {dueTodayTasks.length > 0 && (
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px]"
                >
                  {dueTodayTasks.length} heute
                </Badge>
              )}
              <span className="text-muted-foreground text-[11px]">
                {openTasks.length} offen
              </span>
            </div>
          </NavLink>

          {/* Kalender Status Zeile */}
          <NavLink
            to="/calendar"
            className="flex items-center justify-between rounded-md border border-border/40 bg-secondary/20 p-2 transition-colors hover:bg-secondary/40"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CalendarDays className="size-4 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-medium text-foreground block truncate">
                  {nextAppointment
                    ? nextAppointment.title
                    : todayAppointments.length > 0
                      ? 'Alle heutigen Termine vorbei'
                      : 'Keine Termine heute'}
                </span>
              </div>
            </div>
            {nextAppointment ? (
              <Badge
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] shrink-0"
              >
                {new Date(nextAppointment.startsAt).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Badge>
            ) : (
              <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
            )}
          </NavLink>

          {/* Fokus-Timer Mini-Steuerung */}
          <div className="flex items-center justify-between rounded-md border border-border/40 bg-secondary/20 p-2">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-amber-400" />
              <span className="font-medium text-foreground">
                {pomodoroMode === 'work' ? 'Fokus' : 'Pause'} ({formatTime(pomodoroRemaining)})
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
              onClick={pomodoroRunning ? pausePomodoro : startPomodoro}
            >
              {pomodoroRunning ? (
                <>
                  <Square className="size-3 text-destructive fill-destructive" /> Pause
                </>
              ) : (
                <>
                  <Play className="size-3 text-emerald-400 fill-emerald-400" /> Start
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
