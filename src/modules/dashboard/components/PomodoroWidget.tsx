import { NavLink } from 'react-router'
import { Pause, Play, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePomodoroStore } from '@/stores/pomodoro'
import { formatTime } from '@/lib/utils'
import { WidgetCard } from './WidgetCard'

/** Mini-Ansicht des global laufenden Pomodoro-Timers. */
export function PomodoroWidget() {
  const { mode, remaining, running, completedCycles, start, pause } =
    usePomodoroStore()

  return (
    <WidgetCard title="Pomodoro" icon={Timer} to="/pomodoro">
      <div className="flex items-center justify-between gap-4">
        <div>
          <NavLink
            to="/pomodoro"
            className="font-mono text-4xl font-semibold tabular-nums"
          >
            {formatTime(remaining)}
          </NavLink>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === 'work' ? 'Fokus' : 'Pause'} · {completedCycles} geschafft
          </p>
        </div>
        <Button
          size="icon"
          onClick={running ? pause : start}
          className="bg-gradient-accent glow size-11 rounded-full text-white"
          aria-label={running ? 'Timer pausieren' : 'Timer starten'}
        >
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
        </Button>
      </div>
    </WidgetCard>
  )
}
