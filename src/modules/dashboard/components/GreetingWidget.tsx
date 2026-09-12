import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function greeting(hour: number) {
  if (hour < 5) return 'Gute Nacht'
  if (hour < 11) return 'Guten Morgen'
  if (hour < 18) return 'Guten Tag'
  return 'Guten Abend'
}

/** Begrüßung mit Live-Uhr – der „Hero“ des Bento-Grids. */
export function GreetingWidget({ className }: { className?: string }) {
  const { user } = useUser()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const name = user?.firstName ?? user?.username ?? ''

  return (
    <Card
      className={cn(
        'relative justify-center overflow-hidden h-full glass-card border-primary/25 shadow-lg shadow-primary/5',
        className,
      )}
    >
      {/* Dezente Gradient-Auras im Hintergrund */}
      <div
        aria-hidden
        className="bg-gradient-accent absolute -top-16 -right-16 size-80 rounded-full opacity-25 blur-3xl"
      />
      <div
        aria-hidden
        className="bg-gradient-accent absolute -bottom-24 -left-24 size-64 rounded-full opacity-15 blur-3xl"
      />
      <CardContent className="relative">
        <p className="text-sm text-muted-foreground">
          {now.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {greeting(now.getHours())}
          {name ? (
            <>
              , <span className="text-gradient-accent">{name}</span>
            </>
          ) : null}
        </h1>
        <p className="mt-4 font-mono text-5xl font-semibold tabular-nums">
          {now.toLocaleTimeString('de-DE')}
        </p>
      </CardContent>
    </Card>
  )
}
