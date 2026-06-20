'use client'

import LoadingIndicator from '@/components/loading-indicator'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface AuthState {
  user_id: string
  user_email: string
  user_name: string
  user_is_verified: boolean
}

interface AuthContextType extends AuthState {
  updateAuthState: (state: Partial<AuthState>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user_id: '',
  user_email: '',
  user_name: '',
  user_is_verified: false,
  updateAuthState: () => {},
})

const AUTH_PATHS = ['/login', '/sign-up', '/forgot-password', '/reset-password', '/logout', '/prototype']

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathName = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [authState, setAuthState] = useState<AuthState>({
    user_id: '',
    user_email: '',
    user_name: '',
    user_is_verified: false,
  })

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)

      const isAuthPath = AUTH_PATHS.some((path) => pathName.startsWith(path))
      if (isAuthPath) {
        setIsLoading(false)
        return
      }

      const tokenData = localStorage.getItem('jwt-token')
      if (!tokenData) {
        setIsLoading(false)
        router.push('/login')
        return
      }

      try {
        const { access_token, refresh_token } = JSON.parse(tokenData)
        const { data } = await axios.post('/api/auth/me', {
          access_token,
          refresh_token,
        })

        if (data.is_authenticated) {
          setAuthState({
            user_id: data.user_id,
            user_email: data.user_email,
            user_name: data.user_name ?? '',
            user_is_verified: data.user_is_verified || false,
          })

          if (data.access_token) {
            localStorage.setItem(
              'jwt-token',
              JSON.stringify({
                access_token: data.access_token,
                refresh_token,
              })
            )
          }
          setIsLoading(false)
        } else {
          setIsLoading(false)
          router.push('/login')
        }
      } catch {
        setIsLoading(false)
        router.push('/login')
      }
    }

    void checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathName])

  const updateAuthState = (newState: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...newState }))
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <AuthContext.Provider value={{ ...authState, updateAuthState }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}