import { Suspense, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { useSettingsStore } from '@/stores/settings'
import { MobileHeader } from './MobileHeader'
import { ModuleLoader } from './ModuleLoader'
import { Sidebar } from './Sidebar'

const SIDEBAR_STORAGE_KEY = 'omnidesk:sidebar-collapsed'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1',
  )
  const compactMode = useSettingsStore((s) => s.compactMode)

  useEffect(() => {
    document.documentElement.dataset.compact = compactMode ? 'true' : 'false'
  }, [compactMode])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const toggleSidebar = () => setCollapsed((prev) => !prev)

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop Sidebar (wird unterhalb von md ausgeblendet) */}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

      {/* Mobiler Header mit Hamburger-Menü & Sheet-Drawer */}
      <MobileHeader />

      {/* Hauptinhalt */}
      <main className="min-w-0 flex-1 overflow-x-auto">
        <Suspense fallback={<ModuleLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
