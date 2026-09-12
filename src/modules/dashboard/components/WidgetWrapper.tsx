import { useState, type ReactNode, type DragEvent } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  EyeOff,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { DashboardWidgetMeta } from '../widgets'

interface WidgetWrapperProps {
  widget: DashboardWidgetMeta
  isCustomizing: boolean
  canMovePrev: boolean
  canMoveNext: boolean
  onMove: (direction: -1 | 1) => void
  onHide: () => void
  onDropWidget: (sourceId: string, targetId: string) => void
  children: ReactNode
}

export function WidgetWrapper({
  widget,
  isCustomizing,
  canMovePrev,
  canMoveNext,
  onMove,
  onHide,
  onDropWidget,
  children,
}: WidgetWrapperProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', widget.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const sourceId = e.dataTransfer.getData('text/plain')
    if (sourceId && sourceId !== widget.id) {
      onDropWidget(sourceId, widget.id)
    }
  }

  return (
    <div
      draggable={isCustomizing}
      onDragStart={isCustomizing ? handleDragStart : undefined}
      onDragOver={isCustomizing ? handleDragOver : undefined}
      onDragLeave={isCustomizing ? handleDragLeave : undefined}
      onDrop={isCustomizing ? handleDrop : undefined}
      className={cn(
        'group/widget relative flex flex-col transition-all duration-150',
        widget.colSpanClass ?? 'col-span-1',
        isCustomizing && [
          'cursor-grab rounded-xl border-2 border-dashed border-border/80 p-1.5 active:cursor-grabbing',
          'bg-accent/10 hover:border-primary/60 hover:bg-accent/20',
          isDragOver && 'border-primary ring-2 ring-primary/30 glow',
        ],
      )}
    >
      {isCustomizing && (
        <div className="mb-1.5 flex items-center justify-between gap-1 rounded-lg bg-background/90 px-2 py-1 text-xs text-muted-foreground backdrop-blur-xs">
          <div className="flex items-center gap-1 font-medium">
            <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{widget.title}</span>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={!canMovePrev}
                  onClick={() => onMove(-1)}
                  aria-label="Nach links / oben verschieben"
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Vorherige Position</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={!canMoveNext}
                  onClick={() => onMove(1)}
                  aria-label="Nach rechts / unten verschieben"
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Nächste Position</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={onHide}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Widget ausblenden"
                >
                  <EyeOff className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Ausblenden</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
