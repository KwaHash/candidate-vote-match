'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CgProfile } from 'react-icons/cg'
import { FaChevronDown, FaListUl } from 'react-icons/fa'
import { FaListCheck } from 'react-icons/fa6'
import { HiOutlineBookOpen } from 'react-icons/hi'
import { RiLogoutCircleRLine, RiMessage3Line, RiRobot2Line } from 'react-icons/ri'

const leadingNavItems = [
  { href: '/ai-chat', label: 'AIチャット', icon: RiRobot2Line },
] as const

const trailingNavItems = [
  { href: '/messages', label: 'メッセージ', icon: RiMessage3Line  },
  { href: '/support-resource', label: '支援リソース', icon: HiOutlineBookOpen },
  { href: '/profile', label: 'プロフィール', icon: CgProfile },
  { href: '/logout', label: 'ログアウト', icon: RiLogoutCircleRLine },
] as const

const houseElectionNav = {
  title: '衆議院議員選挙',
  items: [
    { href: '/politicians', label: '第51回政治家一覧', icon: FaListUl },
    { href: '/candidates/district', label: '第51回小選挙区', icon: FaListCheck },
    { href: '/candidates/proportion', label: '第51回比例代表', icon: FaListCheck },
  ],
} as const

const linkClass =
  'flex items-center justify-center group space-x-1.5 text-m-gold font-bold transition-all duration-500'

export default function MemberHeader() {
  const pathname = usePathname()
  const electionPaths = houseElectionNav.items.map((i) => i.href)
  const isElectionSectionActive = electionPaths.some((p) => pathname === p)

  return (
    <div className='hidden md:flex items-center gap-6'>
      {leadingNavItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href} className={linkClass}>
            <Icon
              className={cn(
                'text-2xl transition-colors duration-300 group-hover:text-green-600',
                isActive ? 'text-green-600' : 'text-[#333]'
              )}
            />
            <span
              className={cn(
                'transition-colors duration-300 group-hover:text-green-600',
                isActive ? 'text-green-600' : 'text-[#333]'
              )}
            >
              {label}
            </span>
          </Link>
        )
      })}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'group',
            linkClass,
            'outline-none rounded-md',
            'data-[state=open]:text-green-600 [&_svg]:transition-colors [&_svg]:duration-300',
            isElectionSectionActive ? 'text-green-600' : 'text-[#333]'
          )}
        >
          <FaListCheck
            className={cn(
              'text-2xl transition-colors duration-300 group-hover:text-green-600 group-data-[state=open]:text-green-600',
              isElectionSectionActive ? 'text-green-600' : 'text-[#333]'
            )}
          />
          <span
            className={cn(
              'transition-colors duration-300 group-hover:text-green-600 group-data-[state=open]:text-green-600',
              isElectionSectionActive ? 'text-green-600' : 'text-[#333]'
            )}
          >
            {houseElectionNav.title}
          </span>
          <FaChevronDown
            className={cn(
              'text-sm opacity-80 transition-transform duration-300 group-data-[state=open]:rotate-180',
              isElectionSectionActive ? 'text-green-600' : 'text-[#333] group-hover:text-green-600'
            )}
            aria-hidden
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          sideOffset={8}
          className='min-w-[14rem] rounded-xl border border-border/50 bg-white p-2 shadow-lg'
        >
          <DropdownMenuLabel className='px-3 py-2 text-xs font-semibold text-muted-foreground'>
            {houseElectionNav.title}
          </DropdownMenuLabel>
          {houseElectionNav.items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <DropdownMenuItem
                key={href}
                asChild
                className={cn(
                  'cursor-pointer rounded px-3 py-2.5 text-sm font-medium text-[#333]',
                  'focus:bg-green-600/10 focus:text-green-600',
                  'data-[highlighted]:bg-green-600/10 data-[highlighted]:text-green-600',
                  isActive && 'bg-green-600/10 text-green-600'
                )}
              >
                <Link href={href} className='flex w-full items-center gap-2'>
                  <Icon className='text-xl shrink-0' />
                  {label}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {trailingNavItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href} className={linkClass}>
            <Icon
              className={cn(
                'text-2xl transition-colors duration-300 group-hover:text-green-600',
                isActive ? 'text-green-600' : 'text-[#333]'
              )}
            />
            <span
              className={cn(
                'transition-colors duration-300 group-hover:text-green-600',
                isActive ? 'text-green-600' : 'text-[#333]'
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
