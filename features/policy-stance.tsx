'use client'

import LoadingIndicator from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { policyQuestions } from '@/constants/policy'
import { getAccessToken } from '@/lib/auth'
import { useAuth } from '@/providers/auth-provider'
import type { ProfileQuestionAnswer } from '@/types/profile'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { FaCheck } from 'react-icons/fa6'
import { MdPolicy } from 'react-icons/md'

const defaultQuestionAnswers = policyQuestions.map((q) => ({
  question: q.question,
  answer: '',
  note: '',
}))

const PolicyStancePage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [questionAnswers, setQuestionAnswers] = useState(defaultQuestionAnswers)
  const { user_id } = useAuth()

  useEffect(() => {
    const fetchPolicyStance = async () => {
      const accessToken = getAccessToken()
      if (!accessToken || !user_id) {
        setIsLoading(false)
        return
      }

      try {
        const { data } = await axios.get('/api/policy-stance', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const policyStance: ProfileQuestionAnswer[] = data.policy_stance ?? []
        if (policyStance.length) {
          setQuestionAnswers(
            policyQuestions.map((q) => {
              const entry = policyStance.find((a) => a.question === q.question)
              return {
                question: q.question,
                answer: entry?.answer ?? '',
                note: entry?.note ?? '',
              }
            })
          )
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error ?? '政策スタンスの取得に失敗しました。')
        }
      }
      setIsLoading(false)
    }

    void fetchPolicyStance()
  }, [user_id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const answeredQuestions = questionAnswers
      .filter((a) => a.answer.trim() !== '')
      .map((a) => ({
        question: a.question,
        answer: a.answer,
        note: a.note.trim() || undefined,
      }))

    const accessToken = getAccessToken()
    if (!accessToken) {
      setError('認証が必要です。再度ログインしてください。')
      return
    }

    setIsSubmitting(true)
    try {
      await axios.put('/api/policy-stance',
        {
          candidate_id: user_id,
          policy_stance: answeredQuestions,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      setSuccess('政策を保存しました。')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? '保存に失敗しました。')
      }
    }
    setIsSubmitting(false)
  }

  const setQuestionAnswer = (question: string, answer: string) => {
    setQuestionAnswers((prev) =>
      prev.map((item) => (item.question === question ? { ...item, answer } : item))
    )
  }

  const setQuestionNote = (question: string, note: string) => {
    setQuestionAnswers((prev) =>
      prev.map((item) => (item.question === question ? { ...item, note } : item))
    )
  }

  const total = policyQuestions.length
  const answered = useMemo(
    () => questionAnswers.filter((a) => a.answer.trim() !== '').length,
    [questionAnswers]
  )
  const progress = Math.round((answered / total) * 100)
  const allAnswered = answered === total

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
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold leading-normal tracking-tight text-white'>政策スタンス</h1>
            <p className='mt-6 text-base sm:text-lg md:text-xl !leading-8 sm:!leading-10 text-gray-100'>各政策への賛否を登録・編集できます</p>
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
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Progress Bar */}
          <div className='sticky top-20 z-10 rounded border border-gray-200 bg-white/95 p-4 backdrop-blur'>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span className='font-medium text-gray-700'>
                回答済み {answered} / {total} 件
              </span>
              <span className='font-semibold text-green-600'>{progress}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
              <div
                className='h-full rounded-full bg-green-600 transition-all duration-300'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Policy Questions */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdPolicy className='h-5 w-5' />
              <h2 className='text-base font-bold'>政策</h2>
            </div>
            <div className='flex flex-col gap-2 p-6'>
              {policyQuestions.map((q, index) => {
                const current = questionAnswers.find((a) => a.question === q.question)
                const isAnswered = !!current?.answer
                return (
                  <div key={q.id} className='rounded-sm border border-border overflow-hidden'>
                    <div className='bg-muted p-3 border-b border-border'>
                      <div className='flex items-center gap-3'>
                        <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold bg-green-600 text-white'>
                          {isAnswered ? <FaCheck className='h-3.5 w-3.5' /> : index + 1}
                        </span>
                        <p className='font-bold text-sm leading-relaxed'>{q.question}</p>
                      </div>
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
                            <Label htmlFor={`q${q.id}-${option.value}`}
                              className='text-sm font-normal cursor-pointer leading-relaxed'
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {current?.answer && (
                        <div className='mt-4 flex flex-col gap-2'>
                          <Label htmlFor={`q${q.id}-note`}
                            className='text-sm font-medium text-gray-800'
                          >
                            有権者に伝えたい補足（任意）
                          </Label>
                          <Textarea
                            id={`q${q.id}-note`}
                            rows={2}
                            value={current.note ?? ''}
                            placeholder={q.placeholder}
                            className='resize-none rounded'
                            onChange={(e) => setQuestionNote(q.question, e.target.value)}
                          />
                        </div>
                      )}
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
              disabled={isSubmitting || !allAnswered}
              className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-green-600 hover:bg-green-700 transform transition-all duration-300'
            >
              {isSubmitting ? '保存中...' : '政策を保存'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default PolicyStancePage
