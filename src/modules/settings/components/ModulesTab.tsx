import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { moduleRegistry } from '@/config/modules'
import { useSettingsStore } from '@/stores/settings'

/** Modul-Manager: ungenutzte Tools aus der Sidebar ausblenden (Spec, Abschnitt 4). */
export function ModulesTab() {
  const disabledModules = useSettingsStore((s) => s.disabledModules)
  const toggleModule = useSettingsStore((s) => s.toggleModule)

  const toggleable = moduleRegistry.filter((m) => m.toggleable)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modul-Manager</CardTitle>
        <CardDescription>
          Deaktivierte Module verschwinden aus der Sidebar und werden nicht
          geladen – das spart Client-Ressourcen. Dashboard und Einstellungen
          sind fest verankert.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {toggleable.map((module) => {
          const enabled = !disabledModules.includes(module.id)
          return (
            <div
              key={module.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <Label
                htmlFor={`module-${module.id}`}
                className="flex items-center gap-3"
              >
                <module.icon className="size-4 text-muted-foreground" />
                {module.title}
              </Label>
              <Switch
                id={`module-${module.id}`}
                checked={enabled}
                onCheckedChange={() => toggleModule(module.id)}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
