import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'

/** Kontakt, wie ihn die API liefert (Timestamps als ISO-Strings). */
export interface ContactDto {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ContactInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  notes: string
}

const QUERY_KEY = ['contacts'] as const

export function useContacts() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<ContactDto[]>('/api/contacts'),
  })
}

function useInvalidateContacts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })
}

export function useCreateContact() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateContacts()
  return useMutation({
    mutationFn: (input: ContactInput) =>
      apiFetch<ContactDto>('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

export function useUpdateContact() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateContacts()
  return useMutation({
    mutationFn: ({ id, ...input }: ContactInput & { id: string }) =>
      apiFetch<ContactDto>(`/api/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteContact() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateContacts()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/contacts/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
