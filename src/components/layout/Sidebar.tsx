import { NavLink, useLocation } from 'react-router'
import { UserButton, useUser } from '@clerk/clerk-react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { moduleRegistry, type ModuleDefinition } from '@/config/modules'
import { useSettingsStore } from '@/stores/settings'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

/** Sidebar-Gruppen in Anzeigereihenfolge; Settings hängt fest im Footer. */
const groups: Array<{ label: string | null; category: ModuleDefinition['category'] }> = [
  { label: null, category: 'core' },
  { label: 'Produktivität', category: 'productivity' },
  { label: 'IT-Tools', category: 'it-tools' },
  { label: 'Sicherheit', category: 'security' },
  { label: 'Cloud', category: 'cloud' },
]

function SidebarLink({
  module,
  collapsed,
}: {
  module: ModuleDefinition
  collapsed: boolean
}) {
  const { pathname } = useLocation()
  // Aktiv-Zustand selbst berechnen und als fertigen String übergeben:
  // eine className-Funktion würde von Radix' TooltipTrigger (asChild)
  // beim Prop-Merging zu einem String koerziert und ginge verloren.
  const isActive =
    module.path === '/' ? pathname === '/' : pathname.startsWith(module.path)

  const link = (
    <NavLink
      to={module.path}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-gradient-accent glow text-white'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center px-2',
      )}
    >
      <module.icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{module.title}</span>}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{module.title}</TooltipContent>
    </Tooltip>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const settingsModule = moduleRegistry.find((m) => m.id === 'settings')!
  const disabledModules = useSettingsStore((s) => s.disabledModules)
  const { user } = useUser()
  const displayName =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    'Unbekannt'

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          'sticky top-0 flex h-screen shrink-0 flex-col border-r bg-card transition-[width] duration-200',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Kopf: Logo + Einklapp-Schalter */}
        <div
          className={cn(
            'flex h-14 items-center border-b px-3',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!collapsed && (
            <span className="text-gradient-accent px-1 text-lg font-bold tracking-tight">
              OmniDesk
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label={collapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        {/* Modul-Navigation (aus der zentralen Registry) */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
          {groups.map((group) => {
            const modules = moduleRegistry.filter(
              (m) =>
                m.category === group.category &&
                m.id !== 'settings' &&
                !disabledModules.includes(m.id),
            )
            if (modules.length === 0) return null
            return (
              <div key={group.category} className="space-y-1">
                {group.label && !collapsed && (
                  <p className="px-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {group.label}
                  </p>
                )}
                {modules.map((m) => (
                  <SidebarLink key={m.id} module={m} collapsed={collapsed} />
                ))}
              </div>
            )
          })}
        </nav>

        {/* Fest verankerter Footer: Benutzerprofil + Einstellungen (Spec, Abschnitt 3) */}
        <div className="border-t p-2">
          <div
            className={cn(
              'flex items-center gap-2',
              collapsed && 'flex-col',
            )}
          >
            <div
              className={cn(
                'flex flex-1 items-center gap-2 rounded-md px-2 py-1.5',
                collapsed && 'flex-none px-0',
              )}
            >
              {/* Clerk-Benutzermenü: Profil verwalten, Abmelden */}
              <UserButton
                appearance={{
                  elements: { avatarBox: 'size-7' },
                }}
              />
              {!collapsed && (
                <span className="truncate text-sm text-muted-foreground">
                  {displayName}
                </span>
              )}
            </div>
            {collapsed && <Separator className="my-1" />}
            <SidebarLink module={settingsModule} collapsed={collapsed} />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
