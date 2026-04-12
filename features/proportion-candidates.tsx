'use client'

import { ProportionCandidateCard } from '@/components/card/proportion-candidate-card'
import LoadingIndicator from '@/components/loading-indicator'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { blocks } from '@/constants/areas'
import { parties } from '@/constants/parties'
import { selectedProportionalDescription } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import { Fragment, useEffect, useState } from 'react'
import { FaChevronRight } from 'react-icons/fa6'
import { HiMiniUserGroup } from 'react-icons/hi2'
import { PiMapPinAreaFill } from 'react-icons/pi'

const ProportionCandidatesPage = () => {
  const [filterProportional, setFilterProportional] = useState<string>('北海道')
  const [filterParty, setFilterParty] = useState('全て政党')
  const [allPoliticians, setAllPoliticians] = useState<IPolitician[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPoliticians = async () => {
      setIsLoading(true)
      try {
        const { data: { politicians } } = await axios.get('/api/candidates/proportion', {
          params: { proportional: filterProportional, party: filterParty }
        })
        setAllPoliticians(politicians)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const _error = err.response?.data?.error
        }
      }
      setIsLoading(false)
    }
    fetchPoliticians()
  }, [filterProportional, filterParty])

  const partyOrder = parties.filter((p) => p.value !== '全て政党').map((p) => p.value)
  const byParty = filterParty === '全て政党'
    ? (() => {
        const map = new Map<string, IPolitician[]>()
        for (const p of allPoliticians) {
          const key = p.party || '—'
          if (!map.has(key)) map.set(key, [])
          map.get(key)!.push(p)
        }
        const result: { party: string; politicians: IPolitician[] }[] = []
        for (const partyValue of partyOrder) {
          const list = map.get(partyValue)
          if (list?.length) result.push({ party: partyValue, politicians: list })
        }
        Array.from(map.entries()).forEach(([party, list]) => {
          if (!partyOrder.includes(party)) result.push({ party, politicians: list })
        })
        return result
      })()
    : null

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Hero */}
      <section className='relative bg-white'>
        <div className='absolute inset-0 bg-gradient-to-r from-green-600 to-green-600/85' />
        <div className='relative max-w-7xl mx-auto px-4 py-24'>
          <div className='text-center'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold leading-normal tracking-tight text-white'>第51回衆議院議員選挙(比例代表)</h1>
            <p className='mt-6 text-base sm:text-lg md:text-xl !leading-8 sm:!leading-10 text-gray-100'>公示日: 	2026年01月27日、 投票日: 2026年02月08日</p>
          </div>
        </div>
        <div className='absolute bottom-0 left-0 right-0'>
          <svg
            className='w-full h-16 text-white transform rotate-180'
            fill='currentColor'
            viewBox='0 0 1200 120'
            preserveAspectRatio='none'
          >
            <path d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' />
          </svg>
        </div>
      </section>

      {/* Search & Filter */}
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-8 bg-background/50 backdrop-blur-sm border-b'>
        <div className='flex flex-col sm:flex-row flex-wrap gap-4 justify-between'>
          <div className='flex items-center gap-2'>
            <Label className='font-normal w-12'>地域</Label>
            <Select value={filterProportional} onValueChange={setFilterProportional}>
              <SelectTrigger className='flex-1 sm:w-[300px] rounded-none flex items-center'>
                <PiMapPinAreaFill className='h-5 w-5 mr-3 text-muted-foreground' />
                <SelectValue placeholder='地域' />
              </SelectTrigger>
              <SelectContent>
                {blocks.map((block) => (
                  <SelectItem key={block.id} value={block.value}>
                    {block.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <Label className='font-normal w-12'>政党</Label>
            <Select value={filterParty} onValueChange={setFilterParty}>
              <SelectTrigger className='flex-1 sm:w-[300px] rounded-none flex items-center'>
                <HiMiniUserGroup className='h-5 w-5 mr-3 text-muted-foreground' />
                <SelectValue placeholder='政党' />
              </SelectTrigger>
              <SelectContent>
                {parties.map((party) => (
                  <SelectItem key={party.id} value={party.value}>
                    {party.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='mt-6 w-full mb-4 bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700'>
          <div className='flex items-center gap-2'>
            <FaChevronRight className='h-4 w-4 text-teal-600 dark:text-teal-400' />
            <h3 className='text-base font-bold text-foreground'>
              <span className='mr-5'>{filterProportional}</span>
              <span>{selectedProportionalDescription(filterProportional)}</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Candidates List */}
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <div className='flex justify-between items-center mb-6 flex-wrap gap-3'>
          <div className='text-sm'>
            現在、立候補されている候補者は{allPoliticians.length}名いらっしゃいます。
          </div>
        </div>

        {byParty ? (
          <div className='flex flex-col gap-16'>
            {byParty.map(({ party, politicians }) => (
              <div key={`party-${party}`}>
                <div className='bg-green-600 text-white font-bold text-lg py-3 px-4 mb-0 rounded-t-md'>
                  {party}
                </div>
                <Table className='w-full'>
                  <TableHeader>
                    <TableRow className='bg-gray-600 hover:bg-gray-600'>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[40px] p-0'>結果</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[40px] p-0.5'>名簿順位</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>写真</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>候補者</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>政党</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[100px] p-0.5'>獲得票</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>前元新</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>当選数</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[100px] p-1'>小選挙区</TableHead>
                      <TableHead className='border border-gray-500 text-white text-center font-normal h-12 p-1'>サイト</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {politicians.map((politician) => (
                      <ProportionCandidateCard key={politician.id} {...politician} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        ) : (
          <Fragment>
            <div className='bg-green-600 text-white font-bold text-lg py-3 px-4 mb-0 rounded-t-md'>
              {filterParty}
            </div>
            <Table className='w-full'>
              <TableHeader>
                <TableRow className='bg-gray-600 hover:bg-gray-600'>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[40px] p-0.5'>結果</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[40px] p-0.5'>名簿順位</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>写真</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>候補者</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>政党</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[100px] p-0.5'>獲得票</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>前元新</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>当選数</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[100px] p-1'>小選挙区</TableHead>
                  <TableHead className='border border-gray-500 text-white text-center font-normal h-12 p-1'>サイト</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPoliticians.map((politician) => (
                  <ProportionCandidateCard key={politician.id} {...politician} />
                ))}
              </TableBody>
            </Table>
          </Fragment>
        )}
      </section>
    </div>
  )
}

export default ProportionCandidatesPage
