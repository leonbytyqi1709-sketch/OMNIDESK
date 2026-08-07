import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
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
    </div>
  )
}
