import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, SlidersHorizontal, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DashboardCustomizerDialog } from '@/modules/dashboard/components/DashboardCustomizerDialog'
import { useSettingsStore } from '@/stores/settings'

export function AppearanceTab() {
  const { theme, setTheme } = useTheme()
  const compactMode = useSettingsStore((s) => s.compactMode)
  const setCompactMode = useSettingsStore((s) => s.setCompactMode)

  // next-themes liefert das Theme erst nach dem Mount (Hydration-Schutz)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            OmniDesk ist für den Dark Mode gebaut – Light und System stehen
            trotzdem zur Verfügung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mounted && (
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">
                  <Moon className="size-4" /> Dunkel
                </SelectItem>
                <SelectItem value="light">
                  <Sun className="size-4" /> Hell
                </SelectItem>
                <SelectItem value="system">
                  <Monitor className="size-4" /> System
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kompakt-Modus</CardTitle>
          <CardDescription>
            Reduziert Abstände app-weit für maximale Informationsdichte.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="compact-switch" className="text-sm">
            Abstände verringern
          </Label>
          <Switch
            id="compact-switch"
            checked={compactMode}
            onCheckedChange={setCompactMode}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard-Widgets</CardTitle>
          <CardDescription>
            Sichtbarkeit und Anordnung der Widgets auf der Einsatzzentrale anpassen.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Widgets lassen sich direkt auf der Einsatzzentrale per Drag & Drop oder über den Widget-Manager anordnen.
          </p>
          <DashboardCustomizerDialog
            trigger={
              <Button variant="outline" size="sm" className="shrink-0 gap-2">
                <SlidersHorizontal className="size-4" /> Widgets verwalten
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
