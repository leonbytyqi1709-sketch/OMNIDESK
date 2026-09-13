import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { CreateMonitorInput, UptimeMonitorDto } from '../api'
import { useCreateMonitor, useUpdateMonitor } from '../api'

interface MonitorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingMonitor: UptimeMonitorDto | null
}

export function MonitorFormDialog({
  open,
  onOpenChange,
  editingMonitor,
}: MonitorFormDialogProps) {
  const createMutation = useCreateMonitor()
  const updateMutation = useUpdateMonitor()

  const [name, setName] = useState('')
  const [type, setType] = useState<'http' | 'tcp'>('http')
  const [url, setUrl] = useState('')
  const [port, setPort] = useState<string>('')
  const [expectedStatus, setExpectedStatus] = useState<number>(200)
  const [timeoutMs, setTimeoutMs] = useState<number>(10000)
  const [active, setActive] = useState<boolean>(true)

  useEffect(() => {
    if (editingMonitor) {
      setName(editingMonitor.name)
      setType(editingMonitor.type)
      setUrl(editingMonitor.url)
      setPort(editingMonitor.port ? String(editingMonitor.port) : '')
      setExpectedStatus(editingMonitor.expectedStatus)
      setTimeoutMs(editingMonitor.timeoutMs)
      setActive(editingMonitor.active)
    } else {
      setName('')
      setType('http')
      setUrl('')
      setPort('')
      setExpectedStatus(200)
      setTimeoutMs(10000)
      setActive(true)
    }
  }, [editingMonitor, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Bitte einen Namen angeben')
      return
    }
    if (!url.trim()) {
      toast.error('Bitte eine URL oder einen Host angeben')
      return
    }
    if (type === 'tcp' && (!port || isNaN(Number(port)))) {
      toast.error('Für TCP-Checks ist ein gültiger Port erforderlich')
      return
    }

    const payload: CreateMonitorInput = {
      name: name.trim(),
      type,
      url: url.trim(),
      port: port ? parseInt(port, 10) : null,
      expectedStatus: type === 'http' ? expectedStatus : 200,
      timeoutMs,
      active,
    }

    try {
      if (editingMonitor) {
        await updateMutation.mutateAsync({
          id: editingMonitor.id,
          ...payload,
        })
        toast.success(`Monitor "${name}" aktualisiert`)
      } else {
        await createMutation.mutateAsync(payload)
        toast.success(`Monitor "${name}" angelegt und erster Check gestartet`)
      }
      onOpenChange(false)
    } catch {
      toast.error('Speichern fehlgeschlagen')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingMonitor ? 'Monitor bearbeiten' : 'Neuen Monitor hinzufügen'}
            </DialogTitle>
            <DialogDescription>
              Überwache Webseiten, APIs oder TCP-Ports mit kontinuierlicher
              Verfügbarkeits- und Latenzprüfung.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name / Bezeichnung *</Label>
              <Input
                id="name"
                placeholder="z. B. Produktions-API oder Homelab-DNS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Typ */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="type">Typ</Label>
                <Select
                  value={type}
                  onValueChange={(val: 'http' | 'tcp') => setType(val)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP / HTTPS</SelectItem>
                    <SelectItem value="tcp">TCP-Port</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === 'tcp' ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    min={1}
                    max={65535}
                    placeholder="z. B. 22, 53, 3306"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="grid gap-1.5">
                  <Label htmlFor="status">Erwarteter HTTP-Status</Label>
                  <Input
                    id="status"
                    type="number"
                    min={100}
                    max={599}
                    value={expectedStatus}
                    onChange={(e) => setExpectedStatus(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            {/* URL / Host */}
            <div className="grid gap-1.5">
              <Label htmlFor="url">
                {type === 'http' ? 'URL (HTTP / HTTPS) *' : 'Host / IP-Adresse *'}
              </Label>
              <Input
                id="url"
                placeholder={
                  type === 'http'
                    ? 'https://example.com/api/health'
                    : '192.168.1.10 oder server.local'
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            {/* Timeout & Aktiv */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="grid gap-1.5">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min={1000}
                  max={30000}
                  step={1000}
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3 mt-4">
                <Label htmlFor="active" className="cursor-pointer text-xs">
                  Aktiv prüfen
                </Label>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending} className="bg-gradient-accent text-white">
              {editingMonitor ? 'Speichern' : 'Monitor anlegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
