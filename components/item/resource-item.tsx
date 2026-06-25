'use client'

import { Button } from '@/components/ui/button'
import { createConversation } from '@/lib/chat-api'
import { cn } from '@/lib/utils'
import { ISupportResource } from '@/types/support-resource'
import { useRouter } from 'next/navigation'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'

interface IResourceItem {
  resource: ISupportResource
}

function providerTypeBadgeClass(providerType: string): string {
  switch (providerType) {
    case '個人':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-300 ease-in-out'
    case '法人':
      return 'bg-green-600 text-white hover:bg-green-600/90 transition-colors duration-300 ease-in-out'
    case '団体':
      return 'bg-yellow-500 text-white hover:bg-yellow-500/90 transition-colors duration-300 ease-in-out'
    case '自治体':
      return 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 ease-in-out'
    default:
      return 'bg-muted text-muted-foreground hover:bg-muted/90 transition-colors duration-300 ease-in-out'
  }
}

function priceTypeBadgeClass(priceType: string): string {
  switch (priceType) {
    case '無料':
      return 'bg-muted text-muted-foreground'
    case '有料':
      return 'bg-red-100 text-red-600'
    case '要相談':
      return 'bg-green-100 text-green-600'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

const ResourceItem = ({ resource }: IResourceItem) => {
  const router = useRouter()

  const {
    provider_type,
    provider_name,
    contact_email,
    contact_phone,
    prefecture,
    municipality,
    content,
    price_type,
    availability,
    coverage_area,
  } = resource

  const location = [prefecture, municipality].filter(Boolean).join(' ')
  const handleCreateConversation = async () => {
    await createConversation('candidate', resource.assistant_id)
    router.push('/messages')
  }

  return (
    <div className='w-full flex flex-col sm:flex-row border border-border bg-card text-card-foreground shadow-sm'>
      <div className='flex flex-col gap-2 justify-center items-center w-20 border-r shrink-0'>
        <span className={cn('px-2 py-1 rounded text-[13px] font-medium', providerTypeBadgeClass(provider_type))}>
          {provider_type}
        </span>
        <span className={cn('text-[13px] px-2 py-1 rounded', priceTypeBadgeClass(price_type))}>
          {price_type}
        </span>
      </div>

      <div className='flex-1 flex flex-col lg:flex-row min-w-0 gap-4 relative'>
        <div className='flex-1 p-5 min-w-0 border-border'>
          <div className='flex flex-wrap items-center justify-between gap-2 mb-2'>
            <h3 className='flex items-center text-lg sm:text-xl font-semibold mb-2 leading-snug'>
              {provider_name}
              <span className='ml-4 text-[13px] bg-blue-100 text-blue-600 px-2 rounded'>{availability}</span>
            </h3>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed break-words whitespace-pre-line'>{content}</p>
          <div className='flex flex-wrap gap-2 mt-3'>
            {coverage_area?.map((area) => (
              <span key={area} className='bg-muted text-muted-foreground px-2 py-1 rounded text-[13px] border'>
                {area}
              </span>
            ))}
          </div>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground'>
            {location && (
              <span className='inline-flex items-center gap-1.5 min-w-0'>
                <FiMapPin className='w-4 h-4 shrink-0' aria-hidden />
                <span className='truncate'>{location}</span>
              </span>
            )}
            {contact_email && (
              <span className='inline-flex items-center gap-1.5 min-w-0'>
                <FiMail className='w-4 h-4 shrink-0' aria-hidden />
                <span className='truncate'>{contact_email}</span>
              </span>
            )}
            {contact_phone && (
              <span className='inline-flex items-center gap-1.5'>
                <FiPhone className='w-4 h-4 shrink-0' aria-hidden />
                {contact_phone}
              </span>
            )}
          </div>
        </div>
        <Button onClick={handleCreateConversation}
          className='absolute top-4 right-6 w-auto h-auto p-0 rounded-none border-none shadow-none hover:text-black hover:bg-transparent' variant='outline'
        >
          <IoChatbubbleEllipsesOutline className='!w-6 !h-6 shrink-0' />
        </Button>
      </div>
    </div>
  )
}

export default ResourceItem
