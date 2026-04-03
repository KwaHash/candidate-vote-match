'use client'

import { PolicyQuestionCard } from '@/components/card/policy-question-card'
import LoadingIndicator from '@/components/loading-indicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WEBSITE_ICONS } from '@/constants/icons'
import { policyQuestions } from '@/constants/policy'
import { getAgeFromBirthDate, getQuestionAnswers, getWebsiteLinks } from '@/lib/utils'
import { IPolitician } from '@/types/politician'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaCalculator, FaCalendar, FaHistory, FaMapMarkerAlt } from 'react-icons/fa'
import { HiUserGroup } from 'react-icons/hi2'
import { MdGroups } from 'react-icons/md'
import { PiListHeartBold } from 'react-icons/pi'

const PoliticianDetailPage = ({ id }: { id: string }) => {
  const [politician, setPolitician] = useState<IPolitician | null>(null)
  const [adjacent, setAdjacent] = useState<IPolitician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)

  useEffect(() => {
    const fetchPolitician = async () => {
      try {
        const { data: { politician, adjacent } } = await axios.get(`/api/politicians/${id}`)
        setPolitician(politician)
        setAdjacent(adjacent)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const _error = err.response?.data?.error
        }
      }
      setIsLoading(false)
    }
    fetchPolitician()
  }, [id])

  useEffect(() => {
    if (!carouselApi) return
    const interval = setInterval(() => {
      carouselApi.scrollNext()
    }, 3000)
    return () => clearInterval(interval)
  }, [carouselApi])

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      <div className='relative h-64 md:h-80 overflow-hidden'>
        <Image
          src='/images/cover.jpg'
          alt='カバー画像'
          fill
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-background/80 to-transparent' />
      </div>

      <div className='container py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-1'>
            <Card className='sticky top-20'>
              <CardContent className='p-6 space-y-6'>
                <div className='relative -mt-20 mb-4'>
                  <div className='w-40 h-40 mx-auto rounded-full border-4 border-background overflow-hidden'>
                    <Image
                      src={politician?.avatar || ''}
                      alt={politician?.kanji_name || politician?.hiragana_name || ''}
                      width={160}
                      height={160}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </div>

                <div className='text-center space-y-1'>
                  <h1 className='text-2xl font-bold'>{politician?.kanji_name || ''}</h1>
                  <p className='text-muted-foreground'>{politician?.hiragana_name || ''}</p>
                </div>

                <div className='space-y-3 text-sm'>
                  <div className='flex items-center'>
                    <HiUserGroup className='h-4 w-4 mr-2' />
                    <span className='min-w-28'>政党</span>
                    <p>{politician?.party || '—'}</p>
                  </div>
                  <div className='flex items-center'>
                    <FaMapMarkerAlt className='h-4 w-4 mr-2' />
                    <span className='min-w-28'>出馬選挙区</span>
                    <p>
                      {politician?.district || '—'}
                      {politician?.proportional && `（比例：${politician.proportional}）`}
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <FaCalculator className='h-4 w-4 mr-2' />
                    <span className='min-w-28'>当選回数</span>
                    <p className='flex items-center gap-4'>
                      <span>衆： {politician?.shu_count}回</span>
                      <span>参： {politician?.san_count}回</span>
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <FaCalendar className='h-4 w-4 mr-2' />
                    <span className='min-w-28'>生年月日</span>
                    <p>{politician?.birth_date || '—'}（{getAgeFromBirthDate(politician?.birth_date)}）</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-2 space-y-6'>
            <Tabs defaultValue='history' className='w-full'>
              <TabsList className='grid w-full grid-cols-2 h-12 rounded-none bg-muted/50 p-0 gap-0'>
                <TabsTrigger
                  value='history'
                  className='flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground'
                >
                  <FaHistory className='h-5 w-5 mr-2' />
                  <span className='font-bold text-base'>経歴</span>
                </TabsTrigger>
                <TabsTrigger
                  value='policies'
                  className='flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground'
                >
                  <PiListHeartBold className='h-5 w-5 mr-2' />
                  <span className='font-bold text-base'>政策アンケート</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value='history' className='space-y-4'>
                <Card className='rounded-sm'>
                  <CardHeader>
                    <CardTitle className='flex items-center text-primary'>
                      <FaHistory className='h-5 w-5 mr-2' />
                      <span className='font-bold text-lg'>経歴</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-2'>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableHead className='text-left text-secondary font-bold'>肩書</TableHead>
                          <TableCell className='px-3 py-2'>{politician?.title || '—'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead className='text-left text-secondary font-bold'>略歴</TableHead>
                          <TableCell className='px-3 py-2'>{politician?.biography || '—'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead className='text-left text-secondary font-bold'>派閥・出身政党</TableHead>
                          <TableCell className='px-3 py-2'>{politician?.origin || '—'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead className='text-left text-secondary font-bold'>前元新</TableHead>
                          <TableCell className='px-3 py-2'>{politician?.shin || '—'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHead className='text-left text-secondary font-bold'>ウェブサイト</TableHead>
                          <TableCell className='px-3 py-2 flex flex-wrap items-center gap-3'>
                            {getWebsiteLinks(politician?.website).map((item) => {
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
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value='policies'>
                <Card className='rounded-sm'>
                  <CardHeader>
                    <CardTitle className='flex items-center text-primary'>
                      <PiListHeartBold className='h-5 w-5 mr-2' />
                      <span className='font-bold text-lg'>政策アンケート</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 px-6 pb-6 pt-0'>
                    {politician?.questions_answers ? (
                      policyQuestions.map((q) => {
                        const answers = getQuestionAnswers(politician?.questions_answers)
                        const entry = answers.find((a) => a.question === q.question)
                        const selectedValue = entry?.answer ?? null
                        return (
                          <PolicyQuestionCard
                            key={q.id}
                            question={q.question}
                            options={q.options}
                            selectedValue={selectedValue}
                          />
                        )
                      })
                    ) : (
                      <p className='text-muted-foreground text-sm'>まだ回答が確認できていないため、内容を表示できません。</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center text-primary'>
                  <MdGroups className='h-6 w-6 mr-2' />
                  <span className='font-bold text-lg'>同じ選挙区の候補者たち</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='relative px-10'>
                {adjacent.length === 0 ? (
                  <p className='text-sm text-muted-foreground px-4'>表示する政治家がいません。</p>
                ) : (
                  <Carousel
                    opts={{ align: 'start', loop: true }}
                    className='w-full'
                    setApi={setCarouselApi}
                  >
                    <CarouselContent className='-ml-4'>
                      {(adjacent ?? []).map((p) => (
                        <CarouselItem key={p.id}
                          className='pl-4 basis-1/2 sm:basis-1/3 md:basis-1/5'
                        >
                          <Link href={`/politicians/${p.id}`} className='hover:opacity-90 transition-opacity duration-300'>
                            <Card className='overflow-hidden hover:shadow-lg transition-all cursor-pointer'>
                              <div className='relative w-full aspect-square shrink-0'>
                                <Image
                                  src={p.avatar || ''}
                                  alt={p.kanji_name || ''}
                                  fill
                                  className='w-full h-full object-cover'
                                />
                              </div>
                              <div className='p-3 text-center'>
                                <h4 className='font-semibold text-base'>{p.kanji_name}</h4>
                                <p className='text-xs text-muted-foreground'>{p.party || '—'}</p>
                              </div>
                            </Card>
                          </Link>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {adjacent.length > 5 && (
                      <>
                        <CarouselPrevious className='-left-6 h-10 w-10 hover:bg-muted-foreground/60 transition-all duration-300' />
                        <CarouselNext className='-right-6 h-10 w-10 hover:bg-muted-foreground/60 transition-all duration-300' />
                      </>
                    )}
                  </Carousel>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoliticianDetailPage
