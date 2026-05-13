'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useChatSocket } from '@/hooks/use-chat-socket'
import { fetchConversationMessages, fetchConversations } from '@/lib/chat-api'
import { cn, formatChatTime } from '@/lib/utils'
import type { ChatConversation, ChatMessage } from '@/types/chat'
import { useEffect, useRef, useState } from 'react'
import { IoIosArrowBack, IoIosSend } from 'react-icons/io'

const role = 'candidate' as const

function getPartnerLabel(conversation: ChatConversation) {
  return conversation.assistantName
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const { isReady, error: socketError, joinConversation, sendMessage, subscribe } = useChatSocket(role)

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId) || null

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const nextConversations = await fetchConversations(role)
        setConversations(nextConversations)
        if (nextConversations.length > 0) {
          setSelectedConversationId((current) => current ?? nextConversations[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '会話一覧の取得に失敗しました。')
      } finally {
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }
    }

    void loadConversations()
  }, [])

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setError(null)

      try {
        const { messages: nextMessages } = await fetchConversationMessages(role, selectedConversationId)
        setMessages(nextMessages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'メッセージの取得に失敗しました。')
      }
    }

    void loadMessages()
  }, [selectedConversationId])

  useEffect(() => {
    if (!isReady || !selectedConversationId) {
      return
    }

    joinConversation(selectedConversationId)
  }, [isReady, joinConversation, selectedConversationId])

  useEffect(() => {
    return subscribe((message) => {
      if (message.conversationId !== selectedConversationId) {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  lastMessage: message.content,
                  lastMessageAt: message.createdAt,
                }
              : conversation
          )
        )
        return
      }

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current
        }

        return [...current, message]
      })
    })
  }, [selectedConversationId, subscribe])

  useEffect(() => {
    const el = messagesScrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, selectedConversationId])

  const handleConversationClick = (conversationId: number) => {
    setSelectedConversationId(conversationId)
    setNewMessage('')
    setMobileThreadOpen(true)
  }

  const handleSend = () => {
    if (!selectedConversationId || !newMessage.trim()) {
      return
    }

    sendMessage(selectedConversationId, newMessage.trim())
    setNewMessage('')
  }

  return (
    <div className='bg-white rounded-lg shadow-lg h-[calc(100dvh_-_80px)]'>
      <div className='flex flex-col h-full border border-gray-100 md:flex-row'>
        <div
          className={cn(
            'flex flex-col overflow-x-hidden border-r w-full md:max-w-sm',
            mobileThreadOpen && 'max-md:hidden'
          )}
        >
          <div className='p-6 border-b space-y-4'>
            <h2 className='text-xl font-semibold'>メッセージ</h2>
            {(error || socketError) && (
              <p className='text-sm text-red-600'>{error || socketError}</p>
            )}
          </div>
          <div className='overflow-x-hidden overflow-y-auto h-[calc(100%-8rem)] scrollbar'>
            {isLoading ? (
              <div className='p-4 space-y-4'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <Skeleton className='h-12 w-12 shrink-0 rounded-full' />
                    <div className='flex-1 space-y-2 min-w-0'>
                      <Skeleton className='h-4 w-[55%]' />
                      <Skeleton className='h-3 w-full max-w-[85%]' />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className='p-4 text-sm text-gray-500'>会話がありません。</p>
            ) : (
              conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant='outline'
                  onClick={() => handleConversationClick(conversation.id)}
                  className={cn(
                    'w-full h-auto border-none p-4 flex items-center rounded-none hover:bg-gray-50 hover:text-gray-950',
                    selectedConversationId === conversation.id && 'bg-indigo-50'
                  )}
                >
                  <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 mr-2'>
                    {getPartnerLabel(conversation).slice(0, 1).toUpperCase()}
                  </div>
                  <div className='flex-1 text-left flex flex-col gap-1 min-w-0'>
                    <div className='w-full truncate'>{getPartnerLabel(conversation)}</div>
                    <p className='w-full text-xs text-gray-600 truncate'>
                      {conversation.lastMessage || 'まだメッセージはありません'}
                    </p>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex min-h-0 flex-col overflow-x-hidden overflow-y-auto grow',
            !mobileThreadOpen && 'max-md:hidden'
          )}
        >
          {selectedConversation ? (
            <>
              <div className='p-4 border-b'>
                <div className='flex items-center gap-4'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='shrink-0 rounded-none md:hidden'
                    onClick={() => setMobileThreadOpen(false)}
                    aria-label='会話一覧に戻る'
                  >
                    <IoIosArrowBack className='h-6 w-6' />
                  </Button>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700'>
                    {getPartnerLabel(selectedConversation).slice(0, 1).toUpperCase()}
                  </div>
                  <span className='font-medium'>{getPartnerLabel(selectedConversation)}</span>
                </div>
              </div>
              <div
                ref={messagesScrollRef}
                className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar'
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn('flex', message.senderRole === role ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded p-4',
                        message.senderRole === role ? 'bg-indigo-600 text-white' : 'bg-gray-100'
                      )}
                    >
                      <p className='mb-2 text-sm'>{message.content}</p>
                      <p
                        className={cn(
                          'text-[10px] text-right',
                          message.senderRole === role ? 'text-indigo-200' : 'text-gray-500'
                        )}
                      >
                        {formatChatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className='p-4 border-t'>
                <div className='flex gap-4'>
                  <Input
                    type='text'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder='メッセージを入力...'
                    className='flex-1 px-4 py-2 border rounded-none'
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!isReady}
                    className='w-auto h-auto bg-indigo-600 text-white px-3 rounded hover:bg-indigo-700 transition-all duration-300'
                  >
                    <IoIosSend className='w-5 h-5' />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className='flex-1 flex items-center justify-center text-gray-500'>
              会話を選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesPage
