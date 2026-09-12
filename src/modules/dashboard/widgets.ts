import type { ComponentType } from 'react'
import {
  CalendarDays,
  Link2,
  ListTodo,
  NotebookPen,
  Sparkles,
  SquareKanban,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import { AppointmentsWidget } from './components/AppointmentsWidget'
import { GreetingWidget } from './components/GreetingWidget'
import { LinksWidget } from './components/LinksWidget'
import { NotesWidget } from './components/NotesWidget'
import { PomodoroWidget } from './components/PomodoroWidget'
import { ProjectsWidget } from './components/ProjectsWidget'
import { TasksWidget } from './components/TasksWidget'

export interface DashboardWidgetMeta {
  id: string
  title: string
  description: string
  icon: LucideIcon
  component: ComponentType
  /** CSS-Klasse für Grid-Spannbreite */
  colSpanClass?: string
  /** Zugehöriges Modul aus der moduleRegistry; wird das Modul deaktiviert, entfällt auch das Widget */
  moduleId?: string
}

export const DASHBOARD_WIDGETS: DashboardWidgetMeta[] = [
  {
    id: 'greeting',
    title: 'Begrüßung & Live-Uhr',
    description: 'Große Statuskarte mit Tageszeit, Datum und Live-Sekundenuhr',
    icon: Sparkles,
    component: GreetingWidget,
    colSpanClass: 'md:col-span-2',
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro-Timer',
    description: 'Kompakte Steuerung des global laufenden Fokus-Timers',
    icon: Timer,
    component: PomodoroWidget,
    moduleId: 'pomodoro',
  },
  {
    id: 'tasks',
    title: 'Offene Aufgaben',
    description: 'Dringendste To-Dos sortiert nach Priorität und Fälligkeit',
    icon: ListTodo,
    component: TasksWidget,
    moduleId: 'tasks',
  },
  {
    id: 'appointments',
    title: 'Nächste Termine',
    description: 'Kommende Kalender- und Booking-Ereignisse',
    icon: CalendarDays,
    component: AppointmentsWidget,
    moduleId: 'calendar',
  },
  {
    id: 'notes',
    title: 'Letzte Notizen',
    description: 'Schnellzugriff auf zuletzt geänderte Dokumente',
    icon: NotebookPen,
    component: NotesWidget,
    moduleId: 'notes',
  },
  {
    id: 'links',
    title: 'Schnellzugriff Links',
    description: 'Gepinnte Web-Interfaces mit Favicons',
    icon: Link2,
    component: LinksWidget,
    moduleId: 'links',
  },
  {
    id: 'projects',
    title: 'Aktive Projekte',
    description: 'Status- und Prioritätsübersicht laufender Projekte',
    icon: SquareKanban,
    component: ProjectsWidget,
    moduleId: 'projects',
  },
]
