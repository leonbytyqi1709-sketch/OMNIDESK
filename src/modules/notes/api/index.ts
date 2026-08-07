import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'

/** Notiz, wie sie die API liefert (Timestamps als ISO-Strings). */
export interface NoteDto {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface NoteInput {
  title: string
  content: string
}

const QUERY_KEY = ['notes'] as const

export function useNotes() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<NoteDto[]>('/api/notes'),
  })
}

function useInvalidateNotes() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })
}

export function useCreateNote() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateNotes()
  return useMutation({
    mutationFn: () => apiFetch<NoteDto>('/api/notes', { method: 'POST' }),
    onSuccess: invalidate,
  })
}

export function useUpdateNote() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateNotes()
  return useMutation({
    mutationFn: ({ id, ...input }: NoteInput & { id: string }) =>
      apiFetch<NoteDto>(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteNote() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateNotes()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/notes/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
