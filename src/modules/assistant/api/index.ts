import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiFetch } from '@/hooks/use-api'

export interface ChatSessionDto {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessageDto {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}
export interface ChatUsageRatelimit {
  remainingRequests: number | null
  remainingTokens: number | null
  resetRequests: string | null
  resetTokens: string | null
}

export interface ChatUsage {
  promptTokens: number | null
  completionTokens: number | null
  totalTokens: number | null
  ratelimit: ChatUsageRatelimit | null
}

export interface SendMessageResult {
  userMessage: ChatMessageDto
  assistantMessage: ChatMessageDto
  usage?: ChatUsage | null
}


const CHAT_SESSIONS_KEY = ['chat-sessions'] as const

export function useChatSessions() {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: CHAT_SESSIONS_KEY,
    queryFn: () => apiFetch<ChatSessionDto[]>('/api/chat/sessions'),
  })
}

export function useCreateSession() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title?: string | void) =>
      apiFetch<ChatSessionDto>('/api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ title: title || undefined }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
    },
  })
}

export function useUpdateSession() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiFetch<ChatSessionDto>(`/api/chat/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
    },
  })
}

export function useDeleteSession() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: true }>(`/api/chat/sessions/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
    },
  })
}

export function useChatMessages(sessionId: string | null) {
  const apiFetch = useApiFetch()
  return useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: () =>
      sessionId
        ? apiFetch<ChatMessageDto[]>(`/api/chat/sessions/${sessionId}/messages`)
        : Promise.resolve([]),
    enabled: !!sessionId,
  })
}

export function useSendMessage() {
  const apiFetch = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation({
    // sessionId wird bei jedem Aufruf mitgegeben (nicht beim Hook-Setup!),
    // damit die erste Nachricht eines frisch angelegten Chats nicht an eine
    // veraltete/leere Session-URL geschickt wird (früherer "Zweimal-senden"-Bug).
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      apiFetch<SendMessageResult>(
        `/api/chat/sessions/${sessionId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ content }),
        },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', variables.sessionId],
      })
      queryClient.invalidateQueries({ queryKey: CHAT_SESSIONS_KEY })
    },
  })
}
