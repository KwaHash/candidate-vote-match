'use client'

import { Thread } from '@/components/thread'
import { VoteRuntimeProvider } from '@/providers/vote-runtime-provider'

const AIChatPage = () => {
  return (
    <VoteRuntimeProvider>
      <div className='flex w-full h-[calc(100dvh_-_88px)] pr-0.5 overflow-hidden'>
        <div className='flex-1 overflow-hidden'>
          <Thread />
        </div>
      </div>
    </VoteRuntimeProvider>
  )
}

export default AIChatPage