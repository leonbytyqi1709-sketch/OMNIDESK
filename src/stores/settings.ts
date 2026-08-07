import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  /** IDs der im Modul-Manager deaktivierten Module (verschwinden aus der Sidebar) */
  disabledModules: string[]
  /** Kompakt-Modus: reduziert Abstände app-weit für maximale Informationsdichte */
  compactMode: boolean
  toggleModule: (id: string) => void
  setCompactMode: (compact: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      disabledModules: [],
      compactMode: false,

      toggleModule: (id) => {
        const { disabledModules } = get()
        set({
          disabledModules: disabledModules.includes(id)
            ? disabledModules.filter((m) => m !== id)
            : [...disabledModules, id],
        })
      },

      setCompactMode: (compact) => set({ compactMode: compact }),
    }),
    { name: 'omnidesk:settings' },
  ),
)
