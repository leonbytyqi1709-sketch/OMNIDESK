import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'

export interface MailAccountDto {
  id: string
  email: string
  label: string
  avatarUrl: string | null
  provider: 'google'
}

export interface MailMessageDto {
  id: string
  accountId: string
  fromName: string
  fromEmail: string
  toEmail: string
  subject: string
  snippet: string
  bodyHtml: string
  date: string
  isRead: boolean
  isStarred: boolean
  folder: 'inbox' | 'sent' | 'starred' | 'trash'
}

export interface SendMailInput {
  accountId?: string
  toEmail: string
  subject: string
  body: string
}

export interface UpdateMailInput {
  id: string
  isRead?: boolean
  isStarred?: boolean
  folder?: 'inbox' | 'sent' | 'starred' | 'trash'
}

export function useMailAccounts() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: ['mail-accounts'],
    queryFn: () => apiFetch<MailAccountDto[]>('/api/mail/accounts'),
  })
}

export function useMailMessages(params: {
  folder?: string
  accountId?: string
  query?: string
}) {
  const apiFetch = useApiFetch()
  const searchParams = new URLSearchParams()
  if (params.folder) searchParams.set('folder', params.folder)
  if (params.accountId) searchParams.set('accountId', params.accountId)
  if (params.query) searchParams.set('q', params.query)

  return useQuery({
    queryKey: ['mail-messages', params.folder, params.accountId, params.query],
    queryFn: () =>
      apiFetch<MailMessageDto[]>(`/api/mail/messages?${searchParams.toString()}`),
  })
}

export function useMailMessage(id: string | null) {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: ['mail-message', id],
    queryFn: () => apiFetch<MailMessageDto>(`/api/mail/messages/${id}`),
    enabled: Boolean(id),
  })
}

export function useSendMail() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SendMailInput) =>
      apiFetch<MailMessageDto>('/api/mail/send', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-messages'] })
    },
  })
}

export function useUpdateMailMessage() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateMailInput) =>
      apiFetch<MailMessageDto>(`/api/mail/messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-messages'] })
    },
  })
}

export function useDeleteMailMessage() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/mail/messages/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-messages'] })
    },
  })
}
