import { useState } from 'react'
import {
  Check,
  LayoutGrid,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useDashboardStore } from '@/stores/dashboard'
import { useSettingsStore } from '@/stores/settings'
import { DashboardCustomizerDialog } from './components/DashboardCustomizerDialog'
import { WidgetWrapper } from './components/WidgetWrapper'
import { DASHBOARD_WIDGETS, type DashboardWidgetMeta } from './widgets'

/**
 * Einsatzzentrale: Modulares Bento-Grid mit anpassbaren Widgets.
 * Anordnung und Sichtbarkeit werden in LocalStorage persistiert.
 */
export default function DashboardPage() {
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const widgetOrder = useDashboardStore((s) => s.widgetOrder)
  const hiddenWidgets = useDashboardStore((s) => s.hiddenWidgets)
  const toggleWidget = useDashboardStore((s) => s.toggleWidget)
  const moveWidget = useDashboardStore((s) => s.moveWidget)
  const reorderWidgets = useDashboardStore((s) => s.reorderWidgets)
  const resetToDefault = useDashboardStore((s) => s.resetToDefault)

  const disabledModules = useSettingsStore((s) => s.disabledModules)

  // 1. Alle verfügbaren Widgets in gespeicherter Reihenfolge aufbereiten
  const orderedAll: DashboardWidgetMeta[] = []
  for (const id of widgetOrder) {
    const found = DASHBOARD_WIDGETS.find((w) => w.id === id)
    if (found) orderedAll.push(found)
  }
  for (const w of DASHBOARD_WIDGETS) {
    if (!orderedAll.some((ow) => ow.id === w.id)) {
      orderedAll.push(w)
    }
  }

  // 2. Aktive/sichtbare Widgets filtern
  const visibleWidgets = orderedAll.filter((widget) => {
    // Falls das übergeordnete Modul deaktiviert ist -> automatisch ausblenden
    if (widget.moduleId && disabledModules.includes(widget.moduleId)) {
      return false
    }
    // Falls manuell ausgeblendet
    if (hiddenWidgets.includes(widget.id)) {
      return false
    }
    return true
  })

  const handleDropReorder = (sourceId: string, targetId: string) => {
    const allIds = orderedAll.map((w) => w.id)
    const sourceIndex = allIds.indexOf(sourceId)
    const targetIndex = allIds.indexOf(targetId)
    if (sourceIndex === -1 || targetIndex === -1) return

    const newIds = [...allIds]
    const [moved] = newIds.splice(sourceIndex, 1)
    newIds.splice(targetIndex, 0, moved)

    reorderWidgets(newIds)
  }

  const handleHide = (id: string, title: string) => {
    toggleWidget(id)
    toast.info(`"${title}" ausgeblendet.`, {
      description: 'Über "Widgets anpassen" kannst du es wieder einblenden.',
    })
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6 p-6 md:p-8">
        {/* Dashboard-Kopfzeile */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Einsatzzentrale</h1>
          <p className="text-sm text-muted-foreground">
            Status, Fokus und Schnellzugriff auf deine wichtigsten Werkzeuge.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isCustomizing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsCustomizing((prev) => !prev)}
            className="gap-2"
          >
            {isCustomizing ? (
              <>
                <Check className="size-4" />
                Fertig
              </>
            ) : (
              <>
                <Pencil className="size-4" />
                Anordnen
              </>
            )}
          </Button>

          <DashboardCustomizerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="size-4" />
                Widgets anpassen
              </Button>
            }
          />
        </div>
      </div>

      {/* Bearbeitungsmodus-Hinweis */}
      {isCustomizing && (
        <div className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-2 rounded-full bg-primary animate-pulse" />
            <p className="text-foreground">
              <span className="font-semibold">Bearbeitungsmodus aktiv:</span> Ziehe
              die Karten an den Griffen oder verwende die Pfeile zum Anordnen.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetToDefault()
                toast.success('Standard-Layout wiederhergestellt')
              }}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Standard
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCustomizing(false)}
              className="text-xs"
            >
              Fertig
            </Button>
          </div>
        </div>
      )}

      {/* Bento-Grid mit Widgets */}
      {visibleWidgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <LayoutGrid className="size-6" />
          </div>
          <h2 className="mt-4 font-semibold text-lg">Keine Widgets sichtbar</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Alle Dashboard-Widgets sind aktuell ausgeblendet oder ihre Module wurden
            im Modul-Manager deaktiviert.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="gap-2"
            >
              <RotateCcw className="size-4" /> Standard wiederherstellen
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="gap-2"
            >
              <SlidersHorizontal className="size-4" /> Widgets einblenden
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleWidgets.map((widget, index) => {
            const WidgetComponent = widget.component
            const isFirst = index === 0
            const isLast = index === visibleWidgets.length - 1

            return (
              <WidgetWrapper
                key={widget.id}
                widget={widget}
                isCustomizing={isCustomizing}
                canMovePrev={!isFirst}
                canMoveNext={!isLast}
                onMove={(direction) => moveWidget(widget.id, direction)}
                onHide={() => handleHide(widget.id, widget.title)}
                onDropWidget={handleDropReorder}
              >
                <WidgetComponent />
              </WidgetWrapper>
            )
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
