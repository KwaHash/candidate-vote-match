'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, getMessageTime } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { IoIosArrowBack, IoIosSend } from 'react-icons/io'

const conversations = [
  {
    id: 1,
    with: '道下大樹',
    avatar: '/avatars/向山_淳.jpg',
    lastMessage: '日本の衆議院選挙での投票方法と当日の流れを教えてください。',
  },
  {
    id: 2,
    with: '金沢結衣',
    avatar: '/avatars/金沢_結衣.jpg',
    lastMessage: '日本で投票率を上げるためにはどのような取り組みが有効ですか？',
  }
]

const initialMessages = [
  {
    id: 1,
    from: 'user',
    content: '日本の衆議院選挙での投票方法と当日の流れを教えてください。',
    time: '10:30'
  },
  {
    id: 2,
    from: 'company',
    content: '小選挙区比例代表並立制を採用しています。全体で465議席あり、そのうち289議席が小選挙区制で選出され、176議席が比例代表制で選出されます。小選挙区制では全国を289の選挙区に分け、各選挙区から1名を選出します。比例代表制では、全国を11のブロックに分け、各ブロックで政党に投票し、得票数に応じて議席を配分します。',
    time: '10:35'
  },
]

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1)
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)
  const messagesScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = messagesScrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, selectedConversation])

  const handleConversationClick = (id: number) => {
    setSelectedConversation(id)
    setMessages(initialMessages)
    setNewMessage('')
    setMobileThreadOpen(true)
  }

  const handleSend = () => {
    if (!newMessage.trim()) return
    setNewMessage('')
    setMessages([...messages, { id: messages.length + 1, from: 'user', content: newMessage, time: getMessageTime() }])
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
          <div className='p-6 border-b'>
            <h2 className='text-xl font-semibold'>メッセージ</h2>
          </div>
          <div className='overflow-x-hidden overflow-y-auto h-[calc(100%-4rem)] scrollbar'>
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant='outline'
                onClick={() => handleConversationClick(conversation.id)}
                className={cn('w-full h-auto border-none p-4 flex items-center rounded-none hover:bg-gray-50 hover:text-gray-950',
                  selectedConversation === conversation.id && 'bg-indigo-50')}
              >
                <Image
                  src={conversation.avatar}
                  alt={conversation.with}
                  width={48}
                  height={48}
                  className='w-12 h-12 rounded-full mr-2'
                />
                <div className='flex-1 text-left flex flex-col gap-1 min-w-0'>
                  <div className='w-full truncate'>{conversation.with}</div>
                  <p className='w-full text-xs text-gray-600 truncate'>{conversation.lastMessage}</p>
                </div>
              </Button>
            ))}
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
                  <Image
                    src={conversations.find(c => c.id === selectedConversation)?.avatar || ''}
                    width={48}
                    height={48}
                    alt={conversations.find(c => c.id === selectedConversation)?.with || ''}
                    className='w-10 h-10 rounded-full'
                  />
                  <span className='font-medium'>
                    {conversations.find(c => c.id === selectedConversation)?.with}
                  </span>
                </div>
              </div>
              <div
                ref={messagesScrollRef}
                className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar'
              >
                {messages.map((message) => (
                  <div key={message.id}
                    className={cn('flex', message.from === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn('max-w-[80%] rounded p-4', message.from === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100')}>
                      <p className='mb-2 text-sm'>{message.content}</p>
                      <p className={cn('text-[10px] text-right', message.from === 'user' ? 'text-indigo-200' : 'text-gray-500')}>
                        {message.time}
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