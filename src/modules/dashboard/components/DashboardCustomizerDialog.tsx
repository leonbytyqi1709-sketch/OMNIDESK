import { useState, type DragEvent } from 'react'
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/stores/dashboard'
import { useSettingsStore } from '@/stores/settings'
import { DASHBOARD_WIDGETS, type DashboardWidgetMeta } from '../widgets'

interface DashboardCustomizerDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DashboardCustomizerDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DashboardCustomizerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen

  const widgetOrder = useDashboardStore((s) => s.widgetOrder)
  const hiddenWidgets = useDashboardStore((s) => s.hiddenWidgets)
  const setWidgetVisible = useDashboardStore((s) => s.setWidgetVisible)
  const moveWidget = useDashboardStore((s) => s.moveWidget)
  const reorderWidgets = useDashboardStore((s) => s.reorderWidgets)
  const resetToDefault = useDashboardStore((s) => s.resetToDefault)

  const disabledModules = useSettingsStore((s) => s.disabledModules)

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Widgets sortiert nach aktueller Reihenfolge
  const orderedWidgets: DashboardWidgetMeta[] = []
  for (const id of widgetOrder) {
    const found = DASHBOARD_WIDGETS.find((w) => w.id === id)
    if (found) orderedWidgets.push(found)
  }
  for (const w of DASHBOARD_WIDGETS) {
    if (!orderedWidgets.some((ow) => ow.id === w.id)) {
      orderedWidgets.push(w)
    }
  }

  const handleReset = () => {
    resetToDefault()
    toast.success('Dashboard auf Standard zurückgesetzt')
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain') || draggedId
    setDraggedId(null)
    setDragOverId(null)

    if (!sourceId || sourceId === targetId) return

    const currentIds = orderedWidgets.map((w) => w.id)
    const sourceIndex = currentIds.indexOf(sourceId)
    const targetIndex = currentIds.indexOf(targetId)
    if (sourceIndex === -1 || targetIndex === -1) return

    const newIds = [...currentIds]
    const [moved] = newIds.splice(sourceIndex, 1)
    newIds.splice(targetIndex, 0, moved)

    reorderWidgets(newIds)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="size-4" />
            Widgets verwalten
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-primary" />
            Dashboard-Widgets anpassen
          </DialogTitle>
          <DialogDescription>
            Bestimme Sichtbarkeit und Reihenfolge deiner Widgets. Ziehe sie an den
            Griffen oder nutze die Pfeiltasten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {orderedWidgets.map((widget, index) => {
            const isModuleDisabled = Boolean(
              widget.moduleId && disabledModules.includes(widget.moduleId),
            )
            const isVisible = !hiddenWidgets.includes(widget.id) && !isModuleDisabled
            const isFirst = index === 0
            const isLast = index === orderedWidgets.length - 1

            return (
              <div
                key={widget.id}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragOver={(e) => handleDragOver(e, widget.id)}
                onDragLeave={() => setDragOverId((prev) => (prev === widget.id ? null : prev))}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, widget.id)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-colors',
                  draggedId === widget.id && 'opacity-40',
                  dragOverId === widget.id && 'border-primary ring-2 ring-primary/20 glow',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                    title="Ziehen zum Neuanordnen"
                  >
                    <GripVertical className="size-4" />
                  </div>

                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <widget.icon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`widget-switch-${widget.id}`}
                        className="cursor-pointer font-medium text-sm"
                      >
                        {widget.title}
                      </Label>
                      {isModuleDisabled && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Modul inaktiv
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {widget.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={isFirst}
                      onClick={() => moveWidget(widget.id, -1)}
                      aria-label={`${widget.title} nach oben verschieben`}
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={isLast}
                      onClick={() => moveWidget(widget.id, 1)}
                      aria-label={`${widget.title} nach unten verschieben`}
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                  </div>

                  <Switch
                    id={`widget-switch-${widget.id}`}
                    checked={isVisible}
                    disabled={isModuleDisabled}
                    onCheckedChange={(checked) => setWidgetVisible(widget.id, checked)}
                    aria-label={`${widget.title} ein-/ausblenden`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Standard
          </Button>

          <Button type="button" onClick={() => setOpen(false)}>
            Fertig
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
