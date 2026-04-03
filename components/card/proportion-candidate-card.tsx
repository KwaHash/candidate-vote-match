import { TableCell, TableRow } from '@/components/ui/table'
import { WEBSITE_ICONS } from '@/constants/icons'
import { getAgeFromBirthDate, getWebsiteLinks } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import Image from 'next/image'
import Link from 'next/link'

export const ProportionCandidateCard = (politician: IPolitician) => {
  const links = getWebsiteLinks(politician.website)
  return (
    <TableRow
      className='hover:bg-gray-100 transition-all duration-300'
    >
      <TableCell className='border border-gray-300 text-center p-0.5'>
      {politician.vote_result === 2 ? (
          <span className='bg-green-500 text-white px-1.5 py-[3px] rounded-full'>当</span>
        ) : politician.vote_result === 1 ? (
          <span className='text-green-500 border border-green-500 px-1.5 py-[3px] rounded-full'>小</span>
        ) : null}
      </TableCell>
      <TableCell className='border border-gray-300 text-center p-0.5'>{politician.rank}</TableCell>
      <TableCell className='border border-gray-300 text-center p-1.5'>
        <Link href={`/politicians/${politician.id}`} className='hover:opacity-90 transition-opacity duration-300'>
          <div className='w-full h-40 relative overflow-hidden'>
            <Image
              src={politician.avatar || ''}
              alt={politician.kanji_name}
              fill
              className='object-cover'
            />
          </div>
        </Link>
      </TableCell>
      <TableCell className='border border-gray-300 text-center leading-8 p-0 relative'>
        <Link href={`/politicians/${politician.id}`}
          className='absolute inset-0 flex flex-col items-center justify-center px-2 hover:opacity-90 transition-opacity duration-300'
        >
          <p className='text-lg font-bold'>{politician.kanji_name}</p>
          <p className='text-sm mb-2'>{politician.hiragana_name}</p>
          <span className='text-sm font-normal'>({getAgeFromBirthDate(politician.birth_date)})</span>
        </Link>
      </TableCell>
      <TableCell className='border border-gray-300 text-center'>
        {politician.party || '—'}
      </TableCell>
      <TableCell className='border border-gray-300 text-center'>
        {politician.vote_count ? politician.vote_count.toLocaleString() + '票' : '—'}
      </TableCell>
      <TableCell className='border border-gray-300 text-center p-0.5'>
        {politician.shin || '—'}
      </TableCell>
      <TableCell className='border border-gray-300 text-center p-0.5'>
        {politician.shu_count}
      </TableCell>
      <TableCell className='border border-gray-300 text-center p-0.5'>
        {politician.district ? politician.district : '—'}
      </TableCell>
      <TableCell className='border border-gray-300 text-center'>
      <div className='flex flex-wrap items-center gap-2'>
          {links.map((item) => {
            const label = item.label?.toLowerCase() ?? ''
            const icon = WEBSITE_ICONS[label]
            if (!icon) return null
            return (
              <Link
                key={item.url}
                href={item.url}
                target='_blank'
                rel='noopener noreferrer'
                onClick={(e) => e.stopPropagation()}
                className='hover:opacity-80 transition-opacity'
              >
                {icon}
              </Link>
            )
          })}
        </div>
      </TableCell>
    </TableRow>
  )
}

