'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaChevronDown } from 'react-icons/fa'
import { isNavGroup, navItems } from './nav-items'

const linkClass =
  'flex items-center justify-center group space-x-1.5 text-m-gold font-bold transition-all duration-500'

export default function MemberHeader() {
  const pathname = usePathname()

  return (
    <div className='hidden md:flex items-center gap-6'>
      {navItems.map((entry) => {
        if (isNavGroup(entry)) {
          const { label, icon: Icon, subItems } = entry
          const isSectionActive = subItems.some((i) => pathname === i.href)

          return (
            <DropdownMenu key={label}>
              <DropdownMenuTrigger
                className={cn(
                  'group',
                  linkClass,
                  'outline-none rounded-md',
                  'data-[state=open]:text-green-600 [&_svg]:transition-colors [&_svg]:duration-300',
                  isSectionActive ? 'text-green-600' : 'text-[#333]'
                )}
              >
                <Icon
                  className={cn(
                    'text-2xl transition-colors duration-300 group-hover:text-green-600 group-data-[state=open]:text-green-600',
                    isSectionActive ? 'text-green-600' : 'text-[#333]'
                  )}
                />
                <span
                  className={cn(
                    'transition-colors duration-300 group-hover:text-green-600 group-data-[state=open]:text-green-600',
                    isSectionActive ? 'text-green-600' : 'text-[#333]'
                  )}
                >
                  {label}
                </span>
                <FaChevronDown
                  className={cn(
                    'text-sm opacity-80 transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-green-600',
                    isSectionActive ? 'text-green-600' : 'text-[#333] group-hover:text-green-600'
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
                  {label}
                </DropdownMenuLabel>
                {subItems.map(({ href, label: subLabel, icon: SubIcon }) => {
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
                        <SubIcon className='text-xl shrink-0' />
                        {subLabel}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }

        const { href, label, icon: Icon } = entry
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
