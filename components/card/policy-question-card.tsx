'use client'

import { cn } from '@/lib/utils'
import { FaCheck } from 'react-icons/fa'

export type PolicyOption = {
  value: string
  label: string
}

type PolicyQuestionCardProps = {
  question: string
  options: PolicyOption[]
  selectedValue?: string | null
  className?: string
}

export function PolicyQuestionCard({
  question,
  options,
  selectedValue = null,
  className
}: PolicyQuestionCardProps) {
  return (
    <div className={cn('rounded-sm border border-border bg-card overflow-hidden', className)}>
      <div className='bg-muted px-4 py-3 border-b border-border'>
        <p className='font-bold text-foreground text-base leading-relaxed'>
          <span className='text-foreground'>Q.</span> {question}
        </p>
      </div>

      <ul className='bg-card px-4 py-3 space-y-2'>
        {options.map((option) => {
          const isSelected = selectedValue === option.value
          return (
            <li key={option.value} className='flex items-center gap-3'>
              <span
                className={cn('flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSelected ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground/30'
                )}
              >
                {isSelected && (
                  <FaCheck className='h-3 w-3 text-primary-foreground stroke-[3]' />
                )}
              </span>
              <span className={cn('text-sm leading-relaxed', isSelected ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                {option.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}