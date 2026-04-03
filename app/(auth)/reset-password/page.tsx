import LoadingIndicator from '@/components/loading-indicator'
import ResetPasswordPage from '@/features/auth/reset-password'
import { Suspense } from 'react'

export default function page() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <ResetPasswordPage />
    </Suspense>
  )
}