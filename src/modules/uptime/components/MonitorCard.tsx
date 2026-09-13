import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  MoreVertical,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { UptimeMonitorDto } from '../api'
import { useCheckSingleMonitor, useDeleteMonitor, useUpdateMonitor } from '../api'

interface MonitorCardProps {
  monitor: UptimeMonitorDto
  onEdit: (monitor: UptimeMonitorDto) => void
  onViewHistory: (monitor: UptimeMonitorDto) => void
}

export function MonitorCard({ monitor, onEdit, onViewHistory }: MonitorCardProps) {
  const checkMutation = useCheckSingleMonitor()
  const deleteMutation = useDeleteMonitor()
  const updateMutation = useUpdateMonitor()
  const [isChecking, setIsChecking] = useState(false)

  const isUp = monitor.active && monitor.lastCheck?.status === 'up'
  const isDown = monitor.active && monitor.lastCheck?.status === 'down'
  const isInactive = !monitor.active

  const handleCheckNow = async () => {
    setIsChecking(true)
    try {
      await checkMutation.mutateAsync(monitor.id)
      toast.success(`Check für "${monitor.name}" abgeschlossen`)
    } catch {
      toast.error('Check fehlgeschlagen')
    } finally {
      setIsChecking(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      await updateMutation.mutateAsync({
        id: monitor.id,
        active: !monitor.active,
      })
      toast.success(
        monitor.active
          ? `Monitor "${monitor.name}" pausiert`
          : `Monitor "${monitor.name}" aktiviert`,
      )
    } catch {
      toast.error('Statusänderung fehlgeschlagen')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Monitor "${monitor.name}" wirklich löschen?`)) return
    try {
      await deleteMutation.mutateAsync(monitor.id)
      toast.success(`Monitor "${monitor.name}" gelöscht`)
    } catch {
      toast.error('Löschen fehlgeschlagen')
    }
  }

  const formatLastCheckTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Noch nie'
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `vor ${diffSec}s`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `vor ${diffMin} min`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `vor ${diffHours} Std.`
    return new Date(dateStr).toLocaleDateString('de-DE')
  }

  return (
    <div
      className={`relative rounded-xl border p-5 transition-all duration-200 card-hover-glow ${
        isInactive
          ? 'border-zinc-800/60 bg-zinc-900/40 opacity-70'
          : isDown
            ? 'border-rose-900/60 bg-rose-950/15'
            : 'border-zinc-800/80 bg-zinc-900/80'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Status-Icon / Dot */}
          <div className="relative flex items-center justify-center">
            {isInactive ? (
              <div className="h-3.5 w-3.5 rounded-full bg-zinc-600" />
            ) : isUp ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-rose-500" />
              </>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-zinc-100">{monitor.name}</h3>
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider text-zinc-400 border-zinc-700/60"
              >
                {monitor.type}
              </Badge>
              {isInactive && (
                <Badge variant="secondary" className="text-[10px] text-zinc-400">
                  Pausiert
                </Badge>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
              {monitor.type === 'http' ? (
                <a
                  href={monitor.url.startsWith('http') ? monitor.url : `https://${monitor.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-zinc-200 hover:underline"
                >
                  <span className="max-w-[220px] truncate">{monitor.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <span className="font-mono">
                  {monitor.url}:{monitor.port}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown Menu & Quick Action */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
            onClick={handleCheckNow}
            disabled={isChecking || checkMutation.isPending}
            title="Jetzt prüfen"
          >
            <RefreshCw
              className={`h-4 w-4 ${isChecking || checkMutation.isPending ? 'animate-spin text-emerald-400' : ''}`}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onViewHistory(monitor)}>
                <History className="mr-2 h-4 w-4" />
                Verlauf (20 Checks)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(monitor)}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive}>
                {monitor.active ? 'Pausieren' : 'Aktivieren'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-rose-400 focus:text-rose-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metriken-Leiste */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-y border-zinc-800/60 py-3 text-xs">
        {/* Status */}
        <div>
          <span className="text-zinc-500">Status</span>
          <div className="mt-0.5 flex items-center gap-1.5 font-medium">
            {isInactive ? (
              <span className="text-zinc-400">Inaktiv</span>
            ) : isUp ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Online</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-rose-400">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Latenz */}
        <div>
          <span className="text-zinc-500">Antwortzeit</span>
          <div className="mt-0.5 flex items-center gap-1.5 font-mono font-medium">
            <Activity className="h-3.5 w-3.5 text-zinc-400" />
            {monitor.lastCheck?.responseTimeMs !== null &&
            monitor.lastCheck?.responseTimeMs !== undefined ? (
              <span
                className={
                  monitor.lastCheck.responseTimeMs < 200
                    ? 'text-emerald-400'
                    : monitor.lastCheck.responseTimeMs < 600
                      ? 'text-amber-400'
                      : 'text-rose-400'
                }
              >
                {monitor.lastCheck.responseTimeMs} ms
              </span>
            ) : (
              <span className="text-zinc-500">-</span>
            )}
          </div>
        </div>

        {/* SSL-Zertifikat oder Uptime */}
        <div>
          <span className="text-zinc-500">SSL-Zertifikat</span>
          <div className="mt-0.5 flex items-center gap-1.5 font-medium">
            {monitor.lastCheck?.sslDaysLeft !== null &&
            monitor.lastCheck?.sslDaysLeft !== undefined ? (
              monitor.lastCheck.sslDaysLeft < 14 ? (
                <span className="flex items-center gap-1 text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {monitor.lastCheck.sslDaysLeft} Tage!
                </span>
              ) : monitor.lastCheck.sslDaysLeft < 30 ? (
                <span className="flex items-center gap-1 text-amber-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {monitor.lastCheck.sslDaysLeft} Tage
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {monitor.lastCheck.sslDaysLeft} Tage
                </span>
              )
            ) : (
              <span className="text-zinc-500">n/a</span>
            )}
          </div>
        </div>
      </div>

      {/* 30-Tage Uptime Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Verfügbarkeit (30 Tage)</span>
          <span
            className={`font-semibold ${
              monitor.uptime30d >= 99
                ? 'text-emerald-400'
                : monitor.uptime30d >= 95
                  ? 'text-amber-400'
                  : 'text-rose-400'
            }`}
          >
            {monitor.uptime30d}%
          </span>
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="mt-2 flex items-center gap-[3px]">
            {monitor.daily30d.map((day) => {
              const colorClass =
                day.total === 0
                  ? 'bg-zinc-800/80 hover:bg-zinc-700'
                  : day.pct === 100
                    ? 'bg-emerald-500/80 hover:bg-emerald-400'
                    : day.pct >= 80
                      ? 'bg-amber-500/80 hover:bg-amber-400'
                      : 'bg-rose-500/80 hover:bg-rose-400'

              return (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-6 flex-1 rounded-[2px] transition-all cursor-pointer ${colorClass}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-semibold">{day.date}</p>
                    <p>
                      {day.total > 0
                        ? `${day.pct}% Uptime (${day.up}/${day.total} Checks up)`
                        : 'Keine Prüfungen an diesem Tag'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </TooltipProvider>

        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
          <span>vor 30 Tagen</span>
          <span>Heute</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/40 pt-2.5">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>{formatLastCheckTime(monitor.lastCheck?.checkedAt)}</span>
        </div>
        {monitor.lastCheck?.error && (
          <span className="max-w-[200px] truncate text-rose-400/90 text-[11px]" title={monitor.lastCheck.error}>
            {monitor.lastCheck.error}
          </span>
        )}
      </div>
    </div>
  )
}
