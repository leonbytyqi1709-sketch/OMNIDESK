import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'
import type { VaultCategory, VaultEntryData } from '../constants'

/** Vault-Metadaten (Salt + Verifier); null solange kein Vault existiert. */
export interface VaultMetaDto {
  userId: string
  salt: string
  verifier: string
  createdAt: string
}

/** Eintrag, wie ihn die API liefert – ausschließlich Ciphertext. */
export interface VaultEntryDto {
  id: string
  category: VaultCategory
  ciphertext: string
  iv: string
  createdAt: string
  updatedAt: string
}

export interface VaultEntryInput {
  category: VaultCategory
  ciphertext: string
  iv: string
}

/** Entschlüsselter Eintrag für die UI: DB-Zeile + Klartext. */
export interface DecryptedEntry {
  row: VaultEntryDto
  data: VaultEntryData
}

const META_KEY = ['vault', 'meta'] as const
const ENTRIES_KEY = ['vault', 'entries'] as const

export function useVaultMeta() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: META_KEY,
    queryFn: () => apiFetch<VaultMetaDto | null>('/api/vault/meta'),
  })
}

export function useCreateVaultMeta() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { salt: string; verifier: string }) =>
      apiFetch<VaultMetaDto>('/api/vault/meta', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: META_KEY }),
  })
}

export function useVaultEntries() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: ENTRIES_KEY,
    queryFn: () => apiFetch<VaultEntryDto[]>('/api/vault/entries'),
  })
}

function useInvalidateEntries() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ENTRIES_KEY })
}

export function useCreateVaultEntry() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateEntries()
  return useMutation({
    mutationFn: (input: VaultEntryInput) =>
      apiFetch<VaultEntryDto>('/api/vault/entries', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

export function useUpdateVaultEntry() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateEntries()
  return useMutation({
    mutationFn: ({ id, ...input }: VaultEntryInput & { id: string }) =>
      apiFetch<VaultEntryDto>(`/api/vault/entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteVaultEntry() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateEntries()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/vault/entries/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
