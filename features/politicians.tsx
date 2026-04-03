'use client'

import { PoliticianCard } from '@/components/card/politician-card'
import LoadingIndicator from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { parties } from '@/constants/parties'
import { cn, politiciansListToCsv } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { HiMiniUserGroup } from 'react-icons/hi2'

const PoliticiansPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterParty, setFilterParty] = useState('全て政党')
  const [allPoliticians, setAllPoliticians] = useState<IPolitician[]>([])
  const [filteredPoliticians, setFilteredPoliticians] = useState<IPolitician[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const { data: { politicians } } = await axios.get('/api/politicians')
        setAllPoliticians(politicians)
        setFilteredPoliticians(politicians)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const error = err.response?.data?.error
        }
      }
      setIsLoading(false)
    }
    fetchPoliticians()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const handleSearch = () => {
    let searchedPoliticians = allPoliticians
    if (searchQuery) {
      searchedPoliticians = searchedPoliticians.filter((politician) => {
        if (politician.kanji_name.includes(searchQuery)) return true
        if (politician.hiragana_name?.includes(searchQuery)) return true
        if (politician.party?.includes(searchQuery)) return true
        if (politician.district?.includes(searchQuery)) return true
        if (politician.shin?.includes(searchQuery)) return true
        if (politician.shu_count?.toString().includes(searchQuery)) return true
        if (politician.san_count?.toString().includes(searchQuery)) return true
        if (politician.title?.includes(searchQuery)) return true
        if (politician.biography?.includes(searchQuery)) return true
        if (politician.origin?.includes(searchQuery)) return true
        if (politician.proportional?.includes(searchQuery)) return true
        return false
      })
    }
    if (filterParty !== '全て政党') {
      searchedPoliticians = searchedPoliticians.filter((politician) => politician.party?.includes(filterParty))
    }
    setFilteredPoliticians(searchedPoliticians)
    setCurrentPage(1)
  }

  // Calculate pagination values
  const totalPages = Math.ceil(filteredPoliticians.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPoliticians = filteredPoliticians.slice(startIndex, endIndex)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  const downloadCsv = () => {
    const csv = politiciansListToCsv(filteredPoliticians)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `政治家一覧_${filterParty}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Hero */}
      <section className='py-20 bg-gradient-to-br from-primary/10 to-accent/10'>
        <div className='container'>
          <div className='max-w-3xl mx-auto text-center space-y-4'>
            <h1 className='text-4xl md:text-5xl font-bold'>政治家一覧</h1>
            <p className='text-xl text-muted-foreground'>あなたにぴったりの政治家を見つけよう</p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-8 bg-background/50 backdrop-blur-sm'>
        <div className='flex flex-col sm:flex-row gap-2 md:gap-3'>
          <div className='flex-1 relative flex'>
            <div className='relative flex-1'>
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='名前、政党で検索...'
                className='pl-10 rounded-none'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className='flex gap-2'>
            <Select value={filterParty} onValueChange={setFilterParty}>
              <SelectTrigger className='w-full sm:w-[200px] md:w-[250px] rounded-none flex items-center'>
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
          <Button
            variant='default'
            size='sm'
            className='rounded-none px-4 flex-shrink-0 h-10 bg-secondary hover:bg-secondary/80 transition-all duration-500'
            onClick={handleSearch}
          >
            <FaSearch className='h-4 w-4 mr-1' />
            <span>検索</span>
          </Button>
        </div>
      </section>

      {/* Politicians List */}
      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <div className='flex justify-between items-center mb-6 flex-wrap gap-3'>
          <div className='text-sm'>
            全{filteredPoliticians.length}名のうち、{filteredPoliticians.length === 0 ? 0 : startIndex + 1}番から{filteredPoliticians.length === 0 ? 0 : Math.min(endIndex, filteredPoliticians.length)}番までを表示しております。
          </div>
          <div className='flex items-center gap-6'>
            <span className='text-sm text-muted-foreground'>表示件数:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className='w-[100px] rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='25'>25</SelectItem>
                <SelectItem value='50'>50</SelectItem>
                <SelectItem value='100'>100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='my-10'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={cn('rounded-none hover:bg-secondary/80 transition-all duration-300 cursor-pointer px-3', currentPage === 1 ? 'pointer-events-none opacity-50' : '')}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href='#'
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page as number)
                        }}
                        className='hover:bg-secondary/80 transition-all duration-300 cursor-pointer'
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={cn('rounded-none hover:bg-secondary/80 transition-all duration-300 cursor-pointer px-3', currentPage === totalPages ? 'pointer-events-none opacity-50' : '')}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className='rounded-md border'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow className='bg-gray-600 hover:bg-gray-600'>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>写真</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[200px] p-1'>名前</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[150px] p-1'>政党</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[100px] p-1'>生年月日</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[50px] p-0.5'>前元新</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[80px] p-0.5'>当選数</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 w-[70px] p-1'>比例</TableHead>
                <TableHead className='border border-gray-500 text-white text-center font-normal h-12 p-1'>サイト</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPoliticians.map((politician) => (
                <PoliticianCard key={politician.id} {...politician} />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-12'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={cn('rounded-none hover:bg-secondary/80 transition-all duration-300 cursor-pointer px-3', currentPage === 1 ? 'pointer-events-none opacity-50' : '')}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href='#'
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page as number)
                        }}
                        className='hover:bg-secondary/80 transition-all duration-300 cursor-pointer'
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={cn('rounded-none hover:bg-secondary/80 transition-all duration-300 cursor-pointer px-3', currentPage === totalPages ? 'pointer-events-none opacity-50' : '')}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  )
}

export default PoliticiansPage