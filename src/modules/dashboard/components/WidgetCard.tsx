import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WidgetCardProps {
  title: string
  icon: LucideIcon
  /** Route des zugehörigen Moduls („Öffnen“-Pfeil) */
  to?: string
  className?: string
  children: ReactNode
}

/** Einheitlicher Rahmen für alle Dashboard-Widgets im Bento-Grid. */
export function WidgetCard({
  title,
  icon: Icon,
  to,
  className,
  children,
}: WidgetCardProps) {
  return (
    <Card className={cn('gap-3 py-4', className)}>
      <CardHeader className="flex flex-row items-center justify-between px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" /> {title}
        </CardTitle>
        {to && (
          <NavLink
            to={to}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`${title} öffnen`}
          >
            <ArrowRight className="size-4" />
          </NavLink>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 px-4">{children}</CardContent>
    </Card>
  )
}
