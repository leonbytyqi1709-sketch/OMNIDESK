import { create } from 'zustand'

interface VaultState {
  /** AES-Schlüssel des entsperrten Vaults – existiert NUR im RAM. */
  key: CryptoKey | null
  unlock: (key: CryptoKey) => void
  lock: () => void
}

/**
 * Bewusst NICHT persistiert: Ein Seiten-Reload sperrt den Vault wieder.
 * Der CryptoKey ist zusätzlich nicht extrahierbar (siehe src/lib/crypto.ts).
 */
export const useVaultStore = create<VaultState>((set) => ({
  key: null,
  unlock: (key) => set({ key }),
  lock: () => set({ key: null }),
}))
