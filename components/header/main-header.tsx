'use client'

import MemberHeader from '@/components/header/member-header'
import Image from 'next/image'
import Link from 'next/link'

const MainHeader = () => {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center justify-between w-full max-w-[1400px] px-4 mx-auto'>
        <Link href='/' className='py-1'>
          <Image src='/images/logo.png' alt='わたしの政治ロゴ' width={142} height={78} priority />
        </Link>
        <MemberHeader />
      </div>
    </header>
  )
}

export default MainHeader