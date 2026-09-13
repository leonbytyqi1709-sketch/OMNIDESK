import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'

export interface UptimeCheckDto {
  id: string
  monitorId: string
  status: 'up' | 'down'
  responseTimeMs: number | null
  statusCode: number | null
  sslDaysLeft: number | null
  error: string | null
  checkedAt: string
}

export interface DailyUptimeBucket {
  date: string
  up: number
  total: number
  pct: number
}

export interface UptimeMonitorDto {
  id: string
  userId: string
  name: string
  type: 'http' | 'tcp'
  url: string
  port: number | null
  expectedStatus: number
  timeoutMs: number
  active: boolean
  createdAt: string
  updatedAt: string
  lastCheck: UptimeCheckDto | null
  uptime30d: number
  daily30d: DailyUptimeBucket[]
  totalChecks: number
}

export interface CreateMonitorInput {
  name: string
  type: 'http' | 'tcp'
  url: string
  port?: number | null
  expectedStatus?: number
  timeoutMs?: number
  active?: boolean
}

export interface UpdateMonitorInput extends Partial<CreateMonitorInput> {}

export const UPTIME_QUERY_KEY = ['uptime-monitors'] as const

export function useUptimeMonitors() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: UPTIME_QUERY_KEY,
    queryFn: () => apiFetch<UptimeMonitorDto[]>('/api/uptime'),
    refetchInterval: 60_000,
  })
}

export function useCreateMonitor() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMonitorInput) =>
      apiFetch<UptimeMonitorDto>('/api/uptime', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPTIME_QUERY_KEY })
    },
  })
}

export function useUpdateMonitor() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateMonitorInput & { id: string }) =>
      apiFetch<UptimeMonitorDto>(`/api/uptime/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPTIME_QUERY_KEY })
    },
  })
}

export function useDeleteMonitor() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: true }>(`/api/uptime/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPTIME_QUERY_KEY })
    },
  })
}

export function useRefreshAllMonitors() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<{ success: true }>('/api/uptime/refresh-all', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPTIME_QUERY_KEY })
    },
  })
}

export function useCheckSingleMonitor() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<UptimeCheckDto>(`/api/uptime/${id}/check`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPTIME_QUERY_KEY })
    },
  })
}

export function useMonitorChecks(monitorId: string | null) {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: ['uptime-checks', monitorId],
    queryFn: () =>
      monitorId
        ? apiFetch<UptimeCheckDto[]>(`/api/uptime/${monitorId}/checks`)
        : Promise.resolve([]),
    enabled: !!monitorId,
    refetchInterval: 30_000,
  })
}
