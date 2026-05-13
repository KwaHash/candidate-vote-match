'use client'

import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/auth-provider'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FiLock, FiMail } from 'react-icons/fi'
import { HiMiniArrowRightStartOnRectangle } from 'react-icons/hi2'
import * as yup from 'yup'

interface ILogInForm {
  email: string;
  password: string;
}

export default function LogInPage() {
  const { updateAuthState } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string>('')

  const schema = yup.object().shape({
    email: yup
      .string()
      .required('メールアドレスは必須です')
      .email('メールアドレスを正しく入力してください'),
    password: yup.string().required('パスワードは必須です'),
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ILogInForm>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: ILogInForm) => {
    setError('')
    const { email, password } = data

    try {
      const { data: { access_token, refresh_token } } = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('jwt-token', JSON.stringify({
        access_token,
        refresh_token
      }))
      const { data } = await axios.post('/api/auth/me', {
        access_token,
        refresh_token,
      })

      updateAuthState({
        user_id: data.user_id,
        user_email: data.user_email,
        user_name: data.user_name ?? '',
        user_is_verified: data.user_is_verified || false,
      })
      router.push('/politicians')
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
        <h1 className='text-2xl text-gray-900 text-center mt-4 mb-8 font-bold'>ログイン</h1>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiMail className='text-lg' />
              <Label htmlFor='email'>メールアドレス</Label>
              <RequiredLabel />
            </div>
            <div className='w-full'>
              <InputField id='email' control={control} className='w-full' />
              {errors.email && (
                <p className='text-xs mt-2 text-m-red'>
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <div className='flex gap-1 items-center'>
              <FiLock className='text-lg' />
              <Label htmlFor='password'>パスワード</Label>
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

          {error && (
            <p className='text-xs text-m-red'>{error}</p>
          )}

          {/* Login Button */}
          <div className='flex items-start'>
            <div className='w-full'>
              <Button
                type='submit'
                variant='default'
                className='w-full rounded-none bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
              >
                ログイン
              </Button>
            </div>
          </div>
        </form>

        <div className='w-full flex justify-center items-center mt-8'>
          <Link href='/forgot-password' className='text-sm flex items-center hover:text-m-blue transform transition-all duration-300'>
            <AiOutlineQuestionCircle className='text-lg mr-2' />
            <span>パスワードをお忘れですか？</span>
          </Link>
        </div>

        <div className='w-full text-center text-sm flex items-center justify-center mt-3'>
          アカウントをお持ちでない方は
          <Link href='/sign-up' className='flex items-center font-semibold'>
            <span className='text-m-blue'>こちら</span>
            <HiMiniArrowRightStartOnRectangle className='text-lg' />
          </Link>
        </div>
      </div>
    </div>
  )
}
