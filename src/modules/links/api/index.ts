import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'

/** Link, wie ihn die API liefert (Timestamps als ISO-Strings). */
export interface LinkDto {
  id: string
  title: string
  url: string
  category: string | null
  icon: string | null
  createdAt: string
  updatedAt: string
}

export interface LinkInput {
  title: string
  url: string
  category?: string | null
  icon?: string | null
}

const QUERY_KEY = ['links'] as const

export function useLinks() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<LinkDto[]>('/api/links'),
  })
}

function useInvalidateLinks() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })
}

export function useCreateLink() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateLinks()
  return useMutation({
    mutationFn: (input: LinkInput) =>
      apiFetch<LinkDto>('/api/links', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

export function useUpdateLink() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateLinks()
  return useMutation({
    mutationFn: ({ id, ...input }: LinkInput & { id: string }) =>
      apiFetch<LinkDto>(`/api/links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteLink() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateLinks()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/links/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
