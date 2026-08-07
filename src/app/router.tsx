import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { moduleRegistry } from '@/config/modules'

/**
 * Alle Modul-Routen entstehen aus der zentralen Registry.
 * Die Komponenten sind React.lazy-Einträge – der Code eines Moduls wird
 * erst beim ersten Aufruf seiner Route geladen (Suspense im AppLayout).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {moduleRegistry.map((m) => (
            <Route key={m.id} path={m.path} element={<m.component />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
