'use client'

import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import LoadingIndicator from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { parties } from '@/constants/parties'
import { policyQuestions } from '@/constants/policy'
import { cn, WEBSITE_LINK_LABELS } from '@/lib/utils'
import {
  isProfileAvatarValue, MAX_PROFILE_AVATAR_SIZE_BYTES, PROFILE_AVATAR_ACCEPT,
  type ICandidateProfile, type IProfileForm, type ProfileCustomItem, type ProfileWebsiteLink
} from '@/types/profile'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { format, isValid, parse } from 'date-fns'
import { ja } from 'date-fns/locale'
import Image from 'next/image'
import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { IconType } from 'react-icons'
import { FaCalendar, FaImage, FaPlus, FaTrash, FaUser } from 'react-icons/fa'
import { FiUser } from 'react-icons/fi'
import { HiUserGroup } from 'react-icons/hi2'
import { PiListHeartBold } from 'react-icons/pi'
import * as yup from 'yup'

const WEBSITE_FIELD_LABELS: Record<string, string> = {
  homepage: 'ホームページ',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  line: 'LINE',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
}

const partyOptions = parties.filter((p) => p.id !== 0)

const profileInputClass = 'w-full rounded-none border-gray-200 focus-visible:ring-[#777]'

const BIRTH_DATE_FORMAT = 'yyyy/MM/dd'
const BIRTH_DATE_FROM_YEAR = 1920
const BIRTH_DATE_TO_YEAR = new Date().getFullYear()

function parseBirthDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, BIRTH_DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

function formatBirthDate(date: Date): string {
  return format(date, BIRTH_DATE_FORMAT)
}

type ProfileFormFieldProps = {
  label: string
  htmlFor: string
  icon?: IconType
  required?: boolean
  error?: string
  className?: string
  children: ReactNode
}

function ProfileFormField({
  label,
  htmlFor,
  icon: Icon,
  required,
  error,
  className,
  children,
}: ProfileFormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='flex items-center gap-1.5'>
        {Icon && <Icon className='h-4 w-4 shrink-0 text-gray-500' />}
        <Label htmlFor={htmlFor} className='text-sm font-medium text-gray-800'>
          {label}
        </Label>
        {required && <RequiredLabel className='ml-1' />}
      </div>
      {children}
      {error && <p className='text-xs text-m-red'>{error}</p>}
    </div>
  )
}

const defaultQuestionAnswers = policyQuestions.map((q) => ({
  question: q.question,
  answer: '',
}))

type WebsiteLinkEntry = ProfileWebsiteLink & { id: string }

const createWebsiteLinkEntry = (label = '', url = ''): WebsiteLinkEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  label,
  url,
})

type CustomItemEntry = ProfileCustomItem & { id: string }

const createCustomItemEntry = (label = '', value = ''): CustomItemEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  label,
  value,
})

const defaultValues: IProfileForm = {
  kanji_name: '',
  hiragana_name: '',
  party: '',
  birth_date: '',
  avatar: '',
  title: '',
  origin: '',
  biography: '',
}

const schema = yup.object().shape({
  kanji_name: yup.string().trim().required('氏名（漢字）は必須です'),
  hiragana_name: yup.string().trim().required('氏名（ひらがな）は必須です'),
  party: yup.string().trim().required('政党は必須です'),
  birth_date: yup
    .string()
    .trim()
    .required('生年月日は必須です')
    .matches(/^\d{4}\/\d{2}\/\d{2}$/, '生年月日は YYYY/MM/DD 形式で入力してください'),
  avatar: yup
    .string()
    .trim()
    .required('プロフィール画像は必須です')
    .test('avatar-valid', '画像ファイルを選択してください', (value) =>
      isProfileAvatarValue(value)
    ),
  title: yup.string().trim().optional(),
  origin: yup.string().trim().optional(),
  biography: yup.string().trim().optional(),
})

function validateWebsiteLinks(links: WebsiteLinkEntry[]): string | null {
  const usedLabels = new Set<string>()
  for (const link of links) {
    const label = link.label.trim()
    const url = link.url.trim()
    if (!label) return 'SNSの種類を選択してください。'
    if (!url) return `${WEBSITE_FIELD_LABELS[label] ?? label}のURLを入力してください。`
    if (!yup.string().url().isValidSync(url)) {
      return `${WEBSITE_FIELD_LABELS[label] ?? label}のURLを正しく入力してください。`
    }
    if (usedLabels.has(label)) return '同じSNSは重複して登録できません。'
    usedLabels.add(label)
  }
  return null
}

function validateCustomItems(items: CustomItemEntry[]): string | null {
  for (const item of items) {
    const label = item.label.trim()
    const value = item.value.trim()
    if (!label) return '項目名を入力してください。'
    if (!value) return `「${label}」の内容を入力してください。`
  }
  return null
}

function customItemsFromProfile(items: ProfileCustomItem[] | undefined): CustomItemEntry[] {
  return (items ?? []).map((item) => createCustomItemEntry(item.label, item.value))
}

function profileToFormValues(profile: ICandidateProfile): IProfileForm {
  return {
    ...defaultValues,
    kanji_name: profile.kanji_name,
    hiragana_name: profile.hiragana_name,
    party: profile.party,
    birth_date: profile.birth_date,
    avatar: profile.avatar,
    title: profile.title ?? '',
    origin: profile.origin ?? '',
    biography: profile.biography ?? '',
  }
}

function websiteLinksFromProfile(website: ProfileWebsiteLink[] | undefined): WebsiteLinkEntry[] {
  return (website ?? [])
    .filter((link) => WEBSITE_LINK_LABELS.includes(link.label as (typeof WEBSITE_LINK_LABELS)[number]))
    .map((link) => createWebsiteLinkEntry(link.label, link.url))
}

function formToProfilePayload(
  data: IProfileForm,
  questionAnswers: { question: string; answer: string }[],
  websiteLinks: WebsiteLinkEntry[],
  customItems: CustomItemEntry[]
): ICandidateProfile {
  const website = websiteLinks.map((link) => ({
    label: link.label.trim(),
    url: link.url.trim(),
  }))

  const items = customItems.map((item) => ({
    label: item.label.trim(),
    value: item.value.trim(),
  }))

  const answeredQuestions = questionAnswers.filter((a) => a.answer.trim() !== '')

  return {
    kanji_name: data.kanji_name.trim(),
    hiragana_name: data.hiragana_name.trim(),
    party: data.party.trim(),
    birth_date: data.birth_date.trim(),
    avatar: data.avatar.trim(),
    title: data.title?.trim() || undefined,
    origin: data.origin?.trim() || undefined,
    biography: data.biography?.trim() || undefined,
    question_answers: answeredQuestions.length > 0 ? answeredQuestions : undefined,
    website: website.length > 0 ? website : undefined,
    custom_items: items.length > 0 ? items : undefined,
  }
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  const tokenData = localStorage.getItem('jwt-token')
  if (!tokenData) return null
  try {
    const { access_token } = JSON.parse(tokenData)
    return access_token ?? null
  } catch {
    return null
  }
}

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [questionAnswers, setQuestionAnswers] = useState(defaultQuestionAnswers)
  const [websiteLinks, setWebsiteLinks] = useState<WebsiteLinkEntry[]>([])
  const [customItems, setCustomItems] = useState<CustomItemEntry[]>([])
  const [avatarPreviewError, setAvatarPreviewError] = useState(false)
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IProfileForm>({
    resolver: yupResolver(schema),
    defaultValues,
  })

  const avatarValue = watch('avatar')
  const hasAvatarImage =
    isProfileAvatarValue(avatarValue) && !avatarPreviewError
  const avatarFileStatus =
    avatarFileName ?? (hasAvatarImage ? '登録済みの画像' : '選択されていません')

  useEffect(() => {
    setAvatarPreviewError(false)
  }, [avatarValue])

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。')
      return
    }
    if (file.size > MAX_PROFILE_AVATAR_SIZE_BYTES) {
      setError('2MB以下の画像を選択してください。')
      return
    }

    setError('')
    setAvatarFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setValue('avatar', result, { shouldValidate: true, shouldDirty: true })
        setAvatarPreviewError(false)
      }
    }
    reader.onerror = () => {
      setError('画像の読み込みに失敗しました。')
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = getAccessToken()
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        const { data } = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (data.profile) {
          reset(profileToFormValues(data.profile))
          setAvatarFileName(null)
          setWebsiteLinks(websiteLinksFromProfile(data.profile.website))
          setCustomItems(customItemsFromProfile(data.profile.custom_items))
          if (data.profile.question_answers?.length) {
            setQuestionAnswers(
              policyQuestions.map((q) => {
                const entry = data.profile.question_answers.find(
                  (a: { question: string }) => a.question === q.question
                )
                return { question: q.question, answer: entry?.answer ?? '' }
              })
            )
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error ?? 'プロフィールの取得に失敗しました。')
        }
      }
      setIsLoading(false)
    }

    void fetchProfile()
  }, [reset])

  const onSubmit = async (data: IProfileForm) => {
    setError('')
    setSuccess('')
    const accessToken = getAccessToken()
    if (!accessToken) {
      setError('認証が必要です。再度ログインしてください。')
      return
    }

    const websiteError = validateWebsiteLinks(websiteLinks)
    if (websiteError) {
      setError(websiteError)
      return
    }

    const customItemsError = validateCustomItems(customItems)
    if (customItemsError) {
      setError(customItemsError)
      return
    }

    try {
      const payload = formToProfilePayload(data, questionAnswers, websiteLinks, customItems)
      await axios.put('/api/profile', payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setSuccess('プロフィールを保存しました。')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? '保存に失敗しました。')
      }
    }
  }

  const setQuestionAnswer = (question: string, answer: string) => {
    setQuestionAnswers((prev) =>
      prev.map((item) => (item.question === question ? { ...item, answer } : item))
    )
  }

  const addWebsiteLink = () => {
    if (websiteLinks.length >= WEBSITE_LINK_LABELS.length) return
    const used = new Set(websiteLinks.map((link) => link.label))
    const nextLabel = WEBSITE_LINK_LABELS.find((label) => !used.has(label)) ?? ''
    setWebsiteLinks((prev) => [...prev, createWebsiteLinkEntry(nextLabel, '')])
  }

  const removeWebsiteLink = (id: string) => {
    setWebsiteLinks((prev) => prev.filter((link) => link.id !== id))
  }

  const updateWebsiteLink = (
    id: string,
    patch: Partial<Pick<ProfileWebsiteLink, 'label' | 'url'>>
  ) => {
    setWebsiteLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, ...patch } : link))
    )
  }

  const canAddWebsiteLink = websiteLinks.length < WEBSITE_LINK_LABELS.length

  const addCustomItem = () => {
    setCustomItems((prev) => [...prev, createCustomItemEntry('', '')])
  }

  const removeCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateCustomItem = (
    id: string,
    patch: Partial<Pick<ProfileCustomItem, 'label' | 'value'>>
  ) => {
    setCustomItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero */}
      <section className='relative bg-white'>
        <div className='absolute inset-0 bg-gradient-to-r from-green-600 to-green-600/85' />
        <div className='relative max-w-7xl mx-auto px-4 py-24'>
          <div className='text-center'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold leading-normal tracking-tight text-white'>プロフィール</h1>
            <p className='mt-6 text-base sm:text-lg md:text-xl !leading-8 sm:!leading-10 text-gray-100'>候補者情報を登録・編集できます</p>
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

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <FaUser className='h-5 w-5 shrink-0' />
              <h2 className='text-base font-bold'>基本情報</h2>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2'>
                <ProfileFormField
                  label='氏名（漢字）'
                  htmlFor='kanji_name'
                  icon={FiUser}
                  required
                  error={errors.kanji_name?.message}
                >
                  <InputField
                    id='kanji_name'
                    control={control}
                    placeholder='例：山田 太郎'
                    className={profileInputClass}
                  />
                </ProfileFormField>

                <ProfileFormField
                  label='氏名（ひらがな）'
                  htmlFor='hiragana_name'
                  icon={FiUser}
                  required
                  error={errors.hiragana_name?.message}
                >
                  <InputField
                    id='hiragana_name'
                    control={control}
                    placeholder='例：やまだ たろう'
                    className={profileInputClass}
                  />
                </ProfileFormField>

                <ProfileFormField
                  label='政党'
                  htmlFor='party'
                  icon={HiUserGroup}
                  required
                  error={errors.party?.message}
                >
                  <Controller
                    name='party'
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id='party' className={cn(profileInputClass, 'h-10')}>
                          <SelectValue placeholder='政党を選択' />
                        </SelectTrigger>
                        <SelectContent>
                          {partyOptions.map((p) => (
                            <SelectItem key={p.id} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </ProfileFormField>

                <ProfileFormField
                  label='生年月日'
                  htmlFor='birth_date'
                  icon={FaCalendar}
                  required
                  error={errors.birth_date?.message}
                >
                  <Controller
                    name='birth_date'
                    control={control}
                    render={({ field }) => {
                      const selectedDate = parseBirthDate(field.value)
                      return (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type='button'
                              variant='outline'
                              id='birth_date'
                              className={cn(
                                profileInputClass,
                                'h-10 justify-start text-left font-normal hover:bg-gray-400 transform duration-300 ease-in-out',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {selectedDate
                                ? format(selectedDate, BIRTH_DATE_FORMAT, { locale: ja })
                                : '日付を選択'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              captionLayout='dropdown-buttons'
                              fromYear={BIRTH_DATE_FROM_YEAR}
                              toYear={BIRTH_DATE_TO_YEAR}
                              selected={selectedDate}
                              onSelect={(date) =>
                                field.onChange(date ? formatBirthDate(date) : '')
                              }
                              disabled={(date) => date > new Date()}
                              defaultMonth={selectedDate}
                              locale={ja}
                              formatters={{
                                formatMonthCaption: (month) =>
                                  format(month, 'M月', { locale: ja }),
                                formatYearCaption: (month) =>
                                  format(month, 'yyyy年', { locale: ja }),
                              }}
                              labels={{
                                labelMonthDropdown: () => '月を選択',
                                labelYearDropdown: () => '年を選択',
                                labelPrevious: () => '前の月',
                                labelNext: () => '次の月',
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )
                    }}
                  />
                </ProfileFormField>

                <ProfileFormField
                  label='プロフィール画像'
                  htmlFor='avatar-file'
                  icon={FaImage}
                  required
                  error={errors.avatar?.message}
                  className='md:col-span-2'
                >
                  <Controller
                    name='avatar'
                    control={control}
                    render={({ field }) => <input type='hidden' {...field} value={field.value ?? ''} />}
                  />
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                    <div className='relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100'>
                      {hasAvatarImage ? (
                        <Image
                          src={avatarValue}
                          alt='プロフィール画像プレビュー'
                          fill
                          unoptimized
                          className='object-cover'
                          onError={() => setAvatarPreviewError(true)}
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center'>
                          <FaUser className='h-14 w-14 text-gray-400' aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col gap-2'>
                      <input
                        id='avatar-file'
                        type='file'
                        accept={PROFILE_AVATAR_ACCEPT}
                        className='sr-only'
                        onChange={handleAvatarFileChange}
                      />
                      <div className='flex flex-wrap items-center gap-3'>
                        <label
                          htmlFor='avatar-file'
                          className={cn(
                            profileInputClass,
                            'inline-flex h-10 cursor-pointer items-center justify-center border bg-background px-4 text-sm font-medium text-gray-800 hover:bg-gray-50'
                          )}
                        >
                          ファイルを選択
                        </label>
                        <span className='text-sm text-muted-foreground'>{avatarFileStatus}</span>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        JPEG、PNG、WebP、GIF（2MB以内）
                      </p>
                    </div>
                  </div>
                </ProfileFormField>

                <div className='flex flex-col gap-2'>
                  <Label htmlFor='title'>肩書</Label>
                  <InputField id='title' control={control} placeholder='例：元厚生労働大臣' className='w-full' />
                </div>

                <div className='flex flex-col gap-2'>
                  <Label htmlFor='origin'>派閥・出身政党</Label>
                  <InputField
                    id='origin'
                    control={control}
                    placeholder='例：民主党'
                    className='w-full'
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <Label htmlFor='biography'>略歴</Label>
                  <Controller
                    name='biography'
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id='biography'
                        rows={6}
                        className='rounded-none resize-y'
                        placeholder='略歴を入力してください'
                      />
                    )}
                  />
                </div>
              </div>
              <div className='flex flex-col gap-4 mt-6'>
                <div className='flex items-center justify-between gap-2'>
                  <Label className='text-sm font-medium text-gray-800'>SNS・ウェブサイト</Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='rounded-none border-gray-200 bg-white hover:bg-gray-400 transform duration-300 ease-in-out'
                    onClick={addWebsiteLink}
                    disabled={!canAddWebsiteLink}
                  >
                    <FaPlus className='mr-1 h-3 w-3' />
                    追加
                  </Button>
                </div>
                {websiteLinks.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    追加ボタンからSNSリンクを登録できます
                  </p>
                ) : (
                  <div className='flex flex-col gap-3'>
                    {websiteLinks.map((link) => (
                      <div
                        key={link.id}
                        className='flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-end'
                      >
                        <div className='flex flex-1 flex-col gap-2 sm:max-w-[200px]'>
                          <Label htmlFor={`website-label-${link.id}`} className='text-sm'>
                            種類
                          </Label>
                          <Select
                            value={link.label || undefined}
                            onValueChange={(value) =>
                              updateWebsiteLink(link.id, { label: value })
                            }
                          >
                            <SelectTrigger
                              id={`website-label-${link.id}`}
                              className={cn(profileInputClass, 'h-10')}
                            >
                              <SelectValue placeholder='種類を選択' />
                            </SelectTrigger>
                            <SelectContent>
                              {WEBSITE_LINK_LABELS.map((label) => {
                                const isUsed = websiteLinks.some(
                                  (entry) => entry.label === label && entry.id !== link.id
                                )
                                return (
                                  <SelectItem key={label} value={label} disabled={isUsed}>
                                    {WEBSITE_FIELD_LABELS[label] ?? label}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex flex-[2] flex-col gap-2'>
                          <Label htmlFor={`website-url-${link.id}`} className='text-sm'>
                            URL
                          </Label>
                          <Input
                            id={`website-url-${link.id}`}
                            type='url'
                            value={link.url}
                            placeholder='https://...'
                            className={profileInputClass}
                            onChange={(e) =>
                              updateWebsiteLink(link.id, { url: e.target.value })
                            }
                          />
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='shrink-0 hover:bg-transparent text-muted-foreground hover:text-red-600 transform duration-300 ease-in-out'
                          onClick={() => removeWebsiteLink(link.id)}
                          aria-label='削除'
                        >
                          <FaTrash className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-4 mt-6'>
                <div className='flex items-center justify-between gap-2'>
                  <Label className='text-sm font-medium text-gray-800'>その他の項目</Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='rounded-none border-gray-200 bg-white hover:bg-gray-400 transform duration-300 ease-in-out'
                    onClick={addCustomItem}
                  >
                    <FaPlus className='mr-1 h-3 w-3' />
                    追加
                  </Button>
                </div>
                {customItems.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    追加ボタンから自由な項目を登録できます
                  </p>
                ) : (
                  <div className='flex flex-col gap-3'>
                    {customItems.map((item) => (
                      <div
                        key={item.id}
                        className='flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-end'
                      >
                        <div className='flex flex-1 flex-col gap-2 sm:max-w-[200px]'>
                          <Label htmlFor={`custom-label-${item.id}`} className='text-sm'>
                            項目名
                          </Label>
                          <Input
                            id={`custom-label-${item.id}`}
                            value={item.label}
                            placeholder='例：所属委員会'
                            className={profileInputClass}
                            onChange={(e) =>
                              updateCustomItem(item.id, { label: e.target.value })
                            }
                          />
                        </div>
                        <div className='flex flex-[2] flex-col gap-2'>
                          <Label htmlFor={`custom-value-${item.id}`} className='text-sm'>
                            内容
                          </Label>
                          <Input
                            id={`custom-value-${item.id}`}
                            value={item.value}
                            placeholder='例：予算委員会'
                            className={profileInputClass}
                            onChange={(e) =>
                              updateCustomItem(item.id, { value: e.target.value })
                            }
                          />
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='shrink-0 hover:bg-transparent text-muted-foreground hover:text-red-600 transform duration-300 ease-in-out'
                          onClick={() => removeCustomItem(item.id)}
                          aria-label='削除'
                        >
                          <FaTrash className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <PiListHeartBold className='h-5 w-5' />
              <h2 className='text-base font-bold'>政策</h2>
            </div>
            <div className='p-6'>
              {policyQuestions.map((q) => {
                const current = questionAnswers.find((a) => a.question === q.question)
                return (
                  <div key={q.id} className='rounded-sm border border-border overflow-hidden'>
                    <div className='bg-muted px-4 py-3 border-b border-border'>
                      <p className='font-bold text-sm leading-relaxed'>
                        <span>Q.</span> {q.question}
                      </p>
                    </div>
                    <div className='px-4 py-3'>
                      <RadioGroup
                        value={current?.answer ?? ''}
                        onValueChange={(value) => setQuestionAnswer(q.question, value)}
                        className='space-y-2'
                      >
                        {q.options.map((option) => (
                          <div key={option.value} className='flex items-center gap-3'>
                            <RadioGroupItem value={option.value} id={`q${q.id}-${option.value}`} />
                            <Label
                              htmlFor={`q${q.id}-${option.value}`}
                              className='text-sm font-normal cursor-pointer leading-relaxed'
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {error && (
            <p className='bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
          )}
          {success && (
            <p className='bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700'>{success}</p>
          )}

          <div className='flex items-start'>
            <Button
              type='submit'
              variant='default'
              disabled={isSubmitting}
              className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
            >
              {isSubmitting ? '保存中...' : 'プロフィールを保存'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ProfilePage
