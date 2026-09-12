import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'
import type { Subtask, TaskPriority, TaskStatus } from '@/db/schema'

export type { Subtask, TaskPriority, TaskStatus }

/** Aufgabe, wie sie die API liefert (Timestamps als ISO-Strings). */
export interface TaskDto {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  tags?: string[] | null
  subtasks?: Subtask[] | null
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  tags?: string[]
  subtasks?: Subtask[]
}

const QUERY_KEY = ['tasks'] as const

export function useTasks() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<TaskDto[]>('/api/tasks'),
  })
}

function useInvalidateTasks() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })
}

export function useCreateTask() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (input: TaskInput) =>
      apiFetch<TaskDto>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

/** Teil-Update – reicht z.B. für reine Statuswechsel im Kanban. */
export function useUpdateTask() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<TaskInput> & { id: string }) =>
      apiFetch<TaskDto>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  })
}

export function useDeleteTask() {
  const apiFetch = useApiFetch()
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
