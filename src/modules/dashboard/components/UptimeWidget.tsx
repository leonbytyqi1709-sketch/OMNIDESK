import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useRefreshAllMonitors, useUptimeMonitors } from '@/modules/uptime/api'
import { WidgetCard } from './WidgetCard'

/** Bento-Widget: Uptime & Service-Health Statusübersicht */
export function UptimeWidget() {
  const { data: monitors = [], isLoading } = useUptimeMonitors()
  const refreshAllMutation = useRefreshAllMonitors()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const activeMonitors = monitors.filter((m) => m.active)
  const onlineCount = activeMonitors.filter((m) => m.lastCheck?.status === 'up').length
  const offlineCount = activeMonitors.filter((m) => m.lastCheck?.status === 'down').length

  const criticalSslCount = activeMonitors.filter(
    (m) =>
      m.lastCheck?.sslDaysLeft !== null &&
      m.lastCheck?.sslDaysLeft !== undefined &&
      m.lastCheck.sslDaysLeft < 14,
  ).length

  // Durchschnittliche Latenz aktiver erreichbarer Monitore
  const onlineWithLatency = activeMonitors.filter(
    (m) => m.lastCheck?.status === 'up' && typeof m.lastCheck?.responseTimeMs === 'number',
  )
  const avgLatency =
    onlineWithLatency.length > 0
      ? Math.round(
          onlineWithLatency.reduce((acc, m) => acc + (m.lastCheck?.responseTimeMs || 0), 0) /
            onlineWithLatency.length,
        )
      : null

  const handleRefresh = async () => {
    if (activeMonitors.length === 0 || isRefreshing) return
    setIsRefreshing(true)
    try {
      await refreshAllMutation.mutateAsync()
      toast.success('Alle Uptime-Monitore werden geprüft')
    } catch {
      toast.error('Aktualisierung fehlgeschlagen')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <WidgetCard
      title={`Service-Health (${onlineCount}/${activeMonitors.length})`}
      icon={Activity}
      to="/uptime"
    >
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      ) : activeMonitors.length === 0 ? (
        <div className="py-2 text-center">
          <p className="text-xs text-muted-foreground">
            Noch keine aktiven Uptime-Monitore angelegt.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Status Header Zeile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {offlineCount > 0 ? (
                <>
                  <XCircle className="h-4 w-4 text-rose-500 animate-pulse" />
                  <span className="text-xs font-semibold text-rose-400">
                    {offlineCount} {offlineCount === 1 ? 'Dienst gestört' : 'Dienste gestört'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-400">
                    Alle {onlineCount} Dienste online
                  </span>
                </>
              )}
            </div>

            {avgLatency !== null && (
              <span className="font-mono text-xs text-muted-foreground">
                Ø {avgLatency} ms
              </span>
            )}
          </div>

          {/* SSL-Warnung wenn kritisch */}
          {criticalSslCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-400">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{criticalSslCount} SSL-Zertifikat läuft in &lt;14 Tagen ab!</span>
            </div>
          )}

          {/* Mini-Liste der wichtigsten Monitore */}
          <div className="space-y-1.5 divide-y divide-border/30">
            {activeMonitors.slice(0, 3).map((m) => {
              const isUp = m.lastCheck?.status === 'up'
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between pt-1.5 text-xs first:pt-0"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        isUp ? 'bg-emerald-500' : 'bg-rose-500',
                      )}
                    />
                    <span className="truncate font-medium text-foreground">
                      {m.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
                    {isUp && m.lastCheck?.responseTimeMs !== null ? (
                      <span>{m.lastCheck?.responseTimeMs} ms</span>
                    ) : (
                      <span className="text-rose-400 font-sans">Offline</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer mit Refresh */}
          <div className="flex items-center justify-between border-t border-border/40 pt-1 text-[11px] text-muted-foreground">
            <span>
              {activeMonitors.length > 3
                ? `+ ${activeMonitors.length - 3} weitere Dienste`
                : 'Live-Monitoring aktiv'}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleRefresh}
              disabled={isRefreshing || refreshAllMutation.isPending}
              title="Alle Monitore jetzt prüfen"
            >
              <RefreshCw
                className={cn(
                  'h-3 w-3',
                  (isRefreshing || refreshAllMutation.isPending) &&
                    'animate-spin text-emerald-400',
                )}
              />
            </Button>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
