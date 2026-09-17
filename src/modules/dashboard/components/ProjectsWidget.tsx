import { NavLink } from 'react-router'
import { CheckCircle2, ListTodo, SquareKanban, Target } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useProjectDetail, useProjects } from '@/modules/projects/api'
import { PRIORITY_META, PROJECT_STATUS_META } from '@/modules/projects/constants'
import { WidgetCard } from './WidgetCard'

/** Zeigt Aufgaben- und Meilenstein-Zähler eines Projekts. */
function ProjectStats({ projectId }: { projectId: string }) {
  const { data } = useProjectDetail(projectId)
  if (!data) return null
  const openTasks = data.tasks.filter((t) => t.status !== 'done').length
  const openMilestones = data.milestones.filter((m) => !m.done).length

  return (
    <span className="flex shrink-0 items-center gap-2.5 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1" title={`${openTasks} offene Aufgaben`}>
        <ListTodo className="size-3" />
        {openTasks}
      </span>
      <span className="flex items-center gap-1" title={`${openMilestones} offene Meilensteine`}>
        <Target className="size-3" />
        {openMilestones}
      </span>
      {openTasks === 0 && openMilestones === 0 && (
        <CheckCircle2 className="size-3 text-emerald-400" />
      )}
    </span>
  )
}

/** Übersicht der aktuellen IT-Projekte im Bento-Grid. */
export function ProjectsWidget() {
  const { data: projects, isLoading } = useProjects()

  const activeProjects = (projects ?? []).filter((p) => p.status !== 'done')

  return (
    <WidgetCard
      title={`Laufende Projekte (${activeProjects.length})`}
      icon={SquareKanban}
      to="/projects"
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-8 rounded-md" />
          ))}
        </div>
      ) : activeProjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Keine aktiven Projekte.{' '}
          <NavLink to="/projects" className="text-foreground underline underline-offset-4">
            Neues Projekt anlegen
          </NavLink>
        </p>
      ) : (
        <ul className="-mx-2">
          {activeProjects.slice(0, 4).map((project) => (
            <li key={project.id}>
              <NavLink
                to="/projects"
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
              >
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    PRIORITY_META[project.priority].dotClass,
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {project.name}
                </span>
                <ProjectStats projectId={project.id} />
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                    PROJECT_STATUS_META[project.status].badgeClass,
                  )}
                >
                  {PROJECT_STATUS_META[project.status].label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  )
}
