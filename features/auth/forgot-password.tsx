'use client'

import InputField from '@/components/input/input-field'
import RequiredLabel from '@/components/label/required-label'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiMail } from 'react-icons/fi'
import { HiMiniArrowRightStartOnRectangle } from 'react-icons/hi2'
import * as yup from 'yup'

interface IForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const schema = yup.object().shape({
    email: yup
      .string()
      .required('メールアドレスは必須です')
      .email('メールアドレスを正しく入力してください'),
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordForm>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: IForgotPasswordForm) => {
    setError('')
    const { email } = data

    try {
      await axios.post('/api/auth/forgot-password', { email })
      setSuccess('確認用のリンクをメールで送信しましたので、ご確認ください。')
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
        <h1 className='text-2xl text-gray-900 text-center mt-4 font-bold'>パスワード再設定</h1>
        <p className='mx-2 text-sm text-center mt-2 mb-8'>パスワード再設定のご案内をお送りいたします<br />ご登録のメールアドレスを入力してください</p>

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

          {error && (
            <p className='text-xs text-m-red'>{error}</p>
          )}

          {success && (
            <p className='w-full mb-4 bg-green-50 border-l-4 border-green-400 p-3 text-sm text-green-700'>
              {success}
            </p>
          )}

          {/* Reset Button */}
          <div className='flex items-start'>
            <div className='w-full'>
              <Button
                type='submit'
                variant='default'
                className='w-full rounded-none bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
              >
                送信する
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