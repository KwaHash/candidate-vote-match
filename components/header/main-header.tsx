'use client'

import MemberHeader from '@/components/header/member-header'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const MainHeader = () => {
  const [stickyMenu, setStickyMenu] = useState<boolean>(false)

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true)
    } else {
      setStickyMenu(false)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleStickyMenu)
  })

  return (
    <header className='fixed left-0 top-0 w-full z-50 bg-white transition-all ease-in-out duration-300 shadow'>
      <div className='mx-auto max-w-screen-2xl px-8'>
        <div className={cn('flex justify-between ease-out duration-300', stickyMenu ? 'py-1' : 'py-3')}>
          <Link href='/'>
            <Image src='/images/logo.png' alt='わたしの政治ロゴ' width={128} height={64} priority className='w-32 h-16' />
          </Link>
          <MemberHeader />
        </div>
      </div>
    </header>
  )
}

export default MainHeader