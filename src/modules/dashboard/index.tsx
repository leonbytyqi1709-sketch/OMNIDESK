import { AppointmentsWidget } from './components/AppointmentsWidget'
import { GreetingWidget } from './components/GreetingWidget'
import { LinksWidget } from './components/LinksWidget'
import { NotesWidget } from './components/NotesWidget'
import { PomodoroWidget } from './components/PomodoroWidget'
import { TasksWidget } from './components/TasksWidget'

/**
 * Einsatzzentrale: Bento-Grid mit Widgets.
 * Neue Module bringen eigene Widgets mit, die hier eingehängt werden.
 */
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-2 xl:grid-cols-3">
      <GreetingWidget />
      <PomodoroWidget />
      <TasksWidget />
      <AppointmentsWidget />
      <NotesWidget />
      <LinksWidget />
    </div>
  )
}
