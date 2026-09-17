import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppearanceTab } from './components/AppearanceTab'
import { GeneralTab } from './components/GeneralTab'
import { IntegrationsTab } from './components/IntegrationsTab'
import { ModulesTab } from './components/ModulesTab'

const TAB_KEY = 'omnidesk:settings-tab'
const VALID_TABS = ['general', 'appearance', 'integrations', 'modules'] as const

export default function SettingsPage() {
  // Aktiven Tab dauerhaft merken, damit ein Reload nicht zu "Allgemein" zurückspringt
  const [tab, setTab] = useState<string>(() => {
    const saved = localStorage.getItem(TAB_KEY)
    return saved && (VALID_TABS as readonly string[]).includes(saved) ? saved : 'general'
  })

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        App-Konfiguration, Datensicherung und Modul-Verwaltung.
      </p>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v)
          localStorage.setItem(TAB_KEY, v)
        }}
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="appearance">Erscheinungsbild</TabsTrigger>
          <TabsTrigger value="integrations">Integrationen</TabsTrigger>
          <TabsTrigger value="modules">Modul-Manager</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="appearance" className="mt-4">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="modules" className="mt-4">
          <ModulesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
