import { useEffect, useState, type FormEvent } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
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
import type { WeekAvailability } from '@/db/schema'
import {
  useBookingSettings,
  useSaveBookingSettings,
} from '../api/booking'

const WEEKDAYS: { key: keyof WeekAvailability; label: string }[] = [
  { key: 'mon', label: 'Montag' },
  { key: 'tue', label: 'Dienstag' },
  { key: 'wed', label: 'Mittwoch' },
  { key: 'thu', label: 'Donnerstag' },
  { key: 'fri', label: 'Freitag' },
  { key: 'sat', label: 'Samstag' },
  { key: 'sun', label: 'Sonntag' },
]

const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90, 120]

/** Voreinstellung: Mo–Fr 09:00–17:00, Wochenende aus. */
function defaultAvailability(): WeekAvailability {
  const workday = { enabled: true, from: '09:00', to: '17:00' }
  const off = { enabled: false, from: '09:00', to: '17:00' }
  return {
    mon: { ...workday },
    tue: { ...workday },
    wed: { ...workday },
    thu: { ...workday },
    fri: { ...workday },
    sat: { ...off },
    sun: { ...off },
  }
}

interface BookingSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Konfiguration der öffentlichen Buchungsseite (/book/<slug>). */
export function BookingSettingsDialog({
  open,
  onOpenChange,
}: BookingSettingsDialogProps) {
  const { data: settings, isLoading } = useBookingSettings()
  const saveSettings = useSaveBookingSettings()

  const [slug, setSlug] = useState('')
  const [active, setActive] = useState(false)
  const [slotMinutes, setSlotMinutes] = useState(30)
  const [availability, setAvailability] = useState<WeekAvailability>(
    defaultAvailability,
  )
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setSlug(settings?.slug ?? '')
      setActive(settings?.active ?? false)
      setSlotMinutes(settings?.slotMinutes ?? 30)
      setAvailability(settings?.availability ?? defaultAvailability())
      setCopied(false)
    }
  }, [open, settings])

  const publicUrl = `${window.location.origin}/book/${slug || '<slug>'}`

  const copyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const setDay = (
    key: keyof WeekAvailability,
    patch: Partial<WeekAvailability[keyof WeekAvailability]>,
  ) => {
    setAvailability((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    for (const { key, label } of WEEKDAYS) {
      const day = availability[key]
      if (day.enabled && day.from >= day.to) {
        toast.error(`${label}: "Von" muss vor "Bis" liegen.`)
        return
      }
    }
    try {
      await saveSettings.mutateAsync({ slug, active, slotMinutes, availability })
      toast.success('Booking-Einstellungen gespeichert')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Speichern fehlgeschlagen')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Booking einrichten</DialogTitle>
          <DialogDescription>
            Externe können über die öffentliche Seite freie Slots direkt in
            deinen Kalender buchen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Buchungsseite aktiv</p>
              <p className="text-xs text-muted-foreground">
                Nur aktiv ist die Seite öffentlich erreichbar.
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="booking-slug">Slug (öffentlicher URL-Teil)</Label>
            <Input
              id="booking-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="z.B. max-mustermann"
              pattern="[a-z0-9\-]{3,50}"
              title="3–50 Zeichen: a-z, 0-9, Bindestrich"
              required
              disabled={isLoading}
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="truncate font-mono">{publicUrl}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={copyUrl}
                disabled={slug === ''}
                className="size-6 shrink-0"
                aria-label="Öffentliche URL kopieren"
              >
                {copied ? (
                  <Check className="size-3.5 text-green-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
              {settings?.active && settings.slug !== '' && (
                <a
                  href={`/book/${settings.slug}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-foreground shrink-0"
                  aria-label="Buchungsseite öffnen"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Slot-Länge</Label>
            <Select
              value={String(slotMinutes)}
              onValueChange={(v) => setSlotMinutes(Number(v))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SLOT_OPTIONS.map((min) => (
                  <SelectItem key={min} value={String(min)}>
                    {min} Minuten
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Verfügbarkeit</Label>
            <div className="divide-y rounded-md border">
              {WEEKDAYS.map(({ key, label }) => {
                const day = availability[key]
                return (
                  <div key={key} className="flex items-center gap-3 px-3 py-2">
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(enabled) => setDay(key, { enabled })}
                      aria-label={`${label} verfügbar`}
                    />
                    <span className="w-24 text-sm">{label}</span>
                    <Input
                      type="time"
                      value={day.from}
                      onChange={(e) => setDay(key, { from: e.target.value })}
                      disabled={!day.enabled}
                      className="w-28"
                      aria-label={`${label} von`}
                    />
                    <span className="text-muted-foreground text-xs">bis</span>
                    <Input
                      type="time"
                      value={day.to}
                      onChange={(e) => setDay(key, { to: e.target.value })}
                      disabled={!day.enabled}
                      className="w-28"
                      aria-label={`${label} bis`}
                    />
                  </div>
                )
              })}
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
            <Button
              type="submit"
              disabled={saveSettings.isPending || isLoading}
              className="bg-gradient-accent glow text-white"
            >
              {saveSettings.isPending ? 'Speichert…' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
