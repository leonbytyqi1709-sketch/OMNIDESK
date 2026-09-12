import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'

export interface MailAccountDto {
  id: string
  email: string
  label: string
  avatarUrl: string | null
  provider: 'google'
  hasToken?: boolean
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
  accountId?: string
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
  category?: string
  query?: string
  limit?: number
}) {
  const apiFetch = useApiFetch()
  const searchParams = new URLSearchParams()
  if (params.folder) searchParams.set('folder', params.folder)
  if (params.accountId) searchParams.set('accountId', params.accountId)
  if (params.category) searchParams.set('category', params.category)
  if (params.query) searchParams.set('q', params.query)
  if (params.limit) searchParams.set('limit', params.limit.toString())

  return useQuery({
    queryKey: [
      'mail-messages',
      params.folder,
      params.accountId,
      params.category,
      params.query,
      params.limit,
    ],
    queryFn: () =>
      apiFetch<MailMessageDto[]>(`/api/mail/messages?${searchParams.toString()}`),
  })
}

export function useMailMessage(id: string | null, accountId?: string) {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: ['mail-message', id, accountId],
    queryFn: () =>
      apiFetch<MailMessageDto>(
        `/api/mail/messages/${id}${accountId ? `?accountId=${encodeURIComponent(accountId)}` : ''}`,
      ),
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
      queryClient.invalidateQueries({ queryKey: ['mail-message'] })
    },
  })
}

export function useDeleteMailMessage() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId?: string }) =>
      apiFetch<{ ok: true }>(
        `/api/mail/messages/${id}${accountId ? `?accountId=${encodeURIComponent(accountId)}` : ''}`,
        {
          method: 'DELETE',
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-messages'] })
      queryClient.invalidateQueries({ queryKey: ['mail-message'] })
    },
  })
}
