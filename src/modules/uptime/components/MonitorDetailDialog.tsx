import { Activity, CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { UptimeMonitorDto } from '../api'
import { useMonitorChecks } from '../api'

interface MonitorDetailDialogProps {
  monitor: UptimeMonitorDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MonitorDetailDialog({
  monitor,
  open,
  onOpenChange,
}: MonitorDetailDialogProps) {
  const { data: checks = [], isLoading } = useMonitorChecks(monitor?.id ?? null)

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Prüfverlauf: {monitor?.name}</DialogTitle>
            <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
              {monitor?.type}
            </Badge>
          </div>
          <DialogDescription>
            Die letzten {checks.length} Messungen für {monitor?.url}
            {monitor?.port ? `:${monitor.port}` : ''}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            Prüfhistorie wird geladen...
          </div>
        ) : checks.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            Noch keine Prüfungen für diesen Monitor vorhanden.
          </div>
        ) : (
          <ScrollArea className="max-h-[380px] rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-900/80 sticky top-0">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="w-[150px]">Zeitpunkt</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[110px]">Latenz</TableHead>
                  <TableHead className="w-[90px]">Code</TableHead>
                  <TableHead className="w-[110px]">SSL-Restzeit</TableHead>
                  <TableHead>Meldung / Fehler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map((chk) => (
                  <TableRow key={chk.id} className="border-zinc-850">
                    <TableCell className="font-mono text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {formatTimestamp(chk.checkedAt)}
                      </div>
                    </TableCell>

                    <TableCell>
                      {chk.status === 'up' ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          UP
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-rose-400 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          DOWN
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {chk.responseTimeMs !== null ? (
                        <span
                          className={`flex items-center gap-1 ${
                            chk.responseTimeMs < 200
                              ? 'text-emerald-400'
                              : chk.responseTimeMs < 600
                                ? 'text-amber-400'
                                : 'text-rose-400'
                          }`}
                        >
                          <Activity className="h-3 w-3" />
                          {chk.responseTimeMs} ms
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-zinc-300">
                      {chk.statusCode ?? '-'}
                    </TableCell>

                    <TableCell className="text-xs">
                      {chk.sslDaysLeft !== null ? (
                        <span
                          className={`flex items-center gap-1 ${
                            chk.sslDaysLeft < 14
                              ? 'text-rose-400 font-semibold'
                              : chk.sslDaysLeft < 30
                                ? 'text-amber-400'
                                : 'text-zinc-300'
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {chk.sslDaysLeft} d
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-zinc-400 max-w-[200px] truncate">
                      {chk.error ? (
                        <span className="text-rose-400" title={chk.error}>
                          {chk.error}
                        </span>
                      ) : (
                        <span className="text-zinc-500">OK</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
