import { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'
import { WidgetCard } from './WidgetCard'

interface ZoneMeta {
  city: string
  label: string
  timeZone: string
  flag: string
}

const ZONES: ZoneMeta[] = [
  { city: 'Berlin', label: 'Lokal (MEZ/MESZ)', timeZone: 'Europe/Berlin', flag: '🇩🇪' },
  { city: 'UTC', label: 'Serverzeit', timeZone: 'UTC', flag: '🌐' },
  { city: 'New York', label: 'US East (EST/EDT)', timeZone: 'America/New_York', flag: '🇺🇸' },
  { city: 'Tokio', label: 'Japan (JST)', timeZone: 'Asia/Tokyo', flag: '🇯🇵' },
]

/** Bento-Widget: IT-Weltuhr & Server-Zeitzonen für Remote & Ops. */
export function TimezonesWidget() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <WidgetCard title="IT-Weltuhr & Zeitzonen" icon={Globe}>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {ZONES.map((z) => {
          const timeStr = now.toLocaleTimeString('de-DE', {
            timeZone: z.timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          const dateStr = now.toLocaleDateString('de-DE', {
            timeZone: z.timeZone,
            weekday: 'short',
          })

          return (
            <div
              key={z.city}
              className="flex flex-col justify-between rounded-md border border-border/40 bg-secondary/20 p-2"
            >
              <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <span>{z.flag}</span>
                  <span>{z.city}</span>
                </span>
                <span>{dateStr}</span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold tracking-wider text-foreground">
                {timeStr}
              </div>
              <span className="text-[9px] text-muted-foreground truncate">
                {z.label}
              </span>
            </div>
          )
        })}
      </div>
    </WidgetCard>
  )
}
