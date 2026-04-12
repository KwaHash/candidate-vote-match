'use client'

import { DistrictCandidateCard } from '@/components/card/district-candidate-card'
import LoadingIndicator from '@/components/loading-indicator'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { prefectures } from '@/constants/areas'
import { parties } from '@/constants/parties'
import { districtCandidatesToCsv, selectedDistrictDescription } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { FaChevronRight } from 'react-icons/fa6'
import { HiMiniUserGroup } from 'react-icons/hi2'
import { PiMapPinAreaFill } from 'react-icons/pi'

const DistrictCandidatesPage = () => {
  const [filterPrefecture, setFilterPrefecture] = useState<string>('北海道')
  const [filterDistrict, setFilterDistrict] = useState<string>('北海道1区')
  const [filterParty, setFilterParty] = useState('全て政党')
  const [allPoliticians, setAllPoliticians] = useState<IPolitician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    setTimeout(() => {
      const pref = prefectures.find(p => p.value === filterPrefecture)
      setFilterDistrict(pref?.districts[0].label || `${filterPrefecture}1区`)
    }, 100)
  }, [filterPrefecture])

  useEffect(() => {
    const fetchPoliticians = async () => {
      setIsLoading(true)
      try {
        const { data: { politicians } } = await axios.get('/api/candidates/district', {
          params: { district: filterDistrict, party: filterParty }
        })
        setAllPoliticians(politicians)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const error = err.response?.data?.error
        }
      }
      setIsLoading(false)
    }
    fetchPoliticians()
  }, [filterDistrict, filterParty])

  if (isLoading) {
    return <LoadingIndicator />
  }

  const downloadCsv = () => {
    const csv = districtCandidatesToCsv(allPoliticians)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `小選挙区_${filterDistrict}_${filterParty}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Hero */}
      <section className='relative bg-white'>
        <div className='absolute inset-0 bg-gradient-to-r from-green-600 to-green-600/85' />
        <div className='relative max-w-7xl mx-auto px-4 py-24'>
          <div className='text-center'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold leading-normal tracking-tight text-white'>第51回衆議院議員選挙(小選挙区)</h1>
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
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-10 bg-background/50 backdrop-blur-sm border-b'>
        <div className='flex flex-col sm:flex-row flex-wrap gap-4 justify-between'>
          <div className='flex items-center gap-2'>
            <Label className='font-normal w-12'>地域</Label>
            <Select value={filterPrefecture} onValueChange={setFilterPrefecture}>
              <SelectTrigger className='flex-1 sm:w-[230px] rounded-none flex items-center'>
                <PiMapPinAreaFill className='h-5 w-5 mr-3 text-muted-foreground' />
                <SelectValue placeholder='地域' />
              </SelectTrigger>
              <SelectContent>
                {prefectures.map((prefecture) => (
                  <SelectItem key={prefecture.id} value={prefecture.value}>
                    {prefecture.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <Label className='font-normal w-12'>選挙区</Label>
            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
              <SelectTrigger className='flex-1 sm:w-[230px] rounded-none flex items-center'>
                <PiMapPinAreaFill className='h-5 w-5 mr-3 text-muted-foreground' />
                <SelectValue placeholder='選挙区' />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  const pref = prefectures.find(p => p.value === filterPrefecture)
                  if (pref && Array.isArray(pref.districts)) {
                    return pref.districts.map((district) => (
                      <SelectItem key={district.label} value={district.label}>
                        {district.label}
                      </SelectItem>
                    ))
                  }
                  // Fallback for backward compatibility
                  const districtCount = Array.isArray(pref?.districts) ? pref.districts.length : (pref?.districts ?? 0)
                  return Array.from({ length: districtCount }, (_, idx) => (
                    <SelectItem key={idx + 1} value={`${filterPrefecture}${idx + 1}区`}>
                      {`${filterPrefecture}${idx + 1}区`}
                    </SelectItem>
                  ))
                })()}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <Label className='font-normal w-12'>政党</Label>
            <Select value={filterParty} onValueChange={setFilterParty}>
              <SelectTrigger className='flex-1 sm:w-[230px] rounded-none flex items-center'>
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
          <div className='flex items-center gap-2 mb-3'>
            <FaChevronRight className='h-4 w-4 text-teal-600 dark:text-teal-400' />
            <h3 className='text-base font-bold text-foreground'>{filterDistrict}</h3>
          </div>
          <p className='text-sm text-gray-700 leading-6'>
            {selectedDistrictDescription(filterDistrict) ?? ''}
          </p>
        </div>
      </section>

      {/* Candidates List */}
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <div className='flex justify-between items-center mb-6 flex-wrap gap-3'>
          <div className='text-sm'>
            現在、立候補されている候補者は{allPoliticians.length}名いらっしゃいます。
          </div>
        </div>

        <div className='rounded-md border'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow className='bg-gray-600 hover:bg-gray-600'>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0'>結果</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>写真</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[200px] p-1'>候補者</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>政党</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[100px] p-0.5'>獲得票</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>前元新</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>当選数</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[70px] p-1'>比例</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 p-1'>サイト</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPoliticians.map((politician) => (
                <DistrictCandidateCard key={politician.id} {...politician} />
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}

export default DistrictCandidatesPage
