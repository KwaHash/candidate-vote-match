'use client'

import { Thread } from '@/components/thread'
import { VoteRuntimeProvider } from '@/providers/vote-runtime-provider'

const AIChatPage = () => {
  return (
    <VoteRuntimeProvider>
      <div className='flex w-full h-[calc(100dvh_-_88px)] pr-0.5 overflow-hidden'>
        <div className='absolute inset-0 opacity-[0.04]'
          style={{
            backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
            backgroundSize: '35px 35px'
          }}
        />
        <div className='flex-1 overflow-hidden'>
          <Thread />
        </div>
      </div>
    </VoteRuntimeProvider>
  )
}

export default AIChatPage