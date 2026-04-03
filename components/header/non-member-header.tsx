'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BsStars } from 'react-icons/bs'
import { HiOutlineBookOpen, HiOutlineInformationCircle } from 'react-icons/hi'
import { LuUserRound } from 'react-icons/lu'
import { RiRobot2Line } from 'react-icons/ri'

const navItems = [
  { href: '/about', label: 'わたしの政治とは', icon: HiOutlineInformationCircle },
  { href: '/ai-chat', label: 'AIチャット', icon: RiRobot2Line },
  { href: '/match', label: 'マッチング', icon: BsStars },
  { href: '/support-resources/register', label: '支援リソース', icon: HiOutlineBookOpen },
  { href: '/login', label: '政治家の方', icon: LuUserRound },
] as const

export default function NonMemberHeader() {
  const pathname = usePathname()
  return (
    <div className='hidden md:flex items-center gap-6'>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        const linkClass =
          'flex items-center justify-center group space-x-1.5 text-m-gold font-bold transition-all duration-500'
        const activeClass = 'text-primary'
        const inactiveClass = 'text-[#333]'
        return (
          <Link key={href} href={href} className={linkClass}>
            <Icon
              className={cn(
                'text-2xl transition-colors duration-300 group-hover:text-primary',
                isActive ? activeClass : inactiveClass
              )}
            />
            <span
              className={cn(
                'transition-colors duration-300 group-hover:text-primary',
                isActive ? activeClass : inactiveClass
              )}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
