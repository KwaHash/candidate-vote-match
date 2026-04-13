import Providers from '@/app/providers'
import MainHeader from '@/components/header/main-header'
import TailwindIndicator from '@/components/tailwind-indicator'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import '@/index.css'
import type { Metadata } from 'next'
import { StrictMode } from 'react'

export const metadata: Metadata = {
  title: 'わたしの政治',
  description: '政治は、わたしの"推し"から始まる',
  authors: [{ name: 'わたしの政治' }],
  openGraph: {
    title: 'わたしの政治',
    description: '政治は、わたしの"推し"から始まる',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StrictMode>
      <html lang='ja' suppressHydrationWarning>
        <body>
          <Providers>
            <Toaster />
            <Sonner />
            <div className='flex flex-col w-full min-h-screen overflow-x-hidden overflow-y-auto'>
              <MainHeader />
              <main className='flex flex-col w-full grow bg-[#eee] pt-20'>
                {children}
              </main>
            </div>
            <TailwindIndicator />
          </Providers>
        </body>
      </html>
    </StrictMode>
  )
}