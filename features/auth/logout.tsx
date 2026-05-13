'use client'

import LoadingIndicator from '@/components/loading-indicator'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const LogOutPage = () => {
  const { updateAuthState } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const signOut = async () => {
      setIsLoading(true)
      localStorage.removeItem('jwt-token')
      updateAuthState({
        user_id: '',
        user_email: '',
        user_name: '',
        user_is_verified: false,
      })
      router.push('https://seijiselect.jp')
      setIsLoading(false)
    }
    void signOut()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isLoading ? <LoadingIndicator /> : <></>
}

export default LogOutPage
