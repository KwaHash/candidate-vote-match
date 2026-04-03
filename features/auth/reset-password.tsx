'use client'

import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import LoadingIndicator from '@/components/loading-indicator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiLock } from 'react-icons/fi'
import { HiMiniArrowRightStartOnRectangle } from 'react-icons/hi2'
import * as yup from 'yup'

interface IResetPasswordForm {
  password: string;
  confirm_password: string;
}

const ResetPasswordPage = () => {
  const router = useRouter()
  const [user_id, setUserId] = useState<string>('')
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const schema = yup.object().shape({
    password: yup.string().required('パスワードは必須です'),
    confirm_password: yup
      .string()
      .required('パスワード（確認用）は必須です')
      .oneOf([yup.ref('password')], 'パスワードが一致しません'),
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IResetPasswordForm>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    const token = searchParams.get('token')
    const verify = async () => {
      setError('')
      try {
        const { data } = await axios.post('/api/auth/verify', { token, user_verify: false })
        setUserId(data.user_id)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const error = err.response?.data?.error
          setError(error)
        }
      }
      setIsLoading(false)
    }
    verify()
  }, [])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (error) {
    return (
      <div className='w-full min-h-screen grid place-content-center text-m-red font-semibold text-2xl md:text-3xl'>
        {error}
      </div>
    )
  }

  const onSubmit = async (data: IResetPasswordForm) => {
    setError('')
    const { password } = data

    try {
      await axios.post('/api/auth/reset-password', { user_id, password })
      router.push('/login')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err.response?.data?.error
        setError(error)
      }
    }
  }

  return (
    <div className='w-full max-w-[500px] m-auto'>
      <div className='bg-white w-full px-8 py-10 rounded-lg'>
        <figure className='flex justify-center mb-2'>
          <Image src='/images/logo.png' width={142} height={78} alt='わたしの政治ロゴ' />
        </figure>
        <h1 className='text-2xl text-gray-900 text-center mt-4 mb-8 font-bold'>パスワード再設定</h1>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiLock className='text-lg' />
              <Label htmlFor='password'>新しいパスワード</Label>
              <RequiredLabel />
            </div>
            <div className='w-full'>
              <InputField
                id='password'
                control={control}
                className='w-full'
                isPassword
              />
              {errors.password && (
                <p className='text-xs mt-2 text-m-red'>
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiLock className='text-lg' />
              <Label htmlFor='confirm_password'>パスワードの確認</Label>
              <RequiredLabel />
            </div>
            <div className='w-full'>
              <InputField
                id='confirm_password'
                control={control}
                className='w-full'
                isPassword
              />
              {errors.confirm_password && (
                <p className='text-xs mt-2 text-m-red'>
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className='w-full mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>
              {error}
            </p>
          )}

          {/* Change Button */}
          <div className='flex items-start'>
            <div className='w-full'>
              <Button
                type='submit'
                variant='default'
                className='w-full rounded-none bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
              >
                設定する
              </Button>
            </div>
          </div>
        </form>

        <div className='w-full text-center text-sm flex items-center justify-center mt-8'>
          アカウントをお持ちの方は
          <Link href='/login' className='flex items-center font-semibold'>
            <span className='text-m-blue'>こちら</span>
            <HiMiniArrowRightStartOnRectangle className='text-lg' />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage