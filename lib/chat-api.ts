import type { ChatConversation, ChatMessage, ChatRole } from '@/types/chat'

const chatApiBaseUrl = process.env.NEXT_PUBLIC_CHAT_API_URL!

function getAccessToken() {
  const tokenData = localStorage.getItem('jwt-token')
  if (!tokenData) {
    throw new Error('認証情報が見つかりません。')
  }

  const { access_token } = JSON.parse(tokenData) as { access_token?: string }
  if (!access_token) {
    throw new Error('認証情報が見つかりません。')
  }

  return access_token
}

async function chatRequest<T>(path: string, role: ChatRole, init?: RequestInit): Promise<T> {
  const accessToken = getAccessToken()
  const response = await fetch(`${chatApiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'チャット API の呼び出しに失敗しました。')
  }

  return data as T
}

export async function fetchConversations(role: ChatRole) {
  const data = await chatRequest<{ conversations: ChatConversation[] }>(
    `/socket/conversations?role=${role}`,
    role
  )
  return data.conversations
}

export async function createConversation(role: ChatRole, participantId: number) {
  const data = await chatRequest<{ conversation: ChatConversation }>(
    `/socket/conversations?role=${role}`,
    role,
    {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    }
  )
  return data.conversation
}

export async function fetchConversationMessages(role: ChatRole, conversationId: number) {
  const data = await chatRequest<{ conversation: ChatConversation; messages: ChatMessage[] }>(
    `/socket/conversations/${conversationId}/messages?role=${role}`,
    role
  )
  return data
}
