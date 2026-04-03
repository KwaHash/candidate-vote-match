'use client'

import { DistrictCandidateCard } from '@/components/card/district-candidate-card'
import LoadingIndicator from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { prefectures } from '@/constants/areas'
import { parties } from '@/constants/parties'
import { districtCandidatesToCsv, selectedDistrictDescription } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaHeart } from 'react-icons/fa'
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
      <section className='py-20 bg-gradient-to-br from-primary/10 to-accent/10'>
        <div className='container'>
          <div className='max-w-3xl mx-auto text-center space-y-4'>
            <h1 className='text-4xl md:text-5xl font-bold'>第51回衆議院議員選挙(小選挙区)</h1>
            <p className='text-xl text-muted-foreground'>公示日: 	2026年01月27日、 投票日: 2026年02月08日</p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-8 bg-background/50 backdrop-blur-sm border-b'>
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

      {/* CTA */}
      <section className='py-20 bg-gradient-to-br from-primary/10 to-accent/10'>
        <div className='container'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <h2 className='text-3xl font-bold'>あなたにぴったりの推しを見つけよう</h2>
            <p className='text-lg text-muted-foreground'>
              診断であなたの価値観に合った政治家をマッチング
            </p>
            <Button size='lg' className='text-base h-14 px-8 rounded-none bg-primary hover:bg-primary/90 transition-all duration-500' asChild>
              <Link href='/match'>
                <FaHeart className='h-5 w-5 mr-1' />
                <span>診断を始める</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DistrictCandidatesPage
