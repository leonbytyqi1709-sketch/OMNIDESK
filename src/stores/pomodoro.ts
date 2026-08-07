import { toast } from 'sonner'
import { create } from 'zustand'

export const WORK_SECONDS = 25 * 60
export const BREAK_SECONDS = 5 * 60

export type PomodoroMode = 'work' | 'break'

interface PomodoroState {
  mode: PomodoroMode
  remaining: number
  running: boolean
  /** Abgeschlossene Fokus-Blöcke in dieser Sitzung */
  completedCycles: number
  start: () => void
  pause: () => void
  reset: () => void
  /** Aktuelle Phase überspringen */
  skip: () => void
}

let intervalId: ReturnType<typeof setInterval> | null = null

function stopTicker() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

/**
 * Globaler Pomodoro-Store: Der Timer lebt außerhalb der React-Komponenten
 * und läuft daher beim Navigieren zwischen Modulen einfach weiter.
 */
export const usePomodoroStore = create<PomodoroState>((set, get) => {
  const advancePhase = (finishedNaturally: boolean) => {
    const { mode, completedCycles } = get()
    const nextMode: PomodoroMode = mode === 'work' ? 'break' : 'work'
    set({
      mode: nextMode,
      remaining: nextMode === 'work' ? WORK_SECONDS : BREAK_SECONDS,
      completedCycles:
        mode === 'work' && finishedNaturally ? completedCycles + 1 : completedCycles,
    })
    if (finishedNaturally) {
      toast(
        nextMode === 'break'
          ? 'Fokus-Block geschafft – 5 Minuten Pause!'
          : 'Pause vorbei – zurück in den Fokus.',
      )
    }
  }

  return {
    mode: 'work',
    remaining: WORK_SECONDS,
    running: false,
    completedCycles: 0,

    start: () => {
      if (get().running) return
      set({ running: true })
      intervalId = setInterval(() => {
        const { remaining } = get()
        if (remaining <= 1) {
          advancePhase(true)
        } else {
          set({ remaining: remaining - 1 })
        }
      }, 1000)
    },

    pause: () => {
      stopTicker()
      set({ running: false })
    },

    reset: () => {
      stopTicker()
      set({ mode: 'work', remaining: WORK_SECONDS, running: false })
    },

    skip: () => {
      advancePhase(false)
    },
  }
})
