import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'
import type { WeekAvailability } from '@/db/schema'

/** Booking-Konfiguration, wie sie die API liefert; null solange nicht eingerichtet. */
export interface BookingSettingsDto {
  userId: string
  slug: string
  active: boolean
  slotMinutes: number
  availability: WeekAvailability
  createdAt: string
  updatedAt: string
}

export interface BookingSettingsInput {
  slug: string
  active: boolean
  slotMinutes: number
  availability: WeekAvailability
}

const QUERY_KEY = ['booking-settings'] as const

export function useBookingSettings() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<BookingSettingsDto | null>('/api/booking/settings'),
  })
}

export function useSaveBookingSettings() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BookingSettingsInput) =>
      apiFetch<BookingSettingsDto>('/api/booking/settings', {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
